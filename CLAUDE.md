# Scribs & Pixels School

A multi-course online school for adult self-learners with day jobs. Its core idea is **accountability over content**: the school gives the daily structure, the review loop, streaks and nudges, and links out to free external resources (YouTube, freeCodeCamp, CS50, books) for the actual teaching.

## Workflow
Open tasks live in `TODO.md`; keep it updated. Test build: https://victoranimasahun.github.io/scribsandpixels-school/ (GitHub Pages, auto-deploys from `main`).
Brainstorming and UI/UX design happen on claude.ai; final decisions and designs come back here to build. The user works across Claude Code on this Mac and Claude Code on the web (claude.ai/code), so **commit and push finished work to `main`**, otherwise the other side starts from a stale repo.

## Courses
1. **12-Month Fullstack + ML** (`fullstack-ml`, first course, in progress). Framework in `src/content/courses/fullstack-ml/course.ts`; written weeks in `weeks/week-NN.md`.
   - 6 phases, 52 weeks. Only Weeks 1–3 are written; Weeks 4+ have outlines and get written as the learner progresses (format: `src/content/README.md`).
   - The first learner (Victor) started June 2026, passed the Week 1 quiz (100%) and is on Week 2.
   - Audience: Nigeria + Canada job markets. Examples use Nigerian context (Naira, Lagos, Abuja).
   - Phase 2–6 `topics` in course.ts were inferred from each phase's resources; the original plan only lists resources and milestones for those phases.
2. **Le français de A à Z** (`french`), **complete**: 52 written weeks, A0 → B1, ~1 h/day. `src/content/courses/french/overview.md` has the phases, full syllabus, resources and the Year 2 (B2 / NCLC 7, TCF/TEF Canada) outline. Mock exams: DELF A1 (Wk 17), A2 (Wk 34), B1 (Wk 50), TCF Canada diagnostic (Wk 51).
3. **Excel: Zero to Expert** (`excel`), **complete**: 24 written weeks, beginner → Power Query/Power Pivot/VBA → MO-210/MO-211 certification prep. `overview.md` + `weeks/`. Uses the fictional **NaijaMart** retail datasets in `excel/datasets/` (regenerate with `python3 generate.py`, fixed seed); answer keys in the lessons were computed from those files, so **don't change the generator without recomputing every "Check:" figure**.

French and Excel have `overview.md` (human-readable framework) but no `course.ts` yet, so they aren't registered in `src/content/index.ts`. Their week files are still validated by `npm test`.

**Daily quizzes (all courses):** every study day has **rapid-fire** (timed) + **brain teaser**; a **gate** appears only **1–2 times a week on random days** (pops up before the lesson, tests the previous day, blocks the dashboard until 70% is passed, 60-min cooldown on failure, retries draw different questions of the same topics and difficulty from a bank). Every day still has a gate bank, since any day can be picked. Rules and format: `src/content/QUIZZES.md`; engine: `src/domain/quizGate.ts`; banks: `courses/<slug>/quizzes/week-NN.yaml`, validated by `npm test`. Done: French Weeks 1–2, Excel Weeks 1–2, Fullstack Weeks 1–3 (~200 questions each; programming snippets verified with `node scripts/check-quiz-code.mjs`); all other weeks still need banks, written a slice at a time (the user doesn't want mass generation).

**Sandboxes (all courses):** subject-native playgrounds, as a course's main resource (`main: true`, listed on the course page) and/or embedded in lessons with a `::sandbox <id>` line. Kinds: `phrases` (French builder with agreement checks, speech), `sheet` (spreadsheet engine in `src/domain/sheet.ts`), `python` (Pyodide in a worker), `web` (HTML/CSS/JS preview). Rules and format: `src/content/SANDBOXES.md`. Done so far: French W1, W2, W3, W7 + main lab; Excel W2, W3, W6 + playground; Fullstack: every day of W1–3 + Python and web playgrounds. Reference solutions live in `scripts/python-solutions/` and `scripts/web-solutions/` (never shipped to the browser); `npm run check:python` and `npm run check:web` (headless Chrome via playwright-core; both in CI) prove each passes and each starter fails. Excel tasks can require `$` references with `mustUse`. Lessons hide answers: `:::hint` blocks and `**Check**` paragraphs render folded.

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
- **Pacing (progress-based):** "today" = first unfinished day (`currentPosition`). Missing an evening never puts you behind.
- **Day complete:** every block ticked + log saved (`missingForDay`).
- **Week unlock:** Week N+1 opens when the Week N quiz is passed; the quiz opens when all 6 days are done.
- **Quiz:** self-marked; pass = every question answered and marked "got it" (`gradeQuiz`), per the plan's "if you can answer all of them, you passed".
- **Streak:** consecutive Mon–Sat study days; Sunday is rest and never breaks or adds; today counts as alive until it ends (`streak`).
- **Logs:** 3 prompts daily; day 7 = Sunday weekly review. "Things That Confused Me" = unresolved non-empty `confused` entries.
- **Emails:** at the learner's `nudge_hour` (default 19:00) in their `timezone` (default Africa/Lagos).

## Commands
- `npm run dev` / `npm run build` / `npm run lint`
- `npm test`: Vitest (parser on the real week files + domain rules)
- `npm run check:python` / `npm run check:web`: prove every sandbox task against its reference solution (CI runs both)
- `node scripts/check-quiz-code.mjs [week-NN]`: run quiz Python snippets and print real output next to each answer key
- `npm run sync:functions`: regenerate `supabase/functions/_shared` after changing `src/domain` or content

## Current state (as of 2026-10-01)
- **Done:** content model + Weeks 1–2 + all 52 outlines; domain rules with tests; Supabase schema; API layer; email function.
- **UI not wired yet:** `src/App.tsx` is still the static dashboard mockup using `src/data/curriculum.ts` (placeholder JS/React modules that don't match the real course; delete it when the UI is rebuilt). The user is designing the UI/UX on claude.ai and will bring it back.
- **Not yet run against a real Supabase project:** no project is linked. The migration was verified in PGlite; `api.ts` and the edge function are type-checked only.
- Fullstack Weeks 4+ need writing.

## Setup still needed (user)
1. Create a Supabase project → run the migration (`supabase link` + `supabase db push`, or paste into the SQL editor) → put the URL + publishable key in `.env.local`.
2. Resend: verify a sending domain, create an API key. Optionally set Resend as Supabase Auth's SMTP so magic-link emails come from the school too.
3. Deploy the function: `supabase secrets set RESEND_API_KEY=… EMAIL_FROM="Scribs & Pixels <school@domain>" APP_URL=… CRON_SECRET=…` then `supabase functions deploy send-nudges --no-verify-jwt`, then run `supabase/setup/schedule-nudges.sql`.

## Open decisions (defaults above are in place until decided)
- Pacing, quiz grading and streak rules: confirm or change the defaults.
- Who writes Weeks 3+, and how (drafted on claude.ai in the week format is the current assumption).
- The "Need a nudge?" button in the mockup: what should it do?
