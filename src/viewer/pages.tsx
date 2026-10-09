import { useEffect, useRef, useState } from 'react'
import type { CatalogCourse } from '../content/catalog.ts'
import type { Block } from '../content/types.ts'
import { sandboxes } from '../content/sandboxes.ts'
import type { Question } from '../content/quizzes.ts'
import { courseStartMonday } from '../domain/progress.ts'
import { drawWeekQuiz, gateDaysForWeek, gateStatus, seededRandom, WEEK_QUIZ_RULES } from '../domain/quizGate.ts'
import { addDays, weekday } from '../domain/streak.ts'
import { QuizPlayer } from './QuizPlayer.tsx'
import { href } from './router.ts'
import { dayKey, update, useStore } from './store.ts'
import { blockKey, coursePace, doneBlocks, formatHours, isDayDone, ledger, phasesOf, shortTitle, studyDaysDone, todayPosition, totalWeeks } from './today.ts'
import { resourceIcon, setBlockDone, todayDate } from './actions.ts'
import { Icon, Markdown, MarginTick } from './ui.tsx'
import { formatLeft, useNow } from './useNow.ts'
import { useQuizWeek } from './useQuizWeek.ts'

export function NotFound({ what, course }: { what: string; course: CatalogCourse }) {
  return (
    <div className="page">
      <a className="back" href={href.course(course.slug)}><Icon name="back" size={18} />{shortTitle(course.title)}</a>
      <h1>{what} isn't here</h1>
      <p className="muted-2">It may not be written yet, or the link is wrong.</p>
      <a className="btn primary" href={href.course(course.slug)}>See the weeks of {shortTitle(course.title)}</a>
    </div>
  )
}

// ─── Schedule: calendar pacing ───────────────────────────────────────────

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const prettyDate = (iso: string) => `${WEEKDAYS[weekday(iso)]} ${Number(iso.slice(8, 10))} ${new Date(`${iso}T00:00:00Z`).toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })}`

function SchedulePanel({ course }: { course: CatalogCourse }) {
  const state = useStore()
  const [confirmReplan, setConfirmReplan] = useState(false)
  const started = state.startedOn[course.slug]
  const setStart = (date: string) => update((s) => ({ ...s, startedOn: { ...s.startedOn, [course.slug]: date } }))
  const nextMonday = courseStartMonday(addDays(todayDate(), 1))
  if (!started) {
    return (
      <section className="schedule">
        <h2>Your schedule</h2>
        <p className="small muted-2">Each date has its lesson: Monday is Day 1, Saturday is Day 6, Sunday is rest and review. Missed days stay owed until you catch up.</p>
        <button type="button" className="btn primary" onClick={() => setStart(nextMonday)}>Start on {prettyDate(nextMonday)}</button>
      </section>
    )
  }
  const p = coursePace(course, state, todayDate())!
  const s = p.scheduled
  const first = p.behind[0]
  const onTrack = p.behind.length === 0 && p.quizzesOverdue.length === 0 && s.kind !== 'not-started'
  return (
    <section className="schedule">
      <div className="split">
        <h2>Your schedule</h2>
        {onTrack && <span className="status ok">On track</span>}
        {p.behind.length > 0 && <span className="status behind">{p.behind.length} day{p.behind.length === 1 ? '' : 's'} behind</span>}
      </div>
      <p>
        {s.kind === 'not-started' && <>Starts on <b>{prettyDate(s.startsOn)}</b>.</>}
        {s.kind === 'day' && <>Today the calendar says <a href={href.day(course.slug, s.week, s.day)}>Week {s.week}, Day {s.day}</a>.</>}
        {s.kind === 'review' && <>Sunday: rest, and the Week {s.week} review.</>}
        {s.kind === 'ended' && <>The scheduled course has ended.</>}
      </p>
      {first && <p>Catch up in order, starting with <a href={href.day(course.slug, first.week, first.day)}>Week {first.week}, Day {first.day}</a>.</p>}
      {p.quizzesOverdue.length > 0 && (
        <p>Week quiz overdue: {p.quizzesOverdue.map((w, i) => <span key={w}>{i ? ', ' : ''}<a href={href.week(course.slug, w)}>Week {w}</a></span>)}</p>
      )}
      <p className="small muted-2">
        Started {prettyDate(courseStartMonday(started))}.{' '}
        {confirmReplan
          ? <>Day 1 moves to {prettyDate(nextMonday)}; ticked days stay ticked. <button type="button" className="link" onClick={() => { setStart(nextMonday); setConfirmReplan(false) }}>Re-plan</button> <button type="button" className="link" onClick={() => setConfirmReplan(false)}>Keep my dates</button></>
          : <button type="button" className="link" onClick={() => setConfirmReplan(true)}>Re-plan from next Monday</button>}
      </p>
    </section>
  )
}

// ─── Course: the year ledger by phase ────────────────────────────────────

export function CoursePage({ course }: { course: CatalogCourse }) {
  const { checked } = useStore()
  const [showOverview, setShowOverview] = useState(false)
  const weeks = ledger(course, checked)
  const position = todayPosition(course, checked)
  const current = position.kind === 'day' ? position.week.number : undefined
  const phases = phasesOf(course)
  const groups = phases.length ? phases : [{ number: 1, title: 'All weeks', firstWeek: 1, lastWeek: totalWeeks(course), milestone: '' }]
  const mains = sandboxes.filter((x) => x.course === course.slug && x.main)

  return (
    <div className="page">
      <header className="page-head">
        <p className="muted-2">{shortTitle(course.title)}</p>
        <h1>{totalWeeks(course) > 30 ? 'Your year' : 'Your course'}</h1>
        <p className="small muted-2 num">{studyDaysDone(weeks)} of {weeks.length * 6} study days.{current ? ` Week ${current} of ${totalWeeks(course)}.` : ''}</p>
      </header>

      <SchedulePanel course={course} />

      <div className="phases">
        {groups.map((p) => {
          const inPhase = weeks.filter((w) => w.number >= p.firstWeek && w.number <= p.lastWeek)
          const here = current !== undefined && current >= p.firstWeek && current <= p.lastWeek
          return (
            <section key={p.number} className={`phase ${here ? 'here' : ''}`}>
              <div className="split">
                <h2>{phases.length ? `Phase ${p.number}: ${p.title}` : p.title}</h2>
                <span className="small muted-2 nowrap">Weeks {p.firstWeek}–{p.lastWeek}</span>
              </div>
              <div className="phase-weeks">
                {inPhase.map((w) => {
                  const written = course.weeks.find((x) => x.number === w.number)
                  const inner = (
                    <>
                      {w.days.map((d, i) => <span key={i} className={`px big ${d}`} />)}
                      <span className="wk-num">{w.number}</span>
                    </>
                  )
                  return written
                    ? <a key={w.number} className={`wk ${w.number === current ? 'cur' : ''}`} href={href.week(course.slug, w.number)} aria-label={`Week ${w.number}: ${written.title}`}>{inner}</a>
                    : <span key={w.number} className="wk unwritten" aria-label={`Week ${w.number}: not written yet`}>{inner}</span>
                })}
              </div>
              {p.milestone && <p className="small"><b>Milestone:</b> {p.milestone}</p>}
            </section>
          )
        })}
      </div>

      {mains.length > 0 && (
        <section className="stack">
          <h2>Sandboxes</h2>
          <div className="tile-grid">
            {mains.map((x) => (
              <a key={x.id} className="tile-link" href={href.sandbox(course.slug, x.id)}>
                <Icon name="code" /><strong>{x.title}</strong><span>{x.description}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="stack">
        <h2>Every week</h2>
        <div className="ruled">
          {course.weeks.map((w) => {
            const daysDone = w.days.filter((d) => isDayDone(checked, course.slug, w.number, d)).length
            return (
              <a key={w.number} className="ruled-row link" href={href.week(course.slug, w.number)}>
                <span className="margin num wk-margin">{w.number}</span>
                <span className="row-text"><span className="row-title">{w.title}</span><span className="row-note">{w.theme}</span></span>
                <span className="aside num">{daysDone}/{w.days.length}</span>
              </a>
            )
          })}
        </div>
      </section>

      {course.overview && (
        <section className="stack">
          <button type="button" className="btn ghost" onClick={() => setShowOverview(!showOverview)}>{showOverview ? 'Hide' : 'Read'} the course overview</button>
          {showOverview && <div className="prose"><Markdown text={course.overview.replace(/^# .+\n/, '')} /></div>}
        </section>
      )}
    </div>
  )
}

// ─── Week quiz: auto-marked, 80% to pass (decided 9 Oct 2026) ─────────────

function WeekQuiz({ course, week }: { course: CatalogCourse; week: number }) {
  const state = useStore()
  const now = useNow(1000)
  const { quiz: bank, failed } = useQuizWeek(course.slug, week)
  const key = `${course.slug}:${week}`
  const record = state.weekQuizzes[key] ?? { triggeredAt: 0, attempts: [], seen: [] }
  const status = gateStatus(record.attempts.map((a) => ({ finishedAt: new Date(a.finishedAt), passed: a.passed })), new Date(now), WEEK_QUIZ_RULES)
  const [attempt, setAttempt] = useState<{ no: number; questions: Question[]; done?: boolean } | null>(null)
  const startedRef = useRef(false)
  const passMark = `${Math.round(WEEK_QUIZ_RULES.passMark * 100)}%`
  if (failed) return <p className="small muted-2">The week quiz couldn't load. Check your connection, then <button type="button" className="link" onClick={() => window.location.reload()}>reload the page</button>.</p>
  if (!bank) return <p className="small muted-2">Loading the week quiz…</p>
  const best = Math.max(0, ...record.attempts.map((a) => a.score))
  const start = () => {
    if (startedRef.current) return // a double tap must not record two attempts
    startedRef.current = true
    const questions = drawWeekQuiz(bank, record.seen, seededRandom(Date.now() % 1_000_000_007))
    // Starting counts, as for the checkpoint: the attempt is saved as a fail straight away and replaced
    // at the end. Closing or reloading mid-quiz can't skip the cooldown or preview the bank for free.
    update((s) => {
      const r = s.weekQuizzes[key] ?? { triggeredAt: Date.now(), attempts: [], seen: [] }
      return { ...s, weekQuizzes: { ...s.weekQuizzes, [key]: { ...r, attempts: [...r.attempts, { finishedAt: Date.now(), passed: false, score: 0 }], seen: [...r.seen.filter((id) => !questions.some((q) => q.id === id)), ...questions.map((q) => q.id)] } } }
    })
    setAttempt({ no: record.attempts.length + 1, questions })
  }
  const finish = (result: { passed: boolean; score: number }) => {
    startedRef.current = false
    setAttempt((a) => (a ? { ...a, done: true } : a))
    update((s) => {
      const r = s.weekQuizzes[key] ?? { triggeredAt: Date.now(), attempts: [], seen: [] }
      const attempts = [...r.attempts]
      attempts[Math.max(0, attempts.length - 1)] = { finishedAt: Date.now(), passed: result.passed, score: result.score }
      return { ...s, weekQuizzes: { ...s.weekQuizzes, [key]: { ...r, attempts } } }
    })
  }
  return (
    <section className="quiz-card">
      <div className="quiz-card-head">
        <Icon name="puzzle" />
        <span className="row-text">
          <strong>Week {week} quiz</strong>
          <span className="row-note">15 questions from this week. {passMark} to pass.{record.attempts.length ? ` Best so far: ${Math.round(best * 100)}%` : ''}</span>
        </span>
        {!attempt && status.kind !== 'passed' && status.kind !== 'cooldown' && (
          <button type="button" className="btn primary small-btn" onClick={start}>{record.attempts.length ? 'Retake' : 'Start'}</button>
        )}
      </div>
      {status.kind === 'passed' && !attempt && <p className="status ok">Passed. Week {week + 1} is open.</p>}
      {attempt ? (
        <>
          <QuizPlayer key={attempt.no} title={`Attempt ${attempt.no}`} questions={attempt.questions} rules={WEEK_QUIZ_RULES} passNote={`Pass mark ${passMark}`} onDone={finish} />
          {!attempt.done
            ? <p className="small muted-2">Leaving or reloading before the end counts as a failed attempt.</p>
            : <button type="button" className="link" onClick={() => setAttempt(null)}>Close the quiz</button>}
        </>
      ) : status.kind === 'cooldown' ? (
        <p className="small">Not passed yet. Review the week, then try again in <b className="num">{formatLeft(status.until.getTime() - now)}</b>, with new questions.</p>
      ) : null}
    </section>
  )
}

// ─── Week ────────────────────────────────────────────────────────────────

export function WeekPage({ course, week }: { course: CatalogCourse; week: number }) {
  const { checked } = useStore()
  const w = course.weeks.find((x) => x.number === week)
  if (!w) return <NotFound what={`Week ${week}`} course={course} />
  return (
    <div className="page">
      <a className="back" href={href.course(course.slug)}><Icon name="back" size={18} />{shortTitle(course.title)}</a>
      <header className="page-head">
        <p className="muted-2">Week {w.number}</p>
        <h1>{w.title}</h1>
        <p>{w.theme}</p>
        {w.bigQuestion && <p className="big-question">{w.bigQuestion.replace(/^\*|\*$/g, '')}</p>}
      </header>

      <section className="stack">
        <h2>Days</h2>
        <div className="ruled">
          {w.days.map((d) => {
            const done = isDayDone(checked, course.slug, week, d)
            return (
              <a key={d.number} className={`ruled-row link ${done ? 'done' : ''}`} href={href.day(course.slug, week, d.number)}>
                <span className="margin">{done ? <span className="pen-tick"><Icon name="check" size={22} /></span> : <span className="num wk-margin">{d.number}</span>}</span>
                <span className="row-text"><span className="row-title">{d.weekday}</span><span className="row-note">{d.topic}</span></span>
                <span className="aside num">{doneBlocks(checked, course.slug, week, d)}/{d.blocks.length}</span>
              </a>
            )
          })}
        </div>
      </section>

      {w.resources.length > 0 && (
        <section className="stack">
          <h2>Resources</h2>
          {w.resources.map((r) => {
            const body = <><span className="res-ico"><Icon name={resourceIcon(r.kind)} size={22} /></span><span><strong>{r.title}</strong>{r.note && <small>{r.note}</small>}</span></>
            return r.url
              ? <a key={r.title} className="res" href={r.url} target="_blank" rel="noreferrer">{body}</a>
              : <div key={r.title} className="res">{body}</div>
          })}
        </section>
      )}

      {course.quizWeeks.has(week) && (
        <section className="stack">
          <h2>Week quiz</h2>
          <WeekQuiz course={course} week={week} />
        </section>
      )}

      {w.quiz.length > 0 && (
        <section className="stack">
          <h2>{course.quizWeeks.has(week) ? 'Review questions' : 'Week quiz'}</h2>
          <p className="small muted-2">{course.quizWeeks.has(week) ? 'Answer each one from memory before you check your notes.' : "This week's auto-marked quiz hasn't been written yet. Answer these from memory."}</p>
          <ol className="prose quiz-list">{w.quiz.map((q) => <li key={q.id}><Markdown text={q.prompt} /></li>)}</ol>
          {w.quizNote && <div className="prose small"><Markdown text={w.quizNote} /></div>}
        </section>
      )}
    </div>
  )
}

// ─── Day ─────────────────────────────────────────────────────────────────

/** The 10-minute version keeps only the review and the mini-task. */
const shortBlocks = (blocks: Block[]) => {
  const keep = blocks.filter((b) => b.kind === 'review' || b.kind === 'mini-task')
  return keep.length ? keep : blocks.slice(0, 1)
}

function BlockSheet({ course, week, day, block, current }: { course: CatalogCourse; week: number; day: number; block: Block; current: boolean }) {
  const { checked } = useStore()
  const done = !!checked[blockKey(course.slug, week, day, block.key)]
  return (
    <details className={`ruled block-sheet ${done ? 'done' : ''} ${current ? 'here' : ''}`} open={!done}>
      <summary className="ruled-row">
        <span className="margin" onClick={(e) => e.preventDefault()}>
          <MarginTick done={done} current={current} label={block.title} onToggle={() => setBlockDone(course.slug, week, day, block.key, !done)} />
        </span>
        <span className="row-text"><span className="row-title">{block.title}</span></span>
        {block.minutes > 0 && <span className="aside">{block.minutes} min</span>}
        <Icon name="down" size={18} className="chev" />
      </summary>
      <div className="block-body prose">
        <Markdown text={block.body} />
        {!done && <button type="button" className="btn primary" onClick={() => setBlockDone(course.slug, week, day, block.key, true)}>Mark {block.title.toLowerCase()} done</button>}
      </div>
    </details>
  )
}

export function DayPage({ course, week, day, short }: { course: CatalogCourse; week: number; day: number; short: boolean }) {
  const state = useStore()
  const w = course.weeks.find((x) => x.number === week)
  const d = w?.days.find((x) => x.number === day)
  const { quiz: quizBank, settled: quizzesSettled, failed: quizzesFailed } = useQuizWeek(course.slug, week)
  const quizDay = quizBank?.days.find((x) => x.day === day)
  const key = dayKey(course.slug, week, day)
  const [active, setActive] = useState<number | null>(null)

  // Opening a day makes its course the one Today shows.
  useEffect(() => {
    if (state.activeCourse !== course.slug) update((s) => ({ ...s, activeCourse: course.slug }))
  }, [course.slug, state.activeCourse])

  // Random checkpoint: pops up on this learner's gate days for the week.
  useEffect(() => {
    if (!quizDay?.gate || state.gates[key]) return
    if (gateDaysForWeek(state.learnerId, course.slug, week).includes(day)) {
      update((s) => ({ ...s, gates: { ...s.gates, [key]: { triggeredAt: Date.now(), attempts: [], seen: [] } } }))
    }
  }, [key, quizDay, state.gates, state.learnerId, course.slug, week, day])

  if (!w || !d) return <NotFound what={`Week ${week}, Day ${day}`} course={course} />
  const blocks = short ? shortBlocks(d.blocks) : d.blocks
  const isDone = (b: Block) => !!state.checked[blockKey(course.slug, week, day, b.key)]
  const current = d.blocks.find((b) => !isDone(b))
  const prev = day > 1 ? href.day(course.slug, week, day - 1) : week > 1 && course.weeks.some((x) => x.number === week - 1) ? href.week(course.slug, week - 1) : null
  const hasNextWeek = course.weeks.some((x) => x.number === week + 1)
  const next = day < w.days.length ? href.day(course.slug, week, day + 1) : hasNextWeek ? href.week(course.slug, week + 1) : null
  const prevDay = w.days.find((x) => x.number === day - 1)
  const nextDay = w.days.find((x) => x.number === day + 1)

  return (
    <div className="page day-page">
      <div className="day-bar">
        <div className="split">
          <a className="back" href={href.home()}><Icon name="back" size={18} />Today</a>
          <a className="small muted-2" href={href.week(course.slug, week)}>Week {week}, {d.weekday}</a>
        </div>
        <div className="segments" role="img" aria-label={`${d.blocks.filter(isDone).length} of ${d.blocks.length} blocks done`}>
          {d.blocks.map((b) => <span key={b.key} className={`seg ${isDone(b) ? 'done' : b === current ? 'here' : ''}`} />)}
        </div>
      </div>

      <header className="page-head">
        <h1>{d.topic}</h1>
        <p className="small muted-2">{d.hours ? `About ${formatHours(d.hours)}. ` : ''}Tick each block as you finish it.</p>
      </header>

      {short && (
        <div className="notice">
          <p><b>10-minute version.</b> Just the review and the mini-task. The rest of the day stays open.</p>
          <a href={href.day(course.slug, week, day)}>Show the full day</a>
        </div>
      )}

      <div className="blocks">
        {blocks.map((b) => <BlockSheet key={b.key} course={course} week={week} day={day} block={b} current={b === current} />)}
      </div>

      {!short && (
        <section className="stack">
          <h2>Today's quizzes</h2>
          {!quizDay && (quizzesFailed
            ? <p className="small muted-2">Today's quizzes couldn't load. Check your connection, then <button type="button" className="link" onClick={() => window.location.reload()}>reload the page</button>.</p>
            : <p className="small muted-2">{quizzesSettled ? "Quizzes for this week haven't been written yet." : 'Loading quizzes…'}</p>)}
          {quizDay?.quizzes.map((quiz, i) => {
            const scoreKey = `${key}:quiz${i}`
            const best = state.bestScores[scoreKey]
            return (
              <section key={i} className="quiz-card">
                <div className="quiz-card-head">
                  <Icon name={quiz.kind === 'rapid-fire' ? 'bolt' : 'puzzle'} />
                  <span className="row-text">
                    <strong>{quiz.title}</strong>
                    <span className="row-note">{quiz.questions.length} questions{quiz.secondsPerQuestion ? `, ${quiz.secondsPerQuestion} s each` : ', untimed'}{best !== undefined ? `. Best so far: ${Math.round(best * 100)}%` : ''}</span>
                  </span>
                  {active !== i && <button type="button" className="btn ghost small-btn" onClick={() => setActive(i)}>{best === undefined ? 'Start' : 'Retake'}</button>}
                </div>
                {active === i && (
                  <QuizPlayer
                    title={quiz.title}
                    questions={quiz.questions}
                    secondsPerQuestion={quiz.secondsPerQuestion}
                    onDone={(result) => update((s) => ({ ...s, bestScores: { ...s.bestScores, [scoreKey]: Math.max(result.score, s.bestScores[scoreKey] ?? 0) } }))}
                  />
                )}
              </section>
            )
          })}
        </section>
      )}

      <nav className="pager" aria-label="Days">
        {prev ? <a href={prev}><Icon name="back" size={16} />{prevDay ? prevDay.weekday : `Week ${week - 1}`}</a> : <span />}
        {next ? <a href={next}>{nextDay ? nextDay.weekday : `Week ${week + 1}`}<Icon name="next" size={16} /></a> : <a href={href.course(course.slug)}>Back to the course</a>}
      </nav>
    </div>
  )
}
