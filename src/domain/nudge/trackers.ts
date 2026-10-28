import { addDays, weekday, type IsoDate } from '../streak.ts'

/*
 * Nudge's trackers: what a learner logs about their life, and whether they met their own goal.
 * Pure rules, no storage. A tracker is a definition (a preset or the learner's own); entries are
 * one number per tracker per date. Plan: docs/nudge-plan.md.
 */

export type TrackerKind =
  | 'check'     // done or not (1 = done)
  | 'count'     // tapped up: cups of water, pages read
  | 'number'    // a measured value with a unit: kg, kcal, minutes
  | 'scale'     // 1 to 5, e.g. mood
  | 'duration'  // hours, e.g. sleep

export type Target = {
  /** 'atLeast' 8 cups, or 'atMost' 2100 kcal. */
  direction: 'atLeast' | 'atMost'
  value: number
  /** 'day': every day's value is judged. 'week': the week's total is (for check, its days done). */
  per: 'day' | 'week'
}

export type PresetId = 'food' | 'exercise' | 'word' | 'book' | 'weight' | 'tasks' | 'mood' | 'sleep' | 'water'

export type Tracker = {
  id: string
  name: string
  kind: TrackerKind
  /** Shown after values: 'cups', 'kg'. Empty for check and scale. */
  unit: string
  target: Target | null
  /** The preset it started from, if any (stays even after the learner renames it). */
  preset: PresetId | null
  /** Order on Nudge's Today, lowest first. */
  order: number
  enabled: boolean
  /** Hour of the day (0–23, the learner's time zone) for a reminder, or null for none. */
  reminderHour: number | null
}

/** Nudge's home cards (my_everything_app HomeCardKeys) as trackers, with default goals the learner can change.
 *  Get Ready (weather + outfit) is slice 2: it's a suggestion, not something you log. */
export const PRESETS: Readonly<Record<PresetId, Pick<Tracker, 'preset' | 'name' | 'kind' | 'unit' | 'target'>>> = {
  food:     { preset: 'food',     name: 'Food',            kind: 'number',   unit: 'kcal',  target: { direction: 'atMost', value: 2100, per: 'day' } },
  exercise: { preset: 'exercise', name: 'Exercise',        kind: 'number',   unit: 'min',   target: { direction: 'atLeast', value: 45, per: 'day' } },
  word:     { preset: 'word',     name: 'Word of the day', kind: 'check',    unit: '',      target: { direction: 'atLeast', value: 1, per: 'day' } },
  book:     { preset: 'book',     name: 'Reading',         kind: 'count',    unit: 'pages', target: { direction: 'atLeast', value: 10, per: 'day' } },
  weight:   { preset: 'weight',   name: 'Weight',          kind: 'number',   unit: 'kg',    target: null },
  tasks:    { preset: 'tasks',    name: 'Tasks done',      kind: 'count',    unit: 'tasks', target: { direction: 'atLeast', value: 3, per: 'day' } },
  mood:     { preset: 'mood',     name: 'Mood',            kind: 'scale',    unit: '',      target: null },
  sleep:    { preset: 'sleep',    name: 'Sleep',           kind: 'duration', unit: 'h',     target: { direction: 'atLeast', value: 7, per: 'day' } },
  water:    { preset: 'water',    name: 'Water',           kind: 'count',    unit: 'cups',  target: { direction: 'atLeast', value: 8, per: 'day' } },
}

export const PRESET_IDS = Object.keys(PRESETS) as PresetId[]

/** Switched on for a new learner (Nudge's defaults, minus Get Ready). */
export const DEFAULT_PRESETS: readonly PresetId[] = ['food', 'exercise', 'word', 'book', 'weight', 'tasks']

export function presetTracker(id: PresetId, order: number, enabled = DEFAULT_PRESETS.includes(id)): Tracker {
  return { ...PRESETS[id], target: PRESETS[id].target && { ...PRESETS[id].target }, id, order, enabled, reminderHour: null }
}

/** Every preset in Nudge's order, the defaults switched on. */
export const starterTrackers = (): Tracker[] => PRESET_IDS.map((id, i) => presetTracker(id, i))

// ─── Validation ─────────────────────────────────────────────────────────────

const RANGE: Readonly<Record<TrackerKind, readonly [number, number]>> = {
  check: [0, 1],
  count: [0, 100_000],
  number: [-1_000_000, 1_000_000],
  scale: [1, 5],
  duration: [0, 24],
}

/** Whether one day's value can be logged for this kind (a mood of 7 or 30 hours of sleep can't). */
export function validValue(kind: TrackerKind, value: number): boolean {
  // An unknown kind (old or tampered data) holds nothing, rather than crashing on the lookup.
  if (!Number.isFinite(value) || !(kind in RANGE)) return false
  const [lo, hi] = RANGE[kind]
  if (value < lo || value > hi) return false
  return kind === 'number' || kind === 'duration' ? true : Number.isInteger(value)
}

/** Problems with a tracker the learner made or edited, in plain words; empty when it can be saved. */
export function trackerProblems(t: Pick<Tracker, 'name' | 'kind' | 'unit' | 'target' | 'reminderHour'>): string[] {
  const out: string[] = []
  if (!(t.kind in RANGE)) return ['Pick what kind of thing you log.']
  const name = t.name.trim()
  if (!name) out.push('Give it a name.')
  if (name.length > 40) out.push('Keep the name to 40 characters or fewer.')
  if (t.unit.length > 12) out.push('Keep the unit to 12 characters or fewer.')
  const g = t.target
  if (g) {
    if (g.per === 'day') {
      if (!validValue(t.kind, g.value)) out.push(`A daily goal of ${g.value} doesn't fit this tracker.`)
      if (t.kind === 'check' && g.value !== 1) out.push('A daily yes/no goal is simply "done".')
    } else {
      // A week's goal is a total: up to 7 days' worth.
      const [, hi] = RANGE[t.kind]
      if (!Number.isFinite(g.value) || g.value <= 0 || g.value > hi * 7) out.push(`A weekly goal of ${g.value} doesn't fit this tracker.`)
      if (t.kind === 'check' && !Number.isInteger(g.value)) out.push('A weekly yes/no goal is a number of days, 1 to 7.')
      if (t.kind === 'scale') out.push('A 1–5 scale has a daily goal, not a weekly total.')
    }
  }
  if (t.reminderHour !== null && !(Number.isInteger(t.reminderHour) && t.reminderHour >= 0 && t.reminderHour <= 23)) out.push('Pick a reminder hour from 0 to 23.')
  return out
}

/** A new id for a learner-made tracker: never collides with a preset id ('c-' prefix). */
export const customId = (random: () => number = Math.random) => `c-${Math.floor(random() * 36 ** 8).toString(36).padStart(8, '0')}`

// ─── Goals and streaks ──────────────────────────────────────────────────────

/** One tracker's values: date → number. */
export type Series = Readonly<Record<IsoDate, number>>

export const meets = (target: Target, value: number) => (target.direction === 'atLeast' ? value >= target.value : value <= target.value)

/** The Monday on or before a date: weeks run Monday to Sunday, like the school's. */
export const mondayOf = (date: IsoDate) => addDays(date, -((weekday(date) + 6) % 7))

/** A week's total: the sum of its values (for check, the number of days done). */
export function weekTotal(series: Series, monday: IsoDate): number {
  let total = 0
  for (let i = 0; i < 7; i++) total += series[addDays(monday, i)] ?? 0
  return total
}

export type Progress =
  | { kind: 'no-goal' }
  | { kind: 'met' }
  | { kind: 'not-yet'; remaining: number }   // atLeast: still to go today / this week
  | { kind: 'over'; by: number }             // atMost: already past it

/** Where today (or this week) stands against the goal. An atMost goal counts as met while under it. */
export function progressToward(tracker: Pick<Tracker, 'target'>, series: Series, today: IsoDate): Progress {
  const g = tracker.target
  if (!g) return { kind: 'no-goal' }
  const value = g.per === 'day' ? (series[today] ?? 0) : weekTotal(series, mondayOf(today))
  if (g.direction === 'atLeast') return value >= g.value ? { kind: 'met' } : { kind: 'not-yet', remaining: g.value - value }
  return value <= g.value ? { kind: 'met' } : { kind: 'over', by: value - g.value }
}

export type TrackerStreak = { current: number; best: number; unit: 'days' | 'weeks' }

/**
 * Goals met in a row. A day (or week) only counts once something was logged for it: an atMost
 * goal isn't "met" by logging nothing. Today (this week) is still open: it keeps the streak alive
 * without adding to it until it's met.
 */
export function trackerStreak(tracker: Pick<Tracker, 'target'>, series: Series, today: IsoDate): TrackerStreak | null {
  const g = tracker.target
  if (!g) return null
  const step = g.per === 'day' ? 1 : 7
  const start = g.per === 'day' ? today : mondayOf(today)
  const logged = (period: IsoDate) => (g.per === 'day' ? period in series : Array.from({ length: 7 }, (_, i) => addDays(period, i)).some((d) => d in series))
  const good = (period: IsoDate) => logged(period) && meets(g, g.per === 'day' ? series[period] : weekTotal(series, period))

  let current = 0
  for (let p = good(start) ? start : addDays(start, -step); good(p); p = addDays(p, -step)) current++

  let best = current
  const dates = Object.keys(series).filter((d) => d <= today).sort()
  if (dates.length) {
    let run = 0
    for (let q = g.per === 'day' ? dates[0] : mondayOf(dates[0]); q <= start; q = addDays(q, step)) {
      run = good(q) ? run + 1 : 0
      best = Math.max(best, run)
    }
  }
  return { current, best, unit: g.per === 'day' ? 'days' : 'weeks' }
}

/** A value with its unit, for a card: "6 cups", "7.5 h", "Done". */
export function formatValue(tracker: Pick<Tracker, 'kind' | 'unit'>, value: number | undefined): string {
  if (value === undefined) return '—'
  if (tracker.kind === 'check') return value ? 'Done' : 'Not yet'
  if (tracker.kind === 'scale') return `${value} / 5`
  const n = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return tracker.unit ? `${n} ${tracker.unit}` : n
}
