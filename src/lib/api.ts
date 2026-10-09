import type { Course } from '../content/types.ts'
import type { Enrollment, LearnerState, LogEntry, Profile, QuizAttempt } from '../domain/learner.ts'
import { dayKey, missingForDay, weekStatus } from '../domain/progress.ts'
import { gradeWeekQuiz, type Response, type Result } from '../domain/quizGate.ts'
import type { Question } from '../content/quizzes.ts'
import { supabase } from './supabase.ts'

/*
 * All reads and writes of learner data. Row level security scopes every
 * query to the signed-in user, so no call here filters by user id for safety,
 * only to fill in user_id on inserts.
 */

function check<T>(result: { data?: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  return result.data as T
}

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('Not signed in')
  return data.user.id
}

// Auth ------------------------------------------------------------------------

export async function sendMagicLink(email: string): Promise<void> {
  check(await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } }))
}

export async function signOut(): Promise<void> {
  check(await supabase.auth.signOut())
}

// Loading ---------------------------------------------------------------------

type ProfileRow = { id: string; email: string; display_name: string | null; timezone: string; email_nudges: boolean; nudge_hour: number }
type EnrollmentRow = { id: string; course_slug: string; started_on: string; status: Enrollment['status'] }
type LogRow = {
  id: string; week: number; day: number; learned: string; confused: string; review_tomorrow: string
  answers: Record<string, string>; confusion_resolved_at: string | null; updated_at: string
}
type QuizRow = { id: string; week: number; answers: Record<string, Response | undefined>; score: number; total: number; passed: boolean; created_at: string }

const toProfile = (r: ProfileRow): Profile => ({
  id: r.id, email: r.email, displayName: r.display_name, timezone: r.timezone, emailNudges: r.email_nudges, nudgeHour: r.nudge_hour,
})
const toEnrollment = (r: EnrollmentRow): Enrollment => ({ id: r.id, courseSlug: r.course_slug, startedOn: r.started_on, status: r.status })
const toLog = (r: LogRow): LogEntry => ({
  id: r.id, week: r.week, day: r.day, learned: r.learned, confused: r.confused, reviewTomorrow: r.review_tomorrow,
  answers: r.answers, confusionResolvedAt: r.confusion_resolved_at, updatedAt: r.updated_at,
})
const toQuiz = (r: QuizRow): QuizAttempt => ({
  id: r.id, week: r.week, answers: r.answers, score: r.score, total: r.total, passed: r.passed, createdAt: r.created_at,
})

/** Enrolls the learner if needed and loads everything for one course. */
export async function loadLearnerState(course: Course): Promise<LearnerState> {
  const uid = await userId()
  const slug = course.slug

  let enrollment = check(await supabase.from('enrollments').select('*').eq('course_slug', slug).maybeSingle()) as EnrollmentRow | null
  if (!enrollment) {
    enrollment = check(await supabase.from('enrollments').insert({ user_id: uid, course_slug: slug }).select().single()) as EnrollmentRow
  }

  const [profile, blocks, days, logs, quizzes] = await Promise.all([
    supabase.from('profiles').select('*').single(),
    supabase.from('block_progress').select('week, day, block_key').eq('course_slug', slug),
    supabase.from('day_progress').select('week, day, completed_at').eq('course_slug', slug),
    supabase.from('logs').select('*').eq('course_slug', slug),
    supabase.from('quiz_attempts').select('*').eq('course_slug', slug).order('created_at'),
  ])

  const checkedBlocks = new Map<string, Set<string>>()
  for (const row of check(blocks) as { week: number; day: number; block_key: string }[]) {
    const key = dayKey(row.week, row.day)
    if (!checkedBlocks.has(key)) checkedBlocks.set(key, new Set())
    checkedBlocks.get(key)!.add(row.block_key)
  }
  const dayRows = check(days) as { week: number; day: number; completed_at: string }[]
  const quizAttempts = (check(quizzes) as QuizRow[]).map(toQuiz)

  return {
    profile: toProfile(check(profile) as ProfileRow),
    enrollment: toEnrollment(enrollment),
    progress: {
      completedDays: new Set(dayRows.map((r) => dayKey(r.week, r.day))),
      passedWeeks: new Set(quizAttempts.filter((q) => q.passed).map((q) => q.week)),
    },
    checkedBlocks,
    dayCompletions: dayRows.map((r) => new Date(r.completed_at)),
    logs: new Map((check(logs) as LogRow[]).map((r) => [dayKey(r.week, r.day), toLog(r)])),
    quizAttempts,
  }
}

// Daily work ----------------------------------------------------------------

function assertWeekOpen(course: Course, state: LearnerState, week: number) {
  const status = weekStatus(course, state.progress, week)
  if (status === 'locked') throw new Error(`Week ${week} is locked until the Week ${week - 1} quiz is passed`)
  if (status === 'awaiting-content') throw new Error(`Week ${week} hasn't been written yet`)
}

export async function setBlockChecked(course: Course, state: LearnerState, week: number, day: number, blockKey: string, checked: boolean) {
  assertWeekOpen(course, state, week)
  const row = { user_id: state.profile.id, course_slug: course.slug, week, day, block_key: blockKey }
  if (checked) check(await supabase.from('block_progress').upsert(row, { ignoreDuplicates: true }))
  else check(await supabase.from('block_progress').delete().match(row))
}

export type LogInput = { learned: string; confused: string; reviewTomorrow: string; answers?: Record<string, string> }

/** Saves (or updates) the log for a day. Day 7 is the Sunday weekly review. */
export async function saveLog(course: Course, state: LearnerState, week: number, day: number, input: LogInput): Promise<LogEntry> {
  const row = check(
    await supabase
      .from('logs')
      .upsert(
        {
          user_id: state.profile.id, course_slug: course.slug, week, day,
          learned: input.learned, confused: input.confused, review_tomorrow: input.reviewTomorrow, answers: input.answers ?? {},
        },
        { onConflict: 'user_id,course_slug,week,day' },
      )
      .select()
      .single(),
  ) as LogRow
  return toLog(row)
}

export async function completeDay(course: Course, state: LearnerState, week: number, day: number) {
  assertWeekOpen(course, state, week)
  const content = course.weeks.find((w) => w.number === week)?.days.find((d) => d.number === day)
  if (!content) throw new Error(`Week ${week} has no Day ${day}`)
  const key = dayKey(week, day)
  const missing = missingForDay(content, state.checkedBlocks.get(key) ?? new Set(), state.logs.has(key))
  if (missing.length) throw new Error(`Finish these first: ${missing.join(', ')}`)
  check(await supabase.from('day_progress').upsert({ user_id: state.profile.id, course_slug: course.slug, week, day }, { ignoreDuplicates: true }))
}

/** The auto-marked week quiz (drawWeekQuiz → 80% to pass). Questions come from the week's banks. */
export async function submitQuiz(course: Course, state: LearnerState, week: number, questions: Question[], responses: Record<string, Response | undefined>): Promise<Result> {
  const content = course.weeks.find((w) => w.number === week)
  if (!content) throw new Error(`Week ${week} hasn't been written yet`)
  const unfinished = content.days.filter((d) => !state.progress.completedDays.has(dayKey(week, d.number)))
  if (unfinished.length) throw new Error(`Finish all of Week ${week} before the quiz`)
  if (!questions.length) throw new Error(`Week ${week} has no quiz questions`)
  const result = gradeWeekQuiz(questions, responses)
  check(await supabase.from('quiz_attempts').insert({
    user_id: state.profile.id, course_slug: course.slug, week, answers: responses,
    score: result.correct, total: result.total, passed: result.passed,
  }))
  return result
}

export async function setConfusionResolved(logId: string, resolved: boolean) {
  check(await supabase.from('logs').update({ confusion_resolved_at: resolved ? new Date().toISOString() : null }).eq('id', logId))
}

// Running notes ---------------------------------------------------------------

export type Win = { id: string; note: string; createdAt: string }

export async function listWins(): Promise<Win[]> {
  const rows = check(await supabase.from('wins').select('id, note, created_at').order('created_at', { ascending: false })) as { id: string; note: string; created_at: string }[]
  return rows.map((r) => ({ id: r.id, note: r.note, createdAt: r.created_at }))
}

export async function addWin(note: string, courseSlug?: string) {
  check(await supabase.from('wins').insert({ user_id: await userId(), note, course_slug: courseSlug ?? null }))
}

export type ApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'rejected' | 'no-response' | 'withdrawn'
export type JobApplication = {
  id: string; appliedOn: string; company: string; role: string; platform: string; status: ApplicationStatus; notes: string
}
type ApplicationRow = { id: string; applied_on: string; company: string; role: string; platform: string; status: ApplicationStatus; notes: string }
const toApplication = (r: ApplicationRow): JobApplication => ({
  id: r.id, appliedOn: r.applied_on, company: r.company, role: r.role, platform: r.platform, status: r.status, notes: r.notes,
})

export async function listApplications(): Promise<JobApplication[]> {
  const rows = check(await supabase.from('job_applications').select('*').order('applied_on', { ascending: false })) as ApplicationRow[]
  return rows.map(toApplication)
}

export async function saveApplication(app: Omit<JobApplication, 'id'> & { id?: string }): Promise<JobApplication> {
  const row = {
    ...(app.id ? { id: app.id } : {}), user_id: await userId(),
    applied_on: app.appliedOn, company: app.company, role: app.role, platform: app.platform, status: app.status, notes: app.notes,
  }
  return toApplication(check(await supabase.from('job_applications').upsert(row).select().single()) as ApplicationRow)
}

export async function deleteApplication(id: string) {
  check(await supabase.from('job_applications').delete().eq('id', id))
}

// Settings ----------------------------------------------------------------

export async function updateProfile(changes: Partial<Pick<Profile, 'displayName' | 'timezone' | 'emailNudges' | 'nudgeHour'>>) {
  check(
    await supabase
      .from('profiles')
      .update({
        ...(changes.displayName !== undefined ? { display_name: changes.displayName } : {}),
        ...(changes.timezone !== undefined ? { timezone: changes.timezone } : {}),
        ...(changes.emailNudges !== undefined ? { email_nudges: changes.emailNudges } : {}),
        ...(changes.nudgeHour !== undefined ? { nudge_hour: changes.nudgeHour } : {}),
      })
      .eq('id', await userId()),
  )
}
