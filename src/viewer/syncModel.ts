import type { GateRecord, State } from './store.ts'

/*
 * The pure half of account sync (the network half is sync.ts).
 *
 * The app keeps its whole state in the browser (store.ts) and, once a learner signs in, mirrors
 * the parts below to Supabase. Three snapshots are involved:
 *   base   – what the server held the last time this browser synced with it
 *   local  – this browser's state now
 *   remote – what the server holds now (another device may have changed it)
 * merge() combines them so a change made on either side survives, including removals: a block
 * unticked here stays unticked even though the server still has it, because base shows it was
 * there before. diff() then turns "server state → merged state" into rows to write.
 */

export type Synced = Pick<State, 'checked' | 'studied' | 'startedOn' | 'gates' | 'weekQuizzes' | 'bestScores' | 'activeCourse'>

export const EMPTY: Synced = { checked: {}, studied: {}, startedOn: {}, gates: {}, weekQuizzes: {}, bestScores: {}, activeCourse: null }

export const syncedPart = (s: Synced): Synced => ({
  checked: s.checked, studied: s.studied, startedOn: s.startedOn, gates: s.gates,
  weekQuizzes: s.weekQuizzes, bestScores: s.bestScores, activeCourse: s.activeCourse,
})

// ─── Merge ──────────────────────────────────────────────────────────────────

/** Three-way merge of a map: whichever side changed a key since base wins; if both did, resolve(). */
function merge3<V>(base: Record<string, V>, local: Record<string, V>, remote: Record<string, V>, resolve: (l: V | undefined, r: V | undefined) => V | undefined): Record<string, V> {
  const out: Record<string, V> = {}
  for (const k of new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)])) {
    const b = base[k], l = local[k], r = remote[k]
    const v = l === b ? r : r === b ? l : resolve(l, r)
    if (v !== undefined) out[k] = v
  }
  return out
}

/** A finished attempt has a result; a provisional one (just started, or left mid-way) is a 0% fail. */
const finished = (a: GateRecord['attempts'][number]) => a.passed || a.score > 0

/** Two copies of one checkpoint. Attempts are permanent once finished, so they're merged by
 *  attempt number: a finished result beats a provisional one, and the server's finished result
 *  beats this browser's (the server refuses to change a finished attempt anyway). */
export function mergeRecord(local: GateRecord | undefined, remote: GateRecord | undefined): GateRecord | undefined {
  if (!local || !remote) return local ?? remote
  const attempts = []
  for (let i = 0; i < Math.max(local.attempts.length, remote.attempts.length); i++) {
    const l = local.attempts[i], r = remote.attempts[i]
    attempts.push(!l ? r : !r ? l : finished(r) || !finished(l) ? r : l)
  }
  return {
    triggeredAt: Math.min(local.triggeredAt, remote.triggeredAt),
    attempts,
    // Oldest first: the server's order, then anything only this browser has seen.
    seen: [...remote.seen, ...local.seen.filter((id) => !remote.seen.includes(id))],
  }
}

/** Checkpoint records can't be deleted on the server, so they merge as a union. */
function mergeRecords(local: Record<string, GateRecord>, remote: Record<string, GateRecord>): Record<string, GateRecord> {
  const out: Record<string, GateRecord> = {}
  for (const k of new Set([...Object.keys(local), ...Object.keys(remote)])) out[k] = mergeRecord(local[k], remote[k])!
  return out
}

export function merge(base: Synced, local: Synced, remote: Synced): Synced {
  const either = <V,>(l: V | undefined, r: V | undefined) => l ?? r
  return {
    checked: merge3(base.checked, local.checked, remote.checked, either),
    studied: merge3(base.studied, local.studied, remote.studied, either),
    // Both sides re-planned the same course: the change made in this browser, which the learner is looking at.
    startedOn: merge3(base.startedOn, local.startedOn, remote.startedOn, either),
    bestScores: merge3(base.bestScores, local.bestScores, remote.bestScores, (l, r) => Math.max(l ?? 0, r ?? 0)),
    gates: mergeRecords(local.gates, remote.gates),
    weekQuizzes: mergeRecords(local.weekQuizzes, remote.weekQuizzes),
    activeCourse: local.activeCourse === base.activeCourse ? remote.activeCourse : local.activeCourse,
  }
}

// ─── Rows ───────────────────────────────────────────────────────────────────

export type BlockRow = { course_slug: string; week: number; day: number; block_key: string }
export type DayRow = { course_slug: string; week: number; day: number }
export type CheckpointRow = { kind: 'gate' | 'week'; key: string; triggered_at: string; seen: string[] }
export type AttemptRow = { kind: 'gate' | 'week'; key: string; attempt: number; finished_at: string; passed: boolean; score: number }
export type EnrollmentRow = { course_slug: string; started_on: string }
export type AppState = { activeCourse: string | null; bestScores: Record<string, number> }

const SLUG = /^[a-z0-9-]+$/
const int = (s: string | undefined, min: number, max: number) => {
  const n = Number(s)
  return Number.isInteger(n) && n >= min && n <= max ? n : null
}

/** 'french:3:2:review' → a block_progress row; null for a key the server would refuse. */
export function blockRow(key: string): BlockRow | null {
  const [slug, w, d, block, ...rest] = key.split(':')
  const week = int(w, 1, 99), day = int(d, 1, 6)
  if (rest.length || !SLUG.test(slug ?? '') || week === null || day === null || !block) return null
  return { course_slug: slug, week, day, block_key: block }
}

export const blockKeyOf = (r: BlockRow) => `${r.course_slug}:${r.week}:${r.day}:${r.block_key}`

/** The keys a checkpoint row may have (the database checks the same shapes). */
export const validCheckpointKey = (kind: 'gate' | 'week', key: string) =>
  kind === 'gate' ? /^[a-z0-9-]+:[0-9]{1,2}:[1-6]$/.test(key) : /^[a-z0-9-]+:[0-9]{1,2}$/.test(key)

const iso = (ms: number) => new Date(ms).toISOString()
const DATE = /^\d{4}-\d{2}-\d{2}$/

// ─── Diff ───────────────────────────────────────────────────────────────────

/** Everything to write so the server goes from `before` to `after`. */
export type Ops = {
  blocksAdd: BlockRow[]
  blocksRemove: BlockRow[]
  daysAdd: DayRow[]
  daysRemove: DayRow[]
  studiedAdd: string[]
  studiedRemove: string[]
  enrollUpsert: EnrollmentRow[]
  enrollRemove: string[]
  checkpointsUpsert: CheckpointRow[]
  attemptsInsert: AttemptRow[]
  attemptsUpdate: AttemptRow[]
  appState: AppState | null
}

export const isEmpty = (ops: Ops) =>
  Object.values(ops).every((v) => (Array.isArray(v) ? v.length === 0 : v === null))

const added = (before: Record<string, unknown>, after: Record<string, unknown>) => Object.keys(after).filter((k) => !(k in before))

function recordOps(kind: 'gate' | 'week', before: Record<string, GateRecord>, after: Record<string, GateRecord>, ops: Ops) {
  for (const [key, rec] of Object.entries(after)) {
    if (!validCheckpointKey(kind, key)) continue
    const old = before[key]
    const seenChanged = !old || old.seen.length !== rec.seen.length || old.seen.some((id, i) => id !== rec.seen[i])
    if (!old || old.triggeredAt !== rec.triggeredAt || seenChanged) {
      ops.checkpointsUpsert.push({ kind, key, triggered_at: iso(rec.triggeredAt), seen: rec.seen.slice(-2000) })
    }
    rec.attempts.forEach((a, i) => {
      const row: AttemptRow = { kind, key, attempt: i + 1, finished_at: iso(a.finishedAt), passed: a.passed, score: Math.min(1, Math.max(0, a.score)) }
      const was = old?.attempts[i]
      if (!was) ops.attemptsInsert.push(row)
      else if (was.passed !== a.passed || was.score !== a.score || was.finishedAt !== a.finishedAt) ops.attemptsUpdate.push(row)
    })
    // Attempts or whole checkpoints missing from `after` are never deleted: the server keeps them.
  }
}

/**
 * The rows to write. `doneDays` lists a state's finished days as 'slug:week:day' (every block
 * ticked, worked out from the course content); it's passed in to keep this file pure.
 */
export function diff(before: Synced, after: Synced, doneDays: (checked: Synced['checked']) => Set<string>): Ops {
  const ops: Ops = {
    blocksAdd: [], blocksRemove: [], daysAdd: [], daysRemove: [], studiedAdd: [], studiedRemove: [],
    enrollUpsert: [], enrollRemove: [], checkpointsUpsert: [], attemptsInsert: [], attemptsUpdate: [], appState: null,
  }
  for (const k of added(before.checked, after.checked)) { const r = blockRow(k); if (r) ops.blocksAdd.push(r) }
  for (const k of added(after.checked, before.checked)) { const r = blockRow(k); if (r) ops.blocksRemove.push(r) }

  const daysBefore = doneDays(before.checked), daysAfter = doneDays(after.checked)
  const dayRow = (k: string): DayRow => { const [course_slug, w, d] = k.split(':'); return { course_slug, week: Number(w), day: Number(d) } }
  for (const k of daysAfter) if (!daysBefore.has(k)) ops.daysAdd.push(dayRow(k))
  for (const k of daysBefore) if (!daysAfter.has(k)) ops.daysRemove.push(dayRow(k))

  ops.studiedAdd = added(before.studied, after.studied).filter((d) => DATE.test(d))
  ops.studiedRemove = added(after.studied, before.studied).filter((d) => DATE.test(d))

  for (const [slug, date] of Object.entries(after.startedOn)) {
    if (SLUG.test(slug) && DATE.test(date) && before.startedOn[slug] !== date) ops.enrollUpsert.push({ course_slug: slug, started_on: date })
  }
  ops.enrollRemove = added(after.startedOn, before.startedOn).filter((s) => SLUG.test(s))

  recordOps('gate', before.gates, after.gates, ops)
  recordOps('week', before.weekQuizzes, after.weekQuizzes, ops)

  const scoresChanged = Object.keys({ ...before.bestScores, ...after.bestScores }).some((k) => before.bestScores[k] !== after.bestScores[k])
  if (scoresChanged || before.activeCourse !== after.activeCourse) ops.appState = { activeCourse: after.activeCourse, bestScores: after.bestScores }
  return ops
}

// ─── Rows → state ───────────────────────────────────────────────────────────

export type RemoteRows = {
  blocks: BlockRow[]
  studyDays: { studied_on: string }[]
  enrollments: EnrollmentRow[]
  checkpoints: CheckpointRow[]
  attempts: AttemptRow[]
  appState: unknown
}

/** What the server holds, in the app's shape. Rows are trusted only as far as their shape. */
export function fromRows(rows: RemoteRows): Synced {
  const checked: Record<string, true> = {}
  for (const r of rows.blocks) checked[blockKeyOf(r)] = true
  const studied: Record<string, true> = {}
  for (const r of rows.studyDays) if (DATE.test(r.studied_on)) studied[r.studied_on] = true
  const startedOn: Record<string, string> = {}
  for (const r of rows.enrollments) if (DATE.test(r.started_on)) startedOn[r.course_slug] = r.started_on

  const records: Record<'gate' | 'week', Record<string, GateRecord>> = { gate: {}, week: {} }
  for (const c of rows.checkpoints) {
    records[c.kind][c.key] = { triggeredAt: Date.parse(c.triggered_at), attempts: [], seen: [...c.seen] }
  }
  for (const a of [...rows.attempts].sort((x, y) => x.attempt - y.attempt)) {
    const rec = records[a.kind][a.key]
    // Numbered from 1; a gap (shouldn't happen) is closed up so the array stays dense.
    if (rec) rec.attempts.push({ finishedAt: Date.parse(a.finished_at), passed: a.passed, score: a.score })
  }

  const app = typeof rows.appState === 'object' && rows.appState !== null ? rows.appState as Record<string, unknown> : {}
  const bestScores: Record<string, number> = {}
  if (typeof app.bestScores === 'object' && app.bestScores !== null) {
    for (const [k, v] of Object.entries(app.bestScores)) if (typeof v === 'number' && v >= 0 && v <= 1) bestScores[k] = v
  }
  const activeCourse = typeof app.activeCourse === 'string' && SLUG.test(app.activeCourse) ? app.activeCourse : null
  return { checked, studied, startedOn, gates: records.gate, weekQuizzes: records.week, bestScores, activeCourse }
}

/** Same content, regardless of key order: used to skip no-op state updates. */
export function sameSynced(a: Synced, b: Synced): boolean {
  const norm = (s: Synced) => JSON.stringify(syncedPart(s), (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([x], [y]) => (x < y ? -1 : 1))) : v)
  return norm(a) === norm(b)
}
