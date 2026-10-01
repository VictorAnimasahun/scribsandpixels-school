// End-to-end test of EVERY sandbox in the real app, the way a learner uses it:
//  - python: type the reference solution into the editor, press "✓ Check tasks", expect every task ✅
//  - web:    fill the HTML/CSS/JS tabs from the reference solution, press "✓ Check tasks" (twice), expect all done
//  - sheet:  type each task's model formula into the grid via the formula bar, expect every task ✅
//  - phrases: play every challenge by tapping tiles, expect "✅ Correct!"
// Also fails on any uncaught page error.
//
// Usage: node scripts/e2e-sandboxes.mjs [baseUrl] [chromium|webkit] [filter]
//   baseUrl defaults to http://localhost:5179/ (run `npx vite --port 5179` first)
//   e.g. node scripts/e2e-sandboxes.mjs https://victoranimasahun.github.io/scribsandpixels-school/ webkit py-
import { parse } from 'yaml'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, webkit, devices } from 'playwright-core'

const root = new URL('..', import.meta.url).pathname
const base = (process.argv[2] ?? 'http://localhost:5179/').replace(/\/?$/, '/')
const engine = process.argv[3] ?? 'chromium'
const filter = process.argv[4] ?? ''

const sandboxes = []
for (const course of readdirSync(join(root, 'src/content/courses'))) {
  const dir = join(root, 'src/content/courses', course, 'sandboxes')
  if (!existsSync(dir)) continue
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yaml'))) {
    const s = parse(readFileSync(join(dir, f), 'utf8'))
    if (s.id.includes(filter)) sandboxes.push({ ...s, course })
  }
}
const byId = Object.fromEntries(sandboxes.map((s) => [s.id, s]))

const browser = engine === 'webkit'
  ? await webkit.launch()
  : await chromium.launch({ headless: !process.env.HEADED, executablePath: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(existsSync) })
const context = await browser.newContext(engine === 'webkit' ? devices['iPhone 13'] : { viewport: { width: 390, height: 844 } })
const page = await context.newPage()
page.on('dialog', (d) => d.accept())
let errors = []
page.on('pageerror', (e) => errors.push(e.message))
if (process.env.DEBUG) page.on('console', (m) => console.log('  console:', m.type(), m.text().slice(0, 160)))

const open = async (s) => {
  await page.goto(`${base}#/c/${s.course}/s/${s.id}`)
  await page.locator('.sandbox').first().waitFor({ timeout: 20000 })
  if (await page.getByText('Checkpoint').count()) throw new Error('a checkpoint gate is locking the app')
}

async function testPython(s) {
  const solution = readFileSync(join(root, 'scripts/python-solutions', `${s.id}.py`), 'utf8')
  await page.locator('.sandbox textarea').first().fill(solution)
  await page.getByRole('button', { name: '✓ Check tasks' }).click()
  await page.waitForFunction(() => {
    const items = [...document.querySelectorAll('ol.tasks li')]
    return items.length && items.every((li) => /✅|❌/.test(li.textContent))
  }, null, { timeout: 120000 })
  return page.locator('ol.tasks li').evaluateAll((items) => items.map((li) => li.textContent.includes('✅')))
}

async function testWeb(s) {
  const solution = JSON.parse(readFileSync(join(root, 'scripts/web-solutions', `${s.id}.json`), 'utf8'))
  for (const tab of ['html', 'css', 'js']) {
    if (solution[tab] === undefined) continue
    await page.getByRole('button', { name: tab.toUpperCase(), exact: true }).click()
    await page.locator('.sandbox textarea').first().fill(solution[tab])
  }
  let done = ''
  for (let round = 0; round < Number(process.env.ROUNDS ?? 2); round++) { // twice: a second check without edits must still report
    await page.getByRole('button', { name: '✓ Check tasks' }).click()
    await page.waitForFunction(() => /\d+ \/ \d+ tasks done/.test(document.body.innerText), null, { timeout: 15000 })
    await page.waitForTimeout(400)
    done = (await page.locator('body').innerText()).match(/(\d+) \/ (\d+) tasks done/)
  }
  const items = await page.locator('ol.tasks li').evaluateAll((lis) => lis.map((li) => [li.textContent.includes('✅'), li.textContent.slice(0, 60)]))
  for (const [ok, text] of items) if (!ok) console.log(`    not passing: ${text}`)
  if (process.env.DEBUG && items.some(([ok]) => !ok)) {
    const frame = page.frames().find((f) => f !== page.mainFrame())
    console.log('    iframe box', JSON.stringify(await page.locator('iframe.preview').boundingBox()), 'inner', await frame?.evaluate(() => [innerWidth, document.querySelector('style')?.textContent.slice(0, 400), getComputedStyle(document.querySelector('header') ?? document.body).justifyContent]))
    console.log('    re-run now:', JSON.stringify(await frame?.evaluate((checks) => checks.map((src) => { try { return !!(0, eval)('(' + src + ')') } catch (e) { return 'ERR ' + e.message } }), s.tasks.map((t) => t.check))))
    console.log('    frames:', page.frames().length, JSON.stringify(await frame?.evaluate(() => { const r = (q) => { const e = document.querySelector(q); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] }; return { w: innerWidth, h: innerHeight, header: r('header'), logo: r('.logo'), nav: r('nav'), hero: r('.hero'), h1: r('.hero h1'), cta: r('.cta'), jc: getComputedStyle(document.querySelector('header') ?? document.body).justifyContent, zoom: devicePixelRatio, font: getComputedStyle(document.body).fontSize } })))
  }
  return items.map(([ok]) => ok)
}

const cellTd = (ref) => {
  const [, letters, row] = ref.match(/^([A-Z]+)(\d+)$/)
  const col = [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0)
  return page.locator(`table.grid tbody tr:nth-child(${row}) td:nth-child(${col + 1})`)
}
async function typeCell(ref, value) {
  await cellTd(ref).click()
  const bar = page.locator('.formula-bar input')
  await bar.fill(value)
  await bar.press('Enter')
}
async function testSheet(s) {
  const rows = s.dataset?.rows ?? 0
  for (const task of s.tasks ?? []) {
    for (const [col, template] of Object.entries(task.solutionFill ?? {}))
      for (let r = 2; r <= rows + 1; r++) await typeCell(`${col}${r}`, template.replace(/\{r\}/g, String(r)))
    const single = task.solution ?? (task.hint?.startsWith('=') ? task.hint : undefined)
    if (single) await typeCell(task.cell, single)
  }
  await page.waitForTimeout(300)
  return page.locator('ol.tasks li').evaluateAll((items) => items.map((li) => li.textContent.includes('✅')))
}

async function testPhrases(s) {
  // Merge included sandboxes' challenges the same way the app does.
  const challenges = [...(s.challenges ?? []), ...(s.include ?? []).flatMap((id) => byId[id]?.challenges ?? [])]
  const patterns = [...(s.patterns ?? []), ...(s.include ?? []).flatMap((id) => byId[id]?.patterns ?? [])]
  const results = []
  for (const c of challenges) {
    const details = page.locator('details.challenges')
    if ((await details.getAttribute('open')) === null) await details.locator('summary').click()
    await details.getByRole('button', { name: c.prompt, exact: true }).first().click()
    const pattern = patterns.find((p) => p.id === c.pattern)
    const optionSlots = pattern.slots.filter((sl) => sl.options)
    for (const [index, slot] of optionSlots.entries()) {
      const label = slot.label ?? slot.id
      const slotBox = page.locator('.slot').nth(index)
      const tile = slotBox.locator('button.tile').filter({ has: page.locator('span', { hasText: new RegExp(`^${c.answer[slot.id].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) }).first()
      if (process.env.DEBUG) console.log('  tile', label, '→', c.answer[slot.id], await tile.count(), await slotBox.count())
      await tile.click({ timeout: 5000 })
    }
    await page.getByRole('button', { name: 'Check', exact: true }).click()
    results.push((await page.locator('.verdict').innerText()).includes('✅'))
  }
  return results
}

const testers = { python: testPython, web: testWeb, sheet: testSheet, phrases: testPhrases }
let failures = 0
for (const s of sandboxes) {
  errors = []
  try {
    await open(s)
    const hasSolution = s.kind === 'python' ? existsSync(join(root, 'scripts/python-solutions', `${s.id}.py`))
      : s.kind === 'web' ? existsSync(join(root, 'scripts/web-solutions', `${s.id}.json`)) : true
    const results = (s.tasks?.length || s.challenges?.length || s.include?.length) && hasSolution ? await testers[s.kind](s) : []
    const bad = results.filter((r) => !r).length
    if (bad || errors.length) {
      failures++
      console.log(`✗ ${s.id}: ${bad ? `${bad}/${results.length} not passing` : ''} ${errors.length ? `page errors: ${errors.join(' | ')}` : ''}`)
    } else console.log(`✓ ${s.id} (${s.kind}${results.length ? `, ${results.length} checked` : ', renders'})`)
  } catch (e) {
    failures++
    console.log(`✗ ${s.id}: ${e.message.split('\n')[0]}`)
    if (process.env.DEBUG) console.log((await page.locator('main').innerText().catch(() => '')).slice(-600))
  }
}
await browser.close()
console.log(failures ? `\n${failures} sandbox(es) failing on ${engine}` : `\nAll ${sandboxes.length} sandboxes pass on ${engine}`)
process.exit(failures ? 1 : 0)
