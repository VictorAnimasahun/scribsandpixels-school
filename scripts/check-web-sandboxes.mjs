// Runs every web sandbox task in a real browser (headless Chrome), twice:
//  1. the reference solution must PASS every task;
//  2. the untouched starter must FAIL at least one task (no free passes).
// Solutions live in scripts/web-solutions/<id>.json ({ html?, css?, js? }; missing parts = the starter's) so they never ship to the browser.
// The page is built exactly like the preview in src/viewer/sandboxes/WebSandbox.tsx.
import { parse } from 'yaml'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { transform } from 'sucrase'

const root = new URL('..', import.meta.url).pathname
const chrome = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p))
if (!chrome) {
  console.log('No Chrome found; set CHROME_PATH')
  process.exit(1)
}

const browser = await chromium.launch({ executablePath: chrome })
let failures = 0
// Same console.log capture as the app's bridge (WebSandbox.tsx), so checks can read window.__logs.
const logCapture = `<script>window.__logs = []; window.__errors = []; (() => { const t = (a) => a.map((x) => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' '); const o = console.log; console.log = (...a) => { window.__logs.push(t(a)); o.apply(console, a) }; const e = console.error; console.error = (...a) => { window.__errors.push(t(a)); e.apply(console, a) } })()</script>`

// React sandboxes: mirrors src/viewer/sandboxes/reactPage.ts (JSX + imports compiled with Sucrase, React 18 from cdnjs).
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs'
const REACT_SCRIPTS = `<script src="${CDN}/react/18.3.1/umd/react.development.js"></script><script src="${CDN}/react-dom/18.3.1/umd/react-dom.development.js"></script>`
const MODULE_SHIM = `var exports = {}, module = { exports: exports };
function require(name) {
  if (name === 'react') return React;
  if (name === 'react-dom' || name === 'react-dom/client') return ReactDOM;
  throw new Error('Only "react" and "react-dom/client" can be imported here (got "' + name + '")');
}
`
const compileReact = (source) => {
  try {
    return MODULE_SHIM + transform(source, { transforms: ['jsx', 'imports'], jsxRuntime: 'classic', production: false }).code
  } catch (error) {
    return `console.error(${JSON.stringify(`JSX error: ${error.message}`)})`
  }
}

const run = async (files, checks) => {
  const js = files.react ? compileReact(files.js ?? '') : files.js ?? ''
  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>${files.css ?? ''}</style>${logCapture}${files.react ? REACT_SCRIPTS : ''}</head><body>${files.html ?? ''}<script>${js}</script></body></html>`
  // A fresh tab per run: document replacement keeps JS globals, so reusing a tab would leak
  // the solution's functions into the starter's run.
  const page = await browser.newPage()
  await page.setContent(doc, { waitUntil: 'load' })
  // Same settling as the in-app checker: fonts, then two frames.
  await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))))
  // Same as the app: one check at a time, async checks awaited (5 s limit each).
  const results = await page.evaluate(async (checks) => {
    const out = []
    for (const src of checks) {
      try {
        const value = (0, eval)('(' + src + ')')
        out.push(!!(await Promise.race([value, new Promise((r) => setTimeout(() => r(false), 5000))])))
      } catch { out.push(false) }
    }
    return out
  }, checks)
  await page.close()
  return results
}

for (const course of readdirSync(join(root, 'src/content/courses'))) {
  const dir = join(root, 'src/content/courses', course, 'sandboxes')
  if (!existsSync(dir)) continue
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.yaml'))) {
    const sandbox = parse(readFileSync(join(dir, file), 'utf8'))
    if (sandbox.kind !== 'web' || !sandbox.tasks?.length) continue
    const solutionFile = join(root, 'scripts/web-solutions', `${sandbox.id}.json`)
    if (!existsSync(solutionFile)) {
      console.log(`✗ ${sandbox.id}: no reference solution`)
      failures++
      continue
    }
    const checks = sandbox.tasks.map((t) => t.check)
    const solved = await run({ ...sandbox, ...JSON.parse(readFileSync(solutionFile, "utf8")) }, checks)
    const starter = await run(sandbox, checks)
    const bad = sandbox.tasks.filter((_, i) => !solved[i])
    for (const t of bad) console.log(`✗ ${sandbox.id}: solution fails "${t.prompt}"`)
    const starterFailsSomething = starter.some((ok) => !ok)
    if (!starterFailsSomething) console.log(`✗ ${sandbox.id}: the starter already passes every task`)
    failures += bad.length + (starterFailsSomething ? 0 : 1)
    if (!bad.length && starterFailsSomething) console.log(`✓ ${sandbox.id} (${sandbox.tasks.length} tasks)`)
  }
}
await browser.close()
if (failures) {
  console.log(`\n${failures} problem(s)`)
  process.exit(1)
}
