import { ContentError, parseWeek } from './parseWeek.ts'
import type { Course } from './types.ts'

/** Combines a course's framework with its week files (path → markdown). */
export function buildCourse(meta: Omit<Course, 'weeks'>, weekFiles: Record<string, string>): Course {
  const weeks = Object.entries(weekFiles)
    .map(([path, markdown]) => parseWeek(markdown, path))
    .sort((a, b) => a.number - b.number)

  weeks.forEach((week, index) => {
    if (week.number !== index + 1) {
      throw new ContentError(meta.slug, 1, `weeks must be written in order: found Week ${week.number} where Week ${index + 1} was expected`)
    }
    if (week.number > meta.totalWeeks) throw new ContentError(meta.slug, 1, `Week ${week.number} is past the course's ${meta.totalWeeks} weeks`)
  })

  return { ...meta, weeks }
}
