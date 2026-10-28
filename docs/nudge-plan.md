# Nudge in the school: plan

**Decided with Victor (26 Oct 2026):**
- ~~It's **its own app**~~ **Changed (28 Oct 2026): Nudge stays part of the school** ("leave it inside Scribs school, at least for now"). It's a section of the school (`#/nudge`, in the sidebar) with no separate install. A separate web install and Android app were built and then removed at Victor's request; they're in git history (commits f4e6901 and ba50627) if that's ever wanted.
- It nudges about class work (lessons due, quizzes waiting, cooldowns ending), not only life trackers.
- **Customisable:** preset trackers you can switch on and off, your own trackers, your own goals, card order and reminders.
- **First slice:** trackers and insights, with no AI.
- **Privacy:** admins see a learner's life data **only if that learner opts in**.

Source app: `~/Desktop/my_everything_app` (Kotlin, "Nudge"). Its specs are in `~/Downloads/Personal assistant app/files.zip`: day planner, insights engine, personalization (bandit), notifications/AI, voice replies, backend `/suggest`. The Kotlin repo is the reference and is not changed from here.

## How it fits
Nudge is a section of the school, with its own screens and navigation inside it. It shares the school's **code, account, install and database**:
- It can read school progress directly, so "Week 4 Day 2 is waiting" and "your checkpoint cooldown ends at 18:40" come for free from the existing domain rules (`today.ts`, `progress.ts`, `quizGate.ts`).
- One sign-in. The same Supabase project, the same row-level security style and the same tests.
- **Web and Android:** route `#/nudge` with its own layout, inside the school's install and the school's APK.

Why not a separate codebase? Two copies of the account, sync and progress logic would drift. The class nudges would need an API just to ask the school what's due.

## Slice 1: trackers, goals, layout, reminders, insights (no AI)

### Trackers (pure, in `src/domain/nudge/`)
A tracker is a definition plus daily entries.
- **Kinds:** `check` (done/not done), `count` (cups, pages), `number` (with a unit: kg, minutes), `scale` (1–5, e.g. mood), `duration` (sleep hours).
- **Target:** at least or at most a value, per day or per week. For example: water at least 8 cups a day; sugar-free days at least 5 a week.
- **Presets,** taken from Nudge's 10 home cards (food, exercise, word of the day, book, weight, tasks, mood, sleep, water, get ready). Each has sensible default goals that can be edited. Food logs meals with calories and protein, as Nudge does.
- **Custom trackers:** name, kind, unit, target, icon and colour from the design tokens.
- **Per-tracker streak:** days meeting the target in a row. Weekly targets count weeks.
- **Today page:** the cards you enabled, in your order, each with quick-log buttons.

### Class nudges
These are computed from school state:
- the next lesson due, and days behind;
- a week quiz unlocked or overdue;
- when a checkpoint cooldown ends;
- whether the streak is at risk today.

They appear at the top of Nudge's Today, with a link straight to the lesson.

### Insights
This is a port of the spec's `insights-engine-spec.md`, as pure TypeScript with tests.
- **Detectors:** trend (at least 7 days), deviation from your own 30-day baseline (at least 10 days of history), correlation between two trackers (at least 14 paired days and |r| ≥ 0.4), and day-of-week patterns (at least 3 of each weekday).
- **Guardrails:** below a threshold a detector returns nothing. The wording says "tends to go with", never "causes". The same insight doesn't repeat within 7 days. Only the last 30 days count.
- **Stats page:** a chart per tracker, plus its insights.

### Reminders
- Per tracker: on or off, and an hour.
- Delivered by email through the existing `send-nudges` function. This needs the function deployed, which is still on Victor's setup list.
- Android notifications come with the school APK, in slice 2.

### Data and privacy
- **New migration:**
  - `nudge_trackers`: the learner's tracker definitions, order and reminders.
  - `nudge_entries`: one row per tracker per date, plus food meals.
  - `profiles.share_life_with_admin`: false by default.
- **Row-level security:**
  - The owner has full access to their own rows.
  - An admin can *read* them only while the owner's share flag is on. Turning it off hides them again immediately.
  - Nobody else sees anything.
- `npm run check:db` gets attacks for each rule: another learner, an admin without consent, an admin after consent is withdrawn, anonymous access.
- **Sync:** the same local-first store and three-way merge as course progress (`syncModel.ts`), so Nudge works offline and across devices.
- **Signing out** clears Nudge data from the device, as it does for course progress.

### Verification
- Unit tests for every domain rule: target checks, streaks, every insight detector and its guardrails, the class nudges.
- `check:db` attacks; `check:accounts` extended (two devices log water; one unlogs it).
- e2e at phone width.
- `check:offline` (log while offline, then sync).

## Slice 2 (after slice 1 is in use)
- The Nudge Android APK with local notifications.
- The nightly day-plan draft (`day-planner-engine-spec.md`) and the assistant chat, through a Supabase function holding the Anthropic key. Victor adds the key as a secret, and there is an ongoing API cost.
- The personalization bandit (`personalization-engine-spec.md`), which ranks which nudge or insight to show first from what you tap or dismiss.
- Get Ready (weather + outfit) and voice replies.
