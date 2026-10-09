// Visits every course, week and day page the way a learner on a phone would, and reports:
//   - JavaScript errors on the page
//   - pages wider than the phone screen (sideways scrolling)
//   - internal links that lead to a "not here" page
//   - external links (resources, lesson links) that are dead
//
// Usage: node scripts/sweep.mjs [baseUrl] [--no-external]
//   Local: start `npx vite --port 5179`, then node scripts/sweep.mjs http://localhost:5179/
//   Live:  node scripts/sweep.mjs https://victoranimasahun.github.io/scribsandpixels-school/
import { chromium } from 'playwright-core'

const base = process.argv[2]?.startsWith('http') ? process.argv[2] : 'http://localhost:5179/scribsandpixels-school/'
const checkExternal = !process.argv.includes('--no-external')
const chrome = process.env.CHROME_PATH ?? (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome')

const browser = await chromium.launch({ executablePath: chrome })
const context = await browser.newContext({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const page = await context.newPage()
let errors = []
page.on('pageerror', (e) => errors.push(e.message))

const problems = []
const external = new Map() // url → first page it appeared on
const flag = (where, what) => problems.push(`${where}: ${what}`)

async function visit(hash) {
  errors = []
  // A fresh load each time (not just a hash change), like opening a link in a new tab.
  await page.goto('about:blank')
  await page.goto(base + hash, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('main h1, main .lock, main p', { timeout: 15000 })
  await page.waitForTimeout(150)
  const info = await page.evaluate(() => ({
    text: document.querySelector('main')?.innerText ?? '',
    h1: document.querySelector('main h1')?.textContent ?? '',
    wide: document.documentElement.scrollWidth - window.innerWidth,
    links: [...document.querySelectorAll('main a[href]')].map((a) => a.getAttribute('href')),
  }))
  if (errors.length) flag(hash, `JS error: ${errors[0]}`)
  if (info.wide > 2) {
    const culprit = await page.evaluate(() => {
      const w = window.innerWidth
      const el = [...document.querySelectorAll('main *')].find((e) => e.getBoundingClientRect().right > w + 2 && !e.closest('pre, .table-wrap, .grid-wrap, .sheet, iframe'))
      return el ? `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 60) + ` "${(el.textContent ?? '').trim().slice(0, 40)}"` : null
    })
    if (culprit) flag(hash, `wider than the phone by ${info.wide}px (${culprit})`)
  }
  if (/isn't here/.test(info.h1)) flag(hash, 'shows a not-found page')
  if (/Sandbox "[^"]+" not found/.test(info.text)) flag(hash, 'embeds a sandbox that doesn\'t exist')
  for (const href of info.links) if (href?.startsWith('http') && !external.has(href)) external.set(href, hash)
  return info
}

// Mark every day's checkpoint as passed, so the random gate never covers the page being checked.
async function passAllGates(keys) {
  await page.evaluate((keys) => {
    const raw = JSON.parse(localStorage.getItem('snp-test-state-v1') ?? '{}') || {}
    const gates = Object.fromEntries(keys.map((k) => [k, { triggeredAt: 1, attempts: [{ finishedAt: 1, passed: true, score: 1 }], seen: [] }]))
    localStorage.setItem('snp-test-state-v1', JSON.stringify({ learnerId: 'sweep', checked: {}, bestScores: {}, ...raw, gates }))
  }, keys)
}

const home = await visit('#/')
const courses = [...new Set(home.links.filter((h) => /^#\/c\/[^/]+$/.test(h)))]
let pages = 1
for (const course of courses) {
  const slug = course.split('/')[2]
  const coursePage = await visit(course)
  pages++
  const weeks = [...new Set(coursePage.links.filter((h) => /^#\/c\/[^/]+\/w\/\d+$/.test(h)))]
  const dayLinks = []
  for (const week of weeks) {
    const info = await visit(week)
    pages++
    for (const h of info.links) if (/\/w\/\d+\/d\/\d+$/.test(h) && !dayLinks.includes(h)) dayLinks.push(h)
  }
  await passAllGates(dayLinks.map((h) => { const [, , s, , w, , d] = h.split('/'); return `${s}:${w}:${d}` }))
  for (const day of dayLinks) {
    const info = await visit(day)
    pages++
    for (const href of info.links.filter((h) => h?.startsWith('#/') && !dayLinks.includes(h) && !weeks.includes(h) && h !== course && h !== '#/')) {
      if (/\/s\//.test(href)) continue
      flag(day, `links to ${href}, which isn't a known page`)
    }
  }
  console.log(`· ${slug}: ${weeks.length} weeks, ${dayLinks.length} days`)
}

let dead = []
if (checkExternal) {
  const results = await Promise.all([...external].map(async ([url, where]) => {
    for (const method of ['HEAD', 'GET']) {
      try {
        const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 (Macintosh) link-check' } })
        if (r.ok) return null
        if (method === 'GET') return { url, where, status: r.status }
      } catch (e) {
        if (method === 'GET') return { url, where, status: e.name === 'TimeoutError' ? 'timeout' : 'unreachable' }
      }
    }
    return null
  }))
  dead = results.filter(Boolean)
}

await browser.close()
console.log(`\nChecked ${pages} pages and ${external.size} external links.`)
for (const p of problems) console.log(`✗ ${p}`)
// Many sites refuse robots (403/429) or can't be reached from this network right now, but work in a
// browser: listed separately as "?", check by hand. Only clear answers (404, 410, 5xx…) count as dead.
const blocked = dead.filter((d) => [401, 403, 405, 429, 999, 'timeout', 'unreachable'].includes(d.status))
for (const d of dead.filter((d) => !blocked.includes(d))) console.log(`✗ dead link ${d.status}: ${d.url} (on ${d.where})`)
for (const d of blocked) console.log(`? couldn't confirm (${d.status}): ${d.url} (on ${d.where})`)
const failures = problems.length + dead.length - blocked.length
console.log(failures ? `\n${failures} problem(s)` : '\nNo problems found')
process.exit(failures ? 1 : 0)
