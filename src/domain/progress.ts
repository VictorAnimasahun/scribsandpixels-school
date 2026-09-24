import type { Course, Day, Week } from '../content/types.ts'

/*
 * Pacing is progress-based: "today" is the learner's next unfinished day, not
 * a calendar date. A week's quiz must be passed before the next week opens.
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

/** The plan's rule: "If you can answer all of them, you passed." */
export function gradeQuiz(week: Week, answers: QuizAnswer[]): QuizResult {
  const byId = new Map(answers.map((a) => [a.questionId, a]))
  const score = week.quiz.filter((q) => {
    const answer = byId.get(q.id)
    return answer !== undefined && answer.gotIt && answer.answer.trim() !== ''
  }).length
  return { score, total: week.quiz.length, passed: week.quiz.length > 0 && score === week.quiz.length }
}
