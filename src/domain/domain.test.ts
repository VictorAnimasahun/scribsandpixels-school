import { describe, expect, it } from 'vitest'
import { courses } from '../content/index.ts'
import { courseCompletion, currentPosition, dayKey, gradeQuiz, missingForDay, weekStatus } from './progress.ts'
import { addDays, localDate, streak, weekDots, weekday } from './streak.ts'

const course = courses[0]
const days = (...keys: [number, number][]) => new Set(keys.map(([w, d]) => dayKey(w, d)))
const fullWeek = (w: number) => [1, 2, 3, 4, 5, 6].map((d) => [w, d] as [number, number])

describe('currentPosition', () => {
  it('starts at Week 1 Day 1', () => {
    expect(currentPosition(course, { completedDays: new Set(), passedWeeks: new Set() })).toEqual({ kind: 'day', week: 1, day: 1 })
  })

  it('moves to the first unfinished day, even if a later one is done', () => {
    const progress = { completedDays: days([1, 1], [1, 3]), passedWeeks: new Set<number>() }
    expect(currentPosition(course, progress)).toEqual({ kind: 'day', week: 1, day: 2 })
  })

  it('asks for the quiz once all six days are done', () => {
    const progress = { completedDays: days(...fullWeek(1)), passedWeeks: new Set<number>() }
    expect(currentPosition(course, progress)).toEqual({ kind: 'quiz', week: 1 })
  })

  it('waits for content when the next week is not written yet', () => {
    const progress = { completedDays: days(...fullWeek(1), ...fullWeek(2)), passedWeeks: new Set([1, 2]) }
    expect(currentPosition(course, progress)).toEqual({ kind: 'awaiting-content', week: 3 })
  })
})

describe('weekStatus', () => {
  const progress = { completedDays: days(...fullWeek(1)), passedWeeks: new Set([1]) }
  it('marks passed, open, and locked weeks', () => {
    expect(weekStatus(course, progress, 1)).toBe('done')
    expect(weekStatus(course, progress, 2)).toBe('current')
    expect(weekStatus(course, progress, 3)).toBe('locked')
    expect(weekStatus(course, { ...progress, passedWeeks: new Set([1, 2]) }, 3)).toBe('awaiting-content')
  })

  it('computes whole-course completion', () => {
    expect(courseCompletion(course, progress)).toBeCloseTo(6 / 312)
  })
})

describe('missingForDay', () => {
  const day = course.weeks[0].days[0]
  it('needs every block ticked and the log saved', () => {
    expect(missingForDay(day, new Set(), false)).toEqual(['review', 'lesson', 'practice', 'mini-task', 'log'])
    expect(missingForDay(day, new Set(['review', 'lesson', 'practice', 'mini-task']), false)).toEqual(['log'])
    expect(missingForDay(day, new Set(['review', 'lesson', 'practice', 'mini-task']), true)).toEqual([])
  })
})

describe('gradeQuiz', () => {
  const week = course.weeks[0]
  const all = week.quiz.map((q) => ({ questionId: q.id, answer: 'an answer', gotIt: true }))
  it('passes only when every question is answered and marked got-it', () => {
    expect(gradeQuiz(week, all)).toEqual({ score: 7, total: 7, passed: true })
    expect(gradeQuiz(week, all.map((a, i) => (i === 0 ? { ...a, gotIt: false } : a)))).toMatchObject({ score: 6, passed: false })
    expect(gradeQuiz(week, all.map((a, i) => (i === 0 ? { ...a, answer: '  ' } : a)))).toMatchObject({ score: 6, passed: false })
    expect(gradeQuiz(week, [])).toMatchObject({ score: 0, passed: false })
  })
})

describe('dates', () => {
  it('knows weekdays and adds days across month ends', () => {
    expect(weekday('2026-09-24')).toBe(4) // Thursday
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('converts instants to the learner’s local date', () => {
    const lateNightLagos = new Date('2026-09-24T23:30:00Z') // 00:30 on the 25th in Lagos
    expect(localDate(lateNightLagos, 'Africa/Lagos')).toBe('2026-09-25')
    expect(localDate(lateNightLagos, 'America/Toronto')).toBe('2026-09-24')
  })
})

describe('streak', () => {
  // Week of Mon 2026-09-21 … Sun 2026-09-27; today is Thursday the 24th.
  const today = '2026-09-24'

  it('counts back from today, and today not studied yet keeps it alive', () => {
    expect(streak(new Set(['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24']), today).current).toBe(4)
    expect(streak(new Set(['2026-09-21', '2026-09-22', '2026-09-23']), today).current).toBe(3)
  })

  it('breaks on a missed weekday', () => {
    expect(streak(new Set(['2026-09-21', '2026-09-23']), today).current).toBe(1)
  })

  it('skips Sunday rest days without breaking', () => {
    const dates = new Set(['2026-09-18', '2026-09-19', '2026-09-21', '2026-09-22', '2026-09-23']) // Fri, Sat, (Sun), Mon, Tue, Wed
    expect(streak(dates, today)).toEqual({ current: 5, best: 5 })
  })

  it('remembers the best run', () => {
    const dates = new Set(['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-23'])
    expect(streak(dates, today)).toEqual({ current: 1, best: 4 })
  })
})

describe('weekDots', () => {
  it('lays out Monday to Sunday around today', () => {
    const dots = weekDots(new Set(['2026-09-21', '2026-09-22']), '2026-09-24')
    expect(dots.map((d) => d.label).join('')).toBe('MTWTFSS')
    expect(dots[0]).toMatchObject({ date: '2026-09-21', studied: true })
    expect(dots[3]).toMatchObject({ isToday: true, studied: false, isFuture: false })
    expect(dots[6]).toMatchObject({ date: '2026-09-27', isFuture: true, isRestDay: true })
  })
})
