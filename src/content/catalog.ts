import { fullstackMl } from './courses/fullstack-ml/course.ts'
import { parseWeek } from './parseWeek.ts'
import { parseQuizWeek, type QuizWeek } from './quizzes.ts'
import type { Week } from './types.ts'

/*
 * Every course in the repo, discovered from its files: overview.md (optional),
 * weeks/week-NN.md and quizzes/week-NN.yaml.
 *
 * Quiz banks are most of the content by size (thousands of questions), so each week's bank is its
 * own small file, downloaded the first time that week is opened (loadQuizWeek), not with the app.
 * Which weeks *have* quizzes is known up front from the file names alone.
 */

const overviews = import.meta.glob<string>('./courses/*/overview.md', { query: '?raw', import: 'default', eager: true })
const weekFiles = import.meta.glob<string>('./courses/*/weeks/*.md', { query: '?raw', import: 'default', eager: true })
const quizFiles = import.meta.glob<string>('./courses/*/quizzes/*.yaml', { query: '?raw', import: 'default' })

export type CatalogCourse = {
  slug: string
  title: string
  overview?: string
  weeks: Week[]
  totalWeeks: number
  /** Weeks that have a quiz bank (load it with loadQuizWeek). */
  quizWeeks: Set<number>
}

const slugOf = (path: string) => path.split('/')[2]
const weekOf = (path: string) => Number(path.match(/week-(\d+)\.yaml$/)?.[1])

const fallbackTitles: Record<string, string> = { [fullstackMl.slug]: fullstackMl.title }
/** Course length from its course.ts when it has one; otherwise the written weeks are the whole course. */
const knownLengths: Record<string, number> = { [fullstackMl.slug]: fullstackMl.totalWeeks }

function build(): CatalogCourse[] {
  const slugs = [...new Set(Object.keys(weekFiles).map(slugOf))]
  return slugs.map((slug) => {
    const overview = Object.entries(overviews).find(([p]) => slugOf(p) === slug)?.[1]
    const title = overview?.match(/^# (.+)$/m)?.[1] ?? fallbackTitles[slug] ?? slug
    const weeks = Object.entries(weekFiles)
      .filter(([p]) => slugOf(p) === slug)
      .map(([p, md]) => parseWeek(md, p))
      .sort((a, b) => a.number - b.number)
    const quizWeeks = new Set(Object.keys(quizFiles).filter((p) => slugOf(p) === slug).map(weekOf))
    return { slug, title, overview, weeks, totalWeeks: knownLengths[slug] ?? weeks.length, quizWeeks }
  }).sort((a, b) => a.title.localeCompare(b.title))
}

export const catalog: CatalogCourse[] = build()

export const findCourse = (slug: string) => catalog.find((c) => c.slug === slug)

// ─── Quiz banks, loaded on demand ─────────────────────────────────────────

const loaded = new Map<string, QuizWeek | null>() // null: the week has no bank
const failed = new Set<string>() // download failed (offline, or the site was redeployed): retry on reload
const loading = new Map<string, Promise<QuizWeek | undefined>>()
const listeners = new Set<() => void>()
let version = 0
const keyOf = (slug: string, week: number) => `${slug}:${week}`

/** The week's bank if it has been loaded already; undefined if not (yet). */
export function quizWeek(slug: string, week: number): QuizWeek | undefined {
  return loaded.get(keyOf(slug, week)) ?? undefined
}

/** True once the bank is here, or when the week has no bank at all. A failed download is *not*
 *  settled: a checkpoint must stay locked rather than open because its questions couldn't load. */
export function quizWeekSettled(slug: string, week: number): boolean {
  return loaded.has(keyOf(slug, week)) || !findCourse(slug)?.quizWeeks.has(week)
}

export const quizWeekFailed = (slug: string, week: number) => failed.has(keyOf(slug, week))

export function loadQuizWeek(slug: string, week: number): Promise<QuizWeek | undefined> {
  const key = keyOf(slug, week)
  if (loaded.has(key)) return Promise.resolve(loaded.get(key) ?? undefined)
  const existing = loading.get(key)
  if (existing) return existing
  const path = Object.keys(quizFiles).find((p) => slugOf(p) === slug && weekOf(p) === week)
  const done = (value: QuizWeek | null | 'failed') => {
    if (value === 'failed') failed.add(key)
    else loaded.set(key, value)
    loading.delete(key)
    version++
    listeners.forEach((l) => l())
    return value === 'failed' ? undefined : value ?? undefined
  }
  const promise = path
    ? quizFiles[path]().then((text) => done(parseQuizWeek(text, path)), () => done('failed'))
    : Promise.resolve(done(null))
  loading.set(key, promise)
  return promise
}

/** For React: re-render when any bank finishes loading. */
export function subscribeQuizzes(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const quizVersion = () => version
