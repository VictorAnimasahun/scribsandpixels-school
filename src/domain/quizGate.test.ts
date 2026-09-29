import { describe, expect, it } from 'vitest'
import type { Question } from '../content/quizzes.ts'
import { drawAttempt, gateDaysForWeek, gateStatus, gradeAttempt, isLocked, markAnswer, seededRandom } from './quizGate.ts'

const q = (id: string, difficulty: Question['difficulty']): Question => ({ id, difficulty, type: 'truefalse', prompt: id, answer: true })
const bank = [
  ...['e1', 'e2', 'e3', 'e4', 'e5', 'e6'].map((id) => q(id, 'easy')),
  ...['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'].map((id) => q(id, 'medium')),
  ...['h1', 'h2', 'h3'].map((id) => q(id, 'hard')),
]
const blueprint = { easy: 2, medium: 3, hard: 1 }

describe('drawAttempt', () => {
  it('draws the blueprint mix of difficulties', () => {
    const drawn = drawAttempt(bank, blueprint, [], seededRandom(1))
    expect(drawn.map((x) => x.difficulty)).toEqual(['easy', 'easy', 'medium', 'medium', 'medium', 'hard'])
  })

  it('never repeats a question across three attempts', () => {
    const seen: string[] = []
    for (let attempt = 0; attempt < 3; attempt++) {
      const ids = drawAttempt(bank, blueprint, seen, seededRandom(attempt + 7)).map((x) => x.id)
      expect(ids.some((id) => seen.includes(id))).toBe(false)
      seen.push(...ids)
    }
    expect(new Set(seen).size).toBe(18)
  })

  it('reuses the least recently seen once a bank is exhausted', () => {
    const seen = bank.map((x) => x.id) // every question seen, e1 oldest
    const drawn = drawAttempt(bank, blueprint, seen, seededRandom(3)).map((x) => x.id)
    expect(drawn).toEqual(['e1', 'e2', 'm1', 'm2', 'm3', 'h1'])
  })
})

describe('markAnswer', () => {
  const text: Question = { id: 't', difficulty: 'easy', type: 'text', prompt: 'x', accept: ['Je suis étudiante.', 'je suis etudiante'] }

  it('ignores case, spacing and final punctuation', () => {
    expect(markAnswer(text, '  je SUIS   étudiante ')).toEqual({ correct: true })
  })

  it('accepts missing accents as a slip when accents are lenient, rejects them when strict', () => {
    const single: Question = { ...text, accept: ['Ça va bien'] }
    expect(markAnswer(single, 'ca va bien')).toEqual({ correct: true, accentSlip: true })
    expect(markAnswer({ ...single, accents: 'strict' }, 'ca va bien')).toEqual({ correct: false, accentSlip: true })
  })

  it('marks mcq, multi, order and match', () => {
    expect(markAnswer({ id: 'a', difficulty: 'easy', type: 'mcq', prompt: 'x', choices: ['a', 'b'], answer: 1 }, 1).correct).toBe(true)
    expect(markAnswer({ id: 'b', difficulty: 'easy', type: 'multi', prompt: 'x', choices: ['a', 'b', 'c'], answers: [0, 2] }, [2, 0]).correct).toBe(true)
    expect(markAnswer({ id: 'c', difficulty: 'easy', type: 'order', prompt: 'x', items: ['je', 'suis', 'là'] }, ['suis', 'je', 'là']).correct).toBe(false)
    expect(markAnswer({ id: 'd', difficulty: 'easy', type: 'match', prompt: 'x', pairs: [['un', '1'], ['deux', '2'], ['trois', '3']] }, ['1', '2', '3']).correct).toBe(true)
  })

  it('counts a timeout (no response) as wrong', () => {
    expect(markAnswer(text, undefined).correct).toBe(false)
  })
})

describe('gradeAttempt', () => {
  it('passes at 70%', () => {
    const qs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((id) => q(id, 'easy'))
    const answers = (n: number) => Object.fromEntries(qs.map((x, i) => [x.id, i < n]))
    expect(gradeAttempt(qs, answers(7))).toMatchObject({ correct: 7, passed: true })
    expect(gradeAttempt(qs, answers(6))).toMatchObject({ correct: 6, passed: false })
  })
})

describe('gateStatus', () => {
  const t = (minutes: number) => new Date(Date.UTC(2026, 8, 29, 8, minutes))

  it('opens the first attempt, and passing unlocks the day', () => {
    expect(gateStatus([], t(0))).toEqual({ kind: 'open', attempt: 1 })
    expect(isLocked(gateStatus([], t(0)))).toBe(true)
    expect(gateStatus([{ finishedAt: t(5), passed: true }], t(6))).toEqual({ kind: 'passed' })
  })

  it('locks everything for 60 minutes after a failed attempt', () => {
    const failed = [{ finishedAt: t(5), passed: false }]
    expect(gateStatus(failed, t(30))).toEqual({ kind: 'cooldown', until: t(65), attempt: 2 })
    expect(isLocked(gateStatus(failed, t(30)))).toBe(true)
    expect(gateStatus(failed, t(65))).toEqual({ kind: 'open', attempt: 2 })
  })
})

describe('gateDaysForWeek', () => {
  it('schedules 1 or 2 gates on distinct study days, stable for the same learner and week', () => {
    for (let week = 1; week <= 52; week++) {
      const days = gateDaysForWeek('learner-1', 'french', week)
      expect(days.length === 1 || days.length === 2).toBe(true)
      expect(new Set(days).size).toBe(days.length)
      days.forEach((d) => expect(d >= 1 && d <= 6).toBe(true))
      expect(gateDaysForWeek('learner-1', 'french', week)).toEqual(days)
    }
  })

  it('varies across weeks and learners (irregular, not predictable)', () => {
    const patterns = new Set(Array.from({ length: 52 }, (_, i) => gateDaysForWeek('learner-1', 'french', i + 1).join(',')))
    expect(patterns.size).toBeGreaterThan(10)
    const counts = Array.from({ length: 52 }, (_, i) => gateDaysForWeek('learner-1', 'french', i + 1).length)
    expect(counts).toContain(1)
    expect(counts).toContain(2)
    expect(gateDaysForWeek('learner-2', 'french', 5)).not.toEqual(gateDaysForWeek('learner-1', 'french', 5)) // almost surely
  })
})
