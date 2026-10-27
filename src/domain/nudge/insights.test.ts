import { describe, expect, it } from 'vitest'
import { seededRandom } from '../quizGate.ts'
import { addDays } from '../streak.ts'
import { anovaP, baseline, correlation, correlationP, dayOfWeek, deviation, fTestP, insights, pearson, robustSlope, trend, tTestP, type Named } from './insights.ts'

const water: Named = { id: 'water', name: 'Water', kind: 'count', unit: 'cups' }
const sleep: Named = { id: 'sleep', name: 'Sleep', kind: 'duration', unit: 'h' }
const exercise: Named = { id: 'exercise', name: 'Exercise', kind: 'number', unit: 'min' }
const steps: Named = { id: 'c-steps', name: 'Steps', kind: 'count', unit: 'steps' }
const prayer: Named = { id: 'c-pray', name: 'Morning prayer', kind: 'check', unit: '' }

const TODAY = '2026-10-27' // a Tuesday

/** values[0] is logged `values.length - 1` days before `last`, the final value on `last`. */
const series = (values: (number | null)[], last = TODAY) =>
  Object.fromEntries(values.flatMap((v, i) => (v === null ? [] : [[addDays(last, i - (values.length - 1)), v]])))

describe('statistics', () => {
  it('pearson matches hand-worked values', () => {
    expect(pearson([1, 2, 3], [2, 4, 6], 3)).toBeCloseTo(1)
    expect(pearson([1, 2, 3], [3, 2, 1], 3)).toBeCloseTo(-1)
    // means 2.5 and 2.5; sum of products 3; sums of squares 5 and 5 → 3 / 5
    expect(pearson([1, 2, 3, 4], [2, 1, 4, 3], 4)).toBeCloseTo(0.6)
  })
  it("pearson refuses too little data, or a series that never changes", () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeNull() // default minimum is 14 pairs
    expect(pearson([1, 2, 3, 4], [5, 5, 5, 5], 4)).toBeNull()
  })
  it('robustSlope is the median pairwise slope, so one outlier barely moves it', () => {
    expect(robustSlope([0, 1, 2], [1, 3, 5])).toBeCloseTo(2)
    expect(robustSlope([3, 3], [1, 9])).toBeNull()
    // Four flat days then a spike: slopes 0 ×6, 2, 2.67, 4, 8 → median 0 (a least-squares line says 1.6)
    expect(robustSlope([0, 1, 2, 3, 4], [1, 1, 1, 1, 9])).toBe(0)
  })
  it('baseline', () => {
    expect(baseline([2, 4, 4, 4, 5, 5, 7, 9], 8)).toEqual({ mean: 5, sd: 2 })
    expect(baseline([2, 4, 4], 8)).toBeNull()
  })
})

describe('significance', () => {
  // Critical values from standard statistical tables: each sits exactly at p = 0.05.
  it('t-test p-values match the tables', () => {
    expect(tTestP(12.706, 1)).toBeCloseTo(0.05, 3)
    expect(tTestP(2.228, 10)).toBeCloseTo(0.05, 3)
    expect(tTestP(2.042, 30)).toBeCloseTo(0.05, 3)
    expect(tTestP(0, 10)).toBeCloseTo(1, 6)
  })
  it('correlation p-values match the critical r tables', () => {
    expect(correlationP(0.532, 14)).toBeCloseTo(0.05, 2) // why |r| >= 0.4 alone isn't enough at 14 days
    expect(correlationP(0.361, 30)).toBeCloseTo(0.05, 2)
    expect(correlationP(1, 14)).toBe(0)
  })
  it('F-test and ANOVA p-values match the tables', () => {
    expect(fTestP(4.965, 1, 10)).toBeCloseTo(0.05, 3)
    expect(fTestP(3.354, 2, 27)).toBeCloseTo(0.05, 3)
    expect(anovaP([[1, 2, 3], [1, 2, 3], [1, 2, 3]])).toBeCloseTo(1, 6)
    expect(anovaP([[5, 5, 5], [9, 9, 9]])).toBe(0)
  })
})

const food: Named = { id: 'food', name: 'Food', kind: 'number', unit: 'kcal' }

describe('noise is not a pattern', () => {
  it('scattered exercise is not a downward trend', () => {
    // The made-up log that the first version called "going down by 6.3 min" in the browser (27 Oct).
    const minutes: Record<string, number> = {}
    for (let i = 20; i >= 1; i--) if (i % 3) minutes[addDays(TODAY, -i)] = 20 + ((i * 11) % 40)
    expect(trend(exercise, minutes, TODAY)).toBeNull()
  })
  it('independent random trackers are almost never called a pattern', () => {
    // 200 learners, each with 5 trackers of pure noise over 30 days: with the spec's thresholds
    // alone, 69 of them saw a chance pattern; with one 5% shared across comparisons, about 1 in 20.
    const trackers: Named[] = [water, sleep, exercise, steps, food]
    let fooled = 0
    for (let learner = 0; learner < 200; learner++) {
      const random = seededRandom(1000 + learner)
      const logs = Object.fromEntries(trackers.map((t) => [t.id, Object.fromEntries(Array.from({ length: 30 }, (_, i) => [addDays(TODAY, -i - 1), 50 + random() * 20]))]))
      if (insights(trackers, logs, TODAY).some((i) => i.kind !== 'deviation')) fooled++
    }
    expect(fooled / 200).toBeLessThanOrEqual(0.06) // one shared 5%, plus sampling wobble
  })
})

describe('trend', () => {
  it('finds a steady rise and says how much', () => {
    // 4,4,5,5,…,8,8 over 10 days: median pairwise slope 0.5 a day → 4.5 cups across 9 days
    const found = trend(water, series([4, 4, 5, 5, 6, 6, 7, 7, 8, 8]), TODAY)
    expect(found?.key).toBe('trend:water:up')
    expect(found?.text).toBe('Your water has been going up: about 4.5 cups over the last 10 days.')
  })
  it("doesn't call one bad night a trend", () => {
    expect(trend(sleep, series([7, 7.5, 7, 6.5, 7, 7.5, 7, 6.5, 7, 7.5, 7, 6.5, 4]), TODAY)).toBeNull()
  })
  it('needs 7 logged days and a real change', () => {
    expect(trend(water, series([4, 5, 6, 7, 8, 9]), TODAY)).toBeNull()
    expect(trend(water, series([8, 7, 8, 8, 7, 8, 8, 7, 8, 8]), TODAY)).toBeNull()
  })
  it('only looks at the last 30 days', () => {
    // A climb that ended 40 days ago, flat since.
    const old = series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], addDays(TODAY, -40))
    expect(trend(water, { ...old, ...series(Array(20).fill(8)) }, TODAY)).toBeNull()
  })
  it("doesn't apply to yes/no trackers", () => {
    expect(trend(prayer, series([0, 0, 0, 0, 1, 1, 1, 1, 1, 1]), TODAY)).toBeNull()
  })
})

describe('deviation', () => {
  // Normal: 7 h six times, 7.5 h three times, 6.5 h three times → mean 7, sd 0.354
  const normal = [7, 7.5, 7, 6.5, 7, 7.5, 7, 6.5, 7, 7.5, 7, 6.5]
  it("flags a day far from your own normal", () => {
    const found = deviation(sleep, series([...normal, 4]), TODAY)
    expect(found?.key).toBe(`deviation:sleep:low:${TODAY}`)
    expect(found?.text).toBe("Today's sleep (4 h) is unusually low for you: you normally log about 7 h.")
  })
  it('stays quiet for an ordinary day, or without 10 days of history', () => {
    expect(deviation(sleep, series([...normal, 7.5]), TODAY)).toBeNull()
    expect(deviation(sleep, series([...normal.slice(0, 9), 4]), TODAY)).toBeNull()
    expect(deviation(sleep, series([...normal, null]), TODAY)).toBeNull()
  })
})

describe('correlation', () => {
  const days = 14
  const minutes = Array.from({ length: days }, (_, i) => 10 + i * 5)
  it('reports two trackers moving together, as a pattern not a cause', () => {
    const hours = minutes.map((m) => 6 + m / 60)
    const found = correlation(exercise, series(minutes), sleep, series(hours), TODAY)
    expect(found?.key).toBe('correlation:exercise:sleep:pos')
    expect(found?.text).toContain('on days with more exercise, your sleep tends to be higher')
    expect(found?.text).toContain('not proof that one causes the other')
    expect(found?.text).not.toMatch(/\bbecause\b|\bcauses\b(?! the other)/)
  })
  it('needs 14 days logged on both', () => {
    const hours = minutes.map((m) => 6 + m / 60)
    const sleepMissingOne = series([null, ...hours.slice(1)])
    expect(correlation(exercise, series(minutes), sleep, sleepMissingOne, TODAY)).toBeNull()
  })
  it('ignores weak relationships (|r| below 0.4)', () => {
    // Rising against alternating 5,3,5,3…: r = -7 / √(227.5 × 14) = -0.12
    const alternating = minutes.map((_, i) => (i % 2 ? 3 : 5))
    expect(correlation(exercise, series(minutes), water, series(alternating), TODAY)).toBeNull()
  })
  it('names the same insight the same way whichever tracker comes first', () => {
    const hours = minutes.map((m) => 6 + m / 60)
    const a = correlation(exercise, series(minutes), sleep, series(hours), TODAY)
    const b = correlation(sleep, series(hours), exercise, series(minutes), TODAY)
    expect(a?.key).toBe(b?.key)
  })
})

describe('dayOfWeek', () => {
  // Four weeks, Monday 28 Sep to Sunday 25 Oct: 6,000 steps on weekdays, 12,000 on Saturdays, 3,000 on Sundays.
  const fourWeeks = Object.fromEntries(Array.from({ length: 28 }, (_, i) => {
    const d = addDays('2026-09-28', i)
    return [d, i % 7 === 5 ? 12000 : i % 7 === 6 ? 3000 : 6000]
  }))
  it('finds the weekday that stands out', () => {
    expect(dayOfWeek(steps, fourWeeks, TODAY)?.text).toBe('Your steps is highest on Saturdays (about 12000 steps) and lowest on Sundays (about 3000 steps).')
  })
  it('needs 3 logs on each of 5 weekdays', () => {
    const twoWeeks = Object.fromEntries(Object.entries(fourWeeks).filter(([d]) => d >= '2026-10-12'))
    expect(dayOfWeek(steps, twoWeeks, TODAY)).toBeNull()
  })
  it('stays quiet when the weekdays are alike', () => {
    const even = Object.fromEntries(Object.keys(fourWeeks).map((d, i) => [d, 6000 + (i % 3) * 100]))
    expect(dayOfWeek(steps, even, TODAY)).toBeNull()
  })
})

describe('insights', () => {
  const rising = series([4, 4, 5, 5, 6, 6, 7, 7, 8, 8])
  it('gathers every detector, strongest first', () => {
    const normal = [7, 7.5, 7, 6.5, 7, 7.5, 7, 6.5, 7, 7.5, 7, 6.5]
    const found = insights([water, sleep], { water: rising, sleep: series([...normal, 4]) }, TODAY)
    expect(found.map((i) => i.kind)).toEqual(['deviation', 'trend'])
  })
  it("doesn't repeat an insight within 7 days", () => {
    expect(insights([water], { water: rising }, TODAY, { 'trend:water:up': addDays(TODAY, -3) })).toEqual([])
    expect(insights([water], { water: rising }, TODAY, { 'trend:water:up': addDays(TODAY, -7) })).toHaveLength(1)
  })
  it('says nothing about a tracker with no data', () => {
    expect(insights([water, sleep, prayer], {}, TODAY)).toEqual([])
  })
})
