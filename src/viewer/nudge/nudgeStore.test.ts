import { describe, expect, it } from 'vitest'
import { presetTracker, type Tracker } from '../../domain/nudge/trackers.ts'
import { bump, clearValue, logValue, move, removeTracker, sanitiseNudge, saveTracker, shownTrackers, type NudgeState } from './nudgeStore.ts'

const fresh = (): NudgeState => sanitiseNudge(null)
const steps: Tracker = { id: 'c-steps001', name: 'Steps', kind: 'count', unit: 'steps', target: { direction: 'atLeast', value: 8000, per: 'day' }, preset: null, order: 0, enabled: true, reminderHour: 21 }

describe('sanitiseNudge', () => {
  it('starts a new learner on the presets, not yet set up', () => {
    const s = fresh()
    expect(s.setUp).toBe(false)
    expect(shownTrackers(s).map((t) => t.id)).toEqual(['food', 'exercise', 'word', 'book', 'weight', 'tasks'])
  })
  it('keeps only well-formed data', () => {
    const s = sanitiseNudge({
      setUp: true,
      trackers: [presetTracker('water', 0, true), steps, { ...steps }, { id: 'DROP TABLE', name: 'x', kind: 'count' }, { ...steps, id: 'c-bad00000', kind: 'scale', target: { direction: 'atLeast', value: 9, per: 'day' } }],
      entries: {
        water: { '2026-10-26': 6, '2026-10-27': -2, 'yesterday': 3, '2026-10-25': 'eight' },
        'c-steps001': { '2026-10-26': 9120 },
        ghost: { '2026-10-26': 1 },
      },
      shownInsights: { 'trend:water:up': '2026-10-20', bad: 7 },
      dismissed: { 'behind:french:1:1': true, other: 'yes' },
    })
    expect(s.trackers.map((t) => t.id)).toEqual(['water', 'c-steps001']) // duplicate, bad id and impossible goal dropped
    expect(s.entries).toEqual({ water: { '2026-10-26': 6 }, 'c-steps001': { '2026-10-26': 9120 } })
    expect(s.shownInsights).toEqual({ 'trend:water:up': '2026-10-20' })
    expect(s.dismissed).toEqual({ 'behind:french:1:1': true })
    expect(s.setUp).toBe(true)
  })
  it('never crashes on garbage', () => {
    for (const junk of [undefined, 42, 'x', [], { trackers: 'no' }, { entries: [1, 2] }]) expect(() => sanitiseNudge(junk)).not.toThrow()
  })
})

describe('logging', () => {
  it('logs, bumps and clears values', () => {
    let s = fresh()
    s = logValue(s, 'exercise', '2026-10-27', 30)
    s = bump(s, 'book', '2026-10-27', 5)
    s = bump(s, 'book', '2026-10-27', 5)
    expect(s.entries.exercise).toEqual({ '2026-10-27': 30 })
    expect(s.entries.book).toEqual({ '2026-10-27': 10 })
    expect(bump(s, 'book', '2026-10-27', -50).entries.book['2026-10-27']).toBe(0)
    expect(clearValue(s, 'book', '2026-10-27').entries.book).toEqual({})
  })
  it('ignores what a tracker can\'t hold', () => {
    const s = fresh()
    expect(logValue(s, 'word', '2026-10-27', 3)).toBe(s)       // a yes/no is 0 or 1
    expect(logValue(s, 'nope', '2026-10-27', 1)).toBe(s)       // no such tracker
    expect(logValue(s, 'book', '27/10/2026', 1)).toBe(s)       // not a date
    expect(clearValue(s, 'book', '2026-10-27')).toBe(s)        // nothing to clear
  })
})

describe('editing trackers', () => {
  it('adds a learner-made tracker at the end', () => {
    const s = saveTracker(fresh(), steps) as NudgeState
    expect(shownTrackers(s).at(-1)).toMatchObject({ id: 'c-steps001', order: 9 })
  })
  it('refuses a tracker with problems, saying why', () => {
    expect(saveTracker(fresh(), { ...steps, name: '' })).toEqual(['Give it a name.'])
  })
  it('drops values the new kind can\'t hold when a kind changes', () => {
    let s = saveTracker(fresh(), steps) as NudgeState
    s = logValue(logValue(s, 'c-steps001', '2026-10-26', 3), 'c-steps001', '2026-10-27', 9000)
    s = saveTracker(s, { ...steps, kind: 'scale', unit: '', target: null }) as NudgeState
    expect(s.entries['c-steps001']).toEqual({ '2026-10-26': 3 })
  })
  it('switches a preset off (keeping its history) but deletes a learner-made one', () => {
    let s = logValue(fresh(), 'food', '2026-10-27', 1800)
    s = removeTracker(s, 'food')
    expect(s.trackers.find((t) => t.id === 'food')?.enabled).toBe(false)
    expect(s.entries.food).toEqual({ '2026-10-27': 1800 })
    s = logValue(saveTracker(s, steps) as NudgeState, 'c-steps001', '2026-10-27', 9000)
    s = removeTracker(s, 'c-steps001')
    expect(s.trackers.some((t) => t.id === 'c-steps001')).toBe(false)
    expect('c-steps001' in s.entries).toBe(false)
  })
  it('reorders cards among the shown ones', () => {
    let s = fresh()
    s = move(s, 'exercise', -1)
    expect(shownTrackers(s).slice(0, 2).map((t) => t.id)).toEqual(['exercise', 'food'])
    expect(move(s, 'exercise', -1)).toBe(s) // already first
    s = move(s, 'tasks', 1)
    expect(shownTrackers(s).at(-1)?.id).toBe('tasks') // last shown stays last (hidden presets don't count)
  })
})
