import { useEffect, useMemo, useRef, useState } from 'react'
import type { Sandbox } from '../../content/sandboxes.ts'
import { CodeEditor } from './shared.tsx'
import { loadSaved, remove, save } from './storage.ts'

type Props = { sandbox: Extract<Sandbox, { kind: 'web' }> }
type Tab = 'html' | 'css' | 'js'

/** console.log from the page is forwarded to the parent so learners can see it, and kept in
 *  window.__logs (console.error in window.__errors) so task checks can test printed output (scripts/check-web-sandboxes.mjs mirrors this). */
const bridge = `<script>
  (function () {
    window.__logs = []; window.__errors = [];
    const text = (args) => args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    const send = (level, args) => parent.postMessage({ snpConsole: true, level, text: text(args) }, '*');
    ['log', 'warn', 'error'].forEach(level => { const orig = console[level]; console[level] = (...a) => { if (level === 'log') window.__logs.push(text(a)); if (level === 'error') window.__errors.push(text(a)); send(level, a); orig.apply(console, a); }; });
    window.addEventListener('error', e => send('error', [e.message + ' (line ' + e.lineno + ')']));
  })();
</script>`

export default function WebSandbox({ sandbox }: Props) {
  const key = `web:${sandbox.id}`
  const initial = useMemo(() => {
    const starter = { html: sandbox.html ?? '', css: sandbox.css ?? '', js: sandbox.js ?? '' }
    try {
      const saved = JSON.parse(loadSaved(key) ?? 'null') as Partial<Record<Tab, unknown>> | null
      if (saved && typeof saved === 'object') {
        return { html: typeof saved.html === 'string' ? saved.html : starter.html, css: typeof saved.css === 'string' ? saved.css : starter.css, js: typeof saved.js === 'string' ? saved.js : starter.js }
      }
    } catch {
      // unreadable save: start from the starter files
    }
    return starter
  }, [key, sandbox])
  // Set while a run is starting, cleared when the page has finished running its scripts. If it's
  // still set when the sandbox opens, the last run never finished (an infinite loop froze the tab),
  // so the saved code isn't run again automatically: otherwise the lesson page would freeze on every visit.
  const runningKey = `${key}:running`
  const [frozeLastTime] = useState(() => loadSaved(runningKey) !== null)
  const [files, setFiles] = useState(initial)
  const [tab, setTab] = useState<Tab>('html')
  const [doc, setDoc] = useState('')
  const [logs, setLogs] = useState<{ level: string; text: string }[]>([])
  const [results, setResults] = useState<boolean[] | null>(null)
  const tasks = sandbox.tasks ?? []
  const previewRef = useRef<HTMLIFrameElement>(null)

  // React sandboxes compile JSX first; the compiler is downloaded only for them.
  const page = async (extra = '') => {
    const react = sandbox.react ? await import('./reactPage.ts') : null
    const js = react ? react.compileReact(files.js) : files.js
    return `<!doctype html><html><head><meta charset="utf-8"><style>${files.css}</style>${bridge}${react ? react.REACT_SCRIPTS : ''}</head><body>${files.html}<script>${js}</script><script>parent.postMessage({ snpRan: true }, '*')</script>${extra}</body></html>`
  }

  // Every Run/Check mounts a fresh iframe (keyed by this counter). Reusing one failed twice over:
  // an identical srcDoc doesn't reload (Run/Check pressed twice showed nothing), and Chrome
  // sometimes never lays out a reused sandboxed frame after its srcDoc changes (layout checks failed).
  const [run, setRun] = useState(0)

  const render = () => {
    save(runningKey, String(Date.now()))
    setLogs([])
    void page().then((html) => {
      setRun((n) => n + 1)
      setDoc(html)
    })
  }

  /** Re-render with a checker script that evaluates each task inside the page and reports back. */
  const check = () => {
    setLogs([])
    setResults(null)
    const checker = `<script>
      // A form submit nobody prevented would reload the page and lose the checks: stop it, and record
      // it so a task can still require preventDefault (window.__formReloaded).
      window.__formReloaded = false;
      window.addEventListener('submit', (e) => { if (!e.defaultPrevented) { e.preventDefault(); window.__formReloaded = true } });
      // Layout checks measure positions: wait for fonts, then until the page's size has stopped
      // changing (3 identical readings 25 ms apart, at most ~1 s). Timers, not requestAnimationFrame,
      // because browsers may pause animation frames in off-screen iframes.
      const settle = (done) => {
        let last = '', same = 0, tries = 0;
        const tick = () => {
          // Off-screen frames can report a window size while their content is still unlaid-out
          // (every box 0×0), so wait for the body itself to have a size.
          const body = document.body.getBoundingClientRect();
          const size = innerWidth + 'x' + innerHeight + ':' + Math.round(body.width) + 'x' + Math.round(body.height);
          same = size === last && body.width > 0 ? same + 1 : 0;
          last = size;
          if (same >= 3 || ++tries > 120) done(); else setTimeout(tick, 25);
        };
        tick();
      };
      // Checks run one at a time, in order; a check may be async (it returns a Promise), and
      // each gets up to 5 s so a stuck await can't hang the others.
      const run = async () => {
        const checks = ${JSON.stringify(tasks.map((t) => t.check)).replace(/</g, '\\u003c')};
        const results = [];
        for (const src of checks) {
          try {
            const value = (0, eval)('(' + src + ')');
            results.push(!!(await Promise.race([value, new Promise((r) => setTimeout(() => r(false), 5000))])));
          } catch (e) { results.push(false); }
        }
        parent.postMessage({ snpChecks: results }, '*');
      };
      window.addEventListener('load', () => (document.fonts ? document.fonts.ready : Promise.resolve())
        .then(() => settle(run)));
    </script>`
    save(runningKey, String(Date.now()))
    void page(checker).then((html) => {
      setRun((n) => n + 1)
      setDoc(html)
    })
    // Off-screen frames may not be laid out, so bring the preview into view while it's checked.
    previewRef.current?.scrollIntoView({ block: 'nearest' })
  }

  useEffect(() => save(key, JSON.stringify(files)), [key, files])
  useEffect(() => {
    if (!frozeLastTime) render()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Only this sandbox's own preview: a page can hold two sandboxes, and their messages must not mix.
      if (!previewRef.current || e.source !== previewRef.current.contentWindow) return
      if (e.data?.snpRan) remove(runningKey)
      if (e.data?.snpConsole) setLogs((l) => [...l, { level: e.data.level, text: e.data.text }])
      if (Array.isArray(e.data?.snpChecks)) setResults(e.data.snpChecks as boolean[])
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="sandbox web">
      <div className="tabs">
        {(['html', 'css', 'js'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t.toUpperCase()}</button>
        ))}
        <button className="primary" onClick={render}>▶ Run</button>
        {tasks.length > 0 && <button onClick={check}>✓ Check tasks</button>}
        <button onClick={() => { if (confirm('Reset all three files?')) setFiles({ html: sandbox.html ?? '', css: sandbox.css ?? '', js: sandbox.js ?? '' }) }}>Reset</button>
      </div>
      {frozeLastTime && run === 0 && (
        <p className="fail-detail small">⚠ Your last run didn't finish, maybe an infinite loop (a <code>while</code> or <code>for</code> that never stops). Your code is kept but wasn't run. Fix the loop, then press ▶ Run.</p>
      )}
      <CodeEditor key={tab} value={files[tab]} onChange={(v) => setFiles((f) => ({ ...f, [tab]: v }))} onRun={render} language={tab} rows={10} />
      {/* allow-forms: without it Chrome blocks form submission, so submit handlers never run */}
      <iframe key={run} ref={previewRef} className="preview" title="Preview" sandbox="allow-scripts allow-modals allow-forms" srcDoc={doc} />
      <pre className="console small">{logs.length ? logs.map((l) => `${l.level === 'log' ? '›' : l.level === 'warn' ? '⚠' : '✖'} ${l.text}`).join('\n') : 'console.log output appears here.'}</pre>
      {tasks.length > 0 && (
        <>
          {results && <p className="muted small">{results.filter(Boolean).length} / {tasks.length} tasks done</p>}
          <ol className="tasks">
            {tasks.map((t, i) => (
              <li key={i} className={results ? (results[i] ? 'pass' : 'fail') : ''}>
                <span>{results ? (results[i] ? '✅' : '❌') : '⬜'} {t.prompt}</span>
                {t.hint && results && !results[i] && <details><summary>💡 Hint</summary>{t.hint}</details>}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}
