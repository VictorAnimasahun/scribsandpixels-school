// Writes the Nudge Android app's Capacitor config from the school's (the one `npx cap sync android`
// generates from capacitor.config.ts), changing only what makes it Nudge: its id, its name, and
// the start page (#/nudge). The Nudge build flavour picks this file up over the school's, so both
// apps share one web build and one Android project. Run after every `npx cap sync android`.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const school = JSON.parse(readFileSync(join(root, 'android/app/src/main/assets/capacitor.config.json'), 'utf8'))
const nudge = {
  ...school,
  appId: 'com.scribsandpixels.nudge',
  appName: 'Nudge',
  // Capacitor opens https://localhost + this path: the same app, starting on Nudge.
  server: { ...school.server, appStartPath: '/#/nudge' },
}
const dir = join(root, 'android/app/src/nudge/assets')
mkdirSync(dir, { recursive: true })
writeFileSync(join(dir, 'capacitor.config.json'), `${JSON.stringify(nudge, null, '\t')}\n`)
console.log('wrote android/app/src/nudge/assets/capacitor.config.json')
