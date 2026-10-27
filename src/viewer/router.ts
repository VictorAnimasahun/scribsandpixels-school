import { useSyncExternalStore } from 'react'

export type Route =
  | { page: 'home' }
  | { page: 'course'; slug: string }
  | { page: 'week'; slug: string; week: number }
  | { page: 'day'; slug: string; week: number; day: number; short: boolean }
  | { page: 'sandbox'; slug: string; id: string }
  | { page: 'account' }
  | { page: 'admin' }
  // Nudge, the life-tracking app that shares the school's account (docs/nudge-plan.md).
  | { page: 'nudge' }
  | { page: 'nudge-trackers' }
  | { page: 'nudge-tracker'; id: string }  // edit one; id 'new' makes one
  | { page: 'nudge-stats' }

export type NudgeRoute = Extract<Route, { page: `nudge${string}` }>
export const isNudgeRoute = (r: Route): r is NudgeRoute => r.page.startsWith('nudge')

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'account') return { page: 'account' }
  if (parts[0] === 'admin') return { page: 'admin' }
  if (parts[0] === 'nudge') {
    if (parts[1] === 'trackers' && parts[2]) return { page: 'nudge-tracker', id: parts[2] }
    if (parts[1] === 'trackers') return { page: 'nudge-trackers' }
    if (parts[1] === 'stats') return { page: 'nudge-stats' }
    return { page: 'nudge' }
  }
  if (parts[0] !== 'c' || !parts[1]) return { page: 'home' }
  const slug = parts[1]
  const week = Number(parts[3])
  const day = Number(parts[5])
  if (parts[2] === 's' && parts[3]) return { page: 'sandbox', slug, id: parts[3] }
  if (parts[2] === 'w' && week && parts[4] === 'd' && day) return { page: 'day', slug, week, day, short: parts[6] === 'short' }
  if (parts[2] === 'w' && week) return { page: 'week', slug, week }
  return { page: 'course', slug }
}

export const href = {
  home: () => '#/',
  course: (slug: string) => `#/c/${slug}`,
  week: (slug: string, week: number) => `#/c/${slug}/w/${week}`,
  day: (slug: string, week: number, day: number) => `#/c/${slug}/w/${week}/d/${day}`,
  /** The 10-minute version of a day: Review and the mini-task only. */
  shortDay: (slug: string, week: number, day: number) => `#/c/${slug}/w/${week}/d/${day}/short`,
  sandbox: (slug: string, id: string) => `#/c/${slug}/s/${id}`,
  account: () => '#/account',
  admin: () => '#/admin',
  nudge: () => '#/nudge',
  nudgeTrackers: () => '#/nudge/trackers',
  nudgeTracker: (id: string) => `#/nudge/trackers/${id}`,
  nudgeStats: () => '#/nudge/stats',
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(
    (listener) => {
      window.addEventListener('hashchange', listener)
      return () => window.removeEventListener('hashchange', listener)
    },
    () => window.location.hash,
  )
  return parseRoute(hash)
}
