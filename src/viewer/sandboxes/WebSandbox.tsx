import { useEffect, useMemo, useRef, useState } from 'react'
import type { Sandbox } from '../../content/sandboxes.ts'
import { CodeEditor } from './shared.tsx'
import { loadSaved, save } from './storage.ts'

type Props = { sandbox: Extract<Sandbox, { kind: 'web' }> }
type Tab = 'html' | 'css' | 'js'

/** console.log from the page is forwarded to the parent so learners can see it, and kept in
 *  window.__logs so task checks can test printed output (scripts/check-web-sandboxes.mjs mirrors this). */
const bridge = `<script>
  (function () {
    window.__logs = [];
    const text = (args) => args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    const send = (level, args) => parent.postMessage({ snpConsole: true, level, text: text(args) }, '*');
    ['log', 'warn', 'error'].forEach(level => { const orig = console[level]; console[level] = (...a) => { if (level === 'log') window.__logs.push(text(a)); send(level, a); orig.apply(console, a); }; });
    window.addEventListener('error', e => send('error', [e.message + ' (line ' + e.lineno + ')']));
  })();
</script>`

export default function WebSandbox({ sandbox }: Props) {
  const key = `web:${sandbox.id}`
  const initial = useMemo(() => {
    const saved = loadSaved(key)
    return saved ? (JSON.parse(saved) as Record<Tab, string>) : { html: sandbox.html ?? '', css: sandbox.css ?? '', js: sandbox.js ?? '' }
  }, [key, sandbox])
  const [files, setFiles] = useState(initial)
  const [tab, setTab] = useState<Tab>('html')
  const [doc, setDoc] = useState('')
  const [logs, setLogs] = useState<{ level: string; text: string }[]>([])
  const [results, setResults] = useState<boolean[] | null>(null)
  const tasks = sandbox.tasks ?? []
  const previewRef = useRef<HTMLIFrameElement>(null)

  const page = (extra = '') =>
    `<!doctype html><html><head><meta charset="utf-8"><style>${files.css}</style>${bridge}</head><body>${files.html}<script>${files.js}</script>${extra}</body></html>`

  // Every Run/Check mounts a fresh iframe (keyed by this counter). Reusing one failed twice over:
  // an identical srcDoc doesn't reload (Run/Check pressed twice showed nothing), and Chrome
  // sometimes never lays out a reused sandboxed frame after its srcDoc changes (layout checks failed).
  const [run, setRun] = useState(0)

  const render = () => {
    setLogs([])
    setRun((n) => n + 1)
    setDoc(page())
  }

  /** Re-render with a checker script that evaluates each task inside the page and reports back. */
  const check = () => {
    setLogs([])
    setResults(null)
    const checker = `<script>
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
      const run = () => {
        const checks = ${JSON.stringify(tasks.map((t) => t.check)).replace(/</g, '\\u003c')};
        const results = checks.map((src) => { try { return !!(0, eval)('(' + src + ')'); } catch (e) { return false; } });
        parent.postMessage({ snpChecks: results }, '*');
      };
      window.addEventListener('load', () => (document.fonts ? document.fonts.ready : Promise.resolve())
        .then(() => settle(run)));
    </script>`
    setRun((n) => n + 1)
    setDoc(page(checker))
    // Off-screen frames may not be laid out, so bring the preview into view while it's checked.
    previewRef.current?.scrollIntoView({ block: 'nearest' })
  }

  useEffect(() => save(key, JSON.stringify(files)), [key, files])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(render, [])
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
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
