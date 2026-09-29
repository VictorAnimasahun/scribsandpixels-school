import { describe, expect, it } from 'vitest'
import { parseQuizWeek, validateQuizWeek, type QuizWeek } from './quizzes.ts'

const files = import.meta.glob<string>('./courses/*/quizzes/*.yaml', { query: '?raw', import: 'default', eager: true })
const weekFiles = import.meta.glob<string>('./courses/*/weeks/*.md', { query: '?raw', import: 'default', eager: true })

describe('every quiz file in every course', () => {
  for (const [path, text] of Object.entries(files)) {
    it(`validates ${path}`, () => {
      const week = parseQuizWeek(text, path)
      expect(path).toContain(`week-${String(week.week).padStart(2, '0')}.yaml`)
      // A quiz week needs a matching written week.
      expect(Object.keys(weekFiles)).toContain(path.replace('/quizzes/', '/weeks/').replace('.yaml', '.md'))
      expect(week.days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6])
      for (const day of week.days) {
        expect(day.gate, `day ${day.day} gate`).toBeDefined()
        expect(day.quizzes.length, `day ${day.day} quizzes`).toBeGreaterThanOrEqual(2)
      }
    })
  }
})

describe('validateQuizWeek', () => {
  const base: QuizWeek = {
    week: 1,
    days: [{ day: 1, quizzes: [{ kind: 'mixed', title: 't', questions: [{ id: 'a', difficulty: 'easy', type: 'truefalse', prompt: 'p', answer: true }] }] }],
  }

  it('rejects an answer index out of range', () => {
    const bad = structuredClone(base)
    bad.days[0].quizzes[0].questions = [{ id: 'x', difficulty: 'easy', type: 'mcq', prompt: 'p', choices: ['a', 'b'], answer: 2 }]
    expect(() => validateQuizWeek(bad, 'f')).toThrow('answer index out of range')
  })

  it('rejects duplicate ids', () => {
    const bad = structuredClone(base)
    bad.days[0].quizzes.push({ kind: 'mixed', title: 'u', questions: [{ id: 'a', difficulty: 'easy', type: 'truefalse', prompt: 'p', answer: false }] })
    expect(() => validateQuizWeek(bad, 'f')).toThrow('duplicate question id a')
  })

  it('rejects a gate bank too small for three different attempts', () => {
    const bad = structuredClone(base)
    bad.days[0].gate = {
      title: 'g', covers: 'c', blueprint: { easy: 5, medium: 0, hard: 0 },
      bank: Array.from({ length: 10 }, (_, i) => ({ id: `g${i}`, difficulty: 'easy' as const, type: 'truefalse' as const, prompt: 'p', answer: true })),
    }
    expect(() => validateQuizWeek(bad, 'f')).toThrow('gate bank has 10 easy questions, needs 15')
  })
})
