import { describe, expect, it } from 'vitest'
import { courses } from './index.ts'
import week01 from './courses/fullstack-ml/weeks/week-01.md?raw'
import week02 from './courses/fullstack-ml/weeks/week-02.md?raw'
import { parseWeek } from './parseWeek.ts'

describe('parseWeek on the real course', () => {
  const week1 = parseWeek(week01, 'week-01.md')
  const week2 = parseWeek(week02, 'week-02.md')

  it('reads the week header', () => {
    expect(week1).toMatchObject({
      number: 1,
      title: 'Hello, World. Hello, Computer.',
      theme: 'Understand what programming is and write your very first code.',
      bigQuestion: "How does a computer actually understand what I'm telling it?",
    })
    expect(week2.title).toBe('Lists, Functions, and Your First Real Tool')
  })

  it('reads resources with kinds and notes', () => {
    expect(week1.resources).toHaveLength(5)
    expect(week1.resources[2]).toEqual({
      kind: 'reading',
      title: 'Automate the Boring Stuff — Chapter 1',
      url: 'https://automatetheboringstuff.com/2e/chapter1/',
      note: 'Read after watching Mosh. It reinforces.',
    })
    expect(week2.resources).toHaveLength(7)
  })

  it('reads six days, Monday to Saturday', () => {
    for (const week of [week1, week2]) {
      expect(week.days.map((d) => d.weekday)).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    }
    expect(week2.days[2].topic).toBe('Functions — writing reusable blocks of code')
  })

  it('reads the standard blocks with durations', () => {
    const day = week1.days[0]
    expect(day.blocks.map((b) => [b.key, b.minutes])).toEqual([
      ['review', 30],
      ['lesson', 45],
      ['practice', 45],
      ['mini-task', 30],
      ['log', 10],
    ])
    expect(day.hours).toBe(2.5)
  })

  it('reads project days', () => {
    const saturday = week2.days[5]
    expect(saturday.hours).toBe(3)
    expect(saturday.blocks.map((b) => [b.key, b.kind, b.minutes])).toEqual([
      ['review', 'review', 30],
      ['project', 'project', 120],
      ['freecodecamp', 'freecodecamp', 30],
      ['log', 'log', 10],
    ])
  })

  it('keeps code blocks intact, including # comments', () => {
    const miniTask = week1.days[2].blocks.find((b) => b.kind === 'mini-task')!
    expect(miniTask.body).toContain('# Your structure:')
    expect(miniTask.body).toContain('naira = usd * 1550')
  })

  it('reads the quiz and its note', () => {
    expect(week1.quiz).toHaveLength(7)
    expect(week1.quiz[0]).toEqual({ id: 'w1q1', prompt: 'What does `print()` do?' })
    expect(week1.quizNote).toMatch(/^If you can answer all 7/)
    expect(week2.quiz).toHaveLength(10)
  })
})

describe('every week file in every course', () => {
  const files = import.meta.glob<string>('./courses/*/weeks/*.md', { query: '?raw', import: 'default', eager: true })
  for (const [path, markdown] of Object.entries(files)) {
    it(`parses ${path}`, () => {
      const week = parseWeek(markdown, path)
      expect(path).toContain(`week-${String(week.number).padStart(2, '0')}.md`)
      expect(week.days).toHaveLength(6)
      expect(week.quiz.length).toBeGreaterThan(0)
      expect(week.resources.length).toBeGreaterThan(0)
    })
  }
})

describe('parseWeek errors', () => {
  it('rejects a day on the wrong weekday', () => {
    const md = '# Week 3 — Test\n\n## Day 2 — Monday\n**Topic:** x\n\n### Review (30 min)\nhi\n'
    expect(() => parseWeek(md, 'w.md')).toThrow('w.md:3: Day 2 must be Tuesday')
  })

  it('rejects a day without a topic', () => {
    const md = '# Week 3 — Test\n\n## Day 1 — Monday\n\n### Review (30 min)\nhi\n'
    expect(() => parseWeek(md, 'w.md')).toThrow('missing **Topic:**')
  })

  it('rejects unknown sections', () => {
    expect(() => parseWeek('# Week 3 — Test\n\n## Homework\n', 'w.md')).toThrow('unknown section "## Homework"')
  })
})

describe('course registry', () => {
  it('loads the fullstack-ml course with written weeks and 52 outlines', () => {
    const course = courses[0]
    expect(course.slug).toBe('fullstack-ml')
    const written = course.weeks.map((w) => w.number)
    expect(written.length).toBeGreaterThanOrEqual(4)
    expect(written).toEqual(Array.from({ length: written.length }, (_, i) => i + 1)) // no gaps
    expect(course.outlines.map((o) => o.number)).toEqual(Array.from({ length: 52 }, (_, i) => i + 1))
    expect(course.outlines[34]).toMatchObject({ number: 35, phase: 5, title: 'The ML landscape' })
  })
})
