import { describe, expect, it } from 'vitest'
import { sanitise } from './store.ts'

describe('sanitise saved progress', () => {
  it('turns anything unreadable into a fresh state', () => {
    for (const bad of [null, 42, 'x', [], {}]) {
      const s = sanitise(bad)
      expect(s.checked).toEqual({})
      expect(s.gates).toEqual({})
      expect(s.learnerId).toMatch(/\w+/)
    }
  })
  it('keeps good entries and drops malformed ones', () => {
    const s = sanitise({
      learnerId: 'abc',
      checked: { 'excel:1:1:lesson': true, junk: 'yes' },
      bestScores: { a: 0.8, b: 7, c: 'high' },
      gates: {
        'french:2:3': { triggeredAt: 1, attempts: [{ finishedAt: 2, passed: false, score: 0.5 }], seen: [] },
        'french:2:4': { triggeredAt: 1, attempts: 'nope', seen: [] },
        'french:2:5': null,
      },
    })
    expect(s.learnerId).toBe('abc')
    expect(s.checked).toEqual({ 'excel:1:1:lesson': true })
    expect(s.bestScores).toEqual({ a: 0.8 })
    expect(Object.keys(s.gates)).toEqual(['french:2:3'])
  })
  it('keeps only real dates in the study record', () => {
    const s = sanitise({ studied: { '2026-10-07': true, '2026-10-08': 'yes', yesterday: true }, activeCourse: 'french' })
    expect(s.studied).toEqual({ '2026-10-07': true })
    expect(s.activeCourse).toBe('french')
    expect(sanitise({ activeCourse: 4 }).activeCourse).toBeNull()
  })
})
