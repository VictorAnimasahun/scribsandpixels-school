import { useSyncExternalStore } from 'react'
import { PRESET_IDS, starterTrackers, trackerProblems, validValue, type Target, type Tracker, type TrackerKind } from '../../domain/nudge/trackers.ts'

/*
 * Nudge's data, local-first like course progress (../store.ts): it lives in this browser and,
 * once accounts sync it, is mirrored to the learner's nudge_trackers / nudge_entries rows.
 */

export type NudgeState = {
  trackers: Tracker[]
  /** tracker id → date → value */
  entries: Record<string, Record<string, number>>
  /** insight key → date last shown (the 7-day cooldown) */
  shownInsights: Record<string, string>
  /** class nudge key → true once dismissed */
  dismissed: Record<string, true>
  /** False until the learner has picked their trackers once. */
  setUp: boolean
}

const KEY = 'snp-nudge-v1'
const DATE = /^\d{4}-\d{2}-\d{2}$/
const KINDS: readonly TrackerKind[] = ['check', 'count', 'number', 'scale', 'duration']
const ID = /^([a-z]{3,10}|c-[0-9a-z]{8})$/

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function asTarget(v: unknown): Target | null {
  if (!isObject(v)) return null
  const { direction, value, per } = v
  if ((direction !== 'atLeast' && direction !== 'atMost') || typeof value !== 'number' || (per !== 'day' && per !== 'week')) return null
  return { direction, value, per }
}

function asTracker(v: unknown): Tracker | null {
  if (!isObject(v) || typeof v.id !== 'string' || !ID.test(v.id) || typeof v.name !== 'string' || !KINDS.includes(v.kind as TrackerKind)) return null
  const t: Tracker = {
    id: v.id,
    name: v.name,
    kind: v.kind as TrackerKind,
    unit: typeof v.unit === 'string' ? v.unit : '',
    target: asTarget(v.target),
    preset: PRESET_IDS.includes(v.preset as never) ? (v.preset as Tracker['preset']) : null,
    order: typeof v.order === 'number' && Number.isFinite(v.order) ? v.order : 0,
    enabled: v.enabled !== false,
    reminderHour: typeof v.reminderHour === 'number' ? v.reminderHour : null,
  }
  return trackerProblems(t).length ? null : t
}

/** Saved data is untrusted (an old version, a half-written save, a hand edit): keep only what has the right shape. */
export function sanitiseNudge(raw: unknown): NudgeState {
  const v = isObject(raw) ? raw : {}
  const seen = new Set<string>()
  const trackers = (Array.isArray(v.trackers) ? v.trackers : []).map(asTracker).filter((t): t is Tracker => {
    if (!t || seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })
  const kindOf = new Map(trackers.map((t) => [t.id, t.kind]))
  const entries: NudgeState['entries'] = {}
  for (const [id, byDate] of Object.entries(isObject(v.entries) ? v.entries : {})) {
    const kind = kindOf.get(id)
    if (!kind || !isObject(byDate)) continue
    const kept = Object.entries(byDate).filter(([d, x]) => DATE.test(d) && typeof x === 'number' && validValue(kind, x))
    if (kept.length) entries[id] = Object.fromEntries(kept) as Record<string, number>
  }
  const dates = (o: unknown) => Object.fromEntries(Object.entries(isObject(o) ? o : {}).filter(([, d]) => typeof d === 'string' && DATE.test(d))) as Record<string, string>
  const flags = (o: unknown) => Object.fromEntries(Object.entries(isObject(o) ? o : {}).filter(([, x]) => x === true)) as Record<string, true>
  return {
    trackers: trackers.length ? trackers : starterTrackers(),
    entries,
    shownInsights: dates(v.shownInsights),
    dismissed: flags(v.dismissed),
    setUp: v.setUp === true,
  }
}

function load(): NudgeState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return sanitiseNudge(JSON.parse(raw))
  } catch {
    // storage unavailable or unreadable: start fresh
  }
  return sanitiseNudge(null)
}

let state: NudgeState = load()
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    state = load()
    listeners.forEach((l) => l())
  })
}

export function updateNudge(change: (draft: NudgeState) => NudgeState) {
  state = change(state)
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore: it just won't persist
  }
  listeners.forEach((l) => l())
}

export const getNudgeState = () => state

/** Called on every change (from this tab or another one): account sync listens here. */
export function subscribeNudge(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** Signing out: nothing of the last learner's life data stays in this browser. */
export const clearNudge = () => updateNudge(() => sanitiseNudge(null))

export function useNudge(): NudgeState {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    () => state,
  )
}

// ─── Changes (pure: state in, state out) ─────────────────────────────────────

const without = <V,>(o: Record<string, V>, key: string): Record<string, V> => Object.fromEntries(Object.entries(o).filter(([k]) => k !== key))

/** Log (or replace) one day's value; a value the tracker can't hold is ignored. */
export function logValue(s: NudgeState, trackerId: string, date: string, value: number): NudgeState {
  const t = s.trackers.find((x) => x.id === trackerId)
  if (!t || !DATE.test(date) || !validValue(t.kind, value)) return s
  return { ...s, entries: { ...s.entries, [trackerId]: { ...s.entries[trackerId], [date]: value } } }
}

/** Remove one day's value (an un-tick). */
export function clearValue(s: NudgeState, trackerId: string, date: string): NudgeState {
  if (!(date in (s.entries[trackerId] ?? {}))) return s
  return { ...s, entries: { ...s.entries, [trackerId]: without(s.entries[trackerId], date) } }
}

/** Add to today's count (the + button), never below 0. */
export const bump = (s: NudgeState, trackerId: string, date: string, by: number) =>
  logValue(s, trackerId, date, Math.max(0, (s.entries[trackerId]?.[date] ?? 0) + by))

/** Add or replace a tracker after checking it; returns the problems instead when it can't be saved. */
export function saveTracker(s: NudgeState, t: Tracker): NudgeState | string[] {
  const problems = trackerProblems(t)
  if (problems.length) return problems
  const exists = s.trackers.some((x) => x.id === t.id)
  const trackers = exists ? s.trackers.map((x) => (x.id === t.id ? t : x)) : [...s.trackers, { ...t, order: Math.max(-1, ...s.trackers.map((x) => x.order)) + 1 }]
  // A tracker whose kind changed may hold values the new kind can't (a count of 9 isn't a 1–5 mood).
  const kept = exists ? Object.fromEntries(Object.entries(s.entries[t.id] ?? {}).filter(([, v]) => validValue(t.kind, v))) : {}
  return { ...s, trackers, entries: { ...s.entries, [t.id]: kept } }
}

/** Delete a learner-made tracker and its entries. Presets are switched off instead, so they keep their history. */
export function removeTracker(s: NudgeState, id: string): NudgeState {
  const t = s.trackers.find((x) => x.id === id)
  if (!t) return s
  if (t.preset) return { ...s, trackers: s.trackers.map((x) => (x.id === id ? { ...x, enabled: false } : x)) }
  return { ...s, trackers: s.trackers.filter((x) => x.id !== id), entries: without(s.entries, id) }
}

/** Move a tracker one place up or down among the enabled ones (Nudge's card order). */
export function move(s: NudgeState, id: string, direction: -1 | 1): NudgeState {
  const shown = [...s.trackers].filter((t) => t.enabled).sort((a, b) => a.order - b.order)
  const i = shown.findIndex((t) => t.id === id)
  const j = i + direction
  if (i < 0 || j < 0 || j >= shown.length) return s
  const [a, b] = [shown[i], shown[j]]
  return { ...s, trackers: s.trackers.map((t) => (t.id === a.id ? { ...t, order: b.order } : t.id === b.id ? { ...t, order: a.order } : t)) }
}

/** The enabled trackers in the learner's order. */
export const shownTrackers = (s: NudgeState) => s.trackers.filter((t) => t.enabled).sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1))
