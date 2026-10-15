import type { LogEntry, Profile } from '../domain/learner.ts'
import { requireSupabase } from './supabase.ts'

/*
 * Learner data that isn't part of the synced progress: the daily log, wins, job applications
 * and settings. Progress itself (ticks, study days, checkpoints, week quizzes, start dates) is
 * mirrored by src/viewer/sync.ts. Sign-in lives there too.
 *
 * Row level security scopes every query to the signed-in user, so no call here filters by user
 * id for safety, only to fill in user_id on inserts.
 */

function check<T>(result: { data?: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  return result.data as T
}

async function userId(): Promise<string> {
  const { data } = await requireSupabase().auth.getUser()
  if (!data.user) throw new Error('Not signed in')
  return data.user.id
}

// Daily log -------------------------------------------------------------------

type LogRow = {
  id: string; week: number; day: number; learned: string; confused: string; review_tomorrow: string
  answers: Record<string, string>; confusion_resolved_at: string | null; updated_at: string
}

const toLog = (r: LogRow): LogEntry => ({
  id: r.id, week: r.week, day: r.day, learned: r.learned, confused: r.confused, reviewTomorrow: r.review_tomorrow,
  answers: r.answers, confusionResolvedAt: r.confusion_resolved_at, updatedAt: r.updated_at,
})

export async function listLogs(courseSlug: string): Promise<LogEntry[]> {
  return (check(await requireSupabase().from('logs').select('*').eq('course_slug', courseSlug)) as LogRow[]).map(toLog)
}

export type LogInput = { learned: string; confused: string; reviewTomorrow: string; answers?: Record<string, string> }

/** Saves (or updates) the log for a day. Day 7 is the Sunday weekly review. */
export async function saveLog(courseSlug: string, week: number, day: number, input: LogInput): Promise<LogEntry> {
  const row = check(
    await requireSupabase()
      .from('logs')
      .upsert(
        {
          user_id: await userId(), course_slug: courseSlug, week, day,
          learned: input.learned, confused: input.confused, review_tomorrow: input.reviewTomorrow, answers: input.answers ?? {},
        },
        { onConflict: 'user_id,course_slug,week,day' },
      )
      .select()
      .single(),
  ) as LogRow
  return toLog(row)
}

export async function setConfusionResolved(logId: string, resolved: boolean) {
  check(await requireSupabase().from('logs').update({ confusion_resolved_at: resolved ? new Date().toISOString() : null }).eq('id', logId))
}

// Running notes ---------------------------------------------------------------

export type Win = { id: string; note: string; createdAt: string }

export async function listWins(): Promise<Win[]> {
  const rows = check(await requireSupabase().from('wins').select('id, note, created_at').order('created_at', { ascending: false })) as { id: string; note: string; created_at: string }[]
  return rows.map((r) => ({ id: r.id, note: r.note, createdAt: r.created_at }))
}

export async function addWin(note: string, courseSlug?: string) {
  check(await requireSupabase().from('wins').insert({ user_id: await userId(), note, course_slug: courseSlug ?? null }))
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
  const rows = check(await requireSupabase().from('job_applications').select('*').order('applied_on', { ascending: false })) as ApplicationRow[]
  return rows.map(toApplication)
}

export async function saveApplication(app: Omit<JobApplication, 'id'> & { id?: string }): Promise<JobApplication> {
  const row = {
    ...(app.id ? { id: app.id } : {}), user_id: await userId(),
    applied_on: app.appliedOn, company: app.company, role: app.role, platform: app.platform, status: app.status, notes: app.notes,
  }
  return toApplication(check(await requireSupabase().from('job_applications').upsert(row).select().single()) as ApplicationRow)
}

export async function deleteApplication(id: string) {
  check(await requireSupabase().from('job_applications').delete().eq('id', id))
}

// Settings ----------------------------------------------------------------

type ProfileRow = { id: string; email: string; display_name: string | null; timezone: string; email_nudges: boolean; nudge_hour: number }

export async function getProfile(): Promise<Profile> {
  const r = check(await requireSupabase().from('profiles').select('id, email, display_name, timezone, email_nudges, nudge_hour').single()) as ProfileRow
  return { id: r.id, email: r.email, displayName: r.display_name, timezone: r.timezone, emailNudges: r.email_nudges, nudgeHour: r.nudge_hour }
}

export async function updateProfile(changes: Partial<Pick<Profile, 'displayName' | 'timezone' | 'emailNudges' | 'nudgeHour'>>) {
  check(
    await requireSupabase()
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
