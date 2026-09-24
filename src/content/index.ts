import { buildCourse } from './buildCourse.ts'
import { fullstackMl } from './courses/fullstack-ml/course.ts'
import type { Course, Day, Week } from './types.ts'

const fullstackMlWeeks = import.meta.glob<string>('./courses/fullstack-ml/weeks/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const courses: Course[] = [buildCourse(fullstackMl, fullstackMlWeeks)]

export function getCourse(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug)
}

export function getWeek(course: Course, week: number): Week | undefined {
  return course.weeks.find((w) => w.number === week)
}

export function getDay(course: Course, week: number, day: number): Day | undefined {
  return getWeek(course, week)?.days.find((d) => d.number === day)
}

export type * from './types.ts'
