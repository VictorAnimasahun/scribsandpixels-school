# To-do

## Hosting & domain
- [x] Test build live on GitHub Pages: https://victoranimasahun.github.io/scribsandpixels-school/ (redeploys on every push to `main`)
- [ ] **Deploy on Vercel** (Victor): import the GitHub repo → framework *Vite*, build `npm run build`, output `dist`. No environment variables needed.
- [ ] **Subdomain on the Scribs & Pixels domain** (Victor): confirm the exact domain and which subdomain (e.g. `school.<domain>`).
  - On Vercel: Project → Settings → Domains → add the subdomain, then create the DNS `CNAME` record it shows (usually `cname.vercel-dns.com`).
  - If GitHub Pages gets the subdomain instead: `CNAME` → `victoranimasahun.github.io`, set it under repo Settings → Pages, **and** change `base` in `vite.config.ts` to `'/'` (a custom domain serves from the root).
- [ ] Decide which host is the main one (Vercel or Pages) and point the subdomain there.

## Quizzes (a slice at a time, no mass generation)
- [x] Quiz engine: random weekly checkpoints (1–2/week), 70% pass, 60-min cooldown, new questions on retry
- [x] French Week 1 · Excel Week 1 question banks
- [x] French Weeks 2–16 · Excel Weeks 2–15 (Excel figures recomputed from the datasets)
- [ ] French Weeks 17–52
- [ ] Excel Weeks 16–24
- [x] Fullstack + ML Weeks 1–12 (every Python snippet checked by running it: `node scripts/check-quiz-code.mjs`)
- [ ] Fullstack + ML later weeks as they're written

## Sandboxes (a slice at a time)
- [x] Engines: French phrase builder, Excel spreadsheet, Python, web playground
- [x] French W1–W7, W9, W10 + main lab · Excel W2, W3, W5–W9, W11 + playground · Fullstack: a sandbox for every day of W1–10 (65 sandboxes, 271 auto-checked tasks) + Python/web playgrounds
- [x] End-to-end test of every sandbox in the real app (`npm run e2e [url] [chromium|webkit]`): 76/76 pass on the live site, Chrome and iPhone/WebKit
- [x] Phone-ready code editor (key bar, auto-indent, smart-quote fix), tested on iPhone/Safari and Android/Chrome emulation
- [ ] More French lesson sets (add each to `fr-main` include)
- [ ] More Excel task sheets (every formula week)
- [x] Web-sandbox auto-checks (in-page checks; `npm run check:web` proves them in headless Chrome)
- [x] Excel `mustUse`: tasks can require `$` references, not just the right number

## Hardening (weekend 3 Oct 2026)
- [x] Saved progress is validated on load (corrupt or hand-edited data can't crash or lock the app); two open tabs stay in sync
- [x] A checkpoint whose quiz no longer exists can't lock the app; starting a checkpoint counts (reload/leave = failed attempt, no dodging the cooldown or re-rolling questions); double-tap safe
- [x] Fairer typed answers: French spacing before ?/!, commas, guillemets, curly quotes and thousands separators don't decide a mark
- [x] Python: Stop can't kill a later run; runaway print loops stop at 100,000 characters; output batched
- [x] Web sandbox: an infinite loop can't brick a lesson (saved code isn't auto-run again); messages only from its own preview; corrupt saves ignored
- [x] Sheet: =REPT and text results capped at 32,767 characters (no memory crash); corrupt or out-of-range saves ignored
- [x] Error boundaries: a sandbox that fails to load (site redeployed while open) shows "Reload" instead of blanking the page
- [x] `npm run sweep`: every page at phone width (606 pages: no JS errors, no sideways scroll); external link report
- [x] Fixed: French main lab had a duplicate pattern id (Week 9 "where-is"), so those challenges opened the Week 3 builder; a test now forbids duplicates
- [ ] Check by hand: automatetheboringstuff.com links (unreachable from the test machine on 3 Oct) and sites that block robots (realpython, forvo, innerfrench, myonlinetraininghub, upwork)

## Content
- [x] Fullstack + ML Week 3 (HTML & CSS) · Week 4 (Flexbox, responsive, Git + GitHub) · Week 5 (dictionaries, exceptions, modules, JSON) · Week 6 (Open-Meteo weather script, accessibility, portfolio, first gigs)
- [x] Fullstack + ML Weeks 7–10 (JavaScript basics; arrays, objects, JSON; the DOM; fetch and async)
- [x] Fullstack + ML Week 11 (CSS Grid, custom properties, responsive images, shared header; Mama Put Kitchen home page) + quizzes + 6 sandboxes
- [x] Fullstack + ML Week 12 (React I: Node/npm/Vite, JSX, props, lists and keys, deploy; Mama Put Kitchen React menu) + quizzes + 6 React sandboxes (new `react: true` web sandbox)
- [ ] Fullstack + ML Weeks 11–14: draft outline in `courses/fullstack-ml/phase-2-plan.md`; plan approved 3 Oct (keep the order · milestone = Mama Put Kitchen · Saturdays build the milestone). Write Weeks 11–14 on Monday; add the plan's outlines to `course.ts` then
- [x] Fullstack + ML production-engineering thread (concurrency, observability, reliability, scalability, auth, databases, tradeoffs) planned into Weeks 15–34 and 45–52: `courses/fullstack-ml/production-track.md` + outlines in `course.ts`
- [ ] French: Year 2 (B2 / NCLC 7) weeks, if wanted
- [ ] Add `course.ts` frameworks for French and Excel (only `overview.md` today)

## Product (decisions come from the web chat)
- [ ] Final UI/UX design, replacing the test build's plain screens
- [ ] "Need a nudge?" button (decided 6 Oct: all three): remind me in 1 hour (email) · 10-minute version of today · motivational note
- [ ] Real accounts and saved progress (today progress lives in the browser only)
- [ ] Move quiz answers server-side so learners can't read them in the page code
- [ ] Remove the 🧪 Tester tools for real learners
- [ ] Email nudges (Resend), already drafted in `supabase/`, not active
