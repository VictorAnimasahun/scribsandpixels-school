# Scribs & Pixels School

A multi-course online school for adult self-learners with day jobs. Its core idea is **accountability over content**: the school gives the daily structure, the review loop, streaks and nudges, and links out to free external resources (YouTube, freeCodeCamp, CS50, books) for the actual teaching.

## Workflow
Open tasks live in `TODO.md`; keep it updated. Test build: https://victoranimasahun.github.io/scribsandpixels-school/ (GitHub Pages, auto-deploys from `main`).
Brainstorming and UI/UX design happen on claude.ai; final decisions and designs come back here to build. The current design lives in `docs/design/`. The user works across Claude Code on this Mac and Claude Code on the web (claude.ai/code), so **commit and push finished work to `main`**, otherwise the other side starts from a stale repo.

## Courses
1. **12-Month Fullstack + ML** (`fullstack-ml`, first course, in progress). Framework in `src/content/courses/fullstack-ml/course.ts`; written weeks in `weeks/week-NN.md`.
   - 6 phases, 52 weeks. Weeks 1–14 are written (Phases 1–2 complete); Weeks 15+ have outlines and get written as the learner progresses (format: `src/content/README.md`).
   - The first learner (Victor) started June 2026, passed the Week 1 quiz (100%) and is on Week 2.
   - Audience: Nigeria + Canada job markets. Examples use Nigerian context (Naira, Lagos, Abuja).
   - Phase 2–6 `topics` in course.ts were inferred from each phase's resources; the original plan only lists resources and milestones for those phases.
   - **Production-engineering thread** (added 6 Oct 2026 at Victor's request): concurrency, observability, reliability, scalability, auth, databases and tradeoffs run through Phases 3, 4 and 6, with week outlines for Weeks 7–34 and 45–52 in course.ts. Plan and teaching loop (build → break on purpose → fix → explain the tradeoff): `courses/fullstack-ml/production-track.md`.
2. **Le français de A à Z** (`french`), **complete**: 52 written weeks, A0 → B1, ~1 h/day. `src/content/courses/french/overview.md` has the phases, full syllabus, resources and the Year 2 (B2 / NCLC 7, TCF/TEF Canada) outline. Mock exams: DELF A1 (Wk 17), A2 (Wk 34), B1 (Wk 50), TCF Canada diagnostic (Wk 51).
3. **Excel: Zero to Expert** (`excel`), **complete**: 24 written weeks, beginner → Power Query/Power Pivot/VBA → MO-210/MO-211 certification prep. `overview.md` + `weeks/`. Uses the fictional **NaijaMart** retail datasets in `excel/datasets/` (sheet sandboxes can load sales_2025, products, employees, messy_customers and timesheet_2025-03) (regenerate with `python3 generate.py`, fixed seed); answer keys in the lessons were computed from those files, so **don't change the generator without recomputing every "Check:" figure**.

French and Excel have `overview.md` (human-readable framework) but no `course.ts` yet, so they aren't registered in `src/content/index.ts`. Their week files are still validated by `npm test`.

**Daily quizzes (all courses):** every study day has **rapid-fire** (timed) + **brain teaser**; a **gate** appears only **1–2 times a week on random days** (pops up before the lesson, tests the previous day, blocks the dashboard until 70% is passed, 60-min cooldown on failure, retries draw different questions of the same topics and difficulty from a bank). Every day still has a gate bank, since any day can be picked. Rules and format: `src/content/QUIZZES.md`; engine: `src/domain/quizGate.ts`; banks: `courses/<slug>/quizzes/week-NN.yaml`, validated by `npm test`. Done: French Weeks 1–16, Excel Weeks 1–15, Fullstack Weeks 1–14 (~200 questions each; programming snippets verified with `node scripts/check-quiz-code.mjs`); all other weeks still need banks, written a slice at a time (the user doesn't want mass generation).

**Sandboxes (all courses):** subject-native playgrounds, as a course's main resource (`main: true`, listed on the course page) and/or embedded in lessons with a `::sandbox <id>` line. Kinds: `phrases` (French builder with agreement checks, speech), `sheet` (spreadsheet engine in `src/domain/sheet.ts`), `python` (Pyodide in a worker), `web` (HTML/CSS/JS preview; `react: true` compiles JSX and loads React 18). Rules and format: `src/content/SANDBOXES.md`. Done so far: French W1–W7, W9, W10 + main lab; Excel W2, W3, W5–W9, W11 + playground; Fullstack: every day of W1–14 + Python and web playgrounds. Reference solutions live in `scripts/python-solutions/` and `scripts/web-solutions/` (never shipped to the browser); `npm run check:python` and `npm run check:web` (headless Chrome via playwright-core; both in CI) prove each passes and each starter fails. Excel tasks can require `$` references with `mustUse`. Lessons hide answers: `:::hint` blocks and `**Check**` paragraphs render folded.

More courses will follow; nothing may assume a single course. To add one: a new folder under `src/content/courses/`, register it in `src/content/index.ts` and `scripts/sync-functions.ts`.

## Architecture
- **Content lives in the repo, learner data in Supabase.** Content is versioned and reviewable, and new weeks ship by adding a markdown file. DB rows reference content by `course_slug` + `week` + `day` + `block_key`.
- `src/content/`: types, the week markdown parser (`parseWeek.ts`), course registry (`index.ts`, loads week files with `import.meta.glob`).
- `src/domain/`: pure, tested rules. `progress.ts` (pacing, week unlock, day completion, quiz grading), `streak.ts` (dates, streaks, week dots), `learner.ts` (learner state types + `dashboardSummary`, which gives the UI everything the dashboard mockup currently hardcodes).
- `src/lib/`: `supabase.ts` client (env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`; see `.env.example`), `api.ts` (all reads/writes; enforces unlock and completion rules before writing).
- `supabase/migrations/`: schema + RLS (profiles, enrollments, block_progress, day_progress, logs, quiz_attempts, wins, job_applications, email_events). Verified in PGlite: signup trigger, per-user RLS, append-only quiz attempts.
- `supabase/functions/send-nudges/`: hourly Resend emails (daily nudge Mon–Sat if not studied yet; Sunday weekly review digest). It imports `_shared/`, which is **generated** by `npm run sync:functions`; never edit `_shared/` by hand.
- `supabase/setup/schedule-nudges.sql`: one-time pg_cron schedule (holds secrets; not a migration).

## Rules implemented (defaults for the open decisions; each lives in one function)
- **Pacing (calendar-based, decided 9 Oct 2026):** a course starts on the first Monday on/after enrolment (`courseStartMonday`); each date has its lesson (Mon = Day 1 … Sat = Day 6, Sunday = review) (`scheduledFor`). `pace` lists scheduled days not yet done ("behind") and overdue week quizzes; missed days are caught up in order, starting from `currentPosition` (the first unfinished day). Learners can re-plan from next Monday.
- **Day complete:** every block ticked + log saved (`missingForDay`).
- **Week unlock:** Week N+1 opens when the Week N quiz is passed; the quiz opens when all 6 days are done.
- **Week quiz (auto-marked, decided 9 Oct 2026):** 15 questions drawn from the week's banks (Days 2–6: 2 medium + 1 hard each; `drawWeekQuiz`), 80% to pass (`gradeWeekQuiz`, `WEEK_QUIZ_RULES`), new questions on retry, 60-min cooldown after a fail like checkpoints. The lesson's open "## Quiz" questions stay as review prompts. Weeks without a bank fall back to the self-marked `gradeQuiz`.
- **Streak:** consecutive Mon–Sat study days; Sunday is rest and never breaks or adds; today counts as alive until it ends (`streak`).
- **Logs:** 3 prompts daily; day 7 = Sunday weekly review. "Things That Confused Me" = unresolved non-empty `confused` entries.
- **Emails:** at the learner's `nudge_hour` (default 19:00) in their `timezone` (default Africa/Lagos).

## Commands
- `npm run dev` / `npm run build` / `npm run lint`
- `npm test`: Vitest (parser on the real week files + domain rules)
- `npm run check:python` / `npm run check:web`: prove every sandbox task against its reference solution (CI runs both)
- `npm run e2e [baseUrl] [chromium|webkit] [filter]`: drives every sandbox in the real app (types each reference solution, presses Check, plays every phrase challenge). Run it against the live site after UI changes; start `npx vite --port 5179` for local runs
- `npm run sweep [baseUrl] [--no-external]`: visits every course, week and day page at phone width; reports JS errors, sideways scrolling, links to missing pages and dead external links
- `node scripts/check-quiz-code.mjs [week-NN]` (Python snippets in Python, JS snippets in Node): run quiz Python snippets and print real output next to each answer key
- `npm run sync:functions`: regenerate `supabase/functions/_shared` after changing `src/domain` or content

## Current state (as of 2026-10-01)
- **Done:** content model + Weeks 1–2 + all 52 outlines; domain rules with tests; Supabase schema; API layer; email function.
- **UI (9 Oct 2026):** the claude.ai design is built into the test build. Design source and tokens: `docs/design/` (README + the canvas artboards). Code: `src/viewer/` — `Viewer.tsx` (shell, checkpoint lock, tester tools), `TodayPage.tsx` (Today: first unfinished day, calendar pace line, streak, ledger + "Need a nudge?" sheet), `pages.tsx` (course page: schedule panel + year ledger; week page: auto-marked week quiz + review questions; day page), `ui.tsx` (icons, margin tick, ledger, markdown), `today.ts` (pure: today position, phases, ledger, calendar pace from the saved ticks; tested), `actions.ts` (ticking a block records the study date), `viewer.css` (all tokens and styles). Old mockup (`App.tsx`, `src/data/curriculum.ts`) deleted. The UX pass (on claude.ai) still decides: what the 10-minute version counts for, whether lessons stay readable during a cooldown, whether a failed checkpoint counts toward the streak. "Remind me in an hour" is shown disabled until accounts and email are live; the log prompts and "Still confusing you" need the log data that real accounts bring.
- **Not yet run against a real Supabase project:** no project is linked. The migration was verified in PGlite; `api.ts` and the edge function are type-checked only.
- Fullstack Weeks 11+ need writing; Phase 2 plan approved (3 Oct 2026): keep the order, milestone = "Mama Put Kitchen", Saturdays of Weeks 11–14 build the milestone. Weeks 11–14 written (6 Oct): Phase 2 complete. Phase 3 (backend, Weeks 15–24) is next, with the production-engineering thread. Week plan: `src/content/courses/fullstack-ml/phase-2-plan.md` (approved; add its outlines to `course.ts` when writing Weeks 11–14). Week 6's weather script uses Open-Meteo (free, no key); sandboxes use saved responses because the browser sandbox has no network.

## Setup still needed (user)
1. Create a Supabase project → run the migration (`supabase link` + `supabase db push`, or paste into the SQL editor) → put the URL + publishable key in `.env.local`.
2. Resend: verify a sending domain, create an API key. Optionally set Resend as Supabase Auth's SMTP so magic-link emails come from the school too.
3. Deploy the function: `supabase secrets set RESEND_API_KEY=… EMAIL_FROM="Scribs & Pixels <school@domain>" APP_URL=… CRON_SECRET=…` then `supabase functions deploy send-nudges --no-verify-jwt`, then run `supabase/setup/schedule-nudges.sql`.

## Decisions (9 Oct 2026: school rules R1–R5)
- R1 pacing: calendar-based (above). R2 week quiz: auto-marked, 80% (above). R3 streak: keep (Mon–Sat, Sunday rest). R5 writing weeks: keep (Claude writes and verifies each week here, a slice at a time).
- ~~The "Need a nudge?" button~~ **Decided (6 Oct 2026): all three.** The button offers (1) "Remind me in 1 hour" (one email via the send-nudges function), (2) "Give me the 10-minute version" of today (needs a short version of each day, e.g. Review + the mini-task only), (3) a motivational note. Build it with the new UI.
