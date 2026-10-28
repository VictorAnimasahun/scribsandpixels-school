# To-do

## Hosting & domain
- [x] Test build live on GitHub Pages: https://victoranimasahun.github.io/scribsandpixels-school/ (redeploys on every push to `main`)
- [x] Deployed on Vercel (9 Oct 2026): https://scribsandpixels-school.vercel.app (redeploys on every push to `main`; dashboard: https://vercel.com/victor-animasahuns-projects/scribsandpixels-school). Builds with base `/` because `GITHUB_PAGES` isn't set there.
- [x] Subdomain live (9 Oct 2026): **https://school.scribsandpixels.com** is the main address, served by Vercel (CNAME → Vercel DNS, HTTPS, http redirects). Vercel is the main host; GitHub Pages stays as a copy (CI checks still run there).
- [x] Supabase project created, migrated and configured (12 Oct 2026): Auth URL Configuration + Vercel env vars done (procedure 07)
- [x] Resend (procedure 08, 14–15 Oct 2026): domain scribsandpixels.com verified (eu-west-1; DKIM, `send`/`rsend` CNAMEs, `_dmarc` p=none in Spaceship DNS; root MX/SPF are Spaceship forwarding, leave them); API key in the password manager; Supabase Auth SMTP set; sign-in emails arrive with the code
- [x] Accounts built (15 Oct 2026): sign-in by code or link, local-first sync with three-way merge, checkpoint attempts permanent on the server, sign-out clears the browser; proven by `check:db` and `check:accounts` (both in CI)
- [ ] Vercel deploys untested pushes: gated `vercel` job added to pages.yml (skips until secrets exist). **Victor: procedure 12** (token + IDs as GitHub secrets); then Claude verifies a CI deploy and commits `vercel.json` with `git.deploymentEnabled.main = false`
- [x] Installable app (PWA) with offline lessons and Python (15 Oct 2026), proven by check:offline; real icons replace the Vite placeholder favicon
- [x] check:offline failed at random (also in CI, 16 Oct, so Week 3 missed the Pages copy): root cause found 27 Oct. Each fresh browser got a random learner id, and 24% of them have a checkpoint on Week 1 Day 1, which locked the app mid-check. Now a fixed learner; proven by running a checkpointed id (fails every time, same 3 failures as CI) and the fixed one (passes every time). The service worker was fine
- [x] Android app (15 Oct 2026): Capacitor, APK built by CI on every push, published on the `android-latest` release; tested in the emulator (Today, Account)
- [ ] Android: Capacitor logs "Error injecting safe area CSS" at start-up (its own early script; layout is correct in the emulator). Check on a real phone; Android WebView has no speech synthesis or recognition, so the French "listen"/"speak" buttons won't work in the app (the website on Chrome is fine)
- [ ] Play Store: make a private release key (keep it in the password manager), a signed release build (AAB), store listing
- [ ] Victor: Supabase → Authentication → Rate Limits: check the email limits (sign-up is open to any address, so the form could be used to flood someone's inbox); consider Turnstile/hCaptcha on sign-in later
- [x] Procedure 10 done (16 Oct 2026): both migrations pushed, sign-in template with the code, signed in on laptop + phone, Victor is admin
- [x] Student account (details + progress) and admin role/Learners page (15 Oct 2026), proven in check:db and check:accounts
- [ ] Sign-in/Account screen design (claude.ai): built from the tokens for now (`AccountPage.tsx`, noted in `docs/design/README.md`)
- [ ] Week unlocks aren't enforced in the test-build UI (any week can be ticked); decide before real learners join (the domain rule exists: `weekStatus`)
- [ ] The nudge function only knows Fullstack: register French and Excel in `scripts/sync-functions.ts` (needs their `course.ts`) so their learners get nudges
- [ ] Daily log UI (the 3 prompts) + "Still confusing you": `api.ts` has `saveLog`/`listLogs`; the domain's "day complete" also wants the log

## Nudge (life trackers + class nudges; plan: `docs/nudge-plan.md`, from `~/Desktop/my_everything_app`)
- [x] Core (27 Oct 2026): trackers (9 presets + your own, 5 kinds, daily/weekly goals, streaks), insights engine with the spec's guardrails (outlier-proof trends), class nudges from the school's rules, local store; migration `20261027090000_nudge.sql` (private unless the learner shares with admins), attacked in check:db
- [x] Screens (27 Oct 2026): `#/nudge` Today (class nudges, tracker cards with logging per kind, yesterday switch, one insight a day), `#/nudge/trackers` (switch on/off, order, edit goals and reminder hour, make your own), `#/nudge/stats` (14-day charts with table view, streaks, insights). Driven in Chrome at phone and desktop width
- [x] Insights must be statistically significant (27 Oct): one 5% shared across every comparison; pure noise fooled 35% of learners with the spec's thresholds alone, 3.9% now
- [x] Share-with-coach switch on Account; the Learners page shows a sharing learner's trackers (days logged this week, latest value), proven in check:accounts (on, seen; off, gone at once)
- [ ] claude.ai design pass for Nudge's screens (built from the school's tokens for now)
- [x] Sync (28 Oct 2026): trackers and entries, same three-way merge as course progress (`nudge/nudgeSyncModel.ts`), its own base `snp-nudge-sync-v1`; sign-out clears Nudge. check:accounts: phone→laptop, a tracker made on one device, un-logging everywhere. Without the Nudge tables (migration not pushed) Nudge stays local, course sync carries on and sign-out keeps the unsaved trackers: `NO_NUDGE=1 npm run check:accounts` (both runs in CI)
- [x] Its own install on the web (28 Oct 2026): `public/nudge-manifest.webmanifest` (id `./nudge`, start `#/nudge`), lime N icons from `build-icons.mjs`; while Nudge is on screen the page points at it (`nudge/nudgeInstall.ts`), so Install / Add to Home Screen makes a Nudge icon. check:offline asks Chrome (DevTools protocol) which manifest each page uses and whether anything blocks installing
- [x] Nudge Android app (28 Oct 2026): flavour `nudge`, `com.scribsandpixels.nudge`, own name/icons/splash, starts on `#/nudge`; both APKs built locally and checked (package, label, config inside the APK); CI publishes `nudge.apk` next to the school's
- [ ] **Victor:** install `nudge.apk` from the android-latest release and confirm it opens on Nudge (not verified on a device: no emulator or phone attached here)
- [ ] Reminders per tracker through `send-nudges` (needs the function deployed: setup item 3)
- [x] Victor pushed `20261016090000_no_profile_delete.sql` and `20261027090000_nudge.sql` (28 Oct 2026, after `npx supabase login`: the CLI's token had expired); confirmed on the live API (tables and `share_life_with_admin` answer 200)
- [ ] Slice 2: day planner + assistant chat (Anthropic key as a Supabase secret), personalization bandit, Get Ready, voice

## Quizzes (a slice at a time, no mass generation)
- [x] Quiz engine: random weekly checkpoints (1–2/week), 70% pass, 60-min cooldown, new questions on retry
- [x] French Week 1 · Excel Week 1 question banks
- [x] French Weeks 2–16 · Excel Weeks 2–15 (Excel figures recomputed from the datasets)
- [x] Machine Learning course started (16 Oct 2026): overview, Week 1 (Géron pp. 9–40) with 6 sandboxes + playground and ~200 quiz questions; ML libraries in the Python sandbox
- [x] ML Weeks 2–4 (16 Oct 2026): Lagos housing project (Weeks 2–3), classification + fraud flagger (Week 4); data files and matplotlib charts in the Python sandbox; every sandbox proven in CPython and in Chrome (Pyodide)
- [ ] ML Weeks 5–10 (plan: `fullstack-ml/phase-5-plan.md`), a week at a time; Week 5 = Géron pp. 115–155 (how models learn: gradient descent, polynomial regression, learning curves, regularization, logistic regression)
- [ ] French Weeks 17–52
- [ ] Excel Weeks 16–24
- [x] Fullstack + ML Weeks 1–14 (every Python snippet checked by running it: `node scripts/check-quiz-code.mjs`)
- [ ] Fullstack + ML Weeks 15+ (Phase 3 backend + production thread) as the learner progresses

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
- [x] Robot-blocked links checked in a real Chrome (16 Oct 2026): realpython (3), myonlinetraininghub, upwork, forvo and automatetheboringstuff all load. innerfrench.com sits behind a Cloudflare "Just a moment…" check that blocks automated browsers; open it once on a phone to confirm

## Content
- [x] Fullstack + ML Week 3 (HTML & CSS) · Week 4 (Flexbox, responsive, Git + GitHub) · Week 5 (dictionaries, exceptions, modules, JSON) · Week 6 (Open-Meteo weather script, accessibility, portfolio, first gigs)
- [x] Fullstack + ML Weeks 7–10 (JavaScript basics; arrays, objects, JSON; the DOM; fetch and async)
- [x] Fullstack + ML Week 11 (CSS Grid, custom properties, responsive images, shared header; Mama Put Kitchen home page) + quizzes + 6 sandboxes
- [x] Fullstack + ML Week 12 (React I: Node/npm/Vite, JSX, props, lists and keys, deploy; Mama Put Kitchen React menu) + quizzes + 6 React sandboxes (new `react: true` web sandbox)
- [x] Fullstack + ML Week 13 (React II: useState, controlled forms, immutable updates, useEffect, lifting state up; Mama Put Kitchen cart + WhatsApp order) + quizzes + 6 React sandboxes
- [x] Fullstack + ML Week 14 (Phase 2 graduation: menu.json, open-now + enquiry, accessibility, Lighthouse/Open Graph, bug bash; Mama Put Kitchen shipped) + quizzes + 5 web sandboxes + 1 Python auditor
- [x] Fullstack + ML Weeks 11–14 written (6 Oct 2026): Phase 2 complete (plan: `courses/fullstack-ml/phase-2-plan.md`)
- [x] Fullstack + ML production-engineering thread (concurrency, observability, reliability, scalability, auth, databases, tradeoffs) planned into Weeks 15–34 and 45–52: `courses/fullstack-ml/production-track.md` + outlines in `course.ts`
- [ ] French: Year 2 (B2 / NCLC 7) weeks, if wanted
- [ ] Add `course.ts` frameworks for French and Excel (only `overview.md` today)

## Product (decisions come from the web chat)
- [x] UI design built into the test build (9 Oct 2026): Today, day page, course year ledger, week page, checkpoint lock + cooldown, desktop sidebar (`docs/design/`)
- [ ] UX pass (claude.ai): what the 10-minute version counts for · reading lessons during a cooldown · does a failed checkpoint keep the streak
- [ ] UX pass (claude.ai), found 9 Oct: ticking a block then unticking it still marks today as a study day, so one tap keeps the streak (`setBlockDone` in `src/viewer/actions.ts`). Decide what counts as a study day (a whole day done? a block still ticked at midnight?)
- [x] React sandboxes show "Loading React…" (then a slow-connection note after 8 s) until the preview has run (16 Oct 2026)
- [x] Fixed 9 Oct: pressing ✓ Check on a React sandbox before its first preview finished building could hang forever (WebKit resolved the two builds out of order and the plain preview replaced the checking one). Only the newest Run/Check now updates the preview
- [ ] Watch: `xl-w11-rules` timed out on a grid-cell click in 2 of 12 WebKit e2e runs on 9 Oct (all just after a deploy; 0 of the next 6, and it passes in full runs on every host). If it shows up again, print the full Playwright error (it names what blocks the click)
- [x] "Need a nudge?" sheet: 10-minute version (`#/c/<slug>/w/<n>/d/<n>/short`) and the note work
- [ ] "Remind me in an hour" email (shown disabled until accounts + Resend are live)
- [ ] Daily log form + "Still confusing you" on Today (designed; needs saved logs)
- [x] Real accounts and saved progress (live 16 Oct 2026)
- [ ] Move quiz answers server-side so learners can't read them in the page code
- [x] 🧪 Tester tools hidden from signed-in students (16 Oct 2026); still shown to admins and to visitors without an account. Remove entirely before a public launch
- [ ] Email nudges (Resend), already drafted in `supabase/`, not active
