# Course content

Each course has a framework file and one markdown file per written week:

```
src/content/courses/<course-slug>/
  course.ts           phases, rules, daily structure, resources, 52 week outlines
  weeks/week-01.md    one file per written week, in order (no gaps)
```

A new week goes live as soon as its file is added: it appears in the course, and learners who passed the previous week's quiz can start it. `npm test` parses every week file and fails with `file:line` if one is malformed. After adding or changing a week, run `npm run sync:functions` so the email function knows the new topics.

## Week file format

Write weeks in exactly this shape. It's plain markdown, so a week drafted in a chat can be pasted in directly.

````markdown
# Week 3 — The Web is Just Text
**Theme:** One sentence on what this week is about.
**Big question:** *The question the week answers?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Video title](https://…) | When and how to watch it. |
| 📗 | [Reading title](https://…) | When to read it. |
| 🌐 | [Interactive course](https://…) | Which steps to do. |

## Day 1 — Monday
**Topic:** Today's topic
**Time:** ~2.5 hours

### Review (30 min)
Markdown: lists, **bold**, links, code blocks — anything.

### Lesson (45 min)
…

### Practice (45 min)
```python
# Code blocks are fine, including # comments.
print("hello")
```

### Mini-Task
…

### Log (10 min)
Optional extra prompts; the app always asks the three standard log questions.

## Day 2 — Tuesday
…

## Day 6 — Saturday
**Topic:** Project day
**Time:** ~3 hours

### Review (30 min)
### Weekly Project (2 hours)
### FreeCodeCamp (30 min)
### Log (10 min)

## Quiz
1. First self-check question?
2. Second?

Optional note shown under the quiz.
````

Rules the parser enforces:
- Exactly one `# Week N — Title`. Sections are only `## Resources`, `## Day N — Weekday` and `## Quiz`.
- Days are Monday (1) to Saturday (6); each needs `**Topic:**` and at least one `###` block.
- Block kind comes from the heading: Review, Lesson, Practice, Mini-Task, anything containing "Project", FreeCodeCamp, Log. Any other heading is allowed and becomes a custom block.
- Duration goes in brackets at the end of the heading: `(30 min)` or `(2 hours)`. Without it, the standard time for that kind is used.
- Resource emoji: 📺 video · 📗 reading · 📕 book · 🌐 interactive · 🧩 practice.
- Don't rename or reorder blocks in a week learners have already started: progress is saved per block (`review`, `lesson`, `mini-task`, …).
