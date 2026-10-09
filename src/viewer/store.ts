import { useSyncExternalStore } from 'react'

/*
 * Test-build progress, kept in this browser's localStorage only. It's a
 * stand-in until real accounts exist; nothing leaves the device.
 */

export type GateRecord = {
  /** When the gate popped up; from then on the app is locked until it's passed. */
  triggeredAt: number
  attempts: { finishedAt: number; passed: boolean; score: number }[]
  /** Question ids shown so far, oldest first (so retries get new questions). */
  seen: string[]
}

export type State = {
  learnerId: string
  checked: Record<string, true>
  /** Best score (0–1) per quiz key. */
  bestScores: Record<string, number>
  gates: Record<string, GateRecord>
  /** Course slug → enrolment date (calendar pacing starts the following Monday). */
  startedOn: Record<string, string>
  /** "slug:week" → week-quiz attempts (same record shape as a gate). */
  weekQuizzes: Record<string, GateRecord>
  /** Local dates ('YYYY-MM-DD') on which at least one block was ticked: the streak is built from these. */
  studied: Record<string, true>
  /** The course Today shows; the last one opened. */
  activeCourse: string | null
}

const KEY = 'snp-test-state-v1'

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

const isGate = (g: unknown): g is GateRecord =>
  isObject(g) && typeof g.triggeredAt === 'number' && Array.isArray(g.seen) &&
  Array.isArray(g.attempts) && g.attempts.every((a) => isObject(a) && typeof a.finishedAt === 'number' && typeof a.passed === 'boolean' && typeof a.score === 'number')

/** Saved state is untrusted (an old version, a half-written save, or a hand edit): keep only the
 *  parts with the right shape, so bad data can never crash or lock the app. */
export function sanitise(raw: unknown): State {
  const v = isObject(raw) ? raw : {}
  const pick = <T,>(o: unknown, ok: (x: unknown) => x is T) =>
    Object.fromEntries(Object.entries(isObject(o) ? o : {}).filter(([, x]) => ok(x))) as Record<string, T>
  return {
    learnerId: typeof v.learnerId === 'string' && v.learnerId ? v.learnerId : Math.random().toString(36).slice(2, 10),
    checked: pick(v.checked, (x): x is true => x === true),
    bestScores: pick(v.bestScores, (x): x is number => typeof x === 'number' && x >= 0 && x <= 1),
    gates: pick(v.gates, isGate),
    startedOn: pick(v.startedOn, (x): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)),
    weekQuizzes: pick(v.weekQuizzes, isGate),
    studied: Object.fromEntries(Object.entries(pick(v.studied, (x): x is true => x === true)).filter(([d]) => /^\d{4}-\d{2}-\d{2}$/.test(d))),
    activeCourse: typeof v.activeCourse === 'string' && v.activeCourse ? v.activeCourse : null,
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return sanitise(JSON.parse(raw))
  } catch {
    // storage unavailable or unreadable: fall through to a fresh state
  }
  return sanitise(null)
}

let state: State = load()
const listeners = new Set<() => void>()

// Another tab saved progress: pick it up, so two open tabs don't overwrite each other's ticks.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    state = load()
    listeners.forEach((l) => l())
  })
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore: progress just won't persist
  }
}

export function update(change: (draft: State) => State) {
  state = change(state)
  save()
  listeners.forEach((l) => l())
}

export function resetProgress() {
  update((s) => ({ learnerId: s.learnerId, checked: {}, bestScores: {}, gates: {}, startedOn: {}, weekQuizzes: {}, studied: {}, activeCourse: s.activeCourse }))
}

export function useStore(): State {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
  )
}

export const dayKey = (course: string, week: number, day: number) => `${course}:${week}:${day}`
