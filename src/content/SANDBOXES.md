# Sandboxes: hands-on playgrounds native to each subject

Each course has sandboxes in `src/content/courses/<slug>/sandboxes/<id>.yaml`.
- `main: true` → listed on the course page as a free-play resource.
- Embed one in any lesson block with a line of its own: `::sandbox <id>` (it must belong to the same course).
- `npm test` validates every file, checks every embed, **proves every Excel task's model answer** against the real dataset, and requires each course to have a main sandbox.

| kind | Engine | Loaded |
|---|---|---|
| `phrases` | Phrase builder for languages: word tiles in slots, grammar-agreement checks, French contractions/elision, 🔊 text-to-speech, 🎤 pronunciation check (browsers with speech recognition), 🎲 remix, challenges, saved phrases | always light |
| `sheet` | Mini spreadsheet: A1 refs, `$` locks, ~270 functions incl. SUMIFS, XLOOKUP, INDEX/MATCH, TEXTJOIN, dates, PMT (no dynamic-array spilling or LAMBDA), live task checks | on open (~93 KB) |
| `python` | Real CPython 3.14 (Pyodide) in a Web Worker: input() from an Input box, Stop kills infinite loops, 10 s limit on checks, file I/O works | Python downloads from jsDelivr on first Run |
| `web` | HTML / CSS / JS tabs, live sandboxed preview, `console.log` panel | on open |

## `phrases`
```yaml
id: fr-w07-market
kind: phrases
title: "Au marché"
voice: fr-FR
patterns:
  - id: quantity
    label: "Asking for a quantity"
    slots:
      - { id: start, fixed: "Je voudrais" }
      - id: qty
        options:
          - { text: "une bouteille de", en: "a bottle of", needs: { food: [liquid] }, why: "A bottle holds a liquid." }
      - id: food
        options:
          - { text: "eau", en: "water", tags: [liquid] }
challenges:
  - { prompt: "I would like a bottle of water, please.", pattern: quantity, answer: { qty: "une bouteille de", food: "eau" } }
```
- **Agreement:** an option's `needs: { <slot>: [tag, …] }` requires the option chosen in that slot to carry all those tags (`"a|b"` = either). `why` is the message shown when it fails.
- `label` shows on the tile when it must differ from the French `text` (e.g. `Je (a woman)`).
- Write tiles in their full form; the builder handles `à le → au`, `de le → du`, `de + vowel → d'`, `je/le/la/que + vowel`, and punctuation spacing.
- `include: [ids]` merges other phrase sandboxes (the course's main lab includes every lesson set).
- The validator rejects challenges whose answer breaks the pattern's own rules.

## `sheet`
```yaml
id: xl-w06-sumifs
kind: sheet
dataset: { file: sales_2025, rows: 40, columns: [Region, Category, Units, UnitPrice, DiscountPct, PaymentMethod] }
cells: { I2: "Orders from Lagos" }
formulaFill: { G: "=C{r}*D{r}*(1-E{r}/100)" }
tasks:
  - { prompt: "J2: how many orders came from Lagos?", cell: J2, expect: 18, formula: true, hint: "=COUNTIF(A2:A41,\"Lagos\")" }
```
- Datasets: `sales_2025`, `products`, `employees` (NaijaMart). Row 1 = headers, data from row 2.
- Every task needs a model answer: a formula `hint`, a `solution`, or a `solutionFill` (whole columns). **Tests run it and must get `expect`**, so answer keys can't drift from the data.
- `formula: true` rejects typed numbers.
- `mustUse: ["$J$1"]` requires text in the formula (case and spaces ignored), e.g. to prove an absolute or mixed reference was used, not just the right number.
- A hint with extra words after the formula isn't a valid model answer: add `solution`.

## `python`
```yaml
id: py-w01-d3-naira
kind: python
starter: |
  usd = input("Enter amount in USD: ")
tasks:
  - { prompt: "100 → prints 155000", stdin: ["100"], expectOutput: ["155000"] }
  - prompt: "convert_to_naira(10) returns 15500"
    tests: |
      assert convert_to_naira(10) == 15500, "should return 15500"
```
- A task needs `expectOutput` (lines that must appear) and/or `tests` (Python asserts run after the learner's code). Tests can read `__output__` (everything the program printed) and `__code__` (the learner's source), e.g. to require a loop instead of `max()`.
- Every task sandbox needs a reference solution in `scripts/python-solutions/<id>.py` (never shipped). `npm run check:python` (also in CI) proves the solution passes every task and the starter fails at least one.

## `web`
`html`, `css`, `js` starters, optional `tasks` with a `check`: a JavaScript expression run inside the preview page (truthy = done). The learner presses **✓ Check tasks**; hints show only after a failed check.
```yaml
tasks:
  - prompt: "Round the corners of the cards."
    check: "parseFloat(getComputedStyle(document.querySelector('.card')).borderTopLeftRadius) > 0"
    hint: ".card { border-radius: 8px; }"
```
- Checks run one at a time, in order. A check may be async (return a Promise); it's awaited, with a 5 s limit. Test network code by passing a fake: write `async function getJSON(url, fetchFn = fetch)` and have the check call it with a fake fetch.
- `window.__logs` holds every `console.log` line, so checks can test printed output.
- The page is built as `<style>css</style>` + `<body>html<script>js</script></body>`, so learners write body content (a `<title>` in it still counts).
- Check real structure and computed styles, not raw text, so any correct solution passes.
- Reference solution in `scripts/web-solutions/<id>.json` (`{ html?, css?, js? }`, missing parts = the starter's). `npm run check:web` (also in CI) runs every check in headless Chrome: the solution must pass all, the starter must fail at least one. Needs Chrome locally, or set `CHROME_PATH`.
