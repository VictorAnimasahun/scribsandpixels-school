import { useSyncExternalStore } from 'react'

export type Route =
  | { page: 'home' }
  | { page: 'course'; slug: string }
  | { page: 'week'; slug: string; week: number }
  | { page: 'day'; slug: string; week: number; day: number }
  | { page: 'sandbox'; slug: string; id: string }
  | { page: 'mockup' }

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'mockup') return { page: 'mockup' }
  if (parts[0] !== 'c' || !parts[1]) return { page: 'home' }
  const slug = parts[1]
  const week = Number(parts[3])
  const day = Number(parts[5])
  if (parts[2] === 's' && parts[3]) return { page: 'sandbox', slug, id: parts[3] }
  if (parts[2] === 'w' && week && parts[4] === 'd' && day) return { page: 'day', slug, week, day }
  if (parts[2] === 'w' && week) return { page: 'week', slug, week }
  return { page: 'course', slug }
}

export const href = {
  home: () => '#/',
  course: (slug: string) => `#/c/${slug}`,
  week: (slug: string, week: number) => `#/c/${slug}/w/${week}`,
  day: (slug: string, week: number, day: number) => `#/c/${slug}/w/${week}/d/${day}`,
  sandbox: (slug: string, id: string) => `#/c/${slug}/s/${id}`,
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
