import type { AdminRows } from '../viewer/adminSummary.ts'
import { requireSupabase } from './supabase.ts'

/*
 * The admin page's data: every learner's progress. Only an admin's session can read other
 * learners' rows (the "admins read" policies); for anyone else these queries return just their
 * own rows, so the page shows nothing useful and the UI doesn't offer it.
 */

async function fetchAll<T>(table: string, columns: string, orderBy: string[]): Promise<T[]> {
  const db = requireSupabase()
  const PAGE = 1000
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    let query = db.from(table).select(columns)
    for (const column of orderBy) query = query.order(column)
    const { data, error } = await query.range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    out.push(...(data as T[]))
    if (!data || data.length < PAGE) return out
  }
}

export async function loadAdminRows(): Promise<AdminRows> {
  const [profiles, enrollments, days, studyDays, attempts] = await Promise.all([
    fetchAll<AdminRows['profiles'][number]>('profiles', 'id, email, display_name, timezone, role, created_at', ['created_at', 'id']),
    fetchAll<AdminRows['enrollments'][number]>('enrollments', 'user_id, course_slug, started_on', ['user_id', 'course_slug']),
    fetchAll<AdminRows['days'][number]>('day_progress', 'user_id, course_slug, week, day', ['user_id', 'course_slug', 'week', 'day']),
    fetchAll<AdminRows['studyDays'][number]>('study_days', 'user_id, studied_on', ['user_id', 'studied_on']),
    fetchAll<AdminRows['attempts'][number]>('checkpoint_attempts', 'user_id, kind, key, passed, score, finished_at', ['user_id', 'kind', 'key', 'attempt']),
  ])
  return { profiles, enrollments, days, studyDays, attempts }
}
