import { useEffect, useState } from 'react'
import { catalog } from '../content/catalog.ts'
import type { Profile } from '../domain/learner.ts'
import { streak } from '../domain/streak.ts'
import { accountConfig } from '../lib/accountConfig.ts'
import { todayDate } from './actions.ts'
import { isAdmin, isSignedIn, useAccountStatus, type AccountStatus } from './accountStatus.ts'
import { loadSync, type SyncModule } from './loadSync.ts'
import { href } from './router.ts'
import { useStore } from './store.ts'
import { ledger, shortTitle, studyDaysDone } from './today.ts'
import { Icon } from './ui.tsx'


const MAIN_SITE = 'https://school.scribsandpixels.com/#/account'

function ago(ms: number, now: number) {
  const s = Math.max(0, Math.round((now - ms) / 1000))
  if (s < 10) return 'just now'
  if (s < 60) return `${s} seconds ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`
  return new Date(ms).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })
}

function SaveLine({ status }: { status: AccountStatus }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 15_000); return () => clearInterval(t) }, [])
  const text = {
    off: '', 'signed-out': '',
    loading: 'Downloading your progress…',
    saving: 'Saving…',
    saved: status.savedAt ? `Saved to your account ${ago(status.savedAt, now)}` : 'Saved to your account',
    offline: 'Offline: saving when the connection is back',
    error: 'Not saved yet: trying again',
  }[status.state]
  return <p className={`status ${status.state === 'saved' ? 'ok' : status.state === 'error' || status.state === 'offline' ? 'behind' : ''}`} role="status">{text}</p>
}

function SignIn({ sync, status }: { sync: SyncModule; status: AccountStatus }) {
  const state = useStore()
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)
  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])
  const hasLocalProgress = Object.keys(state.checked).length > 0 || Object.keys(state.weekQuizzes).length > 0

  const send = async (to: string) => {
    setBusy(true)
    setError(null)
    try {
      await sync.sendCode(to)
      setSentTo(to)
      setCode('')
      setResendIn(60)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const verify = async () => {
    if (!sentTo) return
    setBusy(true)
    setError(null)
    try {
      await sync.verifyCode(sentTo, code.trim())
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
    // On success the page switches to "Your account" by itself (the session arrives).
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Sign in</h1>
        <p className="prose small">Your progress then lives in your account: it follows you between your phone and laptop, and your daily nudge email knows what you've done. No password: we email you a code.</p>
      </div>
      {status.message && <p className="banner warn" role="alert">{status.message}</p>}
      {!sentTo ? (
        <form className="account-form" onSubmit={(e) => { e.preventDefault(); void send(email.trim()) }}>
          <label className="field">
            <span>Email</span>
            <input type="email" required autoComplete="email" inputMode="email" autoCapitalize="off" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <button type="submit" className="btn primary" disabled={busy || !email.trim()}>{busy ? 'Sending…' : 'Email me a sign-in code'}</button>
          {hasLocalProgress && <p className="small muted-2">What you've done in this browser so far moves into your account when you sign in.</p>}
        </form>
      ) : (
        <form className="account-form" onSubmit={(e) => { e.preventDefault(); void verify() }}>
          <p>We sent a code to <b>{sentTo}</b>. Type it here, or tap the link in the email <i>on this device</i>.</p>
          <label className="field">
            <span>Code from the email</span>
            <input className="code-input" required autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" maxLength={10} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" />
          </label>
          <button type="submit" className="btn primary" disabled={busy || code.length < 6}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <p className="small muted-2">
            Nothing arrived? Check spam, then{' '}
            {resendIn > 0 ? <>you can ask again in {resendIn} s</> : <button type="button" className="link" disabled={busy} onClick={() => void send(sentTo)}>send a new code</button>}
            {' · '}<button type="button" className="link" onClick={() => { setSentTo(null); setError(null) }}>use a different email</button>
          </p>
        </form>
      )}
      {error && <p className="banner warn" role="alert">{error}</p>}
    </div>
  )
}

/** Every IANA time zone the browser knows (falls back to a short list on old browsers). */
function timeZones(current: string): string[] {
  let zones: string[] = []
  try { zones = Intl.supportedValuesOf('timeZone') } catch { /* old browser */ }
  if (!zones.length) zones = ['Africa/Lagos', 'America/Toronto', 'America/Vancouver', 'Europe/London', 'UTC']
  return zones.includes(current) ? zones : [current, ...zones]
}

const hourLabel = (h: number) => new Date(Date.UTC(2026, 0, 1, h)).toLocaleTimeString([], { hour: 'numeric', timeZone: 'UTC' })

/** Name, time zone and the daily nudge email: the learner's own profile settings. */
function Details() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [draft, setDraft] = useState<Profile | null>(null)
  const [state, setState] = useState<'loading' | 'idle' | 'saving' | 'saved' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    import('../lib/api.ts').then((api) => api.getProfile()).then(
      (p) => { if (live) { setProfile(p); setDraft(p); setState('idle') } },
      (e: Error) => { if (live) { setError(e.message); setState('error') } },
    )
    return () => { live = false }
  }, [])
  if (!draft || !profile) return <section className="stack"><h2>Your details</h2><p className="small muted">{error ? `Couldn't load your details: ${error}` : 'Loading…'}</p></section>
  const changed = JSON.stringify(draft) !== JSON.stringify(profile)
  const save = async () => {
    setState('saving')
    setError(null)
    try {
      const api = await import('../lib/api.ts')
      const name = draft.displayName?.trim() || null
      await api.updateProfile({ displayName: name, timezone: draft.timezone, emailNudges: draft.emailNudges, nudgeHour: draft.nudgeHour })
      const saved = { ...draft, displayName: name }
      setProfile(saved)
      setDraft(saved)
      setState('saved')
    } catch (e) {
      setError((e as Error).message)
      setState('error')
    }
  }
  return (
    <section className="stack">
      <h2>Your details</h2>
      <form className="account-form" onSubmit={(e) => { e.preventDefault(); void save() }}>
        <label className="field">
          <span>Name (used in your emails)</span>
          <input maxLength={60} autoComplete="name" value={draft.displayName ?? ''} onChange={(e) => { setDraft({ ...draft, displayName: e.target.value }); setState('idle') }} placeholder="Your first name" />
        </label>
        <label className="field">
          <span>Time zone (your study days and streak follow your own calendar)</span>
          <select value={draft.timezone} onChange={(e) => { setDraft({ ...draft, timezone: e.target.value }); setState('idle') }}>
            {timeZones(draft.timezone).map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
          </select>
        </label>
        <label className="check-field">
          <input type="checkbox" checked={draft.emailNudges} onChange={(e) => { setDraft({ ...draft, emailNudges: e.target.checked }); setState('idle') }} />
          <span>Email me a nudge on study days I haven't studied yet, and a review every Sunday</span>
        </label>
        <label className="field">
          <span>Nudge time</span>
          <select value={draft.nudgeHour} disabled={!draft.emailNudges} onChange={(e) => { setDraft({ ...draft, nudgeHour: Number(e.target.value) }); setState('idle') }}>
            {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
          </select>
        </label>
        <div className="row">
          <button type="submit" className="btn primary small-btn" disabled={!changed || state === 'saving'}>{state === 'saving' ? 'Saving…' : 'Save details'}</button>
          {state === 'saved' && !changed && <span className="status ok" role="status">Saved</span>}
        </div>
        {error && <p className="banner warn" role="alert">Couldn't save: {error}</p>}
      </form>
    </section>
  )
}

/** Study days done per course and the streak, from this browser's (synced) progress. */
function Progress() {
  const state = useStore()
  const value = streak(new Set(Object.keys(state.studied)), todayDate())
  const courses = catalog
    .map((c) => ({ title: shortTitle(c.title), days: studyDaysDone(ledger(c, state.checked)), total: c.weeks.reduce((n, w) => n + w.days.length, 0) }))
    .filter((c) => c.days > 0)
  return (
    <section className="stack">
      <h2>Your progress</h2>
      <p className="small">Streak <b className="num">{value.current}</b> study day{value.current === 1 ? '' : 's'} (best <span className="num">{value.best}</span>). Sundays are rest and never break it.</p>
      {courses.length
        ? <ul className="learner-courses small">{courses.map((c) => <li key={c.title}><b>{c.title}</b>: <span className="num">{c.days}</span> of {c.total} written days done</li>)}</ul>
        : <p className="small muted">Nothing ticked yet. Today's lesson is on the Today page.</p>}
    </section>
  )
}

function SignedIn({ sync, status }: { sync: SyncModule; status: AccountStatus }) {
  const [unsaved, setUnsaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const out = async (discard: boolean) => {
    setBusy(true)
    const done = await sync.signOut(discard)
    setBusy(false)
    if (!done) setUnsaved(true)
    else window.location.hash = '#/'
  }
  return (
    <div className="page">
      <div className="page-head">
        <h1>Your account</h1>
        <p>Signed in as <b>{status.email}</b></p>
        <SaveLine status={status} />
      </div>
      {status.message && <p className="banner warn" role="alert">{status.message}</p>}
      <section className="stack">
        <p className="prose small">Every tick, checkpoint and week quiz is saved to your account as you go, and anything done on another device arrives here when you come back to this tab.</p>
        <div className="row">
          <button type="button" className="btn ghost small-btn" disabled={status.state === 'loading' || status.state === 'saving'} onClick={() => sync.refresh(true)}>Download from my account now</button>
        </div>
      </section>
      <Progress />
      <Details />
      {isAdmin(status) && (
        <section className="stack">
          <h2>Admin</h2>
          <div className="row"><a className="btn ghost small-btn" href={href.admin()}>See all learners</a></div>
        </section>
      )}
      <section className="stack">
        <h2>Sign out</h2>
        <p className="small muted-2">Signing out removes your progress from this browser. It stays in your account for next time.</p>
        {unsaved ? (
          <div className="banner warn stack">
            <p>Some progress hasn't reached your account yet (no connection). Signing out now would lose it.</p>
            <div className="row">
              <button type="button" className="btn primary small-btn" onClick={() => setUnsaved(false)}>Stay signed in</button>
              <button type="button" className="btn ghost small-btn" disabled={busy} onClick={() => void out(true)}>Sign out anyway</button>
            </div>
          </div>
        ) : (
          <div className="row"><button type="button" className="btn ghost small-btn" disabled={busy} onClick={() => void out(false)}>{busy ? 'Saving…' : 'Sign out'}</button></div>
        )}
      </section>
    </div>
  )
}

export function AccountPage() {
  const status = useAccountStatus()
  const [sync, setSync] = useState<SyncModule | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!accountConfig) return
    let live = true
    loadSync().then((m) => { if (live) setSync(m) }, () => { if (live) setFailed(true) })
    return () => { live = false }
  }, [])

  if (!accountConfig) return (
    <div className="page">
      <div className="page-head"><h1>Accounts</h1></div>
      <p className="prose small">This copy of the school keeps progress in this browser only. To save it to an account, use the main site.</p>
      <div className="row"><a className="btn primary" href={MAIN_SITE}>Go to school.scribsandpixels.com<Icon name="next" size={18} /></a></div>
    </div>
  )
  if (failed) return (
    <div className="page">
      <div className="page-head"><h1>Sign in</h1></div>
      <p className="banner warn">The sign-in page couldn't load. Check your connection, then <button type="button" className="link" onClick={() => window.location.reload()}>reload</button>.</p>
    </div>
  )
  if (!sync || status.state === 'off') return <div className="page"><p className="muted">Loading…</p></div>
  return isSignedIn(status) ? <SignedIn sync={sync} status={status} /> : <SignIn sync={sync} status={status} />
}
