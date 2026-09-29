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
- A task needs `expectOutput` (lines that must appear) and/or `tests` (Python asserts run after the learner's code).
- Before committing, run each task against a reference solution (see git history for the Week 1–2 check).

## `web`
`html`, `css`, `js` starters, optional `tasks` (instructions only, not auto-checked yet).
