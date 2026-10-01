import { useEffect, useMemo, useState } from 'react'
import type { Sandbox } from '../../content/sandboxes.ts'
import { CodeEditor } from './shared.tsx'
import { loadSaved, save } from './storage.ts'

type Props = { sandbox: Extract<Sandbox, { kind: 'web' }> }
type Tab = 'html' | 'css' | 'js'

/** console.log from the page is forwarded to the parent so learners can see it. */
const bridge = `<script>
  (function () {
    const send = (level, args) => parent.postMessage({ snpConsole: true, level, text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
    ['log', 'warn', 'error'].forEach(level => { const orig = console[level]; console[level] = (...a) => { send(level, a); orig.apply(console, a); }; });
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

  const page = (extra = '') =>
    `<!doctype html><html><head><meta charset="utf-8"><style>${files.css}</style>${bridge}</head><body>${files.html}<script>${files.js}</script>${extra}</body></html>`

  const render = () => {
    setLogs([])
    setDoc(page())
  }

  /** Re-render with a checker script that evaluates each task inside the page and reports back. */
  const check = () => {
    setLogs([])
    setResults(null)
    const checker = `<script>
      window.addEventListener('load', () => setTimeout(() => {
        const checks = ${JSON.stringify(tasks.map((t) => t.check)).replace(/</g, '\\u003c')};
        const results = checks.map((src) => { try { return !!(0, eval)('(' + src + ')'); } catch (e) { return false; } });
        parent.postMessage({ snpChecks: results }, '*');
      }, 60));
    </script>`
    setDoc(page(checker))
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
      <iframe className="preview" title="Preview" sandbox="allow-scripts allow-modals" srcDoc={doc} />
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
