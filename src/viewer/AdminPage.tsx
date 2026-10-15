import { useEffect, useState } from 'react'
import { catalog } from '../content/catalog.ts'
import { isAdmin, isSignedIn, useAccountStatus } from './accountStatus.ts'
import { summarise, type LearnerSummary } from './adminSummary.ts'
import { loadSync } from './loadSync.ts'
import { href } from './router.ts'

const date = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })

function LearnerCard({ l }: { l: LearnerSummary }) {
  return (
    <article className="learner-card">
      <div className="split">
        <div className="row-text">
          <strong>{l.name || l.email}</strong>
          {l.name && <span className="row-note">{l.email}</span>}
        </div>
        {l.studiedToday
          ? <span className="status ok">Studied today</span>
          : <span className="status behind">{l.lastStudied ? `Last: ${date(l.lastStudied)}` : 'Never studied'}</span>}
      </div>
      <p className="small">
        Streak <b className="num">{l.streak}</b> (best {l.bestStreak}) · <b className="num">{l.studiedLast7}</b> of the last 7 days
        {l.recentFails > 0 && <> · <b className="num">{l.recentFails}</b> failed checkpoint{l.recentFails === 1 ? '' : 's'} this week</>}
        {l.role === 'admin' && <> · admin</>}
      </p>
      {l.courses.length > 0 ? (
        <ul className="learner-courses small">
          {l.courses.map((c) => (
            <li key={c.slug}>
              <b>{c.title}</b>: {c.daysDone} day{c.daysDone === 1 ? '' : 's'} done
              {c.weeksPassed > 0 && <>, {c.weeksPassed} week quiz{c.weeksPassed === 1 ? '' : 'zes'} passed</>}
              {c.behind === null ? <span className="muted"> · no start date</span> : c.behind > 0 ? <span className="pen"> · {c.behind} behind</span> : <span> · on schedule</span>}
            </li>
          ))}
        </ul>
      ) : <p className="small muted">No finished days yet.</p>}
      <p className="small muted-2">Joined {new Date(l.joined).toLocaleDateString()} · their time zone {l.timezone}</p>
    </article>
  )
}

export function AdminPage() {
  const status = useAccountStatus()
  const [learners, setLearners] = useState<LearnerSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const admin = isAdmin(status)

  useEffect(() => { void loadSync() }, [])
  useEffect(() => {
    if (!admin) return
    let live = true
    import('../lib/admin.ts')
      .then((m) => m.loadAdminRows())
      .then((rows) => { if (live) setLearners(summarise(rows, catalog)) })
      .catch((e: Error) => { if (live) setError(e.message) })
    return () => { live = false }
  }, [admin, reload])

  if (status.state === 'off' || status.state === 'loading' || (isSignedIn(status) && status.role === null)) return <div className="page"><p className="muted">Loading…</p></div>
  if (!admin) return (
    <div className="page">
      <div className="page-head"><h1>Admin</h1></div>
      <p className="prose small">This page is for the school's admins. {isSignedIn(status) ? 'Your account is a student account.' : <>Sign in on the <a href={href.account()}>Account</a> page first.</>}</p>
    </div>
  )
  const notToday = learners?.filter((l) => !l.studiedToday).length ?? 0
  return (
    <div className="page">
      <div className="page-head">
        <h1>Learners</h1>
        {learners && <p className="small muted-2">{learners.length} account{learners.length === 1 ? '' : 's'} · {notToday} not studied today (listed first, longest gap first).</p>}
      </div>
      <div className="row"><button type="button" className="btn ghost small-btn" onClick={() => { setLearners(null); setError(null); setReload((n) => n + 1) }}>Refresh</button></div>
      {error && <p className="banner warn" role="alert">Couldn't load learners: {error}</p>}
      {!learners && !error && <p className="muted">Loading learners…</p>}
      {learners?.map((l) => <LearnerCard key={l.id} l={l} />)}
      <p className="small muted-2">Admins see progress only, not learners' daily logs, wins or job applications, and can't change anyone's data.</p>
    </div>
  )
}
