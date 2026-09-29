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
}

const KEY = 'snp-test-state-v1'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    // storage unavailable: fall through to a fresh state
  }
  return { learnerId: Math.random().toString(36).slice(2, 10), checked: {}, bestScores: {}, gates: {} }
}

let state: State = load()
const listeners = new Set<() => void>()

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
  update((s) => ({ learnerId: s.learnerId, checked: {}, bestScores: {}, gates: {} }))
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
