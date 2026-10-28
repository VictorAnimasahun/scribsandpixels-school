import { PRESET_IDS, trackerProblems, validValue, type Target, type Tracker, type TrackerKind } from '../../domain/nudge/trackers.ts'
import type { NudgeState } from './nudgeStore.ts'

/*
 * The pure half of Nudge's account sync (the network half is in ../sync.ts), built like the course
 * sync (../syncModel.ts): three snapshots (base = what the server held at the last sync, local,
 * remote), a three-way merge so a change made on either side survives (removals included), and a
 * diff that turns "server → merged" into rows to write.
 *
 * Synced: trackers and entries. Device-only: dismissed class nudges, the insight cooldown and the
 * "set up" flag (small conveniences; the course sync owns profiles.app_state and rewrites it whole).
 */

export type NudgeSynced = {
  trackers: Record<string, Tracker>
  /** 'trackerId|YYYY-MM-DD' → value */
  entries: Record<string, number>
}

export const EMPTY_NUDGE: NudgeSynced = { trackers: {}, entries: {} }

export function nudgeSyncedPart(s: Pick<NudgeState, 'trackers' | 'entries'>): NudgeSynced {
  const entries: Record<string, number> = {}
  for (const [id, byDate] of Object.entries(s.entries)) for (const [date, v] of Object.entries(byDate)) entries[`${id}|${date}`] = v
  return { trackers: Object.fromEntries(s.trackers.map((t) => [t.id, t])), entries }
}

/** The merged result back in the store's shape (entries whose tracker is gone are dropped). */
export function applyNudgeSynced(s: NudgeState, synced: NudgeSynced): NudgeState {
  const trackers = Object.values(synced.trackers).sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1))
  const entries: NudgeState['entries'] = {}
  for (const [key, v] of Object.entries(synced.entries)) {
    const [id, date] = key.split('|')
    if (!synced.trackers[id]) continue
    ;(entries[id] ??= {})[date] = v
  }
  return { ...s, trackers, entries }
}

/** Field by field, never by JSON text: trackers built in different places list their fields in a
 *  different order, and an unchanged copy mistaken for an edit would overwrite a real one. */
export function sameTracker(a: Tracker | undefined, b: Tracker | undefined): boolean {
  if (!a || !b) return a === b
  return a.id === b.id && a.name === b.name && a.kind === b.kind && a.unit === b.unit && a.preset === b.preset
    && a.order === b.order && a.enabled === b.enabled && a.reminderHour === b.reminderHour
    && (a.target === null ? b.target === null : b.target !== null && a.target.direction === b.target.direction && a.target.value === b.target.value && a.target.per === b.target.per)
}

/** Three-way merge of a map: whichever side changed a key since base wins; if both did, this browser's change. */
function merge3<V>(base: Record<string, V>, local: Record<string, V>, remote: Record<string, V>, same: (a: V | undefined, b: V | undefined) => boolean): Record<string, V> {
  const out: Record<string, V> = {}
  for (const k of new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)])) {
    const b = base[k], l = local[k], r = remote[k]
    const v = same(l, b) ? r : l
    if (v !== undefined) out[k] = v
  }
  return out
}

export function mergeNudge(base: NudgeSynced, local: NudgeSynced, remote: NudgeSynced): NudgeSynced {
  const trackers = merge3(base.trackers, local.trackers, remote.trackers, sameTracker)
  const entries = merge3(base.entries, local.entries, remote.entries, (a, b) => a === b)
  // A tracker deleted on one side takes its entries with it, even ones logged on the other side.
  for (const key of Object.keys(entries)) if (!trackers[key.split('|')[0]]) delete entries[key]
  return { trackers, entries }
}

export function sameNudge(a: NudgeSynced, b: NudgeSynced): boolean {
  const ids = new Set([...Object.keys(a.trackers), ...Object.keys(b.trackers)])
  for (const id of ids) if (!sameTracker(a.trackers[id], b.trackers[id])) return false
  const keys = Object.keys(a.entries)
  return keys.length === Object.keys(b.entries).length && keys.every((k) => a.entries[k] === b.entries[k])
}

// ─── Rows ───────────────────────────────────────────────────────────────────

export type TrackerRow = {
  tracker_id: string
  name: string
  kind: TrackerKind
  unit: string
  target_direction: Target['direction'] | null
  target_value: number | null
  target_per: Target['per'] | null
  sort_order: number
  enabled: boolean
  reminder_hour: number | null
}
export type EntryRow = { tracker_id: string; logged_on: string; value: number }

const ID = /^([a-z]{3,10}|c-[0-9a-z]{8})$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const KINDS: readonly TrackerKind[] = ['check', 'count', 'number', 'scale', 'duration']

export function trackerRow(t: Tracker): TrackerRow {
  return {
    tracker_id: t.id, name: t.name.trim(), kind: t.kind, unit: t.unit,
    target_direction: t.target?.direction ?? null, target_value: t.target?.value ?? null, target_per: t.target?.per ?? null,
    sort_order: Math.max(0, Math.min(500, Math.round(t.order))), enabled: t.enabled, reminder_hour: t.reminderHour,
  }
}

export type NudgeOps = {
  trackersUpsert: TrackerRow[]
  trackersDelete: string[]
  entriesUpsert: EntryRow[]
  entriesDelete: { tracker_id: string; logged_on: string }[]
}

export const isEmptyNudge = (ops: NudgeOps) => Object.values(ops).every((v) => v.length === 0)

/** Everything to write so the server goes from `before` to `after`. Rows the server would refuse are skipped. */
export function diffNudge(before: NudgeSynced, after: NudgeSynced): NudgeOps {
  const ops: NudgeOps = { trackersUpsert: [], trackersDelete: [], entriesUpsert: [], entriesDelete: [] }
  for (const [id, t] of Object.entries(after.trackers)) {
    if (ID.test(id) && !sameTracker(before.trackers[id], t) && !trackerProblems(t).length) ops.trackersUpsert.push(trackerRow(t))
  }
  for (const id of Object.keys(before.trackers)) if (!after.trackers[id] && ID.test(id)) ops.trackersDelete.push(id)
  for (const [key, v] of Object.entries(after.entries)) {
    const [tracker_id, logged_on] = key.split('|')
    const t = after.trackers[tracker_id]
    if (t && DATE.test(logged_on) && before.entries[key] !== v && validValue(t.kind, v)) ops.entriesUpsert.push({ tracker_id, logged_on, value: v })
  }
  for (const key of Object.keys(before.entries)) {
    const [tracker_id, logged_on] = key.split('|')
    // A deleted tracker's entries go with it on the server (cascade): no separate deletes.
    if (!(key in after.entries) && after.trackers[tracker_id] && DATE.test(logged_on)) ops.entriesDelete.push({ tracker_id, logged_on })
  }
  return ops
}

/** What the server holds, in the app's shape. Rows are trusted only as far as their shape. */
export function nudgeFromRows(trackers: TrackerRow[], entries: EntryRow[]): NudgeSynced {
  const out: NudgeSynced = { trackers: {}, entries: {} }
  for (const r of trackers) {
    // Unknown kinds first: the rules below look the kind up and would fail on one they don't know.
    if (!KINDS.includes(r.kind) || typeof r.name !== 'string' || typeof r.enabled !== 'boolean' || typeof r.sort_order !== 'number') continue
    const target = r.target_direction && r.target_value !== null && r.target_per ? { direction: r.target_direction, value: r.target_value, per: r.target_per } : null
    const t: Tracker = {
      id: r.tracker_id, name: r.name, kind: r.kind, unit: r.unit ?? '', target,
      preset: (PRESET_IDS as string[]).includes(r.tracker_id) ? (r.tracker_id as Tracker['preset']) : null,
      order: r.sort_order, enabled: r.enabled, reminderHour: r.reminder_hour,
    }
    if (ID.test(t.id) && !trackerProblems(t).length) out.trackers[t.id] = t
  }
  for (const e of entries) {
    const t = out.trackers[e.tracker_id]
    if (t && DATE.test(e.logged_on) && validValue(t.kind, e.value)) out.entries[`${e.tracker_id}|${e.logged_on}`] = e.value
  }
  return out
}
