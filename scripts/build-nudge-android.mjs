// Renders the Nudge Android app's icons and splash screens (the lime tile with a green N, the
// inverse of the school's mark) into android/app/src/nudge/res, matching every file and size the
// school app has in src/main/res, so the Nudge build never falls back to a school image.
// Rendered with Chrome so the real Literata font is used. Usage: node scripts/build-nudge-android.mjs
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const root = new URL('..', import.meta.url).pathname
const main = join(root, 'android/app/src/main/res')
const out = join(root, 'android/app/src/nudge/res')
const PAPER = '#F2F5EC', NIGHT = '#16211D', GREEN = '#164F3B', LIME = '#C7E85C'
const font = `<link href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,600&display=block" rel="stylesheet">`
const size = (file) => { const b = readFileSync(file); return [b.readUInt32BE(16), b.readUInt32BE(20)] }

const doc = (w, h, body, bg = 'transparent') => `<!doctype html><html><head>${font}<style>
  html, body { margin: 0; width: ${w}px; height: ${h}px; background: ${bg}; overflow: hidden; }
  body { display: grid; place-items: center; }
  .tile { display: grid; place-items: center; background: ${LIME}; transform: rotate(-6deg); }
  .n { font-family: 'Literata', Georgia, serif; font-weight: 600; color: ${GREEN}; line-height: 1; }
</style></head><body>${body}</body></html>`
const tile = (t) => `<div class="tile" style="width:${t}px;height:${t}px;border-radius:${t * 0.08}px"><span class="n" style="font-size:${t * 0.7}px;transform:translateY(-${t * 0.03}px)">N</span></div>`

/** What each launcher file looks like (the school's set, made by @capacitor/assets, has the same four). */
const launcher = {
  'ic_launcher.png': (s) => doc(s, s, tile(s * 0.74), PAPER),
  'ic_launcher_round.png': (s) => doc(s, s, `<div style="width:${s}px;height:${s}px;border-radius:50%;background:${PAPER};display:grid;place-items:center">${tile(s * 0.62)}</div>`),
  // Adaptive icon layers (the XML insets both by 16.7%): the N alone, and a solid lime ground.
  'ic_launcher_foreground.png': (s) => doc(s, s, `<span class="n" style="font-size:${s * 0.62}px;transform:translateY(-${s * 0.02}px) rotate(-6deg)">N</span>`),
  'ic_launcher_background.png': (s) => doc(s, s, '', LIME),
}

const chrome = process.env.CHROME_PATH ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(existsSync)
const browser = await chromium.launch({ executablePath: chrome })
let written = 0
async function render(file, w, h, html, transparent) {
  const p = await browser.newPage({ viewport: { width: w, height: h } })
  await p.setContent(html)
  await p.evaluate(() => document.fonts.ready)
  // Only pages that draw the N need the font (a plain background never asks for it).
  if (html.includes('class="n"') && !(await p.evaluate(() => document.fonts.check("600 40px 'Literata'")))) throw new Error('Literata did not load (no network?)')
  mkdirSync(join(file, '..'), { recursive: true })
  writeFileSync(file, await p.screenshot({ type: 'png', omitBackground: transparent }))
  await p.close()
  written++
}

for (const dir of readdirSync(main).filter((d) => d.startsWith('mipmap-') && !d.includes('anydpi'))) {
  for (const [name, html] of Object.entries(launcher)) {
    const src = join(main, dir, name)
    if (!existsSync(src)) continue
    const [w] = size(src)
    await render(join(out, dir, name), w, w, html(w), name !== 'ic_launcher_background.png')
  }
}
for (const dir of readdirSync(main).filter((d) => d.startsWith('drawable'))) {
  const src = join(main, dir, 'splash.png')
  if (!existsSync(src)) continue
  const [w, h] = size(src)
  await render(join(out, dir, 'splash.png'), w, h, doc(w, h, tile(Math.min(w, h) * 0.34), dir.includes('night') ? NIGHT : PAPER), false)
}
await browser.close()

// The app's name on the home screen and in the app switcher.
mkdirSync(join(out, 'values'), { recursive: true })
writeFileSync(join(out, 'values/strings.xml'), `<?xml version='1.0' encoding='utf-8'?>
<!-- The Nudge app's names (the school's are in src/main/res/values/strings.xml). -->
<resources>
    <string name="app_name">Nudge</string>
    <string name="title_activity_main">Nudge</string>
    <string name="package_name">com.scribsandpixels.nudge</string>
    <string name="custom_url_scheme">com.scribsandpixels.nudge</string>
</resources>
`)
console.log(`wrote ${written} images and values/strings.xml to android/app/src/nudge/res`)
