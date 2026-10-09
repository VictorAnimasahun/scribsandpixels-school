# UI design (October 2026)

The source design for the learner app, made on claude.ai as a Design canvas
("Scribs & Pixels School UI"). Each `.dc.html` file is one artboard of that canvas; they need the
canvas runtime to render, so treat them as reference markup. The app's real implementation lives in
`src/viewer/` (`Viewer.tsx`, `viewer.css`).

## Idea

An exercise book that fills with pixels.

- **Ruled pages with a red margin.** A day's blocks sit on a ruled sheet; a finished block gets a red tick in the margin.
- **The learner's own words in handwriting** (Kalam): log entries, "Still confusing you". The school's own text never uses it.
- **One square per study day.** A 52-week (or course-length) ledger grouped by phase: small on Today, full on the course page.
- **Checkpoints go dark.** The gate lock and its cooldown are the only dark screens, so a lock is obvious.

## Tokens

| Token | Value | Use |
|---|---|---|
| paper | `#F2F5EC` | page ground |
| sheet | `#FBFCF7` | ruled sheets, cards |
| ink | `#16211D` | text |
| ink-2 | `#55615A` | secondary text (4.5:1 on paper) |
| rule | `#D8E0D2` / `#E1E8DA` | borders, ruled lines, empty pixels |
| green | `#164F3B` | primary actions, done pixels |
| lime | `#C7E85C` | today, current, passes on dark |
| margin | `#E9A595` | the red margin line |
| pen | `#C24A33` | margin ticks, focus rings, wrong answers |
| hand-ink | `#1F3A8A` | handwriting (learner's words) |
| night | `#16211D` | checkpoint screens |

Type: **Literata** (headings, lesson prose), **Public Sans** (interface), **Kalam** (learner's handwriting),
**JetBrains Mono** (code). Touch targets ≥ 44px.

## Screens

| Artboard | Screen | Route |
|---|---|---|
| `Main.dc.html` | Today (phone) | `#/` |
| `Lesson.dc.html` | Day page | `#/c/<slug>/w/<n>/d/<n>` |
| `Checkpoint.dc.html` | Checkpoint question | gate lock over any page |
| `Cooldown.dc.html` | Checkpoint failed, cooldown | gate lock |
| `Nudge.dc.html` | "Need a nudge?" sheet | from Today |
| `Year.dc.html` | Your year (phase ledger) | `#/c/<slug>` |
| `Desktop.dc.html` | Today on desktop | `#/` at ≥ 1000px |

Open UX questions (decided in the UX pass, not here): what the 10-minute version counts for, whether
lessons stay readable during a cooldown, whether a failed checkpoint counts toward the streak.
