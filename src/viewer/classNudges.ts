import type { CatalogCourse } from '../content/catalog.ts'
import { gateStatus, WEEK_QUIZ_RULES } from '../domain/quizGate.ts'
import { streak, weekday, type IsoDate } from '../domain/streak.ts'
import { href } from './router.ts'
import type { GateRecord, State } from './store.ts'
import { coursePace, isDayDone, shortTitle } from './today.ts'

/*
 * Nudge's class nudges: what the school is waiting for, worked out with the school's own rules
 * (calendar pace, week quizzes, checkpoint cooldowns, the study streak). Pure: the state, the
 * courses and the clock are passed in.
 */

export type ClassNudge = {
  /** Stable per thing, so a dismissed nudge stays dismissed until the situation changes. */
  key: string
  /** Higher first: a cooldown ending or a streak at risk matters more than an open quiz. */
  urgency: 1 | 2 | 3
  text: string
  link: string
}

const clock = (d: Date, timeZone: string) => new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d)
const hourIn = (d: Date, timeZone: string) => Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(d))
const attemptsOf = (r: GateRecord) => r.attempts.map((a) => ({ finishedAt: new Date(a.finishedAt), passed: a.passed }))

/** After this hour on a study day with nothing ticked, the streak is "at risk". */
export const STREAK_RISK_HOUR = 17

export function classNudges(
  courses: readonly CatalogCourse[],
  state: Pick<State, 'checked' | 'weekQuizzes' | 'startedOn' | 'gates' | 'studied'>,
  today: IsoDate,
  now: Date,
  timeZone: string,
): ClassNudge[] {
  const out: ClassNudge[] = []
  for (const course of courses) {
    const p = coursePace(course, state, today)
    if (!p) continue // not enrolled: nothing is due
    const name = shortTitle(course.title)

    if (p.behind.length) {
      const first = p.behind[0]
      const n = p.behind.length
      out.push({
        key: `behind:${course.slug}:${first.week}:${first.day}`, urgency: 2,
        text: `${name}: ${n} day${n === 1 ? '' : 's'} behind. Start with Week ${first.week}, Day ${first.day}.`,
        link: href.day(course.slug, first.week, first.day),
      })
    } else if (p.scheduled.kind === 'day') {
      const { week, day } = p.scheduled
      const d = course.weeks.find((w) => w.number === week)?.days.find((x) => x.number === day)
      if (d && !isDayDone(state.checked, course.slug, week, d))
        out.push({ key: `today:${course.slug}:${week}:${day}`, urgency: 1, text: `${name}: today is Week ${week}, Day ${day}: ${d.topic}.`, link: href.day(course.slug, week, day) })
    }

    for (const w of course.weeks) {
      const record = state.weekQuizzes[`${course.slug}:${w.number}`]
      const status = record ? gateStatus(attemptsOf(record), now, WEEK_QUIZ_RULES) : null
      if (status?.kind === 'passed') continue
      if (status?.kind === 'cooldown') {
        out.push({ key: `quiz-cooldown:${course.slug}:${w.number}:${status.attempt}`, urgency: 3, text: `${name}: you can retry the Week ${w.number} quiz at ${clock(status.until, timeZone)}.`, link: href.week(course.slug, w.number) })
        continue
      }
      const allDone = w.days.length > 0 && w.days.every((d) => isDayDone(state.checked, course.slug, w.number, d))
      if (!allDone) continue
      const overdue = p.quizzesOverdue.includes(w.number)
      out.push({ key: `quiz-open:${course.slug}:${w.number}`, urgency: overdue ? 3 : 2, text: `${name}: the Week ${w.number} quiz is ${overdue ? 'overdue' : 'open'}. Pass it to unlock Week ${w.number + 1}.`, link: href.week(course.slug, w.number) })
    }

    for (const [key, record] of Object.entries(state.gates)) {
      if (!key.startsWith(`${course.slug}:`)) continue
      const status = gateStatus(attemptsOf(record), now)
      if (status.kind === 'passed') continue
      const [week, day] = key.slice(course.slug.length + 1).split(':').map(Number)
      if (status.kind === 'cooldown')
        out.push({ key: `gate-cooldown:${key}:${status.attempt}`, urgency: 3, text: `${name}: the checkpoint opens again at ${clock(status.until, timeZone)}.`, link: href.day(course.slug, week, day) })
      else
        out.push({ key: `gate-waiting:${key}:${status.attempt}`, urgency: 3, text: `${name}: a checkpoint is waiting. Pass it to open Week ${week}, Day ${day}.`, link: href.day(course.slug, week, day) })
    }
  }

  // The study streak is the school's, across all courses (Sunday is rest, so never at risk then).
  const s = streak(new Set(Object.keys(state.studied)), today)
  if (s.current > 0 && weekday(today) !== 0 && !state.studied[today] && hourIn(now, timeZone) >= STREAK_RISK_HOUR)
    out.push({ key: `streak:${today}`, urgency: 3, text: `Your ${s.current}-day study streak ends tonight unless you tick a block.`, link: href.home() })

  return out.sort((a, b) => b.urgency - a.urgency)
}
