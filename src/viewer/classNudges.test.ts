import { describe, expect, it } from 'vitest'
import { findCourse } from '../content/catalog.ts'
import { classNudges } from './classNudges.ts'
import type { GateRecord } from './store.ts'
import { blockKey } from './today.ts'

const ml = findCourse('machine-learning')!
const LAGOS = 'Africa/Lagos' // UTC+1, no daylight saving
const TUESDAY = '2026-10-27'
const at = (lagosTime: string) => new Date(`${TUESDAY}T${lagosTime}:00+01:00`)

/** Enrolled on Friday 16 Oct: the course starts Monday 19 Oct, so Tuesday 27 Oct is Week 2, Day 2. */
const enrolled = { startedOn: { 'machine-learning': '2026-10-16' } }
const empty = { checked: {}, weekQuizzes: {}, gates: {}, studied: {}, startedOn: {} }

function tick(days: [number, number][]): Record<string, true> {
  const checked: Record<string, true> = {}
  for (const [w, d] of days) for (const b of ml.weeks[w - 1].days[d - 1].blocks) checked[blockKey('machine-learning', w, d, b.key)] = true
  return checked
}
const week1: [number, number][] = [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6]]
const failedAt = (iso: string): GateRecord => ({ triggeredAt: Date.parse(iso) - 600_000, attempts: [{ finishedAt: Date.parse(iso), passed: false, score: 0.4 }], seen: [] })
const passed: GateRecord = { triggeredAt: 0, attempts: [{ finishedAt: 1, passed: true, score: 0.9 }], seen: [] }

describe('classNudges', () => {
  it('says nothing about a course the learner hasn\'t started', () => {
    expect(classNudges([ml], empty, TUESDAY, at('11:00'), LAGOS)).toEqual([])
  })

  it('points a learner who is behind at the first missed day', () => {
    const [n] = classNudges([ml], { ...empty, ...enrolled }, TUESDAY, at('11:00'), LAGOS)
    expect(n).toEqual({
      key: 'behind:machine-learning:1:1', urgency: 2, link: '#/c/machine-learning/w/1/d/1',
      text: 'Machine Learning: Zero to Model: 7 days behind. Start with Week 1, Day 1.',
    })
  })

  it("on pace: today's lesson, and the finished week's quiz (overdue once its Sunday is over)", () => {
    const state = { ...empty, ...enrolled, checked: tick([...week1, [2, 1]]) }
    const found = classNudges([ml], state, TUESDAY, at('11:00'), LAGOS)
    expect(found.map((n) => n.key)).toEqual(['quiz-open:machine-learning:1', 'today:machine-learning:2:2'])
    expect(found[0]).toMatchObject({ urgency: 3, link: '#/c/machine-learning/w/1', text: expect.stringContaining('Week 1 quiz is overdue. Pass it to unlock Week 2.') })
    expect(found[1].text).toBe(`Machine Learning: Zero to Model: today is Week 2, Day 2: ${ml.weeks[1].days[1].topic}.`)
  })

  it('drops the quiz once passed, and today once done', () => {
    const state = { ...empty, ...enrolled, checked: tick([...week1, [2, 1], [2, 2]]), weekQuizzes: { 'machine-learning:1': passed } }
    expect(classNudges([ml], state, TUESDAY, at('11:00'), LAGOS)).toEqual([])
  })

  it('tells the time a failed week quiz can be retried, in the learner\'s clock', () => {
    // Failed at 10:50 Lagos time; the cooldown is 60 minutes.
    const state = { ...empty, ...enrolled, checked: tick([...week1, [2, 1]]), weekQuizzes: { 'machine-learning:1': failedAt('2026-10-27T09:50:00Z') } }
    const found = classNudges([ml], state, TUESDAY, at('11:00'), LAGOS)
    expect(found[0]).toMatchObject({ key: 'quiz-cooldown:machine-learning:1:2', urgency: 3, text: 'Machine Learning: Zero to Model: you can retry the Week 1 quiz at 11:50.' })
    // After the cooldown it's simply open (and overdue) again.
    expect(classNudges([ml], state, TUESDAY, at('12:00'), LAGOS)[0].key).toBe('quiz-open:machine-learning:1')
  })

  it('tells the time a checkpoint opens again', () => {
    const state = { ...empty, ...enrolled, checked: tick([...week1, [2, 1]]), weekQuizzes: { 'machine-learning:1': passed }, gates: { 'machine-learning:2:2': failedAt('2026-10-27T09:30:00Z') } }
    const found = classNudges([ml], state, TUESDAY, at('11:00'), LAGOS)
    expect(found[0]).toMatchObject({ key: 'gate-cooldown:machine-learning:2:2:2', link: '#/c/machine-learning/w/2/d/2', text: 'Machine Learning: Zero to Model: the checkpoint opens again at 11:30.' })
  })

  it('warns about the study streak after 5 pm on a study day with nothing ticked', () => {
    // Saturday and Monday studied; Sunday is rest, so the streak is 2.
    const state = { ...empty, studied: { '2026-10-24': true as const, '2026-10-26': true as const } }
    expect(classNudges([ml], state, TUESDAY, at('16:59'), LAGOS)).toEqual([])
    expect(classNudges([ml], state, TUESDAY, at('17:30'), LAGOS)).toEqual([
      { key: `streak:${TUESDAY}`, urgency: 3, link: '#/', text: 'Your 2-day study streak ends tonight unless you tick a block.' },
    ])
    expect(classNudges([ml], { ...state, studied: { ...state.studied, [TUESDAY]: true } }, TUESDAY, at('17:30'), LAGOS)).toEqual([])
    expect(classNudges([ml], state, '2026-11-01', new Date('2026-11-01T18:00:00+01:00'), LAGOS)).toEqual([]) // Sunday: rest
  })
})
