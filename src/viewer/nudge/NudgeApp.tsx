import { useEffect, useState, type FormEvent } from 'react'
import { catalog } from '../../content/catalog.ts'
import { insights } from '../../domain/nudge/insights.ts'
import { customId, formatValue, mondayOf, PRESETS, progressToward, trackerStreak, type Target, type Tracker, type TrackerKind } from '../../domain/nudge/trackers.ts'
import { addDays } from '../../domain/streak.ts'
import { accountConfig } from '../../lib/accountConfig.ts'
import { isSignedIn, useAccountStatus } from '../accountStatus.ts'
import { timeZone, todayDate } from '../actions.ts'
import { classNudges } from '../classNudges.ts'
import { href, type NudgeRoute } from '../router.ts'
import { useStore } from '../store.ts'
import { partOfDay } from '../today.ts'
import { Icon } from '../ui.tsx'
import { DaysChart } from './DaysChart.tsx'
import { bump, clearValue, logValue, move, removeTracker, saveTracker, shownTrackers, updateNudge, useNudge, type NudgeState } from './nudgeStore.ts'

/*
 * Nudge: its own app (own home, own navigation) on the school's code and account. It tells you
 * what the school is waiting for and keeps the life trackers you chose. Plan: docs/nudge-plan.md.
 */

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const KIND_LABEL: Record<TrackerKind, string> = {
  check: 'Yes or no (did it today?)',
  count: 'A count you tap up (cups, pages)',
  number: 'A number with a unit (kg, kcal, minutes)',
  scale: 'A 1 to 5 rating (mood, energy)',
  duration: 'Hours (sleep, screen time)',
}

// ─── Shell ─────────────────────────────────────────────────────────────────

function NudgeNav({ route }: { route: NudgeRoute }) {
  const account = useAccountStatus()
  const links = [
    { to: href.nudge(), on: route.page === 'nudge', icon: 'today' as const, label: 'Today' },
    { to: href.nudgeTrackers(), on: route.page === 'nudge-trackers' || route.page === 'nudge-tracker', icon: 'sliders' as const, label: 'Trackers' },
    { to: href.nudgeStats(), on: route.page === 'nudge-stats', icon: 'chart' as const, label: 'Stats' },
  ]
  return (
    <>
      <nav className="sidebar" aria-label="Nudge">
        <a className="brand nudge-brand" href={href.nudge()}><span className="brand-mark">N</span>Nudge</a>
        {links.map((l) => (
          <a key={l.to} className={`side-link ${l.on ? 'on' : ''}`} href={l.to} aria-current={l.on ? 'page' : undefined}><Icon name={l.icon} />{l.label}</a>
        ))}
        <a className="side-link" href={href.home()}><Icon name="course" />Back to the school</a>
        <p className="side-foot">
          {isSignedIn(account)
            ? <>Signed in as {account.email}.<br />{account.state === 'offline' || account.state === 'error' ? 'Not saved yet: will retry.' : 'Your trackers are saved to your account.'}</>
            : <>Your trackers are saved in this browser only.{accountConfig && <a className="side-account" href={href.account()}>Sign in to keep them</a>}</>}
        </p>
      </nav>
      <nav className="tabbar" aria-label="Nudge">
        {links.map((l) => (
          <a key={l.to} className={l.on ? 'on' : ''} href={l.to} aria-current={l.on ? 'page' : undefined}><Icon name={l.icon} size={22} />{l.label}</a>
        ))}
        <a href={href.home()}><Icon name="course" size={22} />School</a>
      </nav>
    </>
  )
}

export function NudgeApp({ route }: { route: NudgeRoute }) {
  let page
  if (route.page === 'nudge-trackers') page = <TrackersPage />
  else if (route.page === 'nudge-tracker') page = <TrackerEditor key={route.id} id={route.id} />
  else if (route.page === 'nudge-stats') page = <StatsPage />
  else page = <NudgeToday />
  return (
    <div className="shell nudge">
      <NudgeNav route={route} />
      <main className="content">{page}</main>
    </div>
  )
}

// ─── Today ─────────────────────────────────────────────────────────────────

function NudgeToday() {
  const school = useStore()
  const n = useNudge()
  const today = todayDate()
  const [date, setDate] = useState(today)
  const now = new Date()
  const nudges = classNudges(catalog, school, today, now, timeZone()).filter((x) => !n.dismissed[x.key])
  const trackers = shownTrackers(n)
  // Today's insight: one at a time, and not one shown on another day this week (the 7-day cooldown).
  const shownBefore = Object.fromEntries(Object.entries(n.shownInsights).filter(([, d]) => d !== today))
  const insight = insights(trackers, n.entries, today, shownBefore)[0]
  useEffect(() => {
    if (insight && n.shownInsights[insight.key] !== today) updateNudge((s) => ({ ...s, shownInsights: { ...s.shownInsights, [insight.key]: today } }))
  }, [insight, n.shownInsights, today])

  return (
    <div className="page nudge-today">
      <header className="page-head">
        <p className="muted-2">{WEEKDAYS[now.getDay()]} {partOfDay(now.getHours())}</p>
        <h1>{nudges.length === 0 ? 'Nothing is waiting' : nudges.length === 1 ? '1 thing needs you' : `${nudges.length} things need you`}</h1>
      </header>

      {nudges.length > 0 && (
        <section className="nudge-list" aria-label="From the school">
          {nudges.map((x) => (
            <div key={x.key} className={`class-nudge u${x.urgency}`}>
              <a href={x.link}>{x.text}</a>
              <button type="button" className="icon-btn" aria-label={`Dismiss: ${x.text}`} onClick={() => updateNudge((s) => ({ ...s, dismissed: { ...s.dismissed, [x.key]: true } }))}><Icon name="close" size={18} /></button>
            </div>
          ))}
        </section>
      )}

      {!n.setUp && (
        <section className="notice">
          <strong>Pick what Nudge keeps track of</strong>
          <span>Six trackers are switched on to start with. Switch them on or off, change the goals, or make your own.</span>
          <a className="btn primary" href={href.nudgeTrackers()}>Choose my trackers</a>
        </section>
      )}

      {insight && (
        <section className="insight-card" aria-label="Something Nudge noticed">
          <Icon name="heart" />
          <p>{insight.text} <a href={href.nudgeStats()}>See your stats</a></p>
        </section>
      )}

      <div className="split split-wrap">
        <h2>Your trackers</h2>
        <div className="day-switch" role="group" aria-label="Which day you're logging">
          <button type="button" className={`chip ${date === today ? 'on' : ''}`} aria-pressed={date === today} onClick={() => setDate(today)}>Today</button>
          <button type="button" className={`chip ${date !== today ? 'on' : ''}`} aria-pressed={date !== today} onClick={() => setDate(addDays(today, -1))}>Yesterday</button>
        </div>
      </div>
      {trackers.length === 0
        ? <p className="muted-2">No trackers are switched on. <a href={href.nudgeTrackers()}>Choose some</a>.</p>
        : <div className="tracker-grid">{trackers.map((t) => <TrackerCard key={t.id} tracker={t} state={n} date={date} today={today} />)}</div>}
    </div>
  )
}

function goalLine(t: Tracker, state: NudgeState, date: string): { text: string; met: boolean } | null {
  const series = state.entries[t.id] ?? {}
  const p = progressToward(t, series, date)
  const when = t.target?.per === 'week' ? ' this week' : ''
  if (p.kind === 'no-goal') return null
  // Nothing logged isn't "within" an at-most goal (0 kcal is under 2,100, but it isn't a day you met).
  const logged = t.target!.per === 'day' ? date in series : Array.from({ length: 7 }, (_, i) => addDays(mondayOf(date), i)).some((d) => d in series)
  if (t.target!.direction === 'atMost' && !logged) return { text: `Nothing logged${when || ' yet'}`, met: false }
  if (p.kind === 'met') return { text: t.target!.direction === 'atMost' ? `Within your goal${when}` : `Goal met${when}`, met: true }
  if (p.kind === 'over') return { text: `${formatValue(t, p.by)} over your goal${when}`, met: false }
  return { text: t.kind === 'check' && t.target!.per === 'day' ? 'Not done yet' : `${formatValue(t, p.remaining)} to go${when}`, met: false }
}

function TrackerCard({ tracker: t, state, date, today }: { tracker: Tracker; state: NudgeState; date: string; today: string }) {
  const series = state.entries[t.id] ?? {}
  const value = series[date]
  const goal = goalLine(t, state, date)
  const streak = trackerStreak(t, series, today)
  const log = (v: number) => updateNudge((s) => logValue(s, t.id, date, v))
  return (
    <section className="tracker-card" aria-label={t.name}>
      <div className="split">
        <h3>{t.name}</h3>
        {streak && streak.current > 0 && <span className="status ok">{inARow(streak.current, streak.unit)}</span>}
      </div>
      <p className="tracker-value num">{formatValue(t, value)}</p>
      {goal && <p className={`small ${goal.met ? 'goal-met' : 'muted-2'}`}>{goal.text}</p>}
      <div className="tracker-controls">
        {t.kind === 'check' && (
          <button type="button" className={value ? 'primary' : ''} aria-pressed={!!value} onClick={() => (value ? updateNudge((s) => clearValue(s, t.id, date)) : log(1))}>
            {value ? <><Icon name="check" size={18} />Done</> : 'Mark as done'}
          </button>
        )}
        {t.kind === 'count' && (
          <>
            <button type="button" className="icon-btn" aria-label={`One less ${t.unit || t.name}`} disabled={!value} onClick={() => updateNudge((s) => bump(s, t.id, date, -1))}><Icon name="minus" /></button>
            <button type="button" className="icon-btn primary" aria-label={`One more ${t.unit || t.name}`} onClick={() => updateNudge((s) => bump(s, t.id, date, 1))}><Icon name="plus" /></button>
            <NumberLog key={`${date}:${value}`} tracker={t} value={value} onLog={log} label="Set" />
          </>
        )}
        {(t.kind === 'number' || t.kind === 'duration') && <NumberLog key={`${date}:${value}`} tracker={t} value={value} onLog={log} label="Save" />}
        {t.kind === 'scale' && (
          <div className="scale" role="group" aria-label={`${t.name}, 1 to 5`}>
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} type="button" className={value === v ? 'primary' : ''} aria-pressed={value === v} onClick={() => (value === v ? updateNudge((s) => clearValue(s, t.id, date)) : log(v))}>{v}</button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/** Type a value and save it. Kept as text while typing so "7." or an empty box isn't fought over;
 *  the card remounts it (its key) when the saved value or the day changes. */
function NumberLog({ tracker: t, value, onLog, label }: { tracker: Tracker; value: number | undefined; onLog: (v: number) => void; label: string }) {
  const [text, setText] = useState(value === undefined ? '' : String(value))
  const [error, setError] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = Number(text.replace(',', '.'))
    if (!text.trim() || !Number.isFinite(v)) return setError('Type a number.')
    if (t.kind === 'duration' && (v < 0 || v > 24)) return setError('Between 0 and 24 hours.')
    if (t.kind === 'count' && (v < 0 || !Number.isInteger(v))) return setError('A whole number, 0 or more.')
    setError('')
    onLog(v)
  }
  return (
    <form className="number-log" onSubmit={submit}>
      <label className="sr-only" htmlFor={`log-${t.id}`}>{t.name}{t.unit ? ` (${t.unit})` : ''}</label>
      <input id={`log-${t.id}`} inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} placeholder={t.unit || 'value'} aria-invalid={!!error} aria-describedby={error ? `err-${t.id}` : undefined} />
      <button type="submit">{label}</button>
      {error && <span id={`err-${t.id}`} className="pen small">{error}</span>}
    </form>
  )
}

// ─── Trackers: choose, order, edit ──────────────────────────────────────────

function TrackersPage() {
  const n = useNudge()
  const all = [...n.trackers].sort((a, b) => Number(b.enabled) - Number(a.enabled) || a.order - b.order)
  const shown = shownTrackers(n)
  const toggle = (t: Tracker) => updateNudge((s) => ({ ...s, setUp: true, trackers: s.trackers.map((x) => (x.id === t.id ? { ...x, enabled: !x.enabled, order: x.enabled ? x.order : Math.max(-1, ...s.trackers.map((y) => y.order)) + 1 } : x)) }))
  return (
    <div className="page">
      <header className="page-head">
        <h1>Your trackers</h1>
        <p className="muted-2">Switch on what you want Nudge to keep for you, put them in the order you like, and set your own goals.</p>
      </header>
      <ul className="tracker-list">
        {all.map((t) => {
          const i = shown.findIndex((x) => x.id === t.id)
          return (
            <li key={t.id} className={t.enabled ? '' : 'off'}>
              <label className="check-field">
                <input type="checkbox" checked={t.enabled} onChange={() => toggle(t)} />
                <span><strong>{t.name}</strong><small className="muted-2">{t.target ? describeGoal(t) : 'No goal: just log it'}{t.reminderHour !== null ? ` · reminder ${hour(t.reminderHour)}` : ''}</small></span>
              </label>
              <span className="row-actions">
                {t.enabled && <>
                  <button type="button" className="icon-btn" aria-label={`Move ${t.name} up`} disabled={i === 0} onClick={() => updateNudge((s) => move(s, t.id, -1))}><Icon name="up" size={18} /></button>
                  <button type="button" className="icon-btn" aria-label={`Move ${t.name} down`} disabled={i === shown.length - 1} onClick={() => updateNudge((s) => move(s, t.id, 1))}><Icon name="down" size={18} /></button>
                </>}
                <a className="chip" href={href.nudgeTracker(t.id)} aria-label={`Edit ${t.name}`}>Edit</a>
              </span>
            </li>
          )
        })}
      </ul>
      <div className="split split-wrap">
        <a className="btn ghost" href={href.nudgeTracker('new')}><Icon name="plus" size={18} />Make your own tracker</a>
        <a className="btn primary" href={href.nudge()} onClick={() => updateNudge((s) => ({ ...s, setUp: true }))}>Done</a>
      </div>
    </div>
  )
}

const hour = (h: number) => `${String(h).padStart(2, '0')}:00`
const inARow = (n: number, unit: 'days' | 'weeks') => `${n} ${n === 1 ? unit.slice(0, -1) : unit} in a row`
function describeGoal(t: Pick<Tracker, 'kind' | 'unit' | 'target'>): string {
  const g = t.target!
  if (t.kind === 'check') return g.per === 'day' ? 'Goal: every day' : `Goal: ${g.value} day${g.value === 1 ? '' : 's'} a week`
  return `Goal: ${g.direction === 'atLeast' ? 'at least' : 'at most'} ${formatValue(t, g.value)} a ${g.per}`
}

type Draft = { name: string; kind: TrackerKind; unit: string; goal: 'none' | Target['direction']; value: string; per: Target['per']; reminder: string }

function TrackerEditor({ id }: { id: string }) {
  const n = useNudge()
  const existing = n.trackers.find((t) => t.id === id)
  const isNew = id === 'new' || !existing
  const [d, setD] = useState<Draft>(() => existing
    ? { name: existing.name, kind: existing.kind, unit: existing.unit, goal: existing.target?.direction ?? 'none', value: existing.target ? String(existing.target.value) : '', per: existing.target?.per ?? 'day', reminder: existing.reminderHour === null ? '' : String(existing.reminderHour) }
    : { name: '', kind: 'count', unit: '', goal: 'atLeast', value: '', per: 'day', reminder: '' })
  const [problems, setProblems] = useState<string[]>([])
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const noUnit = d.kind === 'check' || d.kind === 'scale'

  const save = (e: FormEvent) => {
    e.preventDefault()
    const value = d.kind === 'check' && d.per === 'day' ? 1 : Number(d.value.replace(',', '.'))
    if (d.goal !== 'none' && !(d.kind === 'check' && d.per === 'day') && (!d.value.trim() || !Number.isFinite(value))) return setProblems(['Type a number for the goal.'])
    const tracker: Tracker = {
      id: existing?.id ?? customId(),
      name: d.name.trim(),
      kind: existing?.preset ? existing.kind : d.kind,
      unit: noUnit ? '' : d.unit.trim(),
      target: d.goal === 'none' ? null : { direction: d.kind === 'check' ? 'atLeast' : d.goal, value, per: d.kind === 'scale' ? 'day' : d.per },
      preset: existing?.preset ?? null,
      order: existing?.order ?? 0,
      enabled: existing?.enabled ?? true,
      reminderHour: d.reminder === '' ? null : Number(d.reminder),
    }
    const result = saveTracker(n, tracker)
    if (Array.isArray(result)) return setProblems(result)
    updateNudge(() => ({ ...result, setUp: true }))
    window.location.hash = href.nudgeTrackers()
  }

  const remove = () => {
    if (!existing) return
    if (!existing.preset && !window.confirm(`Delete "${existing.name}" and everything you've logged for it?`)) return
    updateNudge((s) => removeTracker(s, existing.id))
    window.location.hash = href.nudgeTrackers()
  }

  return (
    <div className="page">
      <a className="back" href={href.nudgeTrackers()}><Icon name="back" size={18} />Your trackers</a>
      <h1>{isNew ? 'Make your own tracker' : `Edit ${existing.name}`}</h1>
      <form className="account-form tracker-form" onSubmit={save} noValidate>
        <label className="field">Name
          <input value={d.name} maxLength={40} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Pages read, Prayer, No sugar" />
        </label>
        {existing?.preset ? (
          <p className="small muted-2">{KIND_LABEL[existing.kind]}. Based on Nudge's “{PRESETS[existing.preset].name}” tracker.</p>
        ) : (
          <label className="field">What you log
            <select value={d.kind} onChange={(e) => set('kind', e.target.value as TrackerKind)}>
              {(Object.keys(KIND_LABEL) as TrackerKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
            </select>
          </label>
        )}
        {!noUnit && (
          <label className="field">Unit
            <input value={d.unit} maxLength={12} onChange={(e) => set('unit', e.target.value)} placeholder="cups, kg, min…" />
          </label>
        )}
        <fieldset className="goal-fields">
          <legend>Goal</legend>
          {d.kind === 'check' ? (
            <select aria-label="Goal" value={d.goal === 'none' ? 'none' : d.per} onChange={(e) => (e.target.value === 'none' ? set('goal', 'none') : setD((x) => ({ ...x, goal: 'atLeast', per: e.target.value as Target['per'], value: e.target.value === 'day' ? '1' : x.value || '5' })))}>
              <option value="none">No goal</option>
              <option value="day">Every day</option>
              <option value="week">A number of days each week</option>
            </select>
          ) : (
            <select aria-label="Goal" value={d.goal} onChange={(e) => set('goal', e.target.value as Draft['goal'])}>
              <option value="none">No goal</option>
              <option value="atLeast">At least</option>
              <option value="atMost">At most</option>
            </select>
          )}
          {d.goal !== 'none' && !(d.kind === 'check' && d.per === 'day') && (
            <span className="goal-row">
              <input aria-label="Goal value" inputMode="decimal" value={d.value} onChange={(e) => set('value', e.target.value)} placeholder="8" />
              {d.kind === 'check' ? <span>days a week</span>
                : d.kind === 'scale' ? <span>out of 5, each day</span>
                : <>
                    {d.unit && <span>{d.unit}</span>}
                    <select aria-label="Per" value={d.per} onChange={(e) => set('per', e.target.value as Target['per'])}>
                      <option value="day">a day</option>
                      <option value="week">a week</option>
                    </select>
                  </>}
            </span>
          )}
        </fieldset>
        <label className="field">Reminder
          <select value={d.reminder} onChange={(e) => set('reminder', e.target.value)}>
            <option value="">No reminder</option>
            {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{hour(h)}</option>)}
          </select>
          <small className="muted-2">Reminder emails start once Nudge syncs to your account and the school's email is switched on.</small>
        </label>
        {problems.length > 0 && <div className="banner warn" role="alert">{problems.map((p) => <p key={p}>{p}</p>)}</div>}
        <div className="split split-wrap">
          <button type="submit" className="primary">Save</button>
          {existing && <button type="button" className="danger-btn" onClick={remove}>{existing.preset ? 'Switch it off' : 'Delete this tracker'}</button>}
        </div>
      </form>
    </div>
  )
}

// ─── Stats ─────────────────────────────────────────────────────────────────

function StatsPage() {
  const n = useNudge()
  const today = todayDate()
  const trackers = shownTrackers(n)
  const found = insights(trackers, n.entries, today)
  return (
    <div className="page">
      <header className="page-head">
        <h1>Your stats</h1>
        <p className="muted-2">The last two weeks, and any pattern Nudge is sure enough to mention. It needs a week or two of logging before it says anything, so it never mistakes a one-off for a habit.</p>
      </header>
      <section className="stack" aria-label="What Nudge noticed">
        <h2>Noticed</h2>
        {found.length
          ? found.map((i) => <p key={i.key} className="insight-card"><Icon name="heart" /><span>{i.text}</span></p>)
          : <p className="muted-2">Nothing yet. Patterns need at least a week of logging (two weeks for two trackers moving together).</p>}
      </section>
      {trackers.map((t) => {
        const series = n.entries[t.id] ?? {}
        const streak = trackerStreak(t, series, today)
        const goal = goalLine(t, n, today)
        return (
          <section key={t.id} className="stats-card" aria-label={t.name}>
            <div className="split split-wrap">
              <h2>{t.name}</h2>
              {streak && <span className="small muted-2">{inARow(streak.current, streak.unit)} · best {streak.best}</span>}
            </div>
            {goal && <p className={`small ${goal.met ? 'goal-met' : 'muted-2'}`}>{t.target && describeGoal(t)}. {goal.text}.</p>}
            <DaysChart tracker={t} series={series} today={today} />
          </section>
        )
      })}
    </div>
  )
}
