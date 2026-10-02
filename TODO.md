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
- [x] French Weeks 2–10 · Excel Weeks 2–10 (Excel figures recomputed from the datasets)
- [ ] French Weeks 11–52
- [ ] Excel Weeks 11–24
- [x] Fullstack + ML Weeks 1–10 (every Python snippet checked by running it: `node scripts/check-quiz-code.mjs`)
- [ ] Fullstack + ML later weeks as they're written

## Sandboxes (a slice at a time)
- [x] Engines: French phrase builder, Excel spreadsheet, Python, web playground
- [x] French W1–W7, W9 + main lab · Excel W2, W3, W5, W6, W7, W8, W9 + playground · Fullstack: a sandbox for every day of W1–10 (65 sandboxes, 271 auto-checked tasks) + Python/web playgrounds
- [x] End-to-end test of every sandbox in the real app (`npm run e2e [url] [chromium|webkit]`): 76/76 pass on the live site, Chrome and iPhone/WebKit
- [x] Phone-ready code editor (key bar, auto-indent, smart-quote fix), tested on iPhone/Safari and Android/Chrome emulation
- [ ] More French lesson sets (add each to `fr-main` include)
- [ ] More Excel task sheets (every formula week)
- [x] Web-sandbox auto-checks (in-page checks; `npm run check:web` proves them in headless Chrome)
- [x] Excel `mustUse`: tasks can require `$` references, not just the right number

## Content
- [x] Fullstack + ML Week 3 (HTML & CSS) · Week 4 (Flexbox, responsive, Git + GitHub) · Week 5 (dictionaries, exceptions, modules, JSON) · Week 6 (Open-Meteo weather script, accessibility, portfolio, first gigs)
- [x] Fullstack + ML Weeks 7–10 (JavaScript basics; arrays, objects, JSON; the DOM; fetch and async)
- [ ] Fullstack + ML Weeks 11–14: draft outline in `courses/fullstack-ml/phase-2-plan.md`; Weeks 11–14 wait for Victor's 3 decisions (order, milestone business, Saturdays)
- [ ] French: Year 2 (B2 / NCLC 7) weeks, if wanted
- [ ] Add `course.ts` frameworks for French and Excel (only `overview.md` today)

## Product (decisions come from the web chat)
- [ ] Final UI/UX design, replacing the test build's plain screens
- [ ] Real accounts and saved progress (today progress lives in the browser only)
- [ ] Move quiz answers server-side so learners can't read them in the page code
- [ ] Remove the 🧪 Tester tools for real learners
- [ ] Email nudges (Resend), already drafted in `supabase/`, not active
