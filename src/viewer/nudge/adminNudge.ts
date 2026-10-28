import { addDays, type IsoDate } from '../../domain/streak.ts'
import { formatValue, type TrackerKind } from '../../domain/nudge/trackers.ts'

/*
 * What an admin sees of a learner's Nudge trackers: only rows the database lets through, i.e. of
 * learners who switched on sharing (profiles.share_life_with_admin; enforced by row security).
 * One line per switched-on tracker: how many of the last 7 days were logged, and the latest value.
 */

export type SharedTrackerRow = { user_id: string; tracker_id: string; name: string; kind: TrackerKind; unit: string; enabled: boolean; sort_order: number }
export type SharedEntryRow = { user_id: string; tracker_id: string; logged_on: string; value: number }
export type SharedTracker = { name: string; daysLogged: number; latest: string | null }

export function sharedNudge(trackers: SharedTrackerRow[], entries: SharedEntryRow[], today: IsoDate): Map<string, SharedTracker[]> {
  const weekAgo = addDays(today, -6)
  const byTracker = new Map<string, SharedEntryRow[]>()
  for (const e of entries) {
    const k = `${e.user_id}|${e.tracker_id}`
    byTracker.set(k, [...(byTracker.get(k) ?? []), e])
  }
  const out = new Map<string, SharedTracker[]>()
  for (const t of [...trackers].filter((x) => x.enabled).sort((a, b) => a.sort_order - b.sort_order)) {
    const logs = (byTracker.get(`${t.user_id}|${t.tracker_id}`) ?? []).filter((e) => e.logged_on <= today).sort((a, b) => (a.logged_on < b.logged_on ? 1 : -1))
    const last = logs[0]
    out.set(t.user_id, [...(out.get(t.user_id) ?? []), {
      name: t.name,
      daysLogged: logs.filter((e) => e.logged_on >= weekAgo).length,
      latest: last ? `${formatValue(t, last.value)} on ${last.logged_on}` : null,
    }])
  }
  return out
}
