// Proves the database rules in supabase/migrations against a real Postgres (PGlite, in-process):
// the signup trigger, row level security between two learners, the checkpoint-attempt guard,
// key/shape constraints, and that deleting an account still removes everything.
//
// Supabase's own pieces the migrations rely on are stubbed the way Supabase defines them:
// the `auth` schema with `auth.users` and `auth.uid()` (read from the request's JWT claims),
// and the `anon` / `authenticated` roles.
//
// Usage: npm run check:db
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const db = await PGlite.create()

await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text not null, raw_user_meta_data jsonb not null default '{}');
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`)

// Supabase grants new tables and functions to these roles by default (row level security then
// decides which rows). Done as default privileges *before* the migrations, as Supabase does, so a
// migration's own REVOKE (e.g. learners can't update profiles.role) really takes effect.
await db.exec(`
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;
`)
const dir = join(root, 'supabase/migrations')
for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
  await db.exec(readFileSync(join(dir, file), 'utf8'))
}


let failures = 0
const ok = (name) => console.log(`✓ ${name}`)
const fail = (name, detail) => { failures++; console.log(`✗ ${name}${detail ? `: ${detail}` : ''}`) }

/** Run SQL as a signed-in learner (or anon when uid is null), inside a transaction that's rolled back unless keep. */
async function as(uid, sql, params = [], { keep = false } = {}) {
  await db.exec('begin')
  try {
    await db.exec(`set local role ${uid ? 'authenticated' : 'anon'}`)
    await db.query(`select set_config('request.jwt.claim.sub', $1, true)`, [uid ?? ''])
    const result = await db.query(sql, params)
    await db.exec(keep ? 'commit' : 'rollback')
    return result
  } catch (error) {
    await db.exec('rollback')
    throw error
  }
}
async function expectOk(name, fn) {
  try { await fn(); ok(name) } catch (e) { fail(name, e.message) }
}
async function expectError(name, fn, pattern) {
  try { await fn(); fail(name, 'it was allowed') } catch (e) {
    if (pattern && !pattern.test(e.message)) fail(name, `wrong error: ${e.message}`)
    else ok(name)
  }
}
async function expectRows(name, fn, n) {
  try {
    const r = await fn()
    // A SELECT returns rows; INSERT/UPDATE/DELETE report how many rows they touched.
    const count = r.fields.length ? r.rows.length : (r.affectedRows ?? 0)
    if (count === n) ok(name)
    else fail(name, `expected ${n} rows, got ${count}`)
  } catch (e) { fail(name, e.message) }
}

const A = '00000000-0000-0000-0000-00000000000a'
const B = '00000000-0000-0000-0000-00000000000b'

// Signup ---------------------------------------------------------------------
await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'a@example.com', '{"display_name":"Ada"}'), ($2, 'b@example.com', '{}')`, [A, B])
await expectRows('signup creates a profile for each new user', () => db.query('select id from public.profiles'), 2)
await expectRows('a profile starts with an empty app_state object', () => db.query(`select 1 from public.profiles where id = $1 and app_state = '{}'::jsonb`, [A]), 1)

// Row level security ---------------------------------------------------------
await expectOk('A records a study day', () => as(A, `insert into public.study_days (user_id, studied_on) values ($1, '2026-10-12')`, [A], { keep: true }))
await expectError("A can't record a study day for B", () => as(A, `insert into public.study_days (user_id, studied_on) values ($1, '2026-10-12')`, [B]), /row-level security/)
await expectRows("B can't see A's study days", () => as(B, 'select * from public.study_days'), 0)
await expectRows("anon can't see anyone's study days", () => as(null, 'select * from public.study_days'), 0)
await expectRows("anon can't read profiles", () => as(null, 'select * from public.profiles'), 0)
await expectRows('A sees only their own profile', () => as(A, 'select * from public.profiles'), 1)

await expectOk('A saves app settings', () => as(A, `update public.profiles set app_state = '{"activeCourse":"french","bestScores":{"french:1:1:rapid":0.8}}' where id = $1`, [A], { keep: true }))
await expectError('app_state must be an object', () => as(A, `update public.profiles set app_state = '[1,2]' where id = $1`, [A]), /app_state_is_object/)
await expectRows("A can't change B's profile", () => as(A, `update public.profiles set app_state = '{"x":1}' where id = $1`, [B]), 0)

// Checkpoints ----------------------------------------------------------------
await expectOk('A opens a checkpoint', () => as(A, `insert into public.checkpoints (user_id, kind, key, seen) values ($1, 'gate', 'french:3:2', '{q1,q2}')`, [A], { keep: true }))
await expectOk('A opens a week quiz', () => as(A, `insert into public.checkpoints (user_id, kind, key) values ($1, 'week', 'fullstack-ml:10')`, [A], { keep: true }))
await expectError('a gate key must be course:week:day', () => as(A, `insert into public.checkpoints (user_id, kind, key) values ($1, 'gate', 'french:3')`, [A]), /checkpoint_key_shape/)
await expectError('a week key must be course:week', () => as(A, `insert into public.checkpoints (user_id, kind, key) values ($1, 'week', 'french:3:2')`, [A]), /checkpoint_key_shape/)
await expectError('a gate day is 1–6', () => as(A, `insert into public.checkpoints (user_id, kind, key) values ($1, 'gate', 'french:3:7')`, [A]), /checkpoint_key_shape/)
await expectError('unknown kinds are refused', () => as(A, `insert into public.checkpoints (user_id, kind, key) values ($1, 'exam', 'french:3')`, [A]), /check/)
await expectOk('A adds seen questions', () => as(A, `update public.checkpoints set seen = '{q1,q2,q3}' where user_id = $1 and kind = 'gate' and key = 'french:3:2'`, [A], { keep: true }))
await expectRows("A can't delete a checkpoint (it would take its attempts with it)", () => as(A, `delete from public.checkpoints where user_id = $1`, [A]), 0)
await expectRows("B can't see A's checkpoints", () => as(B, 'select * from public.checkpoints'), 0)
await expectError("B can't open a checkpoint as A", () => as(B, `insert into public.checkpoints (user_id, kind, key) values ($1, 'gate', 'french:4:1')`, [A]), /row-level security/)

// Attempts: start = provisional fail; finish replaces it once; then permanent.
const attempt = (n, passed, score) => `insert into public.checkpoint_attempts (user_id, kind, key, attempt, finished_at, passed, score) values ($1, 'gate', 'french:3:2', ${n}, now(), ${passed}, ${score})`
await expectOk('starting an attempt saves a provisional fail', () => as(A, attempt(1, false, 0), [A], { keep: true }))
await expectOk('finishing replaces it with the result', () => as(A, `update public.checkpoint_attempts set passed = false, score = 0.5, finished_at = now() where user_id = $1 and attempt = 1`, [A], { keep: true }))
await expectError("a finished result can't be rewritten (no turning a fail into a pass)", () => as(A, `update public.checkpoint_attempts set passed = true, score = 1 where user_id = $1 and attempt = 1`, [A]), /can't be changed/)
await expectRows("a learner can't delete an attempt (no erasing a fail to skip the cooldown)", () => as(A, `delete from public.checkpoint_attempts where user_id = $1`, [A]), 0)
await expectError('even code that bypasses row security (service role) can\'t delete an attempt', () => db.query(`delete from public.checkpoint_attempts where user_id = $1`, [A]), /permanent/)
await expectError('an attempt can only be for an existing checkpoint', () => as(A, `insert into public.checkpoint_attempts (user_id, kind, key, attempt, finished_at, passed, score) values ($1, 'gate', 'french:9:9', 1, now(), true, 1)`, [A]), /foreign key|violates/)
await expectError('scores are between 0 and 1', () => as(A, attempt(2, true, 1.5), [A]), /check/)
await expectError("the same attempt number can't be saved twice", () => as(A, attempt(1, true, 1), [A]), /duplicate key/)
await expectOk('a second attempt can pass', () => as(A, attempt(2, false, 0), [A], { keep: true }).then(() => as(A, `update public.checkpoint_attempts set passed = true, score = 0.83 where user_id = $1 and attempt = 2`, [A], { keep: true })))
await expectError("an attempt can't be moved to another checkpoint", () => as(A, attempt(3, false, 0), [A], { keep: true }).then(() => as(A, `update public.checkpoint_attempts set attempt = 9 where user_id = $1 and attempt = 3`, [A])), /can't be moved/)
await expectRows("B can't see A's attempts", () => as(B, 'select * from public.checkpoint_attempts'), 0)
await expectError("B can't add an attempt to A's checkpoint", () => as(B, attempt(4, true, 1), [A]), /row-level security/)
await expectRows("B can't finish A's provisional attempt", () => as(B, `update public.checkpoint_attempts set passed = true, score = 1 where user_id = $1 and attempt = 3`, [A]), 0)

// Roles -----------------------------------------------------------------------
await expectRows('everyone starts as a student', () => db.query("select 1 from public.profiles where role = 'student'"), 2)
await expectError("a learner can't make themselves an admin", () => as(A, `update public.profiles set role = 'admin' where id = $1`, [A]), /permission denied/)
await expectError("a learner can't change their email or id on the profile", () => as(A, `update public.profiles set email = 'x@y.z' where id = $1`, [A]), /permission denied/)
await expectOk('a learner can still change their settings', () => as(A, `update public.profiles set display_name = 'Ada L', timezone = 'America/Toronto', nudge_hour = 20, email_nudges = false where id = $1`, [A], { keep: true }))
await expectError("a learner can't create a second profile", () => as(A, `insert into public.profiles (id, email) values ($1, 'z@z.z')`, ['00000000-0000-0000-0000-0000000000cc']), /permission denied|row-level security/)
await expectRows("is_admin() is false for a student", () => as(A, 'select 1 where public.is_admin()'), 0)
await db.query("insert into public.logs (user_id, course_slug, week, day, learned) values ($1, 'french', 3, 2, 'private note')", [B])
await db.query("insert into public.study_days (user_id, studied_on) values ($1, '2026-10-13')", [B])
// The owner (SQL editor) grants the role.
await db.query("update public.profiles set role = 'admin' where id = $1", [A])
await expectRows('is_admin() is true for an admin', () => as(A, 'select 1 where public.is_admin()'), 1)
await expectRows("an admin can read every learner's profile", () => as(A, 'select id from public.profiles'), 2)
await expectRows("an admin can read another learner's study days", () => as(A, 'select 1 from public.study_days where user_id = $1', [B]), 1)
await expectRows("an admin can read another learner's checkpoints", () => as(A, 'select 1 from public.checkpoints'), 2)
await expectRows("an admin can't read another learner's private daily log", () => as(A, 'select 1 from public.logs where user_id = $1', [B]), 0)
await expectError("an admin can't write another learner's progress", () => as(A, `insert into public.study_days (user_id, studied_on) values ($1, '2026-10-14')`, [B]), /row-level security/)
await expectRows("an admin can't delete another learner's progress", () => as(A, 'delete from public.study_days where user_id = $1', [B]), 0)
await expectRows("an admin can't change another learner's settings", () => as(A, `update public.profiles set nudge_hour = 5 where id = $1`, [B]), 0)
await expectRows("a student still sees only their own rows (the admin's included)", () => as(B, 'select 1 from public.study_days where user_id = $1', [A]), 0)
await expectError('anon is refused is_admin()', () => as(null, 'select public.is_admin()'), /permission denied/)

await expectError("a learner can't delete their own profile (it would wipe their progress and break the account)", () => as(B, 'delete from public.profiles where id = $1', [B]), /permission denied/)

// Nudge: life trackers, private unless the learner consents ---------------------
const C = '00000000-0000-0000-0000-00000000000c'
await db.query(`insert into auth.users (id, email) values ($1, 'c@example.com')`, [C])
const tracker = (id) => `insert into public.nudge_trackers (user_id, tracker_id, name, kind, unit, target_direction, target_value, target_per) values ($1, '${id}', 'Water', 'count', 'cups', 'atLeast', 8, 'day')`
await expectOk('B switches on a preset tracker', () => as(B, tracker('water'), [B], { keep: true }))
await expectOk('B makes their own tracker', () => as(B, `insert into public.nudge_trackers (user_id, tracker_id, name, kind, unit, target_direction, target_value, target_per, reminder_hour) values ($1, 'c-steps001', 'Steps', 'count', 'steps', 'atLeast', 8000, 'day', 21)`, [B], { keep: true }))
await expectOk('B logs a day', () => as(B, `insert into public.nudge_entries (user_id, tracker_id, logged_on, value) values ($1, 'water', '2026-10-26', 6), ($1, 'c-steps001', '2026-10-26', 9120)`, [B], { keep: true }))
await expectOk('B changes a logged value', () => as(B, `update public.nudge_entries set value = 8 where user_id = $1 and tracker_id = 'water'`, [B], { keep: true }))
await expectOk('A (an admin) has trackers of their own', () => as(A, tracker('sleep'), [A], { keep: true }).then(() => as(A, `insert into public.nudge_entries (user_id, tracker_id, logged_on, value) values ($1, 'sleep', '2026-10-26', 7)`, [A], { keep: true })))
await expectError('a tracker id is a preset name or c- plus 8 characters', () => as(B, tracker('Water!'), [B]), /check/)
await expectError('unknown tracker kinds are refused', () => as(B, `insert into public.nudge_trackers (user_id, tracker_id, name, kind) values ($1, 'mood', 'Mood', 'feelings')`, [B]), /check/)
await expectError('a goal needs its direction, value and period together', () => as(B, `insert into public.nudge_trackers (user_id, tracker_id, name, kind, target_value) values ($1, 'mood', 'Mood', 'scale', 4)`, [B]), /target_all_or_nothing/)
await expectError('a tracker needs a name', () => as(B, `insert into public.nudge_trackers (user_id, tracker_id, name, kind) values ($1, 'mood', '   ', 'scale')`, [B]), /check/)
await expectError('reminder hours are 0–23', () => as(B, `update public.nudge_trackers set reminder_hour = 24 where user_id = $1`, [B]), /check/)
await expectError('absurd values are refused', () => as(B, `insert into public.nudge_entries (user_id, tracker_id, logged_on, value) values ($1, 'water', '2026-10-27', 1e9)`, [B]), /check/)
await expectError('an entry needs one of your own trackers', () => as(B, `insert into public.nudge_entries (user_id, tracker_id, logged_on, value) values ($1, 'sleep', '2026-10-27', 7)`, [B]), /foreign key|violates/)
await expectError("B can't add a tracker for C", () => as(B, tracker('water'), [C]), /row-level security/)
await expectError("B can't log a day for A, even on A's own tracker", () => as(B, `insert into public.nudge_entries (user_id, tracker_id, logged_on, value) values ($1, 'sleep', '2026-10-27', 2)`, [A]), /row-level security/)
await expectRows("another learner can't read B's trackers or entries", () => as(C, 'select 1 from public.nudge_trackers union all select 1 from public.nudge_entries'), 0)
await expectRows("anon can't read anyone's life data", () => as(null, 'select 1 from public.nudge_trackers union all select 1 from public.nudge_entries'), 0)
await expectRows("an admin can't read B's life data without consent", () => as(A, 'select 1 from public.nudge_entries where user_id = $1', [B]), 0)
await expectRows("an admin can't switch on B's consent for them", () => as(A, 'update public.profiles set share_life_with_admin = true where id = $1', [B]), 0)
await expectOk('B switches on sharing with their coach', () => as(B, 'update public.profiles set share_life_with_admin = true where id = $1', [B], { keep: true }))
await expectRows('with consent, an admin can read B\'s trackers and entries', () => as(A, 'select 1 from public.nudge_trackers where user_id = $1 union all select 1 from public.nudge_entries where user_id = $1', [B]), 4)
await expectRows('consent is for admins only: another student still sees nothing', () => as(C, 'select 1 from public.nudge_entries'), 0)
await expectRows("with consent, an admin still can't change B's entries", () => as(A, `update public.nudge_entries set value = 0 where user_id = $1`, [B]), 0)
await expectRows("with consent, an admin still can't delete B's trackers", () => as(A, `delete from public.nudge_trackers where user_id = $1`, [B]), 0)
await expectError("with consent, an admin still can't log for B", () => as(A, `insert into public.nudge_entries (user_id, tracker_id, logged_on, value) values ($1, 'water', '2026-10-27', 1)`, [B]), /row-level security/)
await expectOk('B switches sharing off again', () => as(B, 'update public.profiles set share_life_with_admin = false where id = $1', [B], { keep: true }))
await expectRows('the moment consent is withdrawn, the admin sees nothing', () => as(A, 'select 1 from public.nudge_trackers where user_id = $1 union all select 1 from public.nudge_entries where user_id = $1', [B]), 0)
await expectError('anon is refused the consent check', () => as(null, `select public.can_read_life_of('${B}')`), /permission denied/)
await expectError('nobody keeps more than 60 trackers', () => as(C, `insert into public.nudge_trackers (user_id, tracker_id, name, kind) select $1, 'c-' || lpad(n::text, 8, '0'), 'T' || n, 'check' from generate_series(1, 61) n`, [C]), /too many trackers/)
await expectOk('deleting a tracker deletes its entries', async () => {
  await as(B, `delete from public.nudge_trackers where user_id = $1 and tracker_id = 'c-steps001'`, [B], { keep: true })
  const { rows } = await db.query(`select count(*)::int as n from public.nudge_entries where user_id = $1 and tracker_id = 'c-steps001'`, [B])
  if (rows[0].n !== 0) throw new Error(`${rows[0].n} entries left`)
})

// Account deletion -------------------------------------------------------------
await expectOk('deleting an account removes all its data (cascades past the attempt guard)', async () => {
  await db.query('delete from auth.users where id = $1', [A])
  for (const table of ['profiles', 'study_days', 'checkpoints', 'checkpoint_attempts', 'nudge_trackers', 'nudge_entries']) {
    const column = table === 'profiles' ? 'id' : 'user_id'
    const { rows } = await db.query(`select count(*)::int as n from public.${table} where ${column} = $1`, [A])
    if (rows[0].n !== 0) throw new Error(`${rows[0].n} rows left in ${table}`)
  }
})
await expectRows("deleting A left B's profile alone", () => db.query('select 1 from public.profiles where id = $1', [B]), 1)

console.log(failures ? `\n${failures} database check(s) failing` : '\nAll database checks pass')
process.exit(failures ? 1 : 0)
