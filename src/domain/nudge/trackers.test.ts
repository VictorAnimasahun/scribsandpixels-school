import { describe, expect, it } from 'vitest'
import {
  customId, formatValue, mondayOf, PRESET_IDS, PRESETS, presetTracker, progressToward, starterTrackers,
  trackerProblems, trackerStreak, validValue, weekTotal, type Target,
} from './trackers.ts'

const daily = (direction: Target['direction'], value: number): { target: Target } => ({ target: { direction, value, per: 'day' } })
const weekly = (direction: Target['direction'], value: number): { target: Target } => ({ target: { direction, value, per: 'week' } })

describe('presets', () => {
  it("are Nudge's home cards minus Get Ready, defaults switched on", () => {
    expect(PRESET_IDS).toEqual(['food', 'exercise', 'word', 'book', 'weight', 'tasks', 'mood', 'sleep', 'water'])
    const starter = starterTrackers()
    expect(starter.filter((t) => t.enabled).map((t) => t.id)).toEqual(['food', 'exercise', 'word', 'book', 'weight', 'tasks'])
    expect(starter.map((t) => t.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })
  it('give each learner their own copy of the goal', () => {
    const a = presetTracker('water', 0)
    a.target!.value = 12
    expect(PRESETS.water.target!.value).toBe(8)
    expect(presetTracker('water', 0).target!.value).toBe(8)
  })
  it('all pass validation', () => {
    for (const t of starterTrackers()) expect(trackerProblems(t), t.id).toEqual([])
  })
})

describe('validValue', () => {
  it('keeps each kind in its range', () => {
    expect(validValue('scale', 5)).toBe(true)
    expect(validValue('scale', 6)).toBe(false)
    expect(validValue('scale', 3.5)).toBe(false)
    expect(validValue('check', 1)).toBe(true)
    expect(validValue('check', 2)).toBe(false)
    expect(validValue('duration', 7.5)).toBe(true)
    expect(validValue('duration', 25)).toBe(false)
    expect(validValue('count', -1)).toBe(false)
    expect(validValue('count', 2.5)).toBe(false)
    expect(validValue('number', 72.4)).toBe(true)
    expect(validValue('number', NaN)).toBe(false)
    expect(validValue('number', Infinity)).toBe(false)
    expect(validValue('feelings' as never, 1)).toBe(false) // old or tampered data never crashes
  })
})

describe('trackerProblems', () => {
  const base = { name: 'Pages read', kind: 'count' as const, unit: 'pages', target: null, reminderHour: null }
  it('accepts a sound custom tracker', () => {
    expect(trackerProblems({ ...base, ...daily('atLeast', 20), reminderHour: 21 })).toEqual([])
    expect(trackerProblems({ ...base, kind: 'check', unit: '', ...weekly('atLeast', 5) })).toEqual([])
  })
  it('explains what to fix', () => {
    expect(trackerProblems({ ...base, name: '   ' })).toEqual(['Give it a name.'])
    expect(trackerProblems({ ...base, name: 'x'.repeat(41) })).toHaveLength(1)
    expect(trackerProblems({ ...base, kind: 'scale', unit: '', ...daily('atLeast', 7) })).toEqual(["A daily goal of 7 doesn't fit this tracker."])
    expect(trackerProblems({ ...base, kind: 'check', unit: '', ...daily('atLeast', 3) })).toContain('A daily yes/no goal is simply "done".')
    expect(trackerProblems({ ...base, kind: 'check', unit: '', ...weekly('atLeast', 8) })).toEqual(["A weekly goal of 8 doesn't fit this tracker."])
    expect(trackerProblems({ ...base, kind: 'scale', unit: '', ...weekly('atLeast', 20) })).toEqual(['A 1–5 scale has a daily goal, not a weekly total.'])
    expect(trackerProblems({ ...base, reminderHour: 24 })).toEqual(['Pick a reminder hour from 0 to 23.'])
  })
})

describe('customId', () => {
  it("can't collide with a preset", () => {
    expect(customId(() => 0)).toBe('c-00000000')
    expect(customId(() => 0.999999)).toMatch(/^c-[0-9a-z]{8}$/)
    expect(PRESET_IDS.some((id) => id.startsWith('c-'))).toBe(false)
  })
})

describe('weeks', () => {
  it('run Monday to Sunday', () => {
    expect(mondayOf('2026-10-26')).toBe('2026-10-26') // Monday
    expect(mondayOf('2026-10-27')).toBe('2026-10-26')
    expect(mondayOf('2026-11-01')).toBe('2026-10-26') // Sunday belongs to the week before it
    expect(mondayOf('2026-11-02')).toBe('2026-11-02')
  })
  it('total what was logged', () => {
    expect(weekTotal({ '2026-10-25': 9, '2026-10-26': 1, '2026-10-28': 1, '2026-11-01': 1, '2026-11-02': 9 }, '2026-10-26')).toBe(3)
  })
})

describe('progressToward', () => {
  it('counts down to an atLeast goal', () => {
    expect(progressToward(daily('atLeast', 8), { '2026-10-27': 5 }, '2026-10-27')).toEqual({ kind: 'not-yet', remaining: 3 })
    expect(progressToward(daily('atLeast', 8), {}, '2026-10-27')).toEqual({ kind: 'not-yet', remaining: 8 })
    expect(progressToward(daily('atLeast', 8), { '2026-10-27': 9 }, '2026-10-27')).toEqual({ kind: 'met' })
  })
  it('flags going over an atMost goal', () => {
    expect(progressToward(daily('atMost', 2100), { '2026-10-27': 1800 }, '2026-10-27')).toEqual({ kind: 'met' })
    expect(progressToward(daily('atMost', 2100), { '2026-10-27': 2450 }, '2026-10-27')).toEqual({ kind: 'over', by: 350 })
  })
  it('judges a weekly goal on the week so far', () => {
    const days = { '2026-10-26': 1, '2026-10-27': 1, '2026-10-25': 1 }
    expect(progressToward(weekly('atLeast', 5), days, '2026-10-28')).toEqual({ kind: 'not-yet', remaining: 3 })
  })
  it('has nothing to say without a goal', () => {
    expect(progressToward({ target: null }, { '2026-10-27': 70 }, '2026-10-27')).toEqual({ kind: 'no-goal' })
  })
})

describe('trackerStreak', () => {
  const water = daily('atLeast', 8)
  it('counts days in a row, today open until met', () => {
    const s = { '2026-10-23': 8, '2026-10-24': 9, '2026-10-25': 8, '2026-10-26': 10 }
    expect(trackerStreak(water, s, '2026-10-27')).toEqual({ current: 4, best: 4, unit: 'days' })
    expect(trackerStreak(water, { ...s, '2026-10-27': 3 }, '2026-10-27')).toEqual({ current: 4, best: 4, unit: 'days' })
    expect(trackerStreak(water, { ...s, '2026-10-27': 8 }, '2026-10-27')).toEqual({ current: 5, best: 5, unit: 'days' })
  })
  it('breaks on a missed day and remembers the best run', () => {
    const s = { '2026-10-20': 8, '2026-10-21': 8, '2026-10-22': 8, '2026-10-23': 2, '2026-10-25': 8, '2026-10-26': 8 }
    expect(trackerStreak(water, s, '2026-10-27')).toEqual({ current: 2, best: 3, unit: 'days' })
  })
  it("doesn't count an empty day as meeting an atMost goal", () => {
    const food = daily('atMost', 2100)
    expect(trackerStreak(food, { '2026-10-25': 2000, '2026-10-26': 1900 }, '2026-10-27')?.current).toBe(2)
    expect(trackerStreak(food, { '2026-10-24': 2000, '2026-10-26': 1900 }, '2026-10-27')).toEqual({ current: 1, best: 1, unit: 'days' })
    expect(trackerStreak(food, { '2026-10-26': 2500 }, '2026-10-27')?.current).toBe(0)
  })
  it('counts weeks for a weekly goal', () => {
    const fiveAWeek = weekly('atLeast', 5)
    const s: Record<string, number> = {}
    for (const d of ['12', '13', '14', '15', '16', '19', '20', '21', '22', '23']) s[`2026-10-${d}`] = 1
    expect(trackerStreak(fiveAWeek, s, '2026-10-27')).toEqual({ current: 2, best: 2, unit: 'weeks' })
  })
  it('ignores entries dated after today', () => {
    expect(trackerStreak(water, { '2026-10-26': 8, '2026-10-30': 8 }, '2026-10-27')).toEqual({ current: 1, best: 1, unit: 'days' })
  })
  it('has no streak without a goal', () => {
    expect(trackerStreak({ target: null }, { '2026-10-26': 70 }, '2026-10-27')).toBeNull()
  })
})

describe('formatValue', () => {
  it('reads naturally', () => {
    expect(formatValue({ kind: 'count', unit: 'cups' }, 6)).toBe('6 cups')
    expect(formatValue({ kind: 'duration', unit: 'h' }, 7.5)).toBe('7.5 h')
    expect(formatValue({ kind: 'number', unit: 'kg' }, 72.25)).toBe('72.3 kg')
    expect(formatValue({ kind: 'check', unit: '' }, 1)).toBe('Done')
    expect(formatValue({ kind: 'check', unit: '' }, 0)).toBe('Not yet')
    expect(formatValue({ kind: 'scale', unit: '' }, 4)).toBe('4 / 5')
    expect(formatValue({ kind: 'count', unit: '' }, undefined)).toBe('—')
  })
})
