import { useEffect, useRef, useState } from 'react'
import { catalog, findCourse, quizWeek, quizWeekSettled } from '../content/catalog.ts'
import { DEFAULT_QUIZ_RULES, type Question } from '../content/quizzes.ts'
import { drawAttempt, gateDaysForWeek, gateStatus, seededRandom } from '../domain/quizGate.ts'
import { accountConfig, hasStoredSession, urlHasAuthResult } from '../lib/accountConfig.ts'
import { AccountPage } from './AccountPage.tsx'
import { AdminPage } from './AdminPage.tsx'
import { loadSync } from './loadSync.ts'
import { isAdmin, isSignedIn, useAccountStatus } from './accountStatus.ts'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { CoursePage, DayPage, WeekPage } from './pages.tsx'
import { QuizPlayer } from './QuizPlayer.tsx'
import { SandboxHost } from './sandboxes/SandboxHost.tsx'
import { NudgeApp } from './nudge/NudgeApp.tsx'
import { href, isNudgeRoute, useRoute, type Route } from './router.ts'
import { dayKey, resetProgress, update, useStore, type State } from './store.ts'
import { TodayPage } from './TodayPage.tsx'
import { activeCourseOf, shortTitle } from './today.ts'
import { Icon } from './ui.tsx'
import { formatLeft, useNow } from './useNow.ts'
import { useQuizWeek, useQuizzesLoaded } from './useQuizWeek.ts'
import './viewer.css'

// ─── Gate lock ────────────────────────────────────────────────────────────

const gateQuiz = (slug: string, week: number, day: number) =>
  quizWeek(slug, week)?.days.find((d) => d.day === day)?.gate

/** The first gate that has popped up and hasn't been passed. It locks the whole app.
 *  A gate whose quiz no longer exists (renamed content, an edited save) is ignored, never a dead lock. */
function pendingGate(state: State) {
  for (const [key, gate] of Object.entries(state.gates)) {
    if (!gate.attempts.some((a) => a.passed)) {
      const [slug, week, day] = key.split(':')
      // While the bank is still downloading the gate stays locked (GateLock shows "Loading…");
      // once it's here, a gate with no matching quiz is dropped.
      if (quizWeekSettled(slug, Number(week)) && !gateQuiz(slug, Number(week), Number(day))) continue
      return { key, slug, week: Number(week), day: Number(day), gate }
    }
  }
  return null
}

const pct = (score: number) => `${Math.round(score * 100)}%`

function GateLock({ pending, onPassed }: { pending: NonNullable<ReturnType<typeof pendingGate>>; onPassed: (score: number) => void }) {
  const now = useNow(1000)
  const course = findCourse(pending.slug)
  const { failed } = useQuizWeek(pending.slug, pending.week)
  const quiz = gateQuiz(pending.slug, pending.week, pending.day)
  const status = gateStatus(pending.gate.attempts.map((a) => ({ finishedAt: new Date(a.finishedAt), passed: a.passed })), new Date(now))
  // The attempt in progress: its questions are drawn once, when it starts.
  const [attempt, setAttempt] = useState<{ no: number; questions: Question[]; failed?: boolean } | null>(null)
  const startedRef = useRef(false)
  const passMark = pct(DEFAULT_QUIZ_RULES.passMark)

  if (!quiz) return (
    <div className="lock">
      <p className="lock-label"><Icon name="lock" size={16} />Checkpoint</p>
      {failed
        ? <><h1>The checkpoint couldn't load</h1><p className="lock-text">Check your connection, then reload. The school stays locked until it's passed.</p><button type="button" className="btn lime" onClick={() => window.location.reload()}>Reload</button></>
        : <p className="lock-text">Loading checkpoint…</p>}
    </div>
  )

  const start = () => {
    if (startedRef.current) return // a double tap must not record two attempts
    startedRef.current = true
    const questions = drawAttempt(quiz.bank, quiz.blueprint, pending.gate.seen, seededRandom(Date.now() % 1_000_000_007))
    const no = pending.gate.attempts.length + 1
    // Starting counts: the attempt is saved as a fail straight away and replaced by the real result
    // at the end. Reloading or leaving mid-quiz can't dodge the cooldown or re-roll the questions.
    update((s) => {
      const g = s.gates[pending.key]
      return {
        ...s,
        gates: {
          ...s.gates,
          [pending.key]: {
            ...g,
            attempts: [...g.attempts, { finishedAt: Date.now(), passed: false, score: 0 }],
            seen: [...g.seen.filter((id) => !questions.some((q) => q.id === id)), ...questions.map((q) => q.id)],
          },
        },
      }
    })
    setAttempt({ no, questions })
  }

  const finish = (result: { passed: boolean; score: number }) => {
    update((s) => {
      const g = s.gates[pending.key]
      const attempts = [...g.attempts]
      attempts[attempts.length - 1] = { finishedAt: Date.now(), passed: result.passed, score: result.score }
      return { ...s, gates: { ...s.gates, [pending.key]: { ...g, attempts } } }
    })
    // A pass unlocks the app at once (the lock disappears), so the score is shown on the page behind it.
    if (result.passed) onPassed(result.score)
    else setAttempt((a) => (a ? { ...a, failed: true } : a))
  }

  const last = pending.gate.attempts.at(-1)
  const total = quiz.blueprint.easy + quiz.blueprint.medium + quiz.blueprint.hard
  const until = status.kind === 'cooldown' ? status.until : null

  return (
    <div className="lock">
      <p className="lock-label"><Icon name="lock" size={16} />Checkpoint{course ? `: ${shortTitle(course.title)}` : ''}</p>
      {attempt ? (
        <>
          <h1>{quiz.title}</h1>
          <div className="lock-card">
            <QuizPlayer
              key={attempt.no}
              title={`Attempt ${attempt.no}`}
              questions={attempt.questions}
              passNote={`Pass mark ${passMark}`}
              onDone={finish}
            />
            {attempt.failed
              ? <button type="button" className="btn primary" onClick={() => { startedRef.current = false; setAttempt(null) }}>Continue</button>
              : <p className="small muted-2">Leaving or reloading before the end counts as a failed attempt.</p>}
          </div>
        </>
      ) : until ? (
        <>
          <h1>{last ? `${pct(last.score)}. Not quite there.` : 'Not quite there.'}</h1>
          <p className="lock-text">You needed {passMark}. It covered {quiz.covers}.</p>
          <div className="countdown">
            <span className="lock-text">Next attempt opens in</span>
            <span className="count num">{formatLeft(until.getTime() - now)}</span>
            <span className="lock-text">At {until.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}. Same topics, different questions.</span>
          </div>
        </>
      ) : (
        <>
          <h1>{quiz.title}</h1>
          <p className="lock-text">A quick check on the previous day: {quiz.covers}. Score {passMark} to open the school again. Leaving before the end counts as an attempt.</p>
          <button type="button" className="btn lime big" onClick={start}>Start the checkpoint ({total} questions)</button>
          {pending.gate.attempts.length > 0 && (
            <p className="lock-text small">Earlier attempts: {pending.gate.attempts.map((a) => pct(a.score)).join(', ')}</p>
          )}
        </>
      )}
    </div>
  )
}

// ─── Tester tools ──────────────────────────────────────────────────────────

function TesterTools() {
  const state = useStore()
  const route = useRoute()
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const account = useAccountStatus()
  const signedIn = isSignedIn(account)
  const pending = pendingGate(state)
  const gateDays = route.page === 'week' || route.page === 'day' ? gateDaysForWeek(state.learnerId, route.slug, route.week) : null
  // A test build tool: shown to admins and to people trying the school without an account, never
  // to signed-in students (it can force a checkpoint on their real account). Just after a page
  // load the saved session isn't restored yet (sync 'off'): a session in storage counts as signed
  // in, or a student would see the panel for that moment (caught by check:accounts in CI, 28 Oct).
  const signingIn = account.state === 'off' && hasStoredSession()
  if ((signedIn || signingIn) && !isAdmin(account)) return null
  return (
    <div className={`tester ${open ? 'open' : ''}`}>
      <button type="button" onClick={() => { setOpen(!open); setConfirmReset(false) }} aria-label="Tester tools" title="Tester tools">{open ? 'Close' : '🧪'}</button>
      {open && (
        <div className="tester-body">
          {gateDays && <p>Your random checkpoint days this week: <b>{gateDays.map((d) => `Day ${d}`).join(' & ')}</b></p>}
          {route.page === 'day' && (
            <button type="button" onClick={() => { setOpen(false); update((s) => ({ ...s, gates: { ...s.gates, [dayKey(route.slug, route.week, route.day)]: { triggeredAt: Date.now(), attempts: [], seen: [] } } })) }}>Force checkpoint on this day</button>
          )}
          {pending && !signedIn && (
            <button type="button" onClick={() => update((s) => {
              setOpen(false)
              const g = s.gates[pending.key]
              return { ...s, gates: { ...s.gates, [pending.key]: { ...g, attempts: g.attempts.map((a) => ({ ...a, finishedAt: 0 })) } } }
            })}>End cooldown now</button>
          )}
          {signedIn
            ? <p className="small">Signed in: checkpoint results are saved to your account, so they can't be reset or skipped here.</p>
            : confirmReset
              ? <button type="button" className="danger" onClick={() => { setOpen(false); setConfirmReset(false); resetProgress() }}>Yes, reset all progress in this browser</button>
              : <button type="button" onClick={() => setConfirmReset(true)}>Reset my progress</button>}
          <p className="small muted-2">Only for testing. Real learners won't see this panel.</p>
        </div>
      )}
    </div>
  )
}

// ─── App shell ─────────────────────────────────────────────────────────────

function Navigation({ route, activeSlug }: { route: Route; activeSlug: string }) {
  const account = useAccountStatus()
  const onToday = route.page === 'home'
  const onAccount = route.page === 'account'
  const onAdmin = route.page === 'admin'
  const onCourse = !onToday && !onAccount && !onAdmin && route.page !== 'sandbox'
  return (
    <>
      <nav className="sidebar" aria-label="Main">
        <a className="brand" href={href.home()}><span className="brand-mark">S</span>Scribs &amp; Pixels</a>
        <a className={`side-link ${onToday ? 'on' : ''}`} href={href.home()} aria-current={onToday ? 'page' : undefined}><Icon name="today" />Today</a>
        <a className={`side-link ${onCourse ? 'on' : ''}`} href={href.course(activeSlug)} aria-current={onCourse ? 'page' : undefined}><Icon name="course" />Course</a>
        <p className="side-label">Your courses</p>
        {catalog.map((c) => (
          <a key={c.slug} className={`side-link course ${c.slug === activeSlug ? 'active' : ''}`} href={href.course(c.slug)}>{shortTitle(c.title)}</a>
        ))}
        <a className="side-link" href={href.nudge()}><Icon name="heart" />Nudge</a>
        <a className={`side-link ${onAccount ? 'on' : ''}`} href={href.account()} aria-current={onAccount ? 'page' : undefined}><Icon name="user" />Account</a>
        {isAdmin(account) && <a className={`side-link ${onAdmin ? 'on' : ''}`} href={href.admin()} aria-current={onAdmin ? 'page' : undefined}><Icon name="table" />Learners</a>}
        <p className="side-foot">
          {isSignedIn(account)
            ? <>Signed in as {account.email}.<br />{account.state === 'offline' || account.state === 'error' ? 'Not saved yet: will retry.' : 'Progress is saved to your account.'}</>
            : <>Progress is saved in this browser only.{accountConfig && <a className="side-account" href={href.account()}>Sign in to keep it</a>}</>}
        </p>
      </nav>
      <nav className="tabbar" aria-label="Main">
        <a className={onToday ? 'on' : ''} href={href.home()} aria-current={onToday ? 'page' : undefined}><Icon name="today" size={22} />Today</a>
        <a className={onCourse ? 'on' : ''} href={href.course(activeSlug)} aria-current={onCourse ? 'page' : undefined}><Icon name="course" size={22} />Course</a>
        <a href={href.nudge()}><Icon name="heart" size={22} />Nudge</a>
        <a className={onAccount ? 'on' : ''} href={href.account()} aria-current={onAccount ? 'page' : undefined}><Icon name="user" size={22} />Account</a>
      </nav>
    </>
  )
}

export function Viewer() {
  const route = useRoute()
  const state = useStore()
  useQuizzesLoaded() // a bank arriving can release a stale gate
  const pending = pendingGate(state)
  const [passedScore, setPassedScore] = useState<number | null>(null)
  useEffect(() => { window.scrollTo(0, 0) }, [route])
  // Signed in before, or arriving from a sign-in email: start syncing (loads the Supabase client).
  useEffect(() => {
    if (accountConfig && (hasStoredSession() || urlHasAuthResult())) void loadSync()
  }, [])

  const course = 'slug' in route ? findCourse(route.slug) : undefined
  // Opening a course page makes it the course Today shows.
  useEffect(() => {
    if (course && state.activeCourse !== course.slug) update((s) => ({ ...s, activeCourse: course.slug }))
  }, [course, state.activeCourse])
  const activeSlug = course?.slug ?? activeCourseOf(state).slug

  // Nudge has its own screens: a school checkpoint doesn't lock it (Nudge is where you're told one is waiting).
  if (isNudgeRoute(route)) {
    return (
      <ErrorBoundary label="page" resetKey={window.location.hash}>
        <NudgeApp route={route} />
      </ErrorBoundary>
    )
  }

  let page
  if (route.page === 'account') page = <AccountPage />
  else if (route.page === 'admin') page = <AdminPage />
  else if (route.page === 'home' || !course) page = <TodayPage />
  else if (route.page === 'course') page = <CoursePage course={course} />
  else if (route.page === 'week') page = <WeekPage course={course} week={route.week} />
  else if (route.page === 'sandbox') page = (
    <div className="page">
      <a className="back" href={href.course(course.slug)}><Icon name="back" size={18} />{shortTitle(course.title)}</a>
      <SandboxHost id={route.id} />
    </div>
  )
  else page = <DayPage key={`${route.week}-${route.day}`} course={course} week={route.week} day={route.day} short={route.short} />

  if (pending) {
    return (
      <div className="locked-shell">
        <main>
          <ErrorBoundary label="page" resetKey={window.location.hash}>
            <GateLock key={pending.key} pending={pending} onPassed={setPassedScore} />
          </ErrorBoundary>
        </main>
        <TesterTools />
      </div>
    )
  }

  return (
    <div className="shell">
      <Navigation route={route} activeSlug={activeSlug} />
      <main className="content">
        {passedScore !== null && (
          <p className="banner pass" role="status">Checkpoint passed with {pct(passedScore)}. The school is open again. <button type="button" className="link" onClick={() => setPassedScore(null)}>Dismiss</button></p>
        )}
        <ErrorBoundary label="page" resetKey={window.location.hash}>
          {page}
        </ErrorBoundary>
      </main>
      <TesterTools />
    </div>
  )
}
