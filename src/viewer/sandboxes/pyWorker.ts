/// <reference lib="webworker" />
/*
 * Runs learner Python with Pyodide (CPython compiled to WebAssembly) inside a
 * worker, so an infinite loop can be stopped by terminating the worker instead
 * of freezing the page. Pyodide loads from the jsDelivr CDN on first run.
 */

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/'

type PyDict = { set(key: string, value: unknown): void }

type Pyodide = {
  setStdout(options: { write: (buffer: Uint8Array) => number }): void
  setStderr(options: { write: (buffer: Uint8Array) => number }): void
  setStdin(options: { stdin: () => string | undefined }): void
  runPythonAsync(code: string, options?: { globals?: unknown }): Promise<unknown>
  globals: { get(name: string): () => PyDict }
}

export type RunRequest = { id: number; code: string; stdin: string[]; tests?: string }
export type WorkerMessage =
  | { id: number; type: 'status'; text: string }
  | { id: number; type: 'out'; text: string }
  | { id: number; type: 'err'; text: string }
  | { id: number; type: 'done'; ok: boolean; error?: string }

let pyodide: Promise<Pyodide> | null = null
const decoder = new TextDecoder()

async function load(): Promise<Pyodide> {
  const module = await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`)
  return module.loadPyodide({ indexURL: PYODIDE_URL }) as Promise<Pyodide>
}

/** Keep only the learner-relevant part of a Python traceback. */
function cleanTraceback(message: string): string {
  const lines = message.split('\n')
  const start = lines.findIndex((l) => l.includes('File "<exec>"'))
  const kept = start >= 0 ? lines.slice(start) : lines
  return kept.filter((l) => !l.includes('/lib/python') && !l.includes('_pyodide')).join('\n').trim()
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, code, stdin, tests } = event.data
  const post = (message: WorkerMessage) => self.postMessage(message)
  if (!pyodide) {
    post({ id, type: 'status', text: 'Loading Python (first run only, a few seconds)…' })
    pyodide = load()
  }
  let py: Pyodide
  try {
    py = await pyodide
  } catch {
    pyodide = null
    post({ id, type: 'done', ok: false, error: 'Could not load Python. Check your internet connection and try again.' })
    return
  }

  const lines = [...stdin]
  let printed = ''
  py.setStdout({
    write: (b) => {
      const text = decoder.decode(b)
      printed += text
      post({ id, type: 'out', text })
      return b.length
    },
  })
  py.setStderr({ write: (b) => (post({ id, type: 'err', text: decoder.decode(b) }), b.length) })
  py.setStdin({
    stdin: () => {
      const line = lines.shift()
      if (line !== undefined) post({ id, type: 'out', text: `${line}\n` }) // echo, like a terminal
      return line
    },
  })

  const globals = py.globals.get('dict')()
  try {
    await py.runPythonAsync(code, { globals })
    if (tests) {
      // Tests can inspect what the program printed and how it was written.
      globals.set('__output__', printed)
      globals.set('__code__', code)
      await py.runPythonAsync(tests, { globals })
    }
    post({ id, type: 'done', ok: true })
  } catch (error) {
    const message = cleanTraceback(String((error as Error).message ?? error))
    const friendly = /EOFError/.test(message) ? `${message}\n\n(Your program asked for more input than the Input box has. Add another line.)` : message
    post({ id, type: 'done', ok: false, error: friendly })
  }
}
