// Proves the installable app works offline: builds the school, serves the build, lets Chrome
// visit it once (so the service worker saves what it needs), cuts the network, and checks the
// app, lessons and a Python sandbox still work. Also checks the install manifest and icons.
//
// Usage: npm run check:offline
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import net from 'node:net'
import { chromium } from 'playwright-core'
import { build, preview } from 'vite'

const root = new URL('..', import.meta.url).pathname
const outDir = join(root, 'node_modules/.cache/offline-dist')
const freePort = () => new Promise((resolve) => {
  const probe = net.createServer().listen(0, '127.0.0.1', () => { const { port } = probe.address(); probe.close(() => resolve(port)) })
})

// A production build, like the one users get (accounts off: this check is about offline).
delete process.env.VITE_SUPABASE_URL
delete process.env.VITE_SUPABASE_KEY
await build({ root, logLevel: 'error', build: { outDir, emptyOutDir: true }, envDir: '/nonexistent' })
const port = await freePort()
// `stall` makes the server sit on page requests for 20 s, like a stalled mobile connection. It's
// done in the server because requests made by the service worker itself aren't routable from
// the test browser.
let stall = false
const stallPages = {
  name: 'stall-pages',
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (stall && (req.url === '/' || req.url.startsWith('/?') || req.url === '/index.html')) setTimeout(next, 20_000)
      else next()
    })
  },
}
const server = await preview({ root, logLevel: 'error', plugins: [stallPages], build: { outDir }, preview: { port, strictPort: true, host: '127.0.0.1' } })
const APP = `http://127.0.0.1:${port}/`

const chrome = process.env.CHROME_PATH ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(existsSync)
const browser = await chromium.launch({ executablePath: chrome, headless: !process.env.HEADED })
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

let failures = 0
async function check(name, fn) {
  try { await fn(); console.log(`✓ ${name}`) } catch (e) { failures++; console.log(`✗ ${name}\n    ${e.message.split('\n').slice(0, 3).join('\n    ')}`) }
}
const expect = (cond, message) => { if (!cond) throw new Error(message) }

await check('the install manifest and every icon load', async () => {
  const manifest = await (await fetch(`${APP}manifest.webmanifest`)).json()
  expect(manifest.display === 'standalone' && manifest.start_url && manifest.icons.length >= 3, 'manifest incomplete')
  expect(manifest.icons.some((i) => i.purpose === 'maskable') && manifest.icons.some((i) => i.sizes === '512x512'), 'needs a 512px and a maskable icon')
  for (const icon of manifest.icons) {
    const res = await fetch(new URL(icon.src, `${APP}manifest.webmanifest`))
    expect(res.ok && res.headers.get('content-type')?.includes('image/png'), `${icon.src}: ${res.status}`)
  }
  const html = await (await fetch(APP)).text()
  for (const needle of ['rel="manifest"', 'rel="apple-touch-icon"', 'name="theme-color"']) expect(html.includes(needle), `index.html lacks ${needle}`)
})

await check('the service worker installs and takes control', async () => {
  await page.goto(APP)
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null, null, { timeout: 15_000 })
})

// One online visit: Today, a lesson, a week page (loads its quiz bank) and a Python sandbox.
const PY = '#/c/fullstack-ml/s/py-main'
await check('online: lessons and a Python sandbox load', async () => {
  await page.goto(`${APP}#/c/fullstack-ml/w/1/d/1`)
  await page.locator('main h1').first().waitFor()
  await page.goto(`${APP}#/c/fullstack-ml/w/1`)
  await page.getByText('Week 1 quiz').waitFor({ timeout: 15_000 })
  await page.goto(`${APP}${PY}`)
  // The first run downloads Pyodide (about 10 MB); the editor waits for it.
  await page.locator('.sandbox textarea').first().fill('print(6 * 7)', { timeout: 180_000 })
  await page.getByRole('button', { name: /Run/ }).first().click()
  await page.locator('.sandbox').getByText('42').first().waitFor({ timeout: 120_000 })
})

await check('a stalled connection shows the saved app within a few seconds (not a blank screen)', async () => {
  // The page request hangs for 20 s (a stalled mobile connection); the service worker must give
  // up waiting after 4 s and show the saved copy.
  // Leave the app first: going to the same address with only a different #… is a jump inside the
  // page, not a page load, and would never reach the network.
  await page.goto('about:blank')
  stall = true
  try {
    const t = Date.now()
    await page.goto(`${APP}#/c/fullstack-ml/w/1/d/1`, { waitUntil: 'commit', timeout: 30_000 })
    await page.locator('main h1').first().waitFor({ timeout: 10_000 })
    const ms = Date.now() - t
    expect(ms < 8_000, `took ${ms} ms`)
  } finally {
    stall = false
  }
})

await context.setOffline(true)

await check('offline: the app opens', async () => {
  await page.goto(APP)
  await page.locator('main h1').first().waitFor({ timeout: 10_000 })
})
await check('offline: a lesson visited before opens', async () => {
  await page.goto(`${APP}#/c/fullstack-ml/w/1/d/1`)
  await page.locator('main h1').first().waitFor({ timeout: 10_000 })
  expect((await page.locator('main').innerText()).length > 200, 'the lesson is empty')
})
await check('offline: lessons never opened before still open (they ship with the app)', async () => {
  await page.goto(`${APP}#/c/french/w/12/d/3`)
  await page.locator('main h1').first().waitFor({ timeout: 10_000 })
  expect((await page.locator('main').innerText()).length > 200, 'the lesson is empty')
})
await check('offline: a week quiz opened before still loads', async () => {
  await page.goto(`${APP}#/c/fullstack-ml/w/1`)
  await page.getByText('Week 1 quiz').waitFor({ timeout: 10_000 })
})
await check('offline: Python runs (Pyodide was saved on first use)', async () => {
  await page.goto(`${APP}${PY}`)
  await page.reload()
  await page.locator('.sandbox textarea').first().fill('print(sum(range(10)))')
  await page.getByRole('button', { name: /Run/ }).first().click()
  await page.locator('.sandbox').getByText('45').first().waitFor({ timeout: 60_000 })
})
await check('no JavaScript errors', async () => { expect(!errors.length, errors.slice(0, 3).join('\n')) })

console.log(failures ? `\n${failures} offline check(s) failing` : '\nAll offline checks pass')
await browser.close()
await new Promise((r) => server.httpServer.close(r))
process.exit(failures ? 1 : 0)
