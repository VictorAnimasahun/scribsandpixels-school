import { useEffect, useRef, useState } from 'react'
import type { PythonTask, Sandbox } from '../../content/sandboxes.ts'
import type { RunRequest, WorkerMessage } from './pyWorker.ts'
import { CodeEditor } from './shared.tsx'
import { loadSaved, save } from './storage.ts'

type Props = { sandbox: Extract<Sandbox, { kind: 'python' }> }
type RunResult = { ok: boolean; output: string; error?: string }

const TASK_TIMEOUT_MS = 10_000

/** One worker per sandbox; recreated after Stop (terminate kills infinite loops). */
function useRunner() {
  const worker = useRef<Worker | null>(null)
  const nextId = useRef(1)
  const make = () => new Worker(new URL('./pyWorker.ts', import.meta.url), { type: 'module' })
  useEffect(() => () => worker.current?.terminate(), [])

  const run = (code: string, stdin: string[], onChunk: (m: WorkerMessage) => void, tests?: string) =>
    new Promise<RunResult>((resolve) => {
      worker.current ??= make()
      const id = nextId.current++
      let output = ''
      const onTimeout = () => {
        stop()
        resolve({ ok: false, output, error: 'Stopped after 10 seconds. Is there an infinite loop?' })
      }
      let timer = setTimeout(onTimeout, TASK_TIMEOUT_MS)
      const listener = (event: MessageEvent<WorkerMessage>) => {
        const m = event.data
        if (m.id !== id) return
        onChunk(m)
        if (m.type === 'out' || m.type === 'err') output += m.text
        if (m.type === 'status') {
          // Loading Python the first time doesn't count against the run's time limit.
          clearTimeout(timer)
          timer = setTimeout(onTimeout, TASK_TIMEOUT_MS + 60_000)
        }
        if (m.type === 'done') {
          clearTimeout(timer)
          worker.current?.removeEventListener('message', listener)
          resolve({ ok: m.ok, output, error: m.error })
        }
      }
      worker.current.addEventListener('message', listener)
      worker.current.postMessage({ id, code, stdin, tests } satisfies RunRequest)
    })

  const stop = () => {
    worker.current?.terminate()
    worker.current = null
  }
  return { run, stop }
}

function taskPassed(task: PythonTask, result: RunResult) {
  return result.ok && (task.expectOutput ?? []).every((line) => result.output.includes(line))
}

export default function PythonSandbox({ sandbox }: Props) {
  const storageKey = `py:${sandbox.id}`
  const [code, setCode] = useState(() => loadSaved(storageKey) ?? sandbox.starter ?? '')
  const [stdin, setStdin] = useState('')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [taskState, setTaskState] = useState<Record<number, { passed: boolean; detail: string }>>({})
  const { run, stop } = useRunner()

  useEffect(() => save(storageKey, code), [storageKey, code])

  const runCode = async () => {
    setRunning(true)
    setOutput('')
    const result = await run(code, stdin.split('\n').filter((l, i, all) => l !== '' || i < all.length - 1), (m) => {
      if (m.type === 'out' || m.type === 'err' || m.type === 'status') setOutput((o) => o + (m.type === 'status' ? `⏳ ${m.text}\n` : m.text))
    })
    if (!result.ok && result.error) setOutput((o) => `${o}\n❌ ${result.error}`)
    setRunning(false)
  }

  const checkTasks = async () => {
    setRunning(true)
    for (const [i, task] of (sandbox.tasks ?? []).entries()) {
      const result = await run(code, task.stdin ?? [], () => {}, task.tests)
      const passed = taskPassed(task, result)
      const missing = (task.expectOutput ?? []).filter((line) => !result.output.includes(line))
      setTaskState((s) => ({
        ...s,
        [i]: { passed, detail: passed ? '' : result.error ?? (missing.length ? `Output is missing: ${missing.map((l) => `"${l}"`).join(', ')}` : 'Not yet.') },
      }))
    }
    setRunning(false)
  }

  return (
    <div className="sandbox python">
      <CodeEditor value={code} onChange={setCode} onRun={runCode} language="python" />
      <div className="sandbox-row">
        <button className="primary" onClick={runCode} disabled={running}>▶ Run</button>
        {running && <button onClick={() => { stop(); setRunning(false); setOutput((o) => `${o}\n■ Stopped.`) }}>■ Stop</button>}
        {sandbox.tasks?.length ? <button onClick={checkTasks} disabled={running}>✓ Check tasks</button> : null}
        <button onClick={() => { if (confirm('Reset to the starter code?')) setCode(sandbox.starter ?? '') }}>Reset</button>
      </div>
      <label className="small muted">Input (one line per input() call)</label>
      <textarea className="stdin" rows={2} value={stdin} onChange={(e) => setStdin(e.target.value)} placeholder="e.g. Ada" />
      <pre className="console" aria-live="polite">{output || 'Output appears here.'}</pre>
      {sandbox.tasks?.length ? (
        <ol className="tasks">
          {sandbox.tasks.map((task, i) => (
            <li key={i} className={taskState[i] ? (taskState[i].passed ? 'pass' : 'fail') : ''}>
              <span>{taskState[i]?.passed ? '✅' : taskState[i] ? '❌' : '⬜'} {task.prompt}</span>
              {task.stdin && <small className="muted">Input used: {task.stdin.join(' ⏎ ')}</small>}
              {taskState[i] && !taskState[i].passed && <small className="fail-detail">{taskState[i].detail}</small>}
              {task.hint && taskState[i] && !taskState[i].passed && <details><summary>💡 Hint</summary>{task.hint}</details>}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
