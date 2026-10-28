import type { AdminRows } from '../viewer/adminSummary.ts'
import type { SharedEntryRow, SharedTrackerRow } from '../viewer/nudge/adminNudge.ts'
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

/**
 * Nudge trackers of learners who chose to share them (row security returns no others), plus the
 * admin's own. Empty when the server doesn't have the Nudge tables yet.
 */
export async function loadSharedNudge(since: string): Promise<{ trackers: SharedTrackerRow[]; entries: SharedEntryRow[] }> {
  try {
    const db = requireSupabase()
    const [trackers, entries] = await Promise.all([
      fetchAll<SharedTrackerRow>('nudge_trackers', 'user_id, tracker_id, name, kind, unit, enabled, sort_order', ['user_id', 'tracker_id']),
      (async () => {
        const out: SharedEntryRow[] = []
        for (let from = 0; ; from += 1000) {
          const { data, error } = await db.from('nudge_entries').select('user_id, tracker_id, logged_on, value').gte('logged_on', since)
            .order('user_id').order('tracker_id').order('logged_on').range(from, from + 999)
          if (error) throw new Error(error.message)
          out.push(...(data as SharedEntryRow[]))
          if (data.length < 1000) return out
        }
      })(),
    ])
    return { trackers, entries }
  } catch (error) {
    // Most likely the Nudge migration isn't on the server yet; the rest of the page still works.
    console.warn('Nudge trackers not loaded for the admin page:', (error as Error).message)
    return { trackers: [], entries: [] }
  }
}
