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
- [x] French Week 2 · Excel Week 2
- [ ] French Weeks 3–52
- [ ] Excel Weeks 3–24
- [x] Fullstack + ML Weeks 1–3 (every Python snippet checked by running it: `node scripts/check-quiz-code.mjs`)
- [ ] Fullstack + ML later weeks as they're written

## Sandboxes (a slice at a time)
- [x] Engines: French phrase builder, Excel spreadsheet, Python, web playground
- [x] French W1, W2, W3, W7 + main lab · Excel W2, W3, W6 + playground · Fullstack: a sandbox for every day of W1–3 (23 sandboxes, 82 auto-checked tasks) + Python/web playgrounds
- [x] Phone-ready code editor (key bar, auto-indent, smart-quote fix), tested on iPhone/Safari and Android/Chrome emulation
- [ ] More French lesson sets (add each to `fr-main` include)
- [ ] More Excel task sheets (every formula week)
- [x] Web-sandbox auto-checks (in-page checks; `npm run check:web` proves them in headless Chrome)
- [x] Excel `mustUse`: tasks can require `$` references, not just the right number

## Content
- [x] Fullstack + ML Week 3 (HTML & CSS)
- [ ] Fullstack + ML: Weeks 4+
- [ ] French: Year 2 (B2 / NCLC 7) weeks, if wanted
- [ ] Add `course.ts` frameworks for French and Excel (only `overview.md` today)

## Product (decisions come from the web chat)
- [ ] Final UI/UX design, replacing the test build's plain screens
- [ ] Real accounts and saved progress (today progress lives in the browser only)
- [ ] Move quiz answers server-side so learners can't read them in the page code
- [ ] Remove the 🧪 Tester tools for real learners
- [ ] Email nudges (Resend), already drafted in `supabase/`, not active
