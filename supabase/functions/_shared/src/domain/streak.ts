/*
 * Streaks count consecutive study days, Monday to Saturday. Sunday is the
 * plan's rest day: studying then doesn't add to a streak and skipping it
 * never breaks one. Today still counts as "alive" until the day is over.
 *
 * Dates are 'YYYY-MM-DD' strings in the learner's own timezone.
 */

export type IsoDate = string

const DAY_MS = 86_400_000

/** The calendar date of `instant` in `timeZone`, e.g. '2026-09-24'. */
export function localDate(instant: Date, timeZone: string): IsoDate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant)
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10)
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(date: IsoDate): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

const isRestDay = (date: IsoDate) => weekday(date) === 0

export type Streak = { current: number; best: number }

export function streak(studyDates: ReadonlySet<IsoDate>, today: IsoDate): Streak {
  let current = 0
  // Today not studied yet doesn't break the streak; start counting from yesterday.
  let date = studyDates.has(today) ? today : addDays(today, -1)
  for (;;) {
    if (isRestDay(date)) date = addDays(date, -1)
    else if (studyDates.has(date)) { current++; date = addDays(date, -1) }
    else break
  }

  let best = current
  let run = 0
  const sorted = [...studyDates].filter((d) => d <= today && !isRestDay(d)).sort()
  let previous: IsoDate | undefined
  for (const date of sorted) {
    let expected = previous && addDays(previous, 1)
    if (expected && isRestDay(expected)) expected = addDays(expected, 1)
    run = date === expected ? run + 1 : 1
    best = Math.max(best, run)
    previous = date
  }
  return { current, best }
}

export type WeekDot = {
  date: IsoDate
  /** M T W T F S S */
  label: string
  studied: boolean
  isToday: boolean
  isFuture: boolean
  isRestDay: boolean
}

/** Monday-to-Sunday dots for the week containing `today`. */
export function weekDots(studyDates: ReadonlySet<IsoDate>, today: IsoDate): WeekDot[] {
  const monday = addDays(today, -((weekday(today) + 6) % 7))
  return 'MTWTFSS'.split('').map((label, index) => {
    const date = addDays(monday, index)
    return { date, label, studied: studyDates.has(date), isToday: date === today, isFuture: date > today, isRestDay: isRestDay(date) }
  })
}

export function studyDatesFrom(completions: Date[], timeZone: string): Set<IsoDate> {
  return new Set(completions.map((instant) => localDate(instant, timeZone)))
}
