// Renders docs/your-tasks/your-tasks.html to PDF (docs/your-tasks/ and ~/Downloads).
// Usage: node scripts/build-task-pdf.mjs
import { copyFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { chromium } from 'playwright-core'

const chrome = process.env.CHROME_PATH ?? (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome')
const html = resolve('docs/your-tasks/your-tasks.html')
const out = resolve('docs/your-tasks/Victor-Task-Program.pdf')
const browser = await chromium.launch({ executablePath: chrome })
const page = await browser.newPage()
await page.goto('file://' + html)
await page.pdf({
  path: out, format: 'A4', printBackground: true, displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#888;font-family:Helvetica">Victor\'s Task Program · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  margin: { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' },
})
await browser.close()
copyFileSync(out, resolve(homedir(), 'Downloads/Victor-Task-Program.pdf'))
console.log('Wrote', out, 'and ~/Downloads/Victor-Task-Program.pdf')
