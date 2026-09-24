// Copies what the Supabase edge functions share with the app into
// supabase/functions/_shared: the domain logic (pacing, streaks) and a
// manifest of each course without the lesson bodies.
//
// Run after changing src/domain or course content:  npm run sync:functions

import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { buildCourse } from '../src/content/buildCourse.ts'
import { fullstackMl } from '../src/content/courses/fullstack-ml/course.ts'

const root = join(import.meta.dirname, '..')
const shared = join(root, 'supabase/functions/_shared')

for (const file of ['src/content/types.ts', 'src/domain/progress.ts', 'src/domain/streak.ts']) {
  const target = join(shared, file)
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(join(root, file), target)
}

const courses = [{ meta: fullstackMl, weeksDir: 'src/content/courses/fullstack-ml/weeks' }].map(({ meta, weeksDir }) => {
  const files = Object.fromEntries(
    readdirSync(join(root, weeksDir))
      .filter((name) => name.endsWith('.md'))
      .map((name) => [join(weeksDir, name), readFileSync(join(root, weeksDir, name), 'utf8')]),
  )
  const course = buildCourse(meta, files)
  // Emails only need titles and topics; drop lesson bodies to keep the bundle small.
  return {
    ...course,
    weeks: course.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({ ...day, blocks: day.blocks.map((block) => ({ ...block, body: '' })) })),
    })),
  }
})

writeFileSync(join(shared, 'courses.json'), JSON.stringify(courses, null, 2) + '\n')
console.log(`Synced ${courses.length} course(s) and domain logic to supabase/functions/_shared`)
