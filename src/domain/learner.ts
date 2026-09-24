import type { Course, Day, Phase, Week, WeekOutline } from '../content/types.ts'
import { courseCompletion, currentPosition, dayKey, type LearnerProgress, type Position, type QuizAnswer } from './progress.ts'
import { localDate, streak, studyDatesFrom, weekDots, type IsoDate, type Streak, type WeekDot } from './streak.ts'

export type Profile = {
  id: string
  email: string
  displayName: string | null
  timezone: string
  emailNudges: boolean
  nudgeHour: number
}

export type Enrollment = {
  id: string
  courseSlug: string
  startedOn: IsoDate
  status: 'active' | 'paused' | 'finished'
}

export type LogEntry = {
  id: string
  week: number
  /** 1–6 for study days, 7 for the Sunday weekly review. */
  day: number
  learned: string
  confused: string
  reviewTomorrow: string
  answers: Record<string, string>
  confusionResolvedAt: string | null
  updatedAt: string
}

export type QuizAttempt = {
  id: string
  week: number
  answers: QuizAnswer[]
  score: number
  total: number
  passed: boolean
  createdAt: string
}

/** Everything the app knows about one learner in one course. */
export type LearnerState = {
  profile: Profile
  enrollment: Enrollment
  progress: LearnerProgress
  /** dayKey → ticked block keys. */
  checkedBlocks: ReadonlyMap<string, ReadonlySet<string>>
  dayCompletions: Date[]
  /** dayKey → log (day 7 = Sunday review). */
  logs: ReadonlyMap<string, LogEntry>
  quizAttempts: QuizAttempt[]
}

export type DashboardSummary = {
  today: IsoDate
  position: Position
  phase?: Phase
  outline?: WeekOutline
  week?: Week
  day?: Day
  checkedBlocks: ReadonlySet<string>
  studiedToday: boolean
  streak: Streak
  weekDots: WeekDot[]
  showedUpThisWeek: number
  /** 0–1 across all 52 weeks. */
  completion: number
  openConfusions: LogEntry[]
}

export function dashboardSummary(course: Course, state: LearnerState, now = new Date()): DashboardSummary {
  const today = localDate(now, state.profile.timezone)
  const dates = studyDatesFrom(state.dayCompletions, state.profile.timezone)
  const position = currentPosition(course, state.progress)
  const weekNumber = position.kind === 'finished' ? undefined : position.week
  const dots = weekDots(dates, today)

  return {
    today,
    position,
    phase: weekNumber ? course.phases.find((p) => weekNumber >= p.firstWeek && weekNumber <= p.lastWeek) : undefined,
    outline: weekNumber ? course.outlines.find((o) => o.number === weekNumber) : undefined,
    week: weekNumber ? course.weeks.find((w) => w.number === weekNumber) : undefined,
    day: position.kind === 'day' ? course.weeks.find((w) => w.number === position.week)?.days.find((d) => d.number === position.day) : undefined,
    checkedBlocks: position.kind === 'day' ? state.checkedBlocks.get(dayKey(position.week, position.day)) ?? new Set() : new Set(),
    studiedToday: dates.has(today),
    streak: streak(dates, today),
    weekDots: dots,
    showedUpThisWeek: dots.filter((d) => d.studied).length,
    completion: courseCompletion(course, state.progress),
    openConfusions: [...state.logs.values()]
      .filter((log) => log.confused.trim() !== '' && !log.confusionResolvedAt)
      .sort((a, b) => b.week - a.week || b.day - a.day),
  }
}
