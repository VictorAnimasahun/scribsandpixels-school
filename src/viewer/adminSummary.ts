import type { CatalogCourse } from '../content/catalog.ts'
import { dayKey, pace } from '../domain/progress.ts'
import { addDays, localDate, streak, type IsoDate } from '../domain/streak.ts'
import { shortTitle } from './today.ts'

/*
 * What the admin page shows about each learner, worked out from the rows an admin may read.
 * Pure: the rows come in, nothing is fetched here (see lib/admin.ts).
 */

export type AdminRows = {
  profiles: { id: string; email: string; display_name: string | null; timezone: string; role: string; created_at: string }[]
  enrollments: { user_id: string; course_slug: string; started_on: string }[]
  days: { user_id: string; course_slug: string; week: number; day: number }[]
  studyDays: { user_id: string; studied_on: string }[]
  attempts: { user_id: string; kind: 'gate' | 'week'; key: string; passed: boolean; score: number; finished_at: string }[]
}

export type CourseSummary = {
  slug: string
  title: string
  startedOn: IsoDate | null
  daysDone: number
  /** Study days the calendar says are done by now but aren't; null before a start date is picked. */
  behind: number | null
  weeksPassed: number
}

export type LearnerSummary = {
  id: string
  email: string
  name: string | null
  role: string
  joined: string
  timezone: string
  today: IsoDate
  lastStudied: IsoDate | null
  studiedToday: boolean
  streak: number
  bestStreak: number
  /** Study days in the last 7 days, today included. */
  studiedLast7: number
  courses: CourseSummary[]
  /** Checkpoints and week quizzes failed in the last 7 days (a sign someone's stuck). */
  recentFails: number
}

const validZone = (tz: string) => {
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); return tz } catch { return 'Africa/Lagos' }
}

export function summarise(rows: AdminRows, courses: CatalogCourse[], now = new Date()): LearnerSummary[] {
  const by = <T extends { user_id: string }>(list: T[]) => {
    const map = new Map<string, T[]>()
    for (const r of list) (map.get(r.user_id) ?? map.set(r.user_id, []).get(r.user_id)!).push(r)
    return map
  }
  const enrollments = by(rows.enrollments), days = by(rows.days), studyDays = by(rows.studyDays), attempts = by(rows.attempts)
  const weekAgo = now.getTime() - 7 * 86_400_000

  const out = rows.profiles.map((p): LearnerSummary => {
    const timezone = validZone(p.timezone)
    const today = localDate(now, timezone)
    const dates = new Set((studyDays.get(p.id) ?? []).map((d) => d.studied_on))
    const sorted = [...dates].sort()
    const value = streak(dates, today)
    let studiedLast7 = 0
    for (let i = 0; i < 7; i++) if (dates.has(addDays(today, -i))) studiedLast7++

    const mine = attempts.get(p.id) ?? []
    const slugs = new Set([...(enrollments.get(p.id) ?? []).map((e) => e.course_slug), ...(days.get(p.id) ?? []).map((d) => d.course_slug)])
    const courseSummaries = [...slugs].flatMap((slug): CourseSummary[] => {
      const course = courses.find((c) => c.slug === slug)
      if (!course) return []
      const completedDays = new Set((days.get(p.id) ?? []).filter((d) => d.course_slug === slug).map((d) => dayKey(d.week, d.day)))
      const passedWeeks = new Set(mine.filter((a) => a.kind === 'week' && a.passed && a.key.startsWith(`${slug}:`)).map((a) => Number(a.key.split(':')[1])))
      const startedOn = (enrollments.get(p.id) ?? []).find((e) => e.course_slug === slug)?.started_on ?? null
      return [{
        slug,
        title: shortTitle(course.title),
        startedOn,
        daysDone: completedDays.size,
        behind: startedOn ? pace(course, { completedDays, passedWeeks }, startedOn, today).behind.length : null,
        weeksPassed: passedWeeks.size,
      }]
    })

    return {
      id: p.id, email: p.email, name: p.display_name, role: p.role, joined: p.created_at, timezone, today,
      lastStudied: sorted.at(-1) ?? null,
      studiedToday: dates.has(today),
      streak: value.current,
      bestStreak: value.best,
      studiedLast7,
      courses: courseSummaries,
      recentFails: mine.filter((a) => !a.passed && Date.parse(a.finished_at) >= weekAgo).length,
    }
  })

  // Who needs a nudge first: not studied today, longest gap first; then everyone else.
  return out.sort((a, b) =>
    Number(a.studiedToday) - Number(b.studiedToday) ||
    (a.lastStudied ?? '').localeCompare(b.lastStudied ?? '') ||
    a.email.localeCompare(b.email))
}
