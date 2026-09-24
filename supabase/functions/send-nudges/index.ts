// Hourly job (pg_cron → this function). For each learner whose local time has
// just reached their nudge hour, sends one email through Resend:
//   Mon–Sat: a daily nudge for today's day, unless they've already studied.
//   Sunday:  the weekly review digest.
// email_events guarantees at most one email of each kind per learner per day.
//
// Secrets: RESEND_API_KEY, EMAIL_FROM, APP_URL, CRON_SECRET
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.)
// Add ?dry-run to the request to see what would be sent without sending it.

import { createClient } from 'npm:@supabase/supabase-js@2'
import coursesJson from '../_shared/courses.json' with { type: 'json' }
import type { Course } from '../_shared/src/content/types.ts'
import { currentPosition, dayKey, type Position } from '../_shared/src/domain/progress.ts'
import { addDays, localDate, streak, studyDatesFrom, weekday } from '../_shared/src/domain/streak.ts'

const courses = coursesJson as unknown as Course[]

function env(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing secret ${name}`)
  return value
}

const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'))

type Profile = { id: string; email: string; display_name: string | null; timezone: string; nudge_hour: number }
type Email = { userId: string; to: string; kind: 'daily-nudge' | 'weekly-review'; sentOn: string; subject: string; html: string }

function localHour(instant: Date, timeZone: string): number {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(instant))
}

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function describe(course: Course, position: Position): { headline: string; detail: string } {
  switch (position.kind) {
    case 'day': {
      const day = course.weeks.find((w) => w.number === position.week)?.days.find((d) => d.number === position.day)
      const blocks = day?.blocks.map((b) => `${b.title} ${b.minutes}m`).join(' · ') ?? ''
      return { headline: `Week ${position.week}, Day ${position.day}: ${day?.topic ?? ''}`, detail: `About ${day?.hours ?? 2.5} hours — ${blocks}` }
    }
    case 'quiz':
      return { headline: `Your Week ${position.week} quiz is waiting`, detail: 'Pass it to unlock the next week.' }
    case 'awaiting-content':
      return { headline: `Week ${position.week} is being written`, detail: 'Use today for review: re-read your log and redo a past mini-task from memory.' }
    case 'finished':
      return { headline: `You finished ${course.title}`, detail: 'Keep applying. Keep building.' }
  }
}

function layout(title: string, paragraphs: string[]): string {
  return `<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:24px;color:#17211e">
<h1 style="font-weight:400;font-size:24px;color:#164f3b">${title}</h1>
${paragraphs.map((p) => `<p style="font-family:'Trebuchet MS',sans-serif;font-size:15px;line-height:1.6">${p}</p>`).join('\n')}
<p><a href="${env('APP_URL')}" style="display:inline-block;background:#c7e85c;color:#164f3b;padding:12px 18px;text-decoration:none;font-family:'Trebuchet MS',sans-serif;font-weight:700">Open the school →</a></p>
<p style="font-family:'Trebuchet MS',sans-serif;font-size:12px;color:#77807a">You can turn these emails off in Settings.</p>
</div>`
}

async function buildEmail(profile: Profile, now: Date): Promise<Email | null> {
  const today = localDate(now, profile.timezone)
  const isSunday = weekday(today) === 0
  const name = profile.display_name ?? 'there'

  const [enrollments, days, quizzes] = await Promise.all([
    supabase.from('enrollments').select('course_slug').eq('user_id', profile.id).eq('status', 'active'),
    supabase.from('day_progress').select('course_slug, week, day, completed_at').eq('user_id', profile.id),
    supabase.from('quiz_attempts').select('course_slug, week').eq('user_id', profile.id).eq('passed', true),
  ])
  for (const r of [enrollments, days, quizzes]) if (r.error) throw new Error(r.error.message)

  const dates = studyDatesFrom(days.data!.map((d) => new Date(d.completed_at)), profile.timezone)
  const { current } = streak(dates, today)
  const next = enrollments.data!.flatMap(({ course_slug }) => {
    const course = courses.find((c) => c.slug === course_slug)
    if (!course) return []
    const position = currentPosition(course, {
      completedDays: new Set(days.data!.filter((d) => d.course_slug === course_slug).map((d) => dayKey(d.week, d.day))),
      passedWeeks: new Set(quizzes.data!.filter((q) => q.course_slug === course_slug).map((q) => q.week)),
    })
    return [{ course, ...describe(course, position) }]
  })
  if (!next.length) return null

  const nextLines = next.map((n) => `<strong>${escape(n.headline)}</strong><br>${escape(n.detail)}`)

  if (!isSunday) {
    if (dates.has(today)) return null // already showed up today
    const subject = current > 0 ? `Keep your ${current}-day streak alive — ${next[0].headline}` : `Today's non-negotiable — ${next[0].headline}`
    const opener = current > 0
      ? `Hi ${escape(name)}, you're on a ${current}-day streak. One focused session tonight keeps it going.`
      : `Hi ${escape(name)}, one focused session today keeps your future self in motion.`
    return { userId: profile.id, to: profile.email, kind: 'daily-nudge', sentOn: today, subject, html: layout("Today's non-negotiable", [opener, ...nextLines]) }
  }

  // Sunday: rest + weekly review.
  const weekStart = addDays(today, -6)
  const showedUp = [...dates].filter((d) => d >= weekStart && d < today).length
  const logs = await supabase
    .from('logs')
    .select('confused')
    .eq('user_id', profile.id)
    .neq('confused', '')
    .is('confusion_resolved_at', null)
    .gte('created_at', new Date(now.getTime() - 7 * 86_400_000).toISOString())
  if (logs.error) throw new Error(logs.error.message)
  const confusions = logs.data.map((l) => `<li>${escape(l.confused)}</li>`).join('')

  return {
    userId: profile.id,
    to: profile.email,
    kind: 'weekly-review',
    sentOn: today,
    subject: `Your weekly review — you showed up ${showedUp} of 6 days`,
    html: layout('Sunday: rest + weekly review', [
      `Hi ${escape(name)}, you showed up <strong>${showedUp} of 6 days</strong> this week${current > 0 ? ` and you're on a ${current}-day streak` : ''}.`,
      'Take an hour today: read your log, then plan Monday.',
      ...(confusions ? [`Things that confused you this week — worth another look:<ul>${confusions}</ul>`] : []),
      `Up next:<br>${nextLines.join('<br><br>')}`,
    ]),
  }
}

async function send(email: Email): Promise<string> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env('EMAIL_FROM'), to: email.to, subject: email.subject, html: email.html }),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(`Resend ${response.status}: ${JSON.stringify(body)}`)
  return body.id
}

Deno.serve(async (request) => {
  if (request.headers.get('authorization') !== `Bearer ${env('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const dryRun = new URL(request.url).searchParams.has('dry-run')
  const now = new Date()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, timezone, nudge_hour')
    .eq('email_nudges', true)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const results: { userId: string; kind?: string; status: string }[] = []
  for (const profile of profiles as Profile[]) {
    if (localHour(now, profile.timezone) !== profile.nudge_hour) continue
    try {
      const email = await buildEmail(profile, now)
      if (!email) {
        results.push({ userId: profile.id, status: 'nothing to send' })
        continue
      }
      if (dryRun) {
        results.push({ userId: profile.id, kind: email.kind, status: `would send: ${email.subject}` })
        continue
      }
      // Claim the (user, kind, day) slot first so overlapping runs can't double-send.
      const claim = await supabase
        .from('email_events')
        .insert({ user_id: email.userId, kind: email.kind, sent_on: email.sentOn })
        .select('id')
        .single()
      if (claim.error) {
        results.push({ userId: profile.id, kind: email.kind, status: 'already sent' })
        continue
      }
      try {
        const resendId = await send(email)
        await supabase.from('email_events').update({ resend_id: resendId }).eq('id', claim.data.id)
        results.push({ userId: profile.id, kind: email.kind, status: 'sent' })
      } catch (sendError) {
        await supabase.from('email_events').delete().eq('id', claim.data.id)
        throw sendError
      }
    } catch (e) {
      results.push({ userId: profile.id, status: `error: ${(e as Error).message}` })
    }
  }

  return Response.json({ ranAt: now.toISOString(), dryRun, results })
})
