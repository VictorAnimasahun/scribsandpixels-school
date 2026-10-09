import { marked } from 'marked'
import { useMemo } from 'react'
import { SANDBOX_EMBED } from '../content/sandboxes.ts'
import { foldAnswers } from './foldAnswers.ts'
import { SandboxHost } from './sandboxes/SandboxHost.tsx'
import type { LedgerWeek } from './today.ts'

// ─── Icons (inline stroke SVG, sized by the caller) ──────────────────────

const paths = {
  today: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
  course: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  back: <path d="m15 18-6-6 6-6" />,
  next: <path d="m9 18 6-6-6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  puzzle: <><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>,
  play: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="m10 9 5 3-5 3z" /></>,
  book: <><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z" /><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" /></>,
  code: <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />,
  table: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v16" /></>,
  clock: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3" /></>,
  timer: <><path d="M10 2h4M12 14l3-3" /><circle cx="12" cy="14" r="8" /></>,
  note: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m4 13 5 5L20 6" />,
} as const

export type IconName = keyof typeof paths


export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

/** The margin tick: an empty box, or a red pen tick once done. */
export function MarginTick({ done, label, onToggle, current }: { done: boolean; label: string; onToggle: () => void; current?: boolean }) {
  return (
    <button type="button" className={`tick ${done ? 'on' : ''} ${current ? 'current' : ''}`} aria-pressed={done} aria-label={`${label}: ${done ? 'done' : 'not done'}`} onClick={onToggle}>
      {done ? <Icon name="check" size={22} /> : <span className="tick-box" />}
    </button>
  )
}

// ─── The ledger: one square per study day ────────────────────────────────

export function LedgerStrip({ weeks, label }: { weeks: LedgerWeek[]; label: string }) {
  return (
    <div className="ledger" role="img" aria-label={label}>
      {weeks.map((w) => (
        <div key={w.number} className={`ledger-week ${w.phaseStart ? 'phase-start' : ''}`}>
          {w.days.map((d, i) => <span key={i} className={`px ${d}`} />)}
        </div>
      ))}
    </div>
  )
}

// ─── Markdown, with `::sandbox <id>` lines turned into live sandboxes ─────

export function Html({ text }: { text: string }) {
  const html = useMemo(() => (marked.parse(text, { async: false }) as string)
    .replace(/<a href=/g, '<a target="_blank" rel="noreferrer" href=')
    .replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>'), [text])
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />
}

export function Markdown({ text }: { text: string }) {
  const parts: ({ md: string } | { sandbox: string })[] = []
  let buffer: string[] = []
  for (const line of foldAnswers(text).split('\n')) {
    const m = line.match(SANDBOX_EMBED)
    if (m) {
      parts.push({ md: buffer.join('\n') }, { sandbox: m[1] })
      buffer = []
    } else buffer.push(line)
  }
  parts.push({ md: buffer.join('\n') })
  return <>{parts.map((p, i) => ('sandbox' in p ? <SandboxHost key={i} id={p.sandbox} compact /> : p.md.trim() ? <Html key={i} text={p.md} /> : null))}</>
}
