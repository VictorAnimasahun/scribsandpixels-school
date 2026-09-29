import { fullstackMl } from './courses/fullstack-ml/course.ts'
import { parseWeek } from './parseWeek.ts'
import { parseQuizWeek, type QuizWeek } from './quizzes.ts'
import type { Week } from './types.ts'

/*
 * Every course in the repo, discovered from its files: overview.md (optional),
 * weeks/week-NN.md and quizzes/week-NN.yaml.
 */

const overviews = import.meta.glob<string>('./courses/*/overview.md', { query: '?raw', import: 'default', eager: true })
const weekFiles = import.meta.glob<string>('./courses/*/weeks/*.md', { query: '?raw', import: 'default', eager: true })
const quizFiles = import.meta.glob<string>('./courses/*/quizzes/*.yaml', { query: '?raw', import: 'default', eager: true })

export type CatalogCourse = {
  slug: string
  title: string
  overview?: string
  weeks: Week[]
  quizzes: Map<number, QuizWeek>
}

const slugOf = (path: string) => path.split('/')[2]

const fallbackTitles: Record<string, string> = { [fullstackMl.slug]: fullstackMl.title }

function build(): CatalogCourse[] {
  const slugs = [...new Set(Object.keys(weekFiles).map(slugOf))]
  return slugs.map((slug) => {
    const overview = Object.entries(overviews).find(([p]) => slugOf(p) === slug)?.[1]
    const title = overview?.match(/^# (.+)$/m)?.[1] ?? fallbackTitles[slug] ?? slug
    const weeks = Object.entries(weekFiles)
      .filter(([p]) => slugOf(p) === slug)
      .map(([p, md]) => parseWeek(md, p))
      .sort((a, b) => a.number - b.number)
    const quizzes = new Map(
      Object.entries(quizFiles)
        .filter(([p]) => slugOf(p) === slug)
        .map(([p, text]) => {
          const week = parseQuizWeek(text, p)
          return [week.week, week] as const
        }),
    )
    return { slug, title, overview, weeks, quizzes }
  }).sort((a, b) => a.title.localeCompare(b.title))
}

export const catalog: CatalogCourse[] = build()

export const findCourse = (slug: string) => catalog.find((c) => c.slug === slug)
