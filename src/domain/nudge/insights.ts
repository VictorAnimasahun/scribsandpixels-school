import { addDays, weekday, type IsoDate } from '../streak.ts'
import type { Series, Tracker } from './trackers.ts'

/*
 * Insights: honest patterns in a learner's own logs (port of Nudge's insights-engine-spec.md).
 *
 * The guardrails are the point. Small personal datasets make noise look like patterns, so:
 *  - every detector needs a minimum amount of data, and returns nothing below it;
 *  - a correlation needs |r| >= 0.4, and is worded "tends to go with", never "causes";
 *  - only recent data counts (old habits shouldn't hide new ones);
 *  - the same insight isn't shown again within 7 days.
 */

export const RULES = {
  windowDays: 30,
  minPairs: 14,          // correlation: paired days
  minR: 0.4,
  minTrendDays: 7,
  trendShare: 0.15,      // a trend must move at least 15% of the mean across the window
  minBaselineDays: 10,   // history needed before today can be judged against it
  deviationZ: 2.5,       // unusual = 2.5+ standard deviations from your own normal (at 2, ~1 false alarm a fortnight per tracker)
  weekdayWindowDays: 56, // day-of-week patterns look back 8 weeks
  minPerWeekday: 3,
  minWeekdays: 5,
  weekdayGap: 0.25,      // best and worst weekday must differ by 25% of the overall mean
  cooldownDays: 7,
  // Beyond the spec's thresholds: a pattern must also be statistically significant, at 5% split
  // across every comparison made (Bonferroni). At 14 days a chance r of 0.4 is common, and with
  // 5 trackers there are 10 pairs to be fooled by: found in the browser with made-up data, 27 Oct.
  alpha: 0.05,
} as const

// ─── Statistics (checked against hand-worked numbers in the tests) ─────────

export const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

/** Pearson correlation; null with fewer than minN pairs, or when a series never changes. */
export function pearson(xs: readonly number[], ys: readonly number[], minN: number = RULES.minPairs): number | null {
  if (xs.length !== ys.length || xs.length < minN) return null
  const mx = mean(xs), my = mean(ys)
  let num = 0, sx = 0, sy = 0
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my
    num += dx * dy; sx += dx * dx; sy += dy * dy
  }
  const den = Math.sqrt(sx * sy)
  return den === 0 ? null : num / den
}

/**
 * Theil–Sen slope: the median of the slopes between every pair of points. One odd day can't fake a
 * trend with it (a least-squares line is dragged by a single bad night; this isn't). Null when
 * every x is the same.
 */
export function robustSlope(xs: readonly number[], ys: readonly number[]): number | null {
  const slopes: number[] = []
  for (let i = 0; i < xs.length; i++)
    for (let j = i + 1; j < xs.length; j++) if (xs[j] !== xs[i]) slopes.push((ys[j] - ys[i]) / (xs[j] - xs[i]))
  if (!slopes.length) return null
  slopes.sort((a, b) => a - b)
  const mid = slopes.length >> 1
  return slopes.length % 2 ? slopes[mid] : (slopes[mid - 1] + slopes[mid]) / 2
}

// ─── Significance (exact distributions via the regularised incomplete beta function) ──

/** ln Γ(x), Lanczos approximation (accurate to ~15 digits for x > 0). */
function lnGamma(x: number): number {
  const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x)
  x -= 1
  let a = 0.99999999999980993
  const t = x + 7.5
  for (let i = 0; i < 8; i++) a += g[i] / (x + i + 1)
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

/** Continued fraction for the incomplete beta function (Lentz's method). */
function betaFraction(a: number, b: number, x: number): number {
  const tiny = 1e-300
  let c = 1, d = 1 - ((a + b) * x) / (a + 1)
  d = 1 / (Math.abs(d) < tiny ? tiny : d)
  let h = d
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m
    for (const aa of [(m * (b - m) * x) / ((a - 1 + m2) * (a + m2)), (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + 1 + m2))]) {
      d = 1 + aa * d; d = 1 / (Math.abs(d) < tiny ? tiny : d)
      c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny
      h *= d * c
    }
    if (Math.abs(d * c - 1) < 1e-15) break
  }
  return h
}

/** Regularised incomplete beta I_x(a, b). */
export function incompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const front = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x))
  return x < (a + 1) / (a + b + 2) ? (front * betaFraction(a, b, x)) / a : 1 - (front * betaFraction(b, a, 1 - x)) / b
}

/** Two-sided p-value of Student's t with df degrees of freedom. */
export const tTestP = (t: number, df: number) => incompleteBeta(df / 2, 0.5, df / (df + t * t))

/** p-value of a correlation r over n pairs (the t-test on r, df = n − 2). */
export function correlationP(r: number, n: number): number {
  if (Math.abs(r) >= 1) return 0
  return tTestP(r * Math.sqrt((n - 2) / (1 - r * r)), n - 2)
}

/** Upper-tail p-value of F with (d1, d2) degrees of freedom. */
export const fTestP = (f: number, d1: number, d2: number) => incompleteBeta(d2 / 2, d1 / 2, d2 / (d2 + d1 * f))

/** One-way ANOVA across groups: the p-value that the group means differ only by chance. */
export function anovaP(groups: readonly (readonly number[])[]): number {
  const all = groups.flat()
  const grand = mean(all)
  const between = groups.reduce((s, g) => s + g.length * (mean(g) - grand) ** 2, 0)
  const within = groups.reduce((s, g) => { const m = mean(g); return s + g.reduce((t, x) => t + (x - m) ** 2, 0) }, 0)
  const d1 = groups.length - 1, d2 = all.length - groups.length
  if (d1 < 1 || d2 < 1) return 1
  if (within === 0) return between > 0 ? 0 : 1
  return fTestP((between / d1) / (within / d2), d1, d2)
}

/** Mean and population standard deviation; null with fewer than minN values. */
export function baseline(xs: readonly number[], minN: number = RULES.minBaselineDays): { mean: number; sd: number } | null {
  if (xs.length < minN) return null
  const m = mean(xs)
  return { mean: m, sd: Math.sqrt(mean(xs.map((x) => (x - m) ** 2))) }
}

// ─── Insights ───────────────────────────────────────────────────────────────

export type Insight = {
  /** Identity for the cooldown: same kind + same trackers + same direction = same insight. */
  key: string
  kind: 'trend' | 'deviation' | 'correlation' | 'day-of-week'
  trackers: string[]
  /** For sorting only: |r|, |z|, or the size of the change relative to the mean. */
  strength: number
  text: string
}

export type Named = Pick<Tracker, 'id' | 'name' | 'kind' | 'unit'>

const WEEKDAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']
/** 7 → "7", 6.98 → "7", 6.54 → "6.5", 2100.4 → "2100" (never "7.0"). */
const fmt = (n: number) => (Math.abs(n) >= 10 ? String(Math.round(n)) : String(Number(n.toFixed(1))))
const withUnit = (t: Named, n: number) => (t.unit ? `${fmt(n)} ${t.unit}` : fmt(n))
const lower = (t: Named) => t.name.toLowerCase()
const dayNumber = (d: IsoDate) => Date.parse(`${d}T00:00:00Z`) / 86_400_000

/** Logged [date, value] pairs from the `days` days ending on `last`, oldest first. */
function recent(series: Series, last: IsoDate, days: number = RULES.windowDays): [IsoDate, number][] {
  const first = addDays(last, -(days - 1))
  return Object.entries(series).filter(([d]) => d >= first && d <= last).sort(([a], [b]) => (a < b ? -1 : 1))
}

/** A steady rise or fall over the last 30 days. Uses real dates, so gaps in logging don't squash
 *  time; it must be significant (values really do move with time, not just scatter); and its size
 *  comes from the outlier-proof slope, so one unusual day isn't called a trend. */
export function trend(t: Named, series: Series, today: IsoDate, alpha: number = RULES.alpha): Insight | null {
  if (t.kind === 'check') return null
  const points = recent(series, today)
  if (points.length < RULES.minTrendDays) return null
  const xs = points.map(([d]) => dayNumber(d))
  const ys = points.map(([, v]) => v)
  const m = mean(ys)
  const s = robustSlope(xs, ys)
  const r = pearson(xs, ys, RULES.minTrendDays)
  if (s === null || r === null || m === 0 || correlationP(r, xs.length) >= alpha) return null
  const days = xs[xs.length - 1] - xs[0]
  const change = s * days
  if (Math.abs(change) < RULES.trendShare * Math.abs(m)) return null
  const up = change > 0
  return {
    key: `trend:${t.id}:${up ? 'up' : 'down'}`, kind: 'trend', trackers: [t.id], strength: Math.abs(change / m),
    text: `Your ${lower(t)} has been going ${up ? 'up' : 'down'}: about ${withUnit(t, Math.abs(change))} over the last ${days + 1} days.`,
  }
}

/** Today's value against your own normal: the 30 days before today, not counting today. */
export function deviation(t: Named, series: Series, today: IsoDate): Insight | null {
  if (t.kind === 'check' || !(today in series)) return null
  const b = baseline(recent(series, addDays(today, -1)).map(([, v]) => v))
  if (!b || b.sd === 0) return null
  const z = (series[today] - b.mean) / b.sd
  if (Math.abs(z) < RULES.deviationZ) return null
  const high = z > 0
  return {
    key: `deviation:${t.id}:${high ? 'high' : 'low'}:${today}`, kind: 'deviation', trackers: [t.id], strength: Math.abs(z),
    text: `Today's ${lower(t)} (${withUnit(t, series[today])}) is unusually ${high ? 'high' : 'low'} for you: you normally log about ${withUnit(t, b.mean)}.`,
  }
}

/** Two trackers moving together on the same days. Observational: it never claims one causes the other. */
export function correlation(a: Named, sa: Series, b: Named, sb: Series, today: IsoDate, alpha: number = RULES.alpha): Insight | null {
  const fromA = new Map(recent(sa, today))
  const pairs = recent(sb, today).filter(([d]) => fromA.has(d)).map(([d, v]) => [fromA.get(d)!, v] as const)
  const r = pearson(pairs.map((p) => p[0]), pairs.map((p) => p[1]))
  if (r === null || Math.abs(r) < RULES.minR || correlationP(r, pairs.length) >= alpha) return null
  const together = r > 0
  const [x, y] = [a.id, b.id].sort()
  return {
    key: `correlation:${x}:${y}:${together ? 'pos' : 'neg'}`, kind: 'correlation', trackers: [x, y], strength: Math.abs(r),
    text: `Noticed a pattern over ${pairs.length} days: on days with more ${lower(a)}, your ${lower(b)} tends to be ${together ? 'higher' : 'lower'}. That's a pattern, not proof that one causes the other.`,
  }
}

/** One weekday standing out. Needs 3+ logs on at least 5 different weekdays in the last 8 weeks,
 *  and the weekdays must really differ (one-way ANOVA), not just wobble. */
export function dayOfWeek(t: Named, series: Series, today: IsoDate, alpha: number = RULES.alpha): Insight | null {
  const byDay = new Map<number, number[]>()
  for (const [d, v] of recent(series, today, RULES.weekdayWindowDays)) byDay.set(weekday(d), [...(byDay.get(weekday(d)) ?? []), v])
  const groups = [...byDay].filter(([, vs]) => vs.length >= RULES.minPerWeekday)
  if (groups.length < RULES.minWeekdays || anovaP(groups.map(([, vs]) => vs)) >= alpha) return null
  const means = groups.map(([day, vs]) => [day, mean(vs)] as const)
  const overall = mean(means.map(([, m]) => m))
  if (overall === 0) return null
  const sorted = [...means].sort((p, q) => p[1] - q[1] || p[0] - q[0])
  const low = sorted[0], high = sorted[sorted.length - 1]
  const gap = (high[1] - low[1]) / Math.abs(overall)
  if (gap < RULES.weekdayGap) return null
  return {
    key: `day-of-week:${t.id}:${low[0]}:${high[0]}`, kind: 'day-of-week', trackers: [t.id], strength: gap,
    text: t.kind === 'check'
      ? `You tick "${t.name}" most on ${WEEKDAYS[high[0]]} and least on ${WEEKDAYS[low[0]]}.`
      : `Your ${lower(t)} is highest on ${WEEKDAYS[high[0]]} (about ${withUnit(t, high[1])}) and lowest on ${WEEKDAYS[low[0]]} (about ${withUnit(t, low[1])}).`,
  }
}

/**
 * Every insight worth showing today, strongest first, minus those shown in the last 7 days.
 * `shown` maps an insight key to the date it was last shown. One 5% significance level is shared
 * out across every comparison made (a trend and a weekday test per tracker, a correlation per
 * pair), so more trackers don't mean more chances to be fooled: on pure noise, about 1 learner in
 * 20 sees a false pattern (35% with the spec's thresholds alone; measured in the tests).
 */
export function insights(trackers: readonly Named[], series: Readonly<Record<string, Series>>, today: IsoDate, shown: Readonly<Record<string, IsoDate>> = {}): Insight[] {
  const of = (t: Named) => series[t.id] ?? {}
  const found: (Insight | null)[] = []
  const n = trackers.length
  const each = RULES.alpha / Math.max(1, 2 * n + (n * (n - 1)) / 2)
  for (const t of trackers) found.push(trend(t, of(t), today, each), deviation(t, of(t), today), dayOfWeek(t, of(t), today, each))
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) found.push(correlation(trackers[i], of(trackers[i]), trackers[j], of(trackers[j]), today, each))
  const fresh = (i: Insight) => !(i.key in shown) || shown[i.key] <= addDays(today, -RULES.cooldownDays)
  return found.filter((i): i is Insight => i !== null && fresh(i)).sort((a, b) => b.strength - a.strength)
}
