# Scribs & Pixels School

A multi-course online school for adult self-learners with day jobs. Its core idea is **accountability over content**: the school gives the daily structure, the review loop, streaks and nudges, and links out to free external resources (YouTube, freeCodeCamp, CS50, books) for the actual teaching.

## Courses
1. **12-Month Fullstack + ML** (first course, in progress). Full source content: [docs/courses/fullstack-ml-12-month.md](docs/courses/fullstack-ml-12-month.md).
   - 6 phases, 52 weeks. Only Weeks 1–2 have written daily plans; Weeks 3+ are outlines and get written as the learner progresses.
   - The first learner (Victor) started June 2026, passed the Week 1 quiz (100%) and is on Week 2.
   - Audience: Nigeria + Canada job markets. Examples use Nigerian context (Naira, Lagos, Abuja).

More courses will follow, so nothing in the data model or UI should assume a single course.

## Course structure (what the app must model)
```
Course → Phase (milestone, key resources) → Week (theme, big question, resources, quiz, unlock rule)
       → Day (Mon–Sat, topic, time) → Blocks
```
- **Daily blocks:** Review 30m · Lesson 45m · Practice 45m · Mini-task 30m · Log 10m. Saturday is a project day (Weekly Project + FreeCodeCamp).
- **Sunday:** rest + 1-hour weekly review. No new content.
- **Log:** 3 prompts every day: what I learned / what confused me / what I'll review tomorrow. Saturday adds weekly-review prompts.
- **Week quiz:** self-check questions answered in the log. **The next week unlocks only after the quiz is passed.**
- **Resources:** typed as 📺 video · 📗 reading · 🌐 interactive course, each with a "how to use it" note.
- **Running notes per learner:** Things That Confused Me, Wins, Applications Sent (date, company, role, platform, status). Job applications start in Phase 1.
- **Learning rules** (show them in the UI): never skip review · watch twice · type, don't copy · confusion is good · apply early.

## Stack
- React 19 + TypeScript + Vite 8, lint with oxlint. Plain CSS (tokens on `:root` in `src/App.css`).
- **Supabase** (planned): Postgres, auth, and edge functions + pg_cron for scheduled jobs.
- **Resend** (planned): email for messages and nudges. The API key lives only in Supabase edge-function secrets, never in the client. It can also be Supabase Auth's SMTP provider.
- Git remote: `github.com/VictorAnimasahun/scribsandpixels-school`

## Current state (as of 2026-09-24)
- `src/App.tsx`: a single static dashboard mockup (sidebar, today's task hero, curriculum path, check-in). Everything shown is hardcoded: name, date, streak, week dots, counts.
- `src/data/curriculum.ts`: placeholder data (JS/React modules) that **does not match the real course**. Replace it with the real model. `idiomaticExpressions` is unused and its purpose is unknown.
- `src/index.css` is malformed (base styles nested in an unclosed `:root`), so fonts and background don't apply.
- No routing, no Supabase, no Resend, no auth, no persistence. Nothing committed to git yet.

## Roadmap
1. Fix `index.css`, remove Vite template leftovers, make the first commit.
2. Supabase schema: content tables (`courses, phases, weeks, days, day_blocks, resources, quiz_questions`) and learner tables (`profiles, enrollments, day_progress, block_progress, logs, quiz_attempts, confusions, wins, job_applications`), with RLS.
3. Seed Weeks 1–2 (and the Phase 1–6 outlines) from the course markdown.
4. Auth (Supabase magic link).
5. Routing and pages: Dashboard, Today/Day view (blocks + log form), Course/curriculum map, Week quiz, Running notes (confusions, wins, applications), Settings.
6. Wire the dashboard to real data: today's day, streak, week dots, check-in count.
7. Quiz + week unlock gating.
8. Resend emails through edge functions + pg_cron: daily nudge, streak-at-risk, Sunday weekly-review digest, "Need a nudge?" button.
9. Course catalog + enrollment for multiple courses.
10. Deploy (Vercel/Netlify for the SPA; Supabase hosted).

## Open decisions
- Pacing: is "today" the next incomplete day (progress-based) or tied to the calendar from the start date?
- Quiz grading: self-marked, auto-checked, or AI-reviewed?
- Who writes Weeks 3+, and how? (Admin UI, markdown seeds, or AI-generated when a week unlocks?)
- Streak rules: does Sunday count, and is there any grace for missed days?
- Timezone for the daily cutoff and emails (default Africa/Lagos, set per user).
