import { marked } from 'marked'
import { useEffect, useMemo, useState } from 'react'
import App from '../App.tsx'
import { catalog, findCourse, type CatalogCourse } from '../content/catalog.ts'
import { DEFAULT_QUIZ_RULES } from '../content/quizzes.ts'
import { drawAttempt, gateDaysForWeek, gateStatus, seededRandom } from '../domain/quizGate.ts'
import { QuizPlayer } from './QuizPlayer.tsx'
import { SandboxHost } from './sandboxes/SandboxHost.tsx'
import { sandboxes, SANDBOX_EMBED } from '../content/sandboxes.ts'
import { href, useRoute } from './router.ts'
import { dayKey, resetProgress, update, useStore, type State } from './store.ts'
import './viewer.css'

function Html({ text }: { text: string }) {
  const html = useMemo(() => (marked.parse(text, { async: false }) as string).replace(/<a href=/g, '<a target="_blank" rel="noreferrer" href='), [text])
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />
}

/** Markdown where a line `::sandbox <id>` becomes a live sandbox. */
function Markdown({ text }: { text: string }) {
  const parts: ({ md: string } | { sandbox: string })[] = []
  let buffer: string[] = []
  for (const line of text.split('\n')) {
    const m = line.match(SANDBOX_EMBED)
    if (m) {
      parts.push({ md: buffer.join('\n') }, { sandbox: m[1] })
      buffer = []
    } else buffer.push(line)
  }
  parts.push({ md: buffer.join('\n') })
  return <>{parts.map((p, i) => ('sandbox' in p ? <SandboxHost key={i} id={p.sandbox} compact /> : p.md.trim() ? <Html key={i} text={p.md} /> : null))}</>
}

// ─── Gate lock ────────────────────────────────────────────────────────────

/** The first gate that has popped up and hasn't been passed. It locks the whole app. */
function pendingGate(state: State) {
  for (const [key, gate] of Object.entries(state.gates)) {
    if (!gate.attempts.some((a) => a.passed)) {
      const [slug, week, day] = key.split(':')
      return { key, slug, week: Number(week), day: Number(day), gate }
    }
  }
  return null
}

function useNow(everyMs: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), everyMs)
    return () => clearInterval(t)
  }, [everyMs])
  return now
}

function GateLock({ pending }: { pending: NonNullable<ReturnType<typeof pendingGate>> }) {
  const now = useNow(1000)
  const course = findCourse(pending.slug)
  const quiz = course?.quizzes.get(pending.week)?.days.find((d) => d.day === pending.day)?.gate
  const status = gateStatus(pending.gate.attempts.map((a) => ({ finishedAt: new Date(a.finishedAt), passed: a.passed })), new Date(now))
  const [started, setStarted] = useState(false)
  const attemptNo = pending.gate.attempts.length + 1
  const questions = useMemo(
    () => (quiz ? drawAttempt(quiz.bank, quiz.blueprint, pending.gate.seen, seededRandom(Date.now() % 1_000_000_007)) : []),
    // A new draw for each attempt; stable within one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quiz, attemptNo],
  )

  if (!quiz) return null

  return (
    <div className="lock">
      <div className="lock-card">
        <p className="eyebrow">🔒 CHECKPOINT · {course?.title}</p>
        <h2>{quiz.title}</h2>
        <p className="muted">Covers: {quiz.covers}. Everything stays locked until you score {Math.round(DEFAULT_QUIZ_RULES.passMark * 100)}%.</p>
        {status.kind === 'cooldown' ? (
          <div className="cooldown">
            <p>You didn't pass. Rest, review, and try again in</p>
            <p className="big">{formatLeft(status.until.getTime() - now)}</p>
            <p className="muted">Your next attempt covers the same topics with different questions.</p>
          </div>
        ) : started ? (
          <QuizPlayer
            key={attemptNo}
            title={`Checkpoint · attempt ${attemptNo}`}
            questions={questions}
            passNote={`Pass mark ${Math.round(DEFAULT_QUIZ_RULES.passMark * 100)}%`}
            onDone={(result) => {
              setTimeout(() => {
                update((s) => {
                  const g = s.gates[pending.key]
                  return {
                    ...s,
                    gates: {
                      ...s.gates,
                      [pending.key]: {
                        ...g,
                        attempts: [...g.attempts, { finishedAt: Date.now(), passed: result.passed, score: result.score }],
                        seen: [...g.seen.filter((id) => !questions.some((q) => q.id === id)), ...questions.map((q) => q.id)],
                      },
                    },
                  }
                })
                setStarted(false)
              }, 2500)
            }}
          />
        ) : (
          <button className="primary big-btn" onClick={() => setStarted(true)}>Start checkpoint ({questions.length} questions)</button>
        )}
        {pending.gate.attempts.length > 0 && (
          <p className="muted small">Previous attempts: {pending.gate.attempts.map((a) => `${Math.round(a.score * 100)}%`).join(', ')}</p>
        )}
      </div>
    </div>
  )
}

function formatLeft(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ─── Pages ────────────────────────────────────────────────────────────────

function Home() {
  return (
    <>
      <h1>Scribs &amp; Pixels School</h1>
      <p className="muted">Test build: all content is loaded from the repo; your progress is saved in this browser only.</p>
      <div className="cards">
        {catalog.map((c) => (
          <a key={c.slug} className="card" href={href.course(c.slug)}>
            <strong>{c.title}</strong>
            <span>{c.weeks.length} weeks written · quizzes for {c.quizzes.size} week{c.quizzes.size === 1 ? '' : 's'}</span>
          </a>
        ))}
      </div>
    </>
  )
}

function CoursePage({ course }: { course: CatalogCourse }) {
  const [showOverview, setShowOverview] = useState(false)
  return (
    <>
      <p className="crumbs"><a href={href.home()}>Courses</a></p>
      <h1>{course.title}</h1>
      {course.overview && (
        <>
          <button onClick={() => setShowOverview(!showOverview)}>{showOverview ? 'Hide' : 'Show'} course overview</button>
          {showOverview && <Markdown text={course.overview.replace(/^# .+\n/, '')} />}
        </>
      )}
      {sandboxes.some((x) => x.course === course.slug && x.main) && (
        <>
          <h3>🧪 Sandboxes</h3>
          <div className="cards">
            {sandboxes.filter((x) => x.course === course.slug && x.main).map((x) => (
              <a key={x.id} className="card" href={href.sandbox(course.slug, x.id)}>
                <strong>{x.title}</strong>
                <span>{x.description}</span>
              </a>
            ))}
          </div>
          <h3>Weeks</h3>
        </>
      )}
      <div className="list">
        {course.weeks.map((w) => (
          <a key={w.number} className="list-item" href={href.week(course.slug, w.number)}>
            <span className="num">{w.number}</span>
            <span><strong>{w.title}</strong><small>{w.theme}</small></span>
            {course.quizzes.has(w.number) ? <span className="tag">quizzes</span> : <span className="tag off">no quizzes yet</span>}
          </a>
        ))}
      </div>
    </>
  )
}

function WeekPage({ course, week }: { course: CatalogCourse; week: number }) {
  const state = useStore()
  const w = course.weeks.find((x) => x.number === week)
  if (!w) return <p>Week not found.</p>
  const quizWeek = course.quizzes.get(week)
  return (
    <>
      <p className="crumbs"><a href={href.home()}>Courses</a> / <a href={href.course(course.slug)}>{course.title}</a></p>
      <h1>Week {w.number}: {w.title}</h1>
      <p><b>Theme:</b> {w.theme}</p>
      <p><i>{w.bigQuestion}</i></p>
      <h3>Resources</h3>
      <ul className="resources">
        {w.resources.map((r) => <li key={r.title}>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a> : r.title}{r.note ? `: ${r.note}` : ''}</li>)}
      </ul>
      <h3>Days</h3>
      <div className="list">
        {w.days.map((d) => {
          const done = d.blocks.filter((b) => state.checked[`${dayKey(course.slug, week, d.number)}:${b.key}`]).length
          return (
            <a key={d.number} className="list-item" href={href.day(course.slug, week, d.number)}>
              <span className="num">{d.number}</span>
              <span><strong>{d.weekday}</strong><small>{d.topic}</small></span>
              <span className="tag">{done}/{d.blocks.length} blocks</span>
            </a>
          )
        })}
      </div>
      {!quizWeek && <p className="muted">Quizzes for this week haven't been written yet.</p>}
      <h3>Week quiz</h3>
      <ol>{w.quiz.map((q) => <li key={q.id}><Markdown text={q.prompt} /></li>)}</ol>
      {w.quizNote && <Markdown text={w.quizNote} />}
    </>
  )
}

function DayPage({ course, week, day }: { course: CatalogCourse; week: number; day: number }) {
  const state = useStore()
  const w = course.weeks.find((x) => x.number === week)
  const d = w?.days.find((x) => x.number === day)
  const quizDay = course.quizzes.get(week)?.days.find((x) => x.day === day)
  const key = dayKey(course.slug, week, day)
  const [active, setActive] = useState<number | null>(null)

  // Random checkpoint: pops up on this learner's gate days for the week.
  useEffect(() => {
    if (!quizDay?.gate || state.gates[key]) return
    if (gateDaysForWeek(state.learnerId, course.slug, week).includes(day)) {
      update((s) => ({ ...s, gates: { ...s.gates, [key]: { triggeredAt: Date.now(), attempts: [], seen: [] } } }))
    }
  }, [key, quizDay, state.gates, state.learnerId, course.slug, week, day])

  if (!w || !d) return <p>Day not found.</p>
  const prev = day > 1 ? href.day(course.slug, week, day - 1) : week > 1 ? href.week(course.slug, week - 1) : null
  const next = day < w.days.length ? href.day(course.slug, week, day + 1) : href.week(course.slug, week + 1)

  return (
    <>
      <p className="crumbs"><a href={href.home()}>Courses</a> / <a href={href.course(course.slug)}>{course.title}</a> / <a href={href.week(course.slug, week)}>Week {week}</a></p>
      <h1>Day {d.number}: {d.weekday}</h1>
      <p className="topic">{d.topic} · ~{d.hours} h</p>
      {d.blocks.map((b) => {
        const k = `${key}:${b.key}`
        const done = !!state.checked[k]
        return (
          <section key={b.key} className={`block ${done ? 'done' : ''}`}>
            <header>
              <h3>{b.title}{b.minutes ? <small> · {b.minutes} min</small> : null}</h3>
              <label className="done-toggle">
                <input type="checkbox" checked={done} onChange={() => update((s) => {
                  const checked = { ...s.checked }
                  if (done) delete checked[k]
                  else checked[k] = true
                  return { ...s, checked }
                })} /> Done
              </label>
            </header>
            <Markdown text={b.body} />
          </section>
        )
      })}

      <h2>Today's quizzes</h2>
      {!quizDay && <p className="muted">Quizzes for this week haven't been written yet.</p>}
      {quizDay?.quizzes.map((quiz, i) => {
        const scoreKey = `${key}:quiz${i}`
        const best = state.bestScores[scoreKey]
        return (
          <section key={i} className="block quiz-card">
            <header>
              <h3>{quiz.kind === 'rapid-fire' ? '⚡ ' : '🧠 '}{quiz.title}</h3>
              <span className="muted">{quiz.questions.length} questions{quiz.secondsPerQuestion ? ` · ${quiz.secondsPerQuestion}s each` : ''}{best !== undefined ? ` · best ${Math.round(best * 100)}%` : ''}</span>
            </header>
            {active === i ? (
              <QuizPlayer
                title={quiz.title}
                questions={quiz.questions}
                secondsPerQuestion={quiz.secondsPerQuestion}
                onDone={(result) => update((s) => ({ ...s, bestScores: { ...s.bestScores, [scoreKey]: Math.max(result.score, s.bestScores[scoreKey] ?? 0) } }))}
              />
            ) : (
              <button className="primary" onClick={() => setActive(i)}>{best === undefined ? 'Start' : 'Retake'}</button>
            )}
          </section>
        )
      })}

      <nav className="pager">
        {prev ? <a href={prev}>← Previous</a> : <span />}
        <a href={next}>Next →</a>
      </nav>
    </>
  )
}

// ─── Tester tools ──────────────────────────────────────────────────────────

function TesterTools() {
  const state = useStore()
  const route = useRoute()
  const [open, setOpen] = useState(false)
  const pending = pendingGate(state)
  const gateDays = route.page === 'week' || route.page === 'day' ? gateDaysForWeek(state.learnerId, route.slug, route.week) : null
  return (
    <div className={`tester ${open ? 'open' : ''}`}>
      <button onClick={() => setOpen(!open)}>🧪 Tester tools</button>
      {open && (
        <div className="tester-body">
          {gateDays && <p>Your random checkpoint days this week: <b>{gateDays.map((d) => `Day ${d}`).join(' & ')}</b></p>}
          {route.page === 'day' && (
            <button onClick={() => { setOpen(false); update((s) => ({ ...s, gates: { ...s.gates, [dayKey(route.slug, route.week, route.day)]: { triggeredAt: Date.now(), attempts: [], seen: [] } } })) }}>Force checkpoint on this day</button>
          )}
          {pending && (
            <button onClick={() => update((s) => {
              setOpen(false)
              const g = s.gates[pending.key]
              return { ...s, gates: { ...s.gates, [pending.key]: { ...g, attempts: g.attempts.map((a) => ({ ...a, finishedAt: 0 })) } } }
            })}>End cooldown now</button>
          )}
          <button onClick={() => { if (confirm('Reset all progress in this browser?')) { setOpen(false); resetProgress() } }}>Reset my progress</button>
          <p className="muted small">Only for testing. Real learners won't see this panel.</p>
        </div>
      )}
    </div>
  )
}

// ─── App shell ─────────────────────────────────────────────────────────────

export function Viewer() {
  const route = useRoute()
  const state = useStore()
  const pending = pendingGate(state)
  useEffect(() => { window.scrollTo(0, 0) }, [route])

  if (route.page === 'mockup') return <App />

  const course = route.page !== 'home' ? findCourse(route.slug) : undefined
  let page
  if (route.page === 'home' || !course) page = <Home />
  else if (route.page === 'course') page = <CoursePage course={course} />
  else if (route.page === 'week') page = <WeekPage course={course} week={route.week} />
  else if (route.page === 'sandbox') page = (
    <>
      <p className="crumbs"><a href={href.home()}>Courses</a> / <a href={href.course(course.slug)}>{course.title}</a></p>
      <SandboxHost id={route.id} />
    </>
  )
  else page = <DayPage key={`${route.week}-${route.day}`} course={course} week={route.week} day={route.day} />

  return (
    <div className="viewer">
      <header className="topbar-v">
        <a href={href.home()} className="brand-v">S <span>scribs&amp;pixels</span></a>
        <span className="muted small">test build</span>
      </header>
      <main>{pending ? <GateLock key={pending.key} pending={pending} /> : page}</main>
      <TesterTools />
    </div>
  )
}
