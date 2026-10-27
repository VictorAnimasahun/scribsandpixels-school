import { useState } from 'react'
import { addDays } from '../../domain/streak.ts'
import { formatValue, type Series, type Tracker } from '../../domain/nudge/trackers.ts'

/*
 * One tracker's last 14 days as columns. Single series, so one hue (the school's green, 9.2:1 on
 * the card) and no legend: the card's title names it. A day with nothing logged has no mark at all,
 * so a gap never reads as a zero. The daily goal is a dashed reference line. Tap, hover or tab to a
 * column for its value; the same values are in the table underneath, so nothing hides behind a tooltip.
 */

const DAYS = 14
const SLOT = 24      // each day's band; the column is thinner, the rest is air
const COL = 14       // column width (the mark spec caps it at 24)
const PLOT_H = 96
const TOP = 14       // room for the top tick label
const AXIS = 20      // weekday letters under the baseline
const W = DAYS * SLOT
const H = TOP + PLOT_H + AXIS
const SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const LONG = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const day = (d: string) => LONG.format(new Date(`${d}T00:00:00Z`))

/** A clean top for the axis at or above the highest value, without wasting half the height
 *  (2,100 kcal → 2,500, not 5,000; 7.5 h → 8 h). */
function niceMax(n: number): number {
  if (n <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(n))
  return [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((m) => m * p).find((m) => m >= n - 1e-9)!
}

const compact = (n: number) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : String(+n.toFixed(1)))

/** A column with a 4px rounded top and a square foot on the baseline. */
function column(x: number, top: number, bottom: number) {
  const h = bottom - top
  const r = Math.min(4, h / 2, COL / 2)
  return `M${x},${bottom}V${top + r}Q${x},${top} ${x + r},${top}H${x + COL - r}Q${x + COL},${top} ${x + COL},${top + r}V${bottom}Z`
}

export function DaysChart({ tracker, series, today }: { tracker: Pick<Tracker, 'name' | 'kind' | 'unit' | 'target'>; series: Series; today: string }) {
  const dates = Array.from({ length: DAYS }, (_, i) => addDays(today, i - (DAYS - 1)))
  const values = dates.map((d) => series[d])
  const goal = tracker.target?.per === 'day' && tracker.kind !== 'check' ? tracker.target.value : null
  const top = tracker.kind === 'check' ? 1 : tracker.kind === 'scale' ? 5 : niceMax(Math.max(0, goal ?? 0, ...values.map((v) => v ?? 0)))
  const y = (v: number) => TOP + PLOT_H - (Math.max(0, v) / top) * PLOT_H
  const [picked, setPicked] = useState<number | null>(null)
  const describe = (i: number) => `${day(dates[i])}: ${values[i] === undefined ? 'not logged' : formatValue(tracker, values[i])}`

  return (
    <figure className="days-chart">
      <p className="small muted-2 chart-readout" aria-live="polite">{picked === null ? 'Last 14 days. Tap a day for its value.' : describe(picked)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${tracker.name}, last 14 days`} onPointerLeave={() => setPicked(null)}>
        {tracker.kind !== 'check' && (
          <text className="tick-label" x={0} y={TOP - 4}>{compact(top)}{tracker.unit ? ` ${tracker.unit}` : ''}</text>
        )}
        <line className="baseline" x1={0} x2={W} y1={TOP + PLOT_H} y2={TOP + PLOT_H} />
        {goal !== null && goal > 0 && goal <= top && (
          <g className="goal">
            <line x1={0} x2={W} y1={y(goal)} y2={y(goal)} />
            <text x={W} y={y(goal) - 4} textAnchor="end">goal {compact(goal)}</text>
          </g>
        )}
        {dates.map((d, i) => {
          const v = values[i]
          const x = i * SLOT + (SLOT - COL) / 2
          const isToday = d === today
          return (
            <g
              key={d}
              className={`day ${picked === i ? 'picked' : ''}`}
              tabIndex={0}
              aria-label={describe(i)}
              onPointerEnter={() => setPicked(i)}
              onClick={() => setPicked(i)}
              onFocus={() => setPicked(i)}
              onBlur={() => setPicked(null)}
            >
              {/* The hit area is the whole day's band, not just the column. */}
              <rect className="hit" x={i * SLOT} y={0} width={SLOT} height={H} />
              {v !== undefined && v > 0 && <path className="col" d={column(x, y(v), TOP + PLOT_H)} />}
              {v === 0 && <line className="zero" x1={x} x2={x + COL} y1={TOP + PLOT_H - 1} y2={TOP + PLOT_H - 1} />}
              <text className={`day-label ${isToday ? 'today' : ''}`} x={i * SLOT + SLOT / 2} y={H - 5} textAnchor="middle">{SHORT[new Date(`${d}T00:00:00Z`).getUTCDay()]}</text>
            </g>
          )
        })}
      </svg>
      <details className="chart-table">
        <summary>Show as a table</summary>
        <table>
          <thead><tr><th scope="col">Day</th><th scope="col">{tracker.name}</th></tr></thead>
          <tbody>
            {[...dates].reverse().map((d) => (
              <tr key={d}><td>{day(d)}</td><td>{series[d] === undefined ? 'not logged' : formatValue(tracker, series[d])}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
