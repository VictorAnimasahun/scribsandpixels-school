import { catalog, findCourse, type CatalogCourse } from '../content/catalog.ts'
import { fullstackMl } from '../content/courses/fullstack-ml/course.ts'
import type { Day, Week } from '../content/types.ts'
import { dayKey as progressKey, pace, type Pace } from '../domain/progress.ts'
import type { State } from './store.ts'

/*
 * What the Today screen and the year ledger need, worked out from the test build's saved ticks.
 * Pure functions: the store is passed in, nothing is read from the browser here.
 */

export type Checked = Readonly<Record<string, true>>

export const blockKey = (slug: string, week: number, day: number, block: string) => `${slug}:${week}:${day}:${block}`

export const doneBlocks = (checked: Checked, slug: string, week: number, day: Day) =>
  day.blocks.filter((b) => checked[blockKey(slug, week, day.number, b.key)]).length

export const isDayDone = (checked: Checked, slug: string, week: number, day: Day) =>
  day.blocks.length > 0 && doneBlocks(checked, slug, week, day) === day.blocks.length

export type TodayPosition =
  | { kind: 'day'; week: Week; day: Day }
  | { kind: 'finished' }
  | { kind: 'empty' }

/** Progress-based pacing: "today" is the first written day that still has unticked blocks. */
export function todayPosition(course: CatalogCourse, checked: Checked): TodayPosition {
  if (course.weeks.length === 0) return { kind: 'empty' }
  for (const week of course.weeks) {
    for (const day of week.days) {
      if (!isDayDone(checked, course.slug, week.number, day)) return { kind: 'day', week, day }
    }
  }
  return { kind: 'finished' }
}

export type Phase = { number: number; title: string; firstWeek: number; lastWeek: number; milestone: string }

const clean = (s: string) => s.replace(/\*\*/g, '').trim()

/** A course's phases: from course.ts when it has one, else from the overview's "Phases at a Glance" table. */
export function phasesOf(course: CatalogCourse): Phase[] {
  if (course.slug === fullstackMl.slug) {
    return fullstackMl.phases.map((p) => ({ number: p.number, title: p.title, firstWeek: p.firstWeek, lastWeek: p.lastWeek, milestone: p.milestone }))
  }
  const overview = course.overview ?? ''
  const at = overview.search(/^## .*Phases at a Glance/m)
  if (at < 0) return []
  // The first table after the heading: consecutive lines starting with '|'.
  const lines = overview.slice(at).split('\n')
  const start = lines.findIndex((l) => l.startsWith('|'))
  const end = lines.findIndex((l, i) => i > start && !l.startsWith('|'))
  const rows = start < 0 ? [] : lines.slice(start, end < 0 ? undefined : end)
  if (rows.length < 3) return []
  const cells = (row: string) => row.split('|').slice(1, -1).map((c) => c.trim())
  const head = cells(rows[0]).map((h) => h.toLowerCase())
  const col = (name: string) => head.indexOf(name)
  const phases: Phase[] = []
  for (const row of rows.slice(2)) {
    const c = cells(row)
    const weeks = c[col('weeks')]?.match(/(\d+)\s*[–-]\s*(\d+)/)
    if (!weeks) continue
    const name = col('level') >= 0 ? c[col('level')] : (c[col('focus')] ?? '').split(':')[0]
    phases.push({
      number: Number(c[col('phase')]) || phases.length + 1,
      title: clean(name),
      firstWeek: Number(weeks[1]),
      lastWeek: Number(weeks[2]),
      milestone: clean(c[col('milestone')] ?? ''),
    })
  }
  return phases
}

export function totalWeeks(course: CatalogCourse): number {
  if (course.slug === fullstackMl.slug) return fullstackMl.totalWeeks
  const last = phasesOf(course).at(-1)?.lastWeek ?? 0
  return Math.max(last, course.weeks.at(-1)?.number ?? 0)
}

export type Pixel = 'done' | 'today' | 'open' | 'unwritten'
export type LedgerWeek = { number: number; phaseStart: boolean; days: Pixel[] }

/** One square per study day (6 per week) across the whole course. */
export function ledger(course: CatalogCourse, checked: Checked): LedgerWeek[] {
  const position = todayPosition(course, checked)
  const starts = new Set(phasesOf(course).slice(1).map((p) => p.firstWeek))
  const out: LedgerWeek[] = []
  for (let n = 1; n <= totalWeeks(course); n++) {
    const week = course.weeks.find((w) => w.number === n)
    const days: Pixel[] = []
    for (let d = 1; d <= 6; d++) {
      const day = week?.days.find((x) => x.number === d)
      if (!day) days.push('unwritten')
      else if (isDayDone(checked, course.slug, n, day)) days.push('done')
      else if (position.kind === 'day' && position.week.number === n && position.day.number === d) days.push('today')
      else days.push('open')
    }
    out.push({ number: n, phaseStart: starts.has(n), days })
  }
  return out
}

export const studyDaysDone = (weeks: LedgerWeek[]) => weeks.reduce((n, w) => n + w.days.filter((d) => d === 'done').length, 0)

/** "Le français de A à Z — 12-Month French School" → "Le français de A à Z". */
export const shortTitle = (title: string) => title.split(' — ')[0].replace(/ School$/, '')

/** Wording for the time of day, in the learner's own clock. */
export function partOfDay(hour: number): string {
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

/** "2½ hours", "1 hour", "45 min". */
export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  const whole = Math.floor(hours)
  const half = hours - whole >= 0.5 ? '½' : ''
  return `${whole}${half} hour${whole === 1 && !half ? '' : 's'}`
}

/** The course Today shows: the last one opened, else the first with any progress, else the first. */
export function activeCourseOf(state: Pick<State, 'activeCourse' | 'checked'>): CatalogCourse {
  return (state.activeCourse && findCourse(state.activeCourse))
    || catalog.find((c) => Object.keys(state.checked).some((k) => k.startsWith(`${c.slug}:`)))
    || catalog[0]
}

// ─── Calendar pacing (decided 9 Oct 2026) ────────────────────────────────

/** The test build's progress in the domain's shape: a day is done when all its blocks are ticked. */
export function learnerProgress(course: CatalogCourse, state: Pick<State, 'checked' | 'weekQuizzes'>) {
  const completedDays = new Set<string>()
  for (const w of course.weeks)
    for (const d of w.days)
      if (isDayDone(state.checked, course.slug, w.number, d)) completedDays.add(progressKey(w.number, d.number))
  const passedWeeks = new Set(
    Object.entries(state.weekQuizzes)
      .filter(([k, r]) => k.startsWith(`${course.slug}:`) && r.attempts.some((a) => a.passed))
      .map(([k]) => Number(k.split(':')[1])),
  )
  return { completedDays, passedWeeks }
}

/** Where the calendar says the learner should be; null until they've picked a start Monday. */
export function coursePace(course: CatalogCourse, state: Pick<State, 'checked' | 'weekQuizzes' | 'startedOn'>, today: string): Pace | null {
  const started = state.startedOn[course.slug]
  return started ? pace(course, learnerProgress(course, state), started, today) : null
}
