// Runs every web sandbox task in a real browser (headless Chrome), twice:
//  1. the reference solution must PASS every task;
//  2. the untouched starter must FAIL at least one task (no free passes).
// Solutions live in scripts/web-solutions/<id>.json ({ html?, css?, js? }; missing parts = the starter's) so they never ship to the browser.
// The page is built exactly like the preview in src/viewer/sandboxes/WebSandbox.tsx.
import { parse } from 'yaml'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

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
const logCapture = `<script>window.__logs = []; (() => { const o = console.log; console.log = (...a) => { window.__logs.push(a.map((x) => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')); o.apply(console, a) } })()</script>`

const run = async (files, checks) => {
  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>${files.css ?? ''}</style>${logCapture}</head><body>${files.html ?? ''}<script>${files.js ?? ''}</script></body></html>`
  // A fresh tab per run: document replacement keeps JS globals, so reusing a tab would leak
  // the solution's functions into the starter's run.
  const page = await browser.newPage()
  await page.setContent(doc, { waitUntil: 'load' })
  // Same settling as the in-app checker: fonts, then two frames.
  await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))))
  const results = await page.evaluate((checks) => checks.map((src) => {
    try { return !!(0, eval)('(' + src + ')') } catch { return false }
  }), checks)
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
