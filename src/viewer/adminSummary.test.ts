import { describe, expect, it } from 'vitest'
import { catalog } from '../content/catalog.ts'
import { summarise, type AdminRows } from './adminSummary.ts'

// Thursday 15 Oct 2026, midday in Lagos.
const NOW = new Date('2026-10-15T11:00:00Z')
const profile = (id: string, email: string, over: Partial<AdminRows['profiles'][number]> = {}) =>
  ({ id, email, display_name: null, timezone: 'Africa/Lagos', role: 'student', created_at: '2026-10-01T09:00:00Z', ...over })
const empty: AdminRows = { profiles: [], enrollments: [], days: [], studyDays: [], attempts: [] }

describe('summarise (admin page)', () => {
  it("works out each learner's streak, last study day and week", () => {
    const [s] = summarise({
      ...empty,
      profiles: [profile('a', 'a@x.com')],
      studyDays: ['2026-10-10', '2026-10-12', '2026-10-13', '2026-10-14'].map((d) => ({ user_id: 'a', studied_on: d })),
    }, catalog, NOW)
    expect(s.lastStudied).toBe('2026-10-14')
    expect(s.studiedToday).toBe(false)
    // Sat 10, (Sun 11 is rest), Mon 12, Tue 13, Wed 14: today not studied yet doesn't break it.
    expect(s.streak).toBe(4)
    expect(s.studiedLast7).toBe(4) // 9–15 Oct, today included: the 10th, 12th, 13th and 14th
  })

  it('counts days behind the calendar, week quizzes passed and recent fails per course', () => {
    const [s] = summarise({
      ...empty,
      profiles: [profile('a', 'a@x.com')],
      enrollments: [{ user_id: 'a', course_slug: 'fullstack-ml', started_on: '2026-10-12' }],
      days: [{ user_id: 'a', course_slug: 'fullstack-ml', week: 1, day: 1 }],
      attempts: [
        // A passed week counts as caught up (pace skips it), so pass Week 2 here and keep Week 1 open.
        { user_id: 'a', kind: 'week', key: 'fullstack-ml:2', passed: true, score: 0.9, finished_at: '2026-10-14T10:00:00Z' },
        { user_id: 'a', kind: 'gate', key: 'fullstack-ml:1:2', passed: false, score: 0.4, finished_at: '2026-10-13T10:00:00Z' },
        { user_id: 'a', kind: 'gate', key: 'fullstack-ml:1:1', passed: false, score: 0.4, finished_at: '2026-10-01T10:00:00Z' }, // > 7 days ago
      ],
    }, catalog, NOW)
    const fs = s.courses.find((c) => c.slug === 'fullstack-ml')!
    expect(fs.daysDone).toBe(1)
    // Started Monday 12th; today is Thursday (Day 4). Days 1–3 were due; Day 1 is done → 2 behind.
    expect(fs.behind).toBe(2)
    expect(fs.weeksPassed).toBe(1)
    expect(s.recentFails).toBe(1)
  })

  it('a course with ticks but no start date shows progress and no "behind"', () => {
    const [s] = summarise({ ...empty, profiles: [profile('a', 'a@x.com')], days: [{ user_id: 'a', course_slug: 'french', week: 1, day: 1 }] }, catalog, NOW)
    expect(s.courses).toEqual([expect.objectContaining({ slug: 'french', daysDone: 1, behind: null, startedOn: null })])
  })

  it('lists who needs a nudge first: not studied today, longest gap first', () => {
    const list = summarise({
      ...empty,
      profiles: [profile('today', 'today@x.com'), profile('never', 'never@x.com'), profile('monday', 'monday@x.com')],
      studyDays: [{ user_id: 'today', studied_on: '2026-10-15' }, { user_id: 'monday', studied_on: '2026-10-12' }],
    }, catalog, NOW)
    expect(list.map((l) => l.id)).toEqual(['never', 'monday', 'today'])
  })

  it("uses each learner's own calendar date, and survives a bad time zone", () => {
    const [toronto] = summarise({ ...empty, profiles: [profile('t', 't@x.com', { timezone: 'America/Toronto' })] }, catalog, new Date('2026-10-15T02:00:00Z'))
    expect(toronto.today).toBe('2026-10-14') // still the evening before in Toronto
    const [broken] = summarise({ ...empty, profiles: [profile('b', 'b@x.com', { timezone: 'Not/AZone' })] }, catalog, NOW)
    expect(broken.timezone).toBe('Africa/Lagos')
  })

  it("ignores rows for courses that don't exist (renamed or removed content)", () => {
    const [s] = summarise({ ...empty, profiles: [profile('a', 'a@x.com')], days: [{ user_id: 'a', course_slug: 'gone', week: 1, day: 1 }] }, catalog, NOW)
    expect(s.courses).toEqual([])
  })
})
