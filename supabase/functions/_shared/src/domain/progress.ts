import type { Course, Day, Week } from '../content/types.ts'
import { addDays, weekday, type IsoDate } from './streak.ts'

/*
 * Pacing is calendar-based (decided 9 Oct 2026): from the course's start Monday, every date has
 * its lesson (Mon = Day 1 … Sat = Day 6, Sunday = the weekly review). `pace` says where the
 * calendar is and which scheduled days are still undone ("behind"); missed days must be caught
 * up in order, because a week's quiz must be passed before the next week opens.
 * `currentPosition` is the next thing to do (the first unfinished day), which is where catching up starts.
 */

export type LearnerProgress = {
  /** Keys from `dayKey`. */
  completedDays: ReadonlySet<string>
  passedWeeks: ReadonlySet<number>
}

export type Position =
  | { kind: 'day'; week: number; day: number }
  | { kind: 'quiz'; week: number }
  /** The learner is ready for a week that hasn't been written yet. */
  | { kind: 'awaiting-content'; week: number }
  | { kind: 'finished' }

export type WeekStatus = 'done' | 'current' | 'locked' | 'awaiting-content'

export const dayKey = (week: number, day: number) => `${week}:${day}`

export function currentPosition(course: Course, progress: LearnerProgress): Position {
  for (let number = 1; number <= course.totalWeeks; number++) {
    if (progress.passedWeeks.has(number)) continue
    const week = course.weeks.find((w) => w.number === number)
    if (!week) return { kind: 'awaiting-content', week: number }
    const next = week.days.find((d) => !progress.completedDays.has(dayKey(number, d.number)))
    return next ? { kind: 'day', week: number, day: next.number } : { kind: 'quiz', week: number }
  }
  return { kind: 'finished' }
}

export function weekStatus(course: Course, progress: LearnerProgress, number: number): WeekStatus {
  if (progress.passedWeeks.has(number)) return 'done'
  const unlocked = number === 1 || progress.passedWeeks.has(number - 1)
  if (!unlocked) return 'locked'
  return course.weeks.some((w) => w.number === number) ? 'current' : 'awaiting-content'
}

/** Share of the whole course done, counting a passed week as all of its six days. */
export function courseCompletion(course: Course, progress: LearnerProgress): number {
  const daysPerWeek = 6
  let done = 0
  for (let number = 1; number <= course.totalWeeks; number++) {
    if (progress.passedWeeks.has(number)) done += daysPerWeek
    else for (let day = 1; day <= daysPerWeek; day++) if (progress.completedDays.has(dayKey(number, day))) done++
  }
  return done / (course.totalWeeks * daysPerWeek)
}

/**
 * A day is complete when every block is ticked off and the log is written.
 * Returns the blocks still missing (the log block counts as done once saved).
 */
export function missingForDay(day: Day, checkedBlocks: ReadonlySet<string>, logSaved: boolean): string[] {
  return day.blocks
    .filter((block) => (block.kind === 'log' ? !logSaved : !checkedBlocks.has(block.key)))
    .map((block) => block.key)
}

export type QuizAnswer = {
  questionId: string
  answer: string
  /** Self-marked: the learner decides whether they really knew it. */
  gotIt: boolean
}

export type QuizResult = { score: number; total: number; passed: boolean }

// ─── Calendar pacing ──────────────────────────────────────────────────────

/** A course starts on the first Monday on or after enrolment, so Day 1 is always a Monday. */
export function courseStartMonday(startedOn: IsoDate): IsoDate {
  const wd = weekday(startedOn) // 0 = Sunday
  return addDays(startedOn, wd === 1 ? 0 : (8 - wd) % 7)
}

const daysBetween = (from: IsoDate, to: IsoDate) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)

export type Scheduled =
  | { kind: 'not-started'; startsOn: IsoDate }
  | { kind: 'day'; week: number; day: number }
  /** Sunday: rest and the weekly review of `week`. */
  | { kind: 'review'; week: number }
  | { kind: 'ended' }

/** What the calendar says `today` is in the course. */
export function scheduledFor(totalWeeks: number, startedOn: IsoDate, today: IsoDate): Scheduled {
  const start = courseStartMonday(startedOn)
  const elapsed = daysBetween(start, today)
  if (elapsed < 0) return { kind: 'not-started', startsOn: start }
  const week = Math.floor(elapsed / 7) + 1
  if (week > totalWeeks) return { kind: 'ended' }
  const offset = elapsed % 7 // 0 = Monday … 6 = Sunday
  return offset === 6 ? { kind: 'review', week } : { kind: 'day', week, day: offset + 1 }
}

export type Pace = {
  scheduled: Scheduled
  /** Scheduled study days before today that aren't done, oldest first (only written weeks count). */
  behind: { week: number; day: number }[]
  /** Weeks whose Sunday has passed without the quiz being passed. */
  quizzesOverdue: number[]
}

export function pace(course: Pick<Course, 'totalWeeks' | 'weeks'>, progress: LearnerProgress, startedOn: IsoDate, today: IsoDate): Pace {
  const scheduled = scheduledFor(course.totalWeeks, startedOn, today)
  const behind: Pace['behind'] = []
  const quizzesOverdue: number[] = []
  if (scheduled.kind === 'not-started') return { scheduled, behind, quizzesOverdue }
  // How far the calendar has got: every day strictly before today is due.
  const lastWeek = scheduled.kind === 'ended' ? course.totalWeeks : scheduled.week
  for (let number = 1; number <= lastWeek; number++) {
    if (progress.passedWeeks.has(number)) continue
    const week = course.weeks.find((w) => w.number === number)
    if (!week) continue
    const isCurrent = scheduled.kind !== 'ended' && number === scheduled.week
    const dueDays = isCurrent ? (scheduled.kind === 'day' ? scheduled.day - 1 : 6) : 6
    for (const d of week.days) {
      if (d.number <= dueDays && !progress.completedDays.has(dayKey(number, d.number))) behind.push({ week: number, day: d.number })
    }
    // A week's quiz is due by its Sunday; overdue once that Sunday is over.
    if (!isCurrent) quizzesOverdue.push(number)
  }
  return { scheduled, behind, quizzesOverdue }
}

// ─── Week quiz ────────────────────────────────────────────────────────────
// Weeks with a quiz bank use the auto-marked quiz (drawWeekQuiz / gradeWeekQuiz in quizGate.ts,
// 80% to pass, decided 9 Oct 2026). gradeQuiz below is the fallback for weeks without a bank.

/** Self-marked fallback: "If you can answer all of them, you passed." */
export function gradeQuiz(week: Week, answers: QuizAnswer[]): QuizResult {
  const byId = new Map(answers.map((a) => [a.questionId, a]))
  const score = week.quiz.filter((q) => {
    const answer = byId.get(q.id)
    return answer !== undefined && answer.gotIt && answer.answer.trim() !== ''
  }).length
  return { score, total: week.quiz.length, passed: week.quiz.length > 0 && score === week.quiz.length }
}
