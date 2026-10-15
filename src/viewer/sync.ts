import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { catalog } from '../content/catalog.ts'
import { accountConfig } from '../lib/accountConfig.ts'
import { requireSupabase } from '../lib/supabase.ts'
import { getAccountStatus, setAccountStatus } from './accountStatus.ts'
import { clearAll, getState, sanitise, subscribe, update } from './store.ts'
import { diff, EMPTY, fromRows, isEmpty, merge, sameSynced, syncedPart, type Ops, type RemoteRows, type Synced } from './syncModel.ts'
import { isDayDone } from './today.ts'

/*
 * Account sign-in and progress sync. Loaded on demand (it pulls in the Supabase client), when a
 * session is already saved, when the learner arrives from a sign-in email, or when they open the
 * Account page. The merge rules live in syncModel.ts; this file does the talking.
 *
 * Saving: each change to the store is diffed against `base` (what the server held after the last
 * sync, kept in localStorage so every tab shares it) and written shortly after. Downloading: on
 * sign-in, when the tab comes back into view, and every few minutes; the server's state is
 * merged three-way with this browser's, so changes made elsewhere arrive and changes made here
 * aren't lost.
 */

const META_KEY = 'snp-sync-v1'
type Meta = { userId: string; base: Synced }

function readMeta(): Meta | null {
  try {
    const raw = JSON.parse(localStorage.getItem(META_KEY) ?? 'null')
    if (raw && typeof raw.userId === 'string' && raw.base) return { userId: raw.userId, base: syncedPart(sanitise(raw.base)) }
  } catch {
    // unreadable: treated as never synced
  }
  return null
}
function writeMeta(meta: Meta) {
  try { localStorage.setItem(META_KEY, JSON.stringify(meta)) } catch { /* sync still works this session */ }
}
function clearMeta() {
  try { localStorage.removeItem(META_KEY) } catch { /* nothing to clear */ }
}

/** 'slug:week:day' for every day whose blocks are all ticked (the day_progress rows). */
function doneDays(checked: Synced['checked']): Set<string> {
  const out = new Set<string>()
  for (const course of catalog)
    for (const week of course.weeks)
      for (const day of week.days)
        if (isDayDone(checked, course.slug, week.number, day)) out.add(`${course.slug}:${week.number}:${day.number}`)
  return out
}

// ─── Errors ─────────────────────────────────────────────────────────────────

class SyncError extends Error {
  readonly kind: 'offline' | 'conflict' | 'auth' | 'other'
  constructor(message: string, kind: SyncError['kind']) {
    super(message)
    this.kind = kind
  }
}

function classify(error: { message?: string; code?: string; status?: number } | unknown): SyncError {
  const e = (error ?? {}) as { message?: string; code?: string; status?: number }
  const message = e.message ?? String(error)
  if ((typeof navigator !== 'undefined' && navigator.onLine === false) || /failed to fetch|networkerror|load failed|network request failed|fetch failed/i.test(message)) {
    return new SyncError(message, 'offline')
  }
  // 23505 duplicate, P0001 the attempt guard, 23503 a missing checkpoint, 42501 row security:
  // the server holds something this browser didn't know about. Download, merge, try again.
  if (e.code && ['23505', 'P0001', '23503', '42501'].includes(e.code)) return new SyncError(message, 'conflict')
  if (e.code === 'PGRST301' || e.status === 401) return new SyncError(message, 'auth')
  return new SyncError(message, 'other')
}

async function run(query: PromiseLike<{ error: unknown }>) {
  const { error } = await query
  if (error) throw classify(error)
}

// ─── Download ───────────────────────────────────────────────────────────────

/**
 * Every row of a table that belongs to this learner, a page at a time (the API returns at most
 * 1,000 rows per request). Always filtered by user_id: an admin may *read* everyone's rows, and
 * those must never be pulled into the admin's own progress.
 */
async function fetchAll<T>(table: string, columns: string, orderBy: string[], uid: string): Promise<T[]> {
  const db = requireSupabase()
  const PAGE = 1000
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    let query = db.from(table).select(columns).eq('user_id', uid)
    for (const column of orderBy) query = query.order(column)
    const { data, error } = await query.range(from, from + PAGE - 1)
    if (error) throw classify(error)
    out.push(...(data as T[]))
    if (!data || data.length < PAGE) return out
  }
}

async function pull(uid: string): Promise<Synced> {
  const db = requireSupabase()
  const [blocks, studyDays, enrollments, checkpoints, attempts, profile] = await Promise.all([
    fetchAll<RemoteRows['blocks'][number]>('block_progress', 'course_slug, week, day, block_key', ['course_slug', 'week', 'day', 'block_key'], uid),
    fetchAll<RemoteRows['studyDays'][number]>('study_days', 'studied_on', ['studied_on'], uid),
    fetchAll<RemoteRows['enrollments'][number]>('enrollments', 'course_slug, started_on', ['course_slug'], uid),
    fetchAll<RemoteRows['checkpoints'][number]>('checkpoints', 'kind, key, triggered_at, seen', ['kind', 'key'], uid),
    fetchAll<RemoteRows['attempts'][number]>('checkpoint_attempts', 'kind, key, attempt, finished_at, passed, score', ['kind', 'key', 'attempt'], uid),
    db.from('profiles').select('app_state, role').eq('id', uid).maybeSingle(),
  ])
  if (profile.error) throw classify(profile.error)
  setAccountStatus({ role: profile.data?.role === 'admin' ? 'admin' : 'student' })
  return fromRows({ blocks, studyDays, enrollments, checkpoints, attempts, appState: profile.data?.app_state ?? {} })
}

// ─── Upload ─────────────────────────────────────────────────────────────────

const chunks = <T,>(rows: T[], size = 500) => Array.from({ length: Math.ceil(rows.length / size) }, (_, i) => rows.slice(i * size, (i + 1) * size))

/** A few at a time: enough to be quick, few enough not to trip the API's rate limits. */
async function inParallel<T>(items: T[], fn: (item: T) => Promise<void>, limit = 8) {
  for (const batch of chunks(items, limit)) await Promise.all(batch.map(fn))
}

async function pushOps(ops: Ops, uid: string) {
  const db = requireSupabase()
  const mine = <T extends object>(rows: T[]) => rows.map((r) => ({ ...r, user_id: uid }))

  // Checkpoints before their attempts (attempts reference them).
  for (const rows of chunks(mine(ops.checkpointsUpsert))) await run(db.from('checkpoints').upsert(rows, { onConflict: 'user_id,kind,key' }))
  for (const rows of chunks(mine(ops.attemptsInsert))) await run(db.from('checkpoint_attempts').insert(rows))
  for (const a of ops.attemptsUpdate) {
    await run(db.from('checkpoint_attempts').update({ finished_at: a.finished_at, passed: a.passed, score: a.score })
      .match({ user_id: uid, kind: a.kind, key: a.key, attempt: a.attempt }))
  }

  for (const rows of chunks(mine(ops.blocksAdd))) {
    await run(db.from('block_progress').upsert(rows, { onConflict: 'user_id,course_slug,week,day,block_key', ignoreDuplicates: true }))
  }
  await inParallel(ops.blocksRemove, (r) => run(db.from('block_progress').delete().match({ ...r, user_id: uid })))
  for (const rows of chunks(mine(ops.daysAdd))) {
    await run(db.from('day_progress').upsert(rows, { onConflict: 'user_id,course_slug,week,day', ignoreDuplicates: true }))
  }
  await inParallel(ops.daysRemove, (r) => run(db.from('day_progress').delete().match({ ...r, user_id: uid })))

  for (const rows of chunks(ops.studiedAdd.map((d) => ({ user_id: uid, studied_on: d })))) {
    await run(db.from('study_days').upsert(rows, { onConflict: 'user_id,studied_on', ignoreDuplicates: true }))
  }
  if (ops.studiedRemove.length) await run(db.from('study_days').delete().eq('user_id', uid).in('studied_on', ops.studiedRemove))

  if (ops.enrollUpsert.length) await run(db.from('enrollments').upsert(mine(ops.enrollUpsert), { onConflict: 'user_id,course_slug' }))
  if (ops.enrollRemove.length) await run(db.from('enrollments').delete().eq('user_id', uid).in('course_slug', ops.enrollRemove))

  if (ops.appState) await run(db.from('profiles').update({ app_state: ops.appState }).eq('id', uid))
}

// ─── The engine ─────────────────────────────────────────────────────────────

let user: User | null = null
let started = false
let signingOut = false
let pushTimer: ReturnType<typeof setTimeout> | undefined
let retryTimer: ReturnType<typeof setTimeout> | undefined
let retryDelay = 5_000
let lastPull = 0
let unsubscribeStore: (() => void) | null = null

/** One sync job at a time in this tab, and (where the browser supports it) across tabs. */
let queue: Promise<unknown> = Promise.resolve()
function exclusive<T>(job: () => Promise<T>): Promise<T> {
  const locked = () => (typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('snp-sync', job) as Promise<T>
    : job())
  const next = queue.then(locked, locked)
  queue = next.catch(() => undefined)
  return next
}

const saved = () => setAccountStatus({ state: 'saved', savedAt: Date.now(), message: null })

/** Merge the server's state with this browser's and write back what the server is missing. */
async function reconcile(uid: string): Promise<void> {
  const remote = await pull(uid)
  lastPull = Date.now()
  const meta = readMeta()
  let merged: Synced = EMPTY
  let firstHere = false
  update((s) => {
    const local = syncedPart(s)
    if (meta?.userId === uid) merged = merge(meta.base, local, remote)
    // Another account's progress was left in this browser (its session ended without signing
    // out): it isn't this learner's, so don't mix it in.
    else if (meta) merged = remote
    // First sign-in in this browser: what was done before signing in joins the account.
    else { merged = merge(EMPTY, local, remote); firstHere = true }
    return sameSynced(local, merged) && s.learnerId === uid ? s : { ...s, ...merged, learnerId: uid }
  })
  const ops = diff(remote, merged, doneDays)
  if (!isEmpty(ops)) await pushOps(ops, uid)
  writeMeta({ userId: uid, base: merged })
  if (firstHere) await rememberTimezone(uid)
}

/** Send this browser's changes since the last sync. */
async function push(uid: string): Promise<void> {
  const meta = readMeta()
  if (meta?.userId !== uid) return reconcile(uid)
  const current = syncedPart(getState())
  const ops = diff(meta.base, current, doneDays)
  if (isEmpty(ops)) return
  setAccountStatus({ state: 'saving' })
  await pushOps(ops, uid)
  writeMeta({ userId: uid, base: current })
}

/** Run a sync job, turning failures into status (and retries) instead of errors. */
async function attempt(job: (uid: string) => Promise<void>): Promise<void> {
  const uid = user?.id
  if (!uid) return
  try {
    await exclusive(async () => {
      try {
        await job(uid)
      } catch (error) {
        const e = error instanceof SyncError ? error : classify(error)
        // The server knew something this browser didn't: merge with it and try once more.
        if (e.kind === 'conflict') await reconcile(uid)
        else if (e.kind === 'auth') { await requireSupabase().auth.refreshSession(); await job(uid) }
        else throw e
      }
    })
    retryDelay = 5_000
    clearTimeout(retryTimer)
    saved()
    // Changes made while that was running go out next.
    const meta = readMeta()
    if (meta && !sameSynced(meta.base, syncedPart(getState()))) schedulePush()
  } catch (error) {
    const e = error instanceof SyncError ? error : classify(error)
    if (e.kind === 'offline') {
      setAccountStatus({ state: 'offline', message: 'No connection. Your progress is kept on this device and saved when you are back online.' })
    } else {
      setAccountStatus({ state: 'error', message: `Couldn't save to your account: ${e.message}. Your progress is kept on this device; it will try again.` })
    }
    clearTimeout(retryTimer)
    retryTimer = setTimeout(() => void attempt(push), retryDelay)
    retryDelay = Math.min(retryDelay * 2, 120_000)
  }
}

function schedulePush() {
  if (!user || signingOut) return
  clearTimeout(pushTimer)
  pushTimer = setTimeout(() => void attempt(push), 400)
}

/** Download what other devices did (throttled: at most every 30 s). */
export function refresh(force = false) {
  if (!user || (!force && Date.now() - lastPull < 30_000)) return
  void attempt(reconcile)
}

async function rememberTimezone(uid: string) {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timezone) await requireSupabase().from('profiles').update({ timezone }).eq('id', uid)
  } catch {
    // the default (Africa/Lagos) stays; it can be changed in settings later
  }
}

async function onSignedIn(next: User) {
  user = next
  setAccountStatus({ state: 'loading', email: next.email ?? null, userId: next.id, message: null })
  unsubscribeStore ??= subscribe(schedulePush)
  await attempt(reconcile)
}

function onSignedOut(expected: boolean) {
  const wasSignedIn = user !== null
  user = null
  clearTimeout(pushTimer)
  clearTimeout(retryTimer)
  unsubscribeStore?.()
  unsubscribeStore = null
  setAccountStatus({
    state: 'signed-out', email: null, userId: null, role: null, savedAt: null,
    // Signed out somewhere else, or the session ran out: the progress here is kept, and signing
    // in again (same account) merges it.
    message: wasSignedIn && !expected ? 'You were signed out. Your progress is still on this device; sign in again to keep saving it.' : getAccountStatus().message,
  })
}

const LINK_ELSEWHERE = 'That sign-in link was opened in a different browser or device from the one that asked for it. Type the 6-digit code from the email instead, or ask for a new email here.'

/** Start once per page: restores a saved session, finishes a sign-in link, and keeps progress in sync. */
export function startSync() {
  if (started) return
  started = true
  if (!accountConfig) { setAccountStatus({ state: 'off' }); return }
  const db = requireSupabase()

  // Arriving from a sign-in email.
  const query = new URLSearchParams(window.location.search)
  const arrivedWithCode = query.has('code')
  const linkError = query.get('error_description')
  if (linkError) {
    setAccountStatus({ message: /expired|invalid/i.test(linkError) ? 'That sign-in link has expired or was already used. Ask for a new one below.' : linkError })
  }
  // Show the Account page (signed in, or why not). supabase-js may already have removed ?code=
  // from the address by now, so this goes by how the page was opened, not by what's left in it.
  let landed = false
  const cleanUrl = () => {
    if (landed) return
    landed = true
    window.history.replaceState(null, '', `${window.location.pathname}#/account`)
    // replaceState doesn't fire hashchange; the router listens for it.
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }
  if (linkError) cleanUrl()

  db.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    // Supabase calls this inside its own lock: don't await its API here, hand off instead.
    setTimeout(() => {
      if (session?.user) {
        if (arrivedWithCode) cleanUrl()
        if (user?.id !== session.user.id) void onSignedIn(session.user)
        else user = session.user
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
        if (arrivedWithCode && event === 'INITIAL_SESSION') { setAccountStatus({ message: LINK_ELSEWHERE }); cleanUrl() }
        onSignedOut(signingOut)
      }
    }, 0)
  })

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh() })
  window.addEventListener('online', () => { if (user) void attempt(push) })
  setInterval(() => { if (document.visibilityState === 'visible') refresh() }, 5 * 60_000)
}

// ─── Sign-in and sign-out ───────────────────────────────────────────────────

function friendly(message: string): string {
  if (/rate limit|too many|security purposes/i.test(message)) return 'Too many sign-in emails in a short time. Wait a minute, then try again.'
  if (/expired|invalid/i.test(message)) return 'That code is wrong or has expired. Use the newest email, or ask for a new code.'
  if (/failed to fetch|network|load failed/i.test(message)) return "Couldn't reach the school's server. Check your connection and try again."
  return message
}

/** Email a sign-in link and a 6-digit code. */
export async function sendCode(email: string): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}${window.location.pathname}` },
  })
  if (error) throw new Error(friendly(error.message))
}

export async function verifyCode(email: string, code: string): Promise<void> {
  const { error } = await requireSupabase().auth.verifyOtp({ email, token: code, type: 'email' })
  if (error) throw new Error(friendly(error.message))
}

/** True when everything made here is on the server (safe to sign out). */
export async function saveNow(): Promise<boolean> {
  await attempt(push)
  const meta = readMeta()
  return !!meta && sameSynced(meta.base, syncedPart(getState()))
}

/**
 * Sign out and clear this browser. Unsaved changes would be lost, so unless `discard` is set this
 * first tries to save and returns false if it couldn't.
 */
export async function signOut(discard = false): Promise<boolean> {
  if (user && !discard && !(await saveNow())) return false
  signingOut = true
  try {
    await requireSupabase().auth.signOut({ scope: 'local' })
  } catch {
    // signed out locally anyway: the saved session is removed below by clearing storage
  }
  clearMeta()
  clearAll()
  onSignedOut(true)
  setAccountStatus({ message: null })
  signingOut = false
  return true
}
