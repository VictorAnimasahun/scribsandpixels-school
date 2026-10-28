// Renders the app icons from the design's brand mark (the tilted green tile with a lime "S" in
// Literata, see .brand-mark in src/viewer/viewer.css) with Chrome, so the real font is used.
// Output goes to public/icons/. Run again after changing the mark: node scripts/build-icons.mjs
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const root = new URL('..', import.meta.url).pathname
const out = join(root, 'public/icons')
mkdirSync(out, { recursive: true })

const PAPER = '#F2F5EC', GREEN = '#164F3B', LIME = '#C7E85C'
const font = `<link href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,600&display=block" rel="stylesheet">`

/** The school's mark: a green tile with a lime S. Nudge's is its inverse: a lime tile with a green N. */
const SCHOOL = { letter: 'S', tile: GREEN, ink: LIME }
const NUDGE = { letter: 'N', tile: LIME, ink: GREEN }

/** kind 'any': paper background, tilted tile. 'maskable': full-bleed tile colour, the letter inside the 80% safe zone. */
const page = (kind, size, mark = SCHOOL) => `<!doctype html><html><head>${font}<style>
  html, body { margin: 0; width: ${size}px; height: ${size}px; }
  body { display: grid; place-items: center; background: ${kind === 'maskable' ? mark.tile : PAPER}; }
  .tile { width: ${size * 0.74}px; height: ${size * 0.74}px; border-radius: ${size * 0.06}px; background: ${mark.tile};
          display: grid; place-items: center; transform: rotate(-6deg); }
  .s { font: 600 ${kind === 'maskable' ? size * 0.5 : size * 0.52}px 'Literata', Georgia, serif; color: ${mark.ink}; line-height: 1;
       transform: translateY(-${size * 0.02}px) ${kind === 'maskable' ? 'rotate(-6deg)' : ''}; }
</style></head><body>${kind === 'maskable' ? `<span class="s">${mark.letter}</span>` : `<div class="tile"><span class="s">${mark.letter}</span></div>`}</body></html>`

const chrome = process.env.CHROME_PATH ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(existsSync)
const browser = await chromium.launch({ executablePath: chrome })
const targets = [
  ['icon-192.png', 'any', 192],
  ['icon-512.png', 'any', 512],
  ['icon-maskable-512.png', 'maskable', 512],
  ['apple-touch-icon.png', 'any', 180],
  ['favicon-48.png', 'any', 48],
  // Nudge, installed as its own app (public/nudge-manifest.webmanifest).
  ['nudge-192.png', 'any', 192, NUDGE],
  ['nudge-512.png', 'any', 512, NUDGE],
  ['nudge-maskable-512.png', 'maskable', 512, NUDGE],
  ['nudge-apple-touch-icon.png', 'any', 180, NUDGE],
]
for (const [file, kind, size, mark] of targets) {
  const p = await browser.newPage({ viewport: { width: size, height: size } })
  await p.setContent(page(kind, size, mark))
  await p.evaluate(() => document.fonts.ready)
  const literata = await p.evaluate(() => document.fonts.check("600 40px 'Literata'"))
  if (!literata) throw new Error('Literata did not load (no network?): the icons would use a fallback font')
  writeFileSync(join(out, file), await p.screenshot({ type: 'png' }))
  await p.close()
  console.log(`wrote public/icons/${file}`)
}
// Sources for the Android app (npx @capacitor/assets generate --android turns them into every
// density): adaptive icon layers (the S inside the 66% safe zone on a transparent foreground; a
// solid green background), a plain icon, and the splash screens.
const assetsDir = join(root, 'assets')
mkdirSync(assetsDir, { recursive: true })
const androidSources = [
  ['icon-only.png', 1024, page('any', 1024)],
  ['icon-background.png', 1024, `<!doctype html><html><body style="margin:0;width:1024px;height:1024px;background:${GREEN}"></body></html>`],
  ['icon-foreground.png', 1024, `<!doctype html><html><head>${font}<style>html,body{margin:0;width:1024px;height:1024px;background:transparent}
    body{display:grid;place-items:center} .s{font:600 420px 'Literata',Georgia,serif;color:${LIME};line-height:1;transform:translateY(-20px) rotate(-6deg)}</style></head>
    <body><span class="s">S</span></body></html>`],
  ['splash.png', 2732, `<!doctype html><html><head>${font}<style>html,body{margin:0;width:2732px;height:2732px;background:${PAPER}}
    body{display:grid;place-items:center} .tile{width:560px;height:560px;border-radius:34px;background:${GREEN};display:grid;place-items:center;transform:rotate(-6deg)}
    .s{font:600 390px 'Literata',Georgia,serif;color:${LIME};line-height:1;transform:translateY(-14px)}</style></head>
    <body><div class="tile"><span class="s">S</span></div></body></html>`],
  ['splash-dark.png', 2732, `<!doctype html><html><head>${font}<style>html,body{margin:0;width:2732px;height:2732px;background:#16211D}
    body{display:grid;place-items:center} .tile{width:560px;height:560px;border-radius:34px;background:${GREEN};display:grid;place-items:center;transform:rotate(-6deg)}
    .s{font:600 390px 'Literata',Georgia,serif;color:${LIME};line-height:1;transform:translateY(-14px)}</style></head>
    <body><div class="tile"><span class="s">S</span></div></body></html>`],
]
for (const [file, size, html] of androidSources) {
  const p = await browser.newPage({ viewport: { width: size, height: size } })
  await p.setContent(html)
  await p.evaluate(() => document.fonts.ready)
  writeFileSync(join(assetsDir, file), await p.screenshot({ type: 'png', omitBackground: file === 'icon-foreground.png' }))
  await p.close()
  console.log(`wrote assets/${file}`)
}

await browser.close()

// The tab icon as SVG: the same tile; the S falls back to Georgia (favicons can't load web fonts).
writeFileSync(join(root, 'public/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect x="6" y="6" width="36" height="36" rx="3" fill="${GREEN}" transform="rotate(-6 24 24)"/>
  <text x="24" y="33" text-anchor="middle" font-family="Literata, Georgia, 'Times New Roman', serif" font-weight="600" font-size="26" fill="${LIME}" transform="rotate(-6 24 24)">S</text>
</svg>
`)
console.log('wrote public/favicon.svg')
