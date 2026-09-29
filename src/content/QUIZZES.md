# Daily quizzes: rules and format

Applies to **every course**. Each written week has a matching quiz file:
`src/content/courses/<slug>/quizzes/week-NN.yaml`. `npm test` validates every file.

## The rules

Every study day (Mon–Sat) has **2 quizzes**, plus a **gate** on random days:

| Quiz | When | Gating |
|---|---|---|
| **Rapid-fire** | After the lesson, every day | Timed per question; required to complete the day |
| **Brain teaser** | After practice, every day | Harder, applied questions; required to complete the day |
| **Gate** (checkpoint) | **Random: 1–2 times a week, on random days**, a different pattern each week and for each learner (`gateDaysForWeek`). Pops up before the day's lesson and tests the **previous day** (on a Monday: the previous week) | **Blocks the dashboard and all learning materials until passed** |

Because any day can be picked, **every day still needs a gate bank** in the quiz file.

**Gate rules** (defaults in `DEFAULT_QUIZ_RULES`, `src/content/quizzes.ts`):
- **Pass mark 70%.**
- **Fail → 60-minute cooldown.** During the cooldown the learner still **cannot access the dashboard** or any material.
- **Retry = same topics, same difficulty mix, different questions.** Each attempt draws its `blueprint` (e.g. 2 easy + 3 medium + 1 hard) from the bank, preferring unseen questions. Once a bank is exhausted, the least recently seen questions return first.
- A bank must hold **≥ 3 attempts' worth** of questions per difficulty (blueprint 2/3/1 → at least 6/9/3 = 18 questions).

**Rapid-fire:** `secondsPerQuestion` per question (7–10 s). Running out of time = wrong. Answers are tapped (MCQ, true/false) or typed (short).
**Typed answers:** case, extra spaces and a final `.!?` are ignored. Missing accents are accepted but flagged ("accent slip") unless the question sets `accents: strict`.

Engine: `src/domain/quizGate.ts` (`drawAttempt`, `markAnswer`, `gradeAttempt`, `gateStatus`, `isLocked`), fully tested.

## Question types

| type | Fields | Use for |
|---|---|---|
| `mcq` | `choices`, `answer` (0-based index) | one correct option |
| `multi` | `choices`, `answers` (indexes) | "select all that apply" |
| `truefalse` | `answer: true/false` | fast checks |
| `text` | `accept` (all correct forms; first = model answer), optional `accents`, `case` | typed answers, translations, formulas |
| `order` | `items` **in the correct order** (the app shuffles) | sentence building, steps |
| `match` | `pairs` of `[left, right]` **matched correctly** (the app shuffles) | vocab, definitions |

Every question has `id` (unique, e.g. `fr-w01-d2-g07`), `difficulty` (`easy` / `medium` / `hard`), `prompt`, optional `code` (a snippet shown in a monospace block) and optional `explain` (shown after answering).

## File shape

```yaml
week: 1
days:
  - day: 2
    gate:
      title: "Checkpoint: greetings and politeness"
      covers: "Week 1 · Day 1: greetings, tu/vous, politeness"
      blueprint: { easy: 2, medium: 3, hard: 1 }
      bank:
        - { id: fr-w01-d2-g01, difficulty: easy, type: mcq, prompt: "…", choices: ["…", "…"], answer: 1 }
        # … 18+ questions
    quizzes:
      - kind: rapid-fire
        title: "Alphabet sprint"
        secondsPerQuestion: 8
        questions: [ … 10–12 questions ]
      - kind: brain-teaser
        title: "Spell it right"
        questions: [ … 5 questions, medium/hard ]
```

## Writing good questions
- Test **the day's actual content**. A gate may only ask what the covered day taught.
- Distractors must be **plausible** (common learner mistakes), never silly.
- `text` answers: list every acceptable form (with/without final punctuation, both word orders if valid).
- Brain teasers: apply, transform, spot the error, combine two skills. Not recall.
- Use `explain` whenever the "why" isn't obvious.
- Excel courses: when a question uses NaijaMart data, the answer must match the dataset (see the course's `datasets/`).
