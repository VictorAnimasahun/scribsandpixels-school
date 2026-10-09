import { useEffect, useRef, useState } from 'react'
import { catalog, type CatalogCourse } from '../content/catalog.ts'
import type { Day, Week } from '../content/types.ts'
import { streak, weekDots, type Streak } from '../domain/streak.ts'
import { href } from './router.ts'
import { useStore } from './store.ts'
import { activeCourseOf, blockKey, coursePace, formatHours, ledger, partOfDay, phasesOf, shortTitle, studyDaysDone, todayPosition, totalWeeks } from './today.ts'
import { setBlockDone, todayDate } from './actions.ts'
import { Icon, LedgerStrip, MarginTick } from './ui.tsx'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function CourseSwitcher({ course }: { course: CatalogCourse }) {
  return (
    <details className="switcher">
      <summary>{shortTitle(course.title)}<Icon name="down" size={16} /></summary>
      <div className="switcher-menu">
        {catalog.map((c) => (
          <a key={c.slug} href={href.course(c.slug)} aria-current={c.slug === course.slug ? 'true' : undefined}>{shortTitle(c.title)}</a>
        ))}
      </div>
    </details>
  )
}

function Session({ course, week, day }: { course: CatalogCourse; week: Week; day: Day }) {
  const { checked } = useStore()
  const isDone = (key: string) => !!checked[blockKey(course.slug, week.number, day.number, key)]
  const done = day.blocks.filter((b) => isDone(b.key)).length
  const current = day.blocks.find((b) => !isDone(b.key))
  return (
    <section className="ruled session" aria-label="Today's session">
      <div className="ruled-row head">
        <span className="margin" />
        <strong>Today's session</strong>
        <span className="aside num">{done} of {day.blocks.length} done</span>
      </div>
      {day.blocks.map((b) => {
        const on = isDone(b.key)
        const here = b === current
        return (
          <div key={b.key} className={`ruled-row ${on ? 'done' : ''} ${here ? 'here' : ''}`}>
            <span className="margin"><MarginTick done={on} current={here} label={b.title} onToggle={() => setBlockDone(course.slug, week.number, day.number, b.key, !on)} /></span>
            <span className="row-text">
              <span className="row-title">{b.title}</span>
              {here && <span className="row-note">You're here</span>}
            </span>
            {b.minutes > 0 && <span className="aside">{b.minutes} min</span>}
          </div>
        )
      })}
      <div className="session-foot">
        <a className="btn primary" href={href.day(course.slug, week.number, day.number)}>
          {done === 0 ? "Start today's session" : current ? `Continue with ${current.title.toLowerCase()}` : 'Open the day'}
        </a>
      </div>
    </section>
  )
}

function StreakCard({ value, dates, today }: { value: Streak; dates: Set<string>; today: string }) {
  const dots = weekDots(dates, today)
  const studiedToday = dates.has(today)
  const sunday = dots.find((d) => d.isToday)?.isRestDay
  return (
    <section className="streak" aria-label="Streak">
      <div className="streak-head">
        <span className="big-num">{value.current}</span>
        <strong>study day{value.current === 1 ? '' : 's'} in a row</strong>
      </div>
      <div className="week-squares">
        {dots.map((d) => (
          <span key={d.date} className={`wsq ${d.studied && !d.isRestDay ? 'studied' : ''} ${d.isToday ? 'today' : ''} ${d.isRestDay ? 'rest' : ''}`}>
            <span className="sq" />
            {d.isRestDay ? 'Rest' : WEEKDAYS[(dots.indexOf(d) + 1) % 7].slice(0, 3)}
          </span>
        ))}
      </div>
      <p className="small muted-2">
        {sunday ? 'Sunday is for your weekly review. It never breaks the chain.'
          : studiedToday ? `You've studied today.${value.best > value.current ? ` Your best is ${value.best}.` : ''}`
            : `Tick a block today to make it ${value.current + 1}. Sunday is rest and never breaks the chain.`}
      </p>
    </section>
  )
}

function YearCard({ course }: { course: CatalogCourse }) {
  const { checked } = useStore()
  const weeks = ledger(course, checked)
  const position = todayPosition(course, checked)
  const weekNo = position.kind === 'day' ? position.week.number : undefined
  const phase = weekNo ? phasesOf(course).find((p) => weekNo >= p.firstWeek && weekNo <= p.lastWeek) : undefined
  const done = studyDaysDone(weeks)
  return (
    <section className="year-card" aria-label="Your year">
      <div className="split">
        <strong>{totalWeeks(course) > 30 ? 'Your year' : 'Your course'}</strong>
        <a href={href.course(course.slug)}>{weekNo ? `Week ${weekNo} of ${totalWeeks(course)}` : 'See every week'}</a>
      </div>
      <LedgerStrip weeks={weeks} label={`${done} of ${weeks.length * 6} study days done`} />
      <p className="small muted-2">
        One square per study day, grouped by phase.
        {phase ? ` You're in ${phase.title}. Milestone: ${phase.milestone}` : ''}
      </p>
    </section>
  )
}

/** One line from the calendar: behind, on track, or an invitation to pick a start Monday. */
function PaceLine({ course }: { course: CatalogCourse }) {
  const state = useStore()
  const p = coursePace(course, state, todayDate())
  if (!p) return <p className="pace small"><a href={href.course(course.slug)}>Pick your start Monday</a> to get a lesson for every date.</p>
  if (p.behind.length) return <p className="pace small"><span className="status behind">{p.behind.length} day{p.behind.length === 1 ? '' : 's'} behind</span> Catch up in order; this is the next one.</p>
  if (p.scheduled.kind === 'not-started') return null
  return <p className="pace small"><span className="status ok">On track</span></p>
}

// ─── Need a nudge? ───────────────────────────────────────────────────────

function nudgeNote(value: Streak, daysDone: number): string {
  if (daysDone === 0) return 'The first evening is the hardest one. Open the lesson and give it ten minutes. You can stop after that.'
  if (value.current >= 3) return `You've shown up ${value.current} study days in a row. Tired after a full workday is normal, and it hasn't stopped you yet. Give tonight ten minutes and decide after that.`
  return `You've already finished ${daysDone} study day${daysDone === 1 ? '' : 's'} of this course, each one after a workday. Open the lesson and give it ten minutes. You can stop after that.`
}

function NudgeSheet({ onClose, shortHref, lessonHref, note }: { onClose: () => void; shortHref: string; lessonHref: string; note: string }) {
  const [showNote, setShowNote] = useState(false)
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    first.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="nudge-title" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-top">
          <div>
            <h2 id="nudge-title">Not feeling it today?</h2>
            <p className="small muted-2">Pick what helps. All three keep you moving.</p>
          </div>
          <button ref={first} type="button" className="icon-btn" aria-label="Close" onClick={onClose}><Icon name="close" /></button>
        </div>
        <button type="button" className="nudge-opt" disabled aria-describedby="remind-note">
          <span className="nudge-ico"><Icon name="clock" /></span>
          <span><strong>Remind me in an hour</strong><small id="remind-note">One email with a link back to today's lesson. Available once accounts and email are switched on.</small></span>
        </button>
        <a className="nudge-opt" href={shortHref}>
          <span className="nudge-ico"><Icon name="timer" /></span>
          <span><strong>Do the 10-minute version</strong><small>Just the review and the mini-task. The rest of the day stays open for later.</small></span>
        </a>
        {showNote ? (
          <div className="nudge-opt open">
            <span className="nudge-head"><span className="nudge-ico lime"><Icon name="note" /></span><strong>A note for today</strong></span>
            <p className="note-text">{note}</p>
            <a className="btn primary" href={lessonHref}>Open the lesson</a>
          </div>
        ) : (
          <button type="button" className="nudge-opt" onClick={() => setShowNote(true)}>
            <span className="nudge-ico"><Icon name="note" /></span>
            <span><strong>Read a note for today</strong><small>A few words from the school, based on how far you've come.</small></span>
          </button>
        )}
      </section>
    </div>
  )
}

// ─── Today ───────────────────────────────────────────────────────────────

export function TodayPage() {
  const state = useStore()
  const course = activeCourseOf(state)
  const position = todayPosition(course, state.checked)
  const today = todayDate()
  const dates = new Set(Object.keys(state.studied))
  const value = streak(dates, today)
  const [nudge, setNudge] = useState(false)
  const now = new Date()
  const greeting = `${WEEKDAYS[now.getDay()]} ${partOfDay(now.getHours())}`
  const hasQuizzes = position.kind === 'day' && course.quizWeeks.has(position.week.number)

  return (
    <div className="today">
      <div className="today-top">
        <CourseSwitcher course={course} />
      </div>

      <div className="today-grid">
        <div className="today-main">
          {position.kind === 'day' ? (
            <>
              <header className="today-head">
                <p className="muted-2">{greeting}</p>
                <h1>{position.day.topic}</h1>
                <div className="split split-wrap">
                  <p className="small muted-2">Week {position.week.number}, Day {position.day.number} of {position.week.days.length}.{position.day.hours ? ` About ${formatHours(position.day.hours)}.` : ''}</p>
                  <button type="button" className="chip" onClick={() => setNudge(true)}><Icon name="bell" size={16} />Need a nudge?</button>
                </div>
                <PaceLine course={course} />
              </header>
              <Session course={course} week={position.week} day={position.day} />
              {hasQuizzes && (
                <div className="quiz-pair">
                  <a className="quiz-tile" href={href.day(course.slug, position.week.number, position.day.number) }>
                    <Icon name="bolt" /><strong>Rapid-fire</strong><span>Timed questions on today</span>
                  </a>
                  <a className="quiz-tile" href={href.day(course.slug, position.week.number, position.day.number)}>
                    <Icon name="puzzle" /><strong>Brain teaser</strong><span>Untimed, a little harder</span>
                  </a>
                </div>
              )}
            </>
          ) : (
            <header className="today-head">
              <p className="muted-2">{greeting}</p>
              <h1>{position.kind === 'finished' ? 'Every written day is done' : 'This course has no lessons yet'}</h1>
              <p className="muted-2">{position.kind === 'finished'
                ? 'The next weeks are being written. Review a week you found hard while you wait.'
                : 'Pick another course to study today.'}</p>
              <a className="btn primary" href={href.course(course.slug)}>See the course</a>
            </header>
          )}
        </div>

        <aside className="today-side">
          <StreakCard value={value} dates={dates} today={today} />
          <YearCard course={course} />
        </aside>
      </div>

      {nudge && position.kind === 'day' && (
        <NudgeSheet
          onClose={() => setNudge(false)}
          shortHref={href.shortDay(course.slug, position.week.number, position.day.number)}
          lessonHref={href.day(course.slug, position.week.number, position.day.number)}
          note={nudgeNote(value, studyDaysDone(ledger(course, state.checked)))}
        />
      )}
    </div>
  )
}
