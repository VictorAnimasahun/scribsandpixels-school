import { describe, expect, it } from 'vitest'
import { findCourse } from '../content/catalog.ts'
import { blockKey, formatHours, ledger, phasesOf, shortTitle, studyDaysDone, todayPosition, totalWeeks, type Checked } from './today.ts'

const fullstack = findCourse('fullstack-ml')!
const french = findCourse('french')!
const excel = findCourse('excel')!

/** Tick every block of the first `days` study days of a course. */
function tickDays(slug: string, days: number): Checked {
  const course = findCourse(slug)!
  const checked: Record<string, true> = {}
  let left = days
  for (const w of course.weeks) for (const d of w.days) {
    if (left-- <= 0) return checked
    for (const b of d.blocks) checked[blockKey(slug, w.number, d.number, b.key)] = true
  }
  return checked
}

describe('today position', () => {
  it('starts on Week 1, Day 1', () => {
    const p = todayPosition(fullstack, {})
    expect(p.kind === 'day' && [p.week.number, p.day.number]).toEqual([1, 1])
  })
  it('moves on only when every block of a day is ticked', () => {
    const p = todayPosition(fullstack, tickDays('fullstack-ml', 8))
    expect(p.kind === 'day' && [p.week.number, p.day.number]).toEqual([2, 3])
    const firstBlock = fullstack.weeks[0].days[0].blocks[0].key
    const p2 = todayPosition(fullstack, { [blockKey('fullstack-ml', 1, 1, firstBlock)]: true })
    expect(p2.kind === 'day' && p2.day.number).toBe(1)
  })
})

describe('phases and ledger', () => {
  it('reads phases from course.ts or the overview table', () => {
    expect(phasesOf(fullstack).map((p) => [p.firstWeek, p.lastWeek])).toEqual([[1, 6], [7, 14], [15, 24], [25, 34], [35, 44], [45, 52]])
    expect(phasesOf(french)).toHaveLength(6)
    expect(phasesOf(french)[0]).toMatchObject({ title: 'A1.1', firstWeek: 1, lastWeek: 8 })
    expect(phasesOf(excel).at(-1)).toMatchObject({ firstWeek: 22, lastWeek: 24 })
    expect(phasesOf(excel)[0].title).toBe('Foundations')
    expect(phasesOf(french)[1].milestone).not.toContain('**')
  })
  it('has six squares per week for the whole course, with today marked', () => {
    expect(totalWeeks(fullstack)).toBe(52)
    expect(totalWeeks(excel)).toBe(24)
    const weeks = ledger(fullstack, tickDays('fullstack-ml', 8))
    expect(weeks).toHaveLength(52)
    expect(studyDaysDone(weeks)).toBe(8)
    expect(weeks[1].days).toEqual(['done', 'done', 'today', 'open', 'open', 'open'])
    expect(weeks.filter((w) => w.phaseStart).map((w) => w.number)).toEqual([7, 15, 25, 35, 45])
  })
})

describe('wording', () => {
  it('shortens course titles and hours', () => {
    expect(shortTitle('Le français de A à Z — 12-Month French School')).toBe('Le français de A à Z')
    expect(formatHours(2.5)).toBe('2½ hours')
    expect(formatHours(1)).toBe('1 hour')
    expect(formatHours(0.75)).toBe('45 min')
  })
})
