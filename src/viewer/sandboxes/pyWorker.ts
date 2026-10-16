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
  FS: { writeFile(path: string, data: Uint8Array): void }
  loadPackagesFromImports(code: string, options?: { messageCallback?: (message: string) => void; errorCallback?: (message: string) => void }): Promise<unknown>
  globals: { get(name: string): () => PyDict }
}

/** files: data files to place next to the code before it runs ({ name, url }). */
export type RunRequest = { id: number; code: string; stdin: string[]; tests?: string; files?: { name: string; url: string }[] }
export type WorkerMessage =
  | { id: number; type: 'status'; text: string }
  | { id: number; type: 'out'; text: string }
  /** A matplotlib figure the code drew, as a PNG data URL. */
  | { id: number; type: 'image'; src: string }
  | { id: number; type: 'err'; text: string }
  | { id: number; type: 'done'; ok: boolean; error?: string }

let pyodide: Promise<Pyodide> | null = null
const fileCache: Record<string, Promise<Uint8Array>> = {}
const MAX_OUTPUT = 100_000
const OUTPUT_LIMIT = 'Output limit reached (100,000 characters). Is something printing in a loop?'
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
  const { id, code, stdin, tests, files } = event.data
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
  let limitHit = false
  // Output is sent in batches (every 50 ms or 4 KB), not one message per print: thousands of tiny
  // messages would make the page re-draw the console thousands of times and feel frozen.
  let buffer = ''
  let lastFlush = Date.now()
  const flush = () => {
    if (buffer) post({ id, type: 'out', text: buffer })
    buffer = ''
    lastFlush = Date.now()
  }
  py.setStdout({
    write: (b) => {
      const text = decoder.decode(b)
      // A runaway print loop would flood the page with millions of lines: stop the program instead.
      if (printed.length + text.length > MAX_OUTPUT) {
        limitHit = true
        throw new Error(OUTPUT_LIMIT)
      }
      printed += text
      buffer += text
      if (buffer.length > 4096 || Date.now() - lastFlush > 50) flush()
      return b.length
    },
  })
  py.setStderr({ write: (b) => (flush(), post({ id, type: 'err', text: decoder.decode(b) }), b.length) })
  py.setStdin({
    stdin: () => {
      const line = lines.shift()
      flush()
      if (line !== undefined) post({ id, type: 'out', text: `${line}\n` }) // echo, like a terminal
      return line
    },
  })

  // The ML lessons import numpy, pandas, scikit-learn…: Pyodide fetches the ones the code (and
  // its checks) import, once; the offline cache keeps them after that.
  const ML = /^\s*(?:import|from)\s+(numpy|pandas|sklearn|scipy|matplotlib)\b/m
  if (ML.test(code) || (tests && ML.test(tests))) {
    post({ id, type: 'status', text: 'Loading the data-science libraries (numpy, pandas, scikit-learn: about 25 MB the first time, then saved on this device)…' })
    try {
      await py.loadPackagesFromImports(`${code}\n${tests ?? ''}`)
    } catch {
      post({ id, type: 'done', ok: false, error: "Couldn't download the data-science libraries. Check your connection (Wi-Fi is best for the first time) and run again." })
      return
    }
  }

  // Data files the lesson uses (e.g. lagos_housing.csv), downloaded once per worker and written
  // next to the code, so open() and pd.read_csv() find them like files on a real computer.
  for (const file of files ?? []) {
    try {
      fileCache[file.url] ??= fetch(file.url).then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.arrayBuffer()
      }).then((b) => new Uint8Array(b))
      py.FS.writeFile(file.name, await fileCache[file.url])
    } catch {
      delete fileCache[file.url]
      post({ id, type: 'done', ok: false, error: `Couldn't load the data file ${file.name}. Check your connection and run again.` })
      return
    }
  }
  // Charts: draw off-screen (there's no window in a worker), then send each figure as an image.
  const charts = /^\s*(?:import|from)\s+matplotlib\b/m.test(code)
  if (charts) await py.runPythonAsync('import matplotlib\nmatplotlib.use("agg")\nimport matplotlib.pyplot as _plt\n_plt.close("all")')

  const globals = py.globals.get('dict')()
  // Run as a script, so `if __name__ == "__main__":` works (a bare dict would see builtins' __name__).
  globals.set('__name__', '__main__')
  try {
    await py.runPythonAsync(code, { globals })
    if (tests) {
      // Tests can inspect what the program printed and how it was written.
      globals.set('__output__', printed)
      globals.set('__code__', code)
      await py.runPythonAsync(tests, { globals })
    }
    flush()
    if (charts) {
      const images = await py.runPythonAsync(`
import base64, io
import matplotlib.pyplot as _plt
_out = []
for _n in _plt.get_fignums():
    _buf = io.BytesIO()
    _plt.figure(_n).savefig(_buf, format="png", dpi=90, bbox_inches="tight")
    _out.append(base64.b64encode(_buf.getvalue()).decode())
_plt.close("all")
"\\n".join(_out)`)
      for (const png of String(images ?? '').split('\n').filter(Boolean)) post({ id, type: 'image', src: `data:image/png;base64,${png}` })
    }
    post({ id, type: 'done', ok: true })
  } catch (error) {
    flush()
    const raw = String((error as Error).message ?? error)
    if (limitHit) {
      post({ id, type: 'done', ok: false, error: OUTPUT_LIMIT })
      return
    }
    const message = cleanTraceback(raw)
    const friendly = /EOFError/.test(message) ? `${message}\n\n(Your program asked for more input than the Input box has. Add another line.)` : message
    post({ id, type: 'done', ok: false, error: friendly })
  }
}
