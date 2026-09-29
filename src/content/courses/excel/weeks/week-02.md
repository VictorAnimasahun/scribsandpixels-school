# Week 2 — First formulas
**Theme:** Make Excel calculate: formatting, arithmetic, and the five essential functions.
**Big question:** *How does Excel turn a grid of numbers into answers?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Excel Skills for Business: Essentials (Coursera)](https://www.coursera.org/learn/excel-essentials) | Enrol for free (audit). Week 1 videos this week. |
| 🌐 | [GCFGlobal — Excel](https://edu.gcfglobal.org/en/excel/) | "Intro to Formulas" and "Functions". |
| 🌐 | [Exceljet — SUM, AVERAGE, COUNT](https://exceljet.net/functions) | Look up each function on the day you learn it. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Excel formatting tips". |
| 📊 | `NaijaMart_Sales_2025.xlsx` | The workbook you saved in Week 1. |

## Day 1 — Monday
**Topic:** Number formatting
**Time:** ~1 hour

### Review (10 min)
From a blank sheet: rename a sheet, add another, AutoFill Jan–Dec, keep a phone number's leading 0.

### Lesson (15 min)
**Formatting changes how a value *looks*, never the value itself.** Check the formula bar: it shows the real value.
| Format | Shortcut / where | Example |
|---|---|---|
| Number with separator | Home → Number → Comma style | 145,000 |
| Currency ₦ | Home → Number → More Number Formats → Currency → ₦ | ₦145,000.00 |
| Percentage | **Ctrl+Shift+%** | 0.15 → 15% |
| Short / long date | **Ctrl+Shift+#** | 12-Mar-25 |
| Increase / decrease decimals | Home → Number buttons | |
| Format Cells dialog | **Ctrl+1** | Everything |

Also on the Home tab: **Bold (Ctrl+B)**, fill colour, borders, alignment, **Wrap Text**, **Merge & Center** (use sparingly; merged cells cause problems with sorting and formulas).

### Practice (20 min)
In NaijaMart_Sales_2025.xlsx, on the Data sheet:
1. Format UnitPrice (column K) as ₦ currency with no decimals.
2. Format OrderDate (column B) as a long date (e.g. *Wednesday, 1 January 2025*), then back to short.
3. Make row 1 bold with a dark fill and white text. Freeze nothing yet.
4. Select column L (DiscountPct): the values are whole numbers (5, 10…), so formatting them as % would show 500%! Leave them. We'll divide by 100 in formulas.

### Mini-Task (10 min)
On a new sheet, type 0.075 and format it as %. What does the cell show, and what does the formula bar show? (**7.5% / 0.075**)

### Log (5 min)
Log. Shortcut of the day: **Ctrl+1**.

## Day 2 — Tuesday
**Topic:** Your first formulas
**Time:** ~1 hour

### Review (10 min)
From memory: format a number as ₦ currency; show 0.2 as 20%.

### Lesson (15 min)
Every formula starts with **=**.
| Operator | Meaning | Example |
|---|---|---|
| + − * / | add, subtract, multiply, divide | `=J2*K2` |
| ^ | power | `=2^3` → 8 |
| ( ) | brackets | `=(A1+B1)/2` |
| & | join text | `=A1&" "&B1` |

**Order of operations:** brackets → powers → × ÷ → + − (like BODMAS). `=10+2*5` = 20, not 60.
**Use cell references, not numbers**: `=J2*K2` updates automatically when J2 changes; `=3*14500` never will.

### Practice (20 min)
On the Data sheet:
1. In N1 type **GrossSales**. In N2: `=J2*K2`. Press Enter.
2. **Double-click the fill handle** of N2 to fill down to row 2401.
3. In O1 type **NetSales**. In O2: `=N2*(1-L2/100)`. Fill down.
4. Format N and O as ₦ currency, no decimals.
5. Select column O and read the Sum in the status bar.

**Check:** N2 = ₦14,500 · O2 = ₦14,500 (no discount) · total net sales **₦834,046,700**

**Sandbox:** do the same exercise on 10 orders right here. Tasks tick green when your cell is right.

::sandbox xl-w02-first-formulas


### Mini-Task (10 min)
In P1 type **DiscountAmount**, and in P2 a formula for how much discount was given (Gross − Net). Fill down. **Check:** total ₦73,631,100.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** SUM, AVERAGE, MIN, MAX, COUNT
**Time:** ~1 hour

### Review (10 min)
Rebuild the NetSales formula in a blank cell from memory.

### Lesson (15 min)
A **function** is a built-in formula: `=NAME(arguments)`.
| Function | Returns | Example |
|---|---|---|
| `=SUM(range)` | total | `=SUM(O2:O2401)` |
| `=AVERAGE(range)` | mean | `=AVERAGE(J2:J2401)` |
| `=MIN(range)` / `=MAX(range)` | smallest / largest | `=MAX(K2:K2401)` |
| `=COUNT(range)` | how many **numbers** | `=COUNT(J2:J2401)` |
| `=COUNTA(range)` | how many **non-empty** cells (text too) | `=COUNTA(C2:C2401)` |
| `=ROUND(value, digits)` | rounds | `=ROUND(AVERAGE(O2:O2401),0)` |

**AutoSum:** select the cell below a column of numbers and press **Alt+=** (Mac: Cmd+Shift+T).
Whole-column references like `=SUM(O:O)` also work and include future rows.

### Practice (20 min)
On the **Summary** sheet, build a Key Figures table:
| A | B |
|---|---|
| Total orders | `=COUNTA(Data!A2:A2401)` |
| Total units | ? |
| Gross sales | ? |
| Net sales | ? |
| Total discount given | ? |
| Average net sale per order | ? |
| Largest single order (net) | ? |
| Average units per order | ? (round to 1 decimal) |

`Data!` means "on the Data sheet". You can also just click the other sheet while typing the formula.

**Check:** 2,400 · 22,129 · ₦907,677,800 · ₦834,046,700 · ₦73,631,100 · ₦347,519 · ₦13,239,600 · 9.2

### Mini-Task (10 min)
Format the Summary table nicely: bold labels, ₦ formats, a border, a title in A1 ("NaijaMart — 2025 Key Figures").

### Log (5 min)
Log. Shortcut: **Alt+=**.

## Day 4 — Thursday
**Topic:** Common formula errors
**Time:** ~1 hour

### Review (10 min)
Recreate 4 of the Key Figures formulas on a blank sheet without looking.

### Lesson (15 min)
| Error | Means | Typical cause |
|---|---|---|
| `#####` | column too narrow | widen it (not really an error) |
| `#DIV/0!` | dividing by zero or an empty cell | `=A1/B1` where B1 is empty |
| `#VALUE!` | wrong type | `=A1+B1` where B1 contains text |
| `#NAME?` | Excel doesn't recognise a name | typo: `=SUMM(A1:A5)` |
| `#REF!` | reference no longer exists | you deleted a row/column a formula used |
| `#N/A` | value not found | lookups (Week 9) |

**Debugging tools:** click the cell and read the formula bar · **F2** colours the referenced cells · Formulas → **Evaluate Formula** (steps through) · **Ctrl+`** shows all formulas in the sheet.

### Practice (20 min)
On a new sheet called **Errors**, deliberately create each of the 6 errors, then fix each one. Write the cause next to it.

### Mini-Task (10 min)
Press **Ctrl+`** on the Data sheet to see all your formulas, then again to switch back.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Formatting for readability
**Time:** ~1 hour

### Review (10 min)
From memory: what causes #DIV/0!, #VALUE! and #REF!?

### Lesson (15 min)
A professional table:
- **Headers:** bold, filled, maybe centred; **freeze** them later (Week 4).
- **Numbers:** right-aligned, same number of decimals, thousand separators.
- **Text:** left-aligned.
- **Borders:** light and thin, or none; use white space.
- **Colour:** 1–2 accent colours maximum. Never rainbow tables.
- **Cell Styles** (Home → Cell Styles) and **Format Painter** (the brush: double-click it to paint many times).
- **Column width:** double-click the border between column letters to autofit.

### Practice (20 min)
Format your Summary sheet and the Data sheet headers professionally, using Format Painter at least 3 times.

### Mini-Task (10 min)
Ask someone to look at your Summary sheet for 5 seconds and tell you the net sales figure. If they can't find it quickly, improve the design.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: weekly expense tracker
**Time:** ~1.5 hours

### Review (15 min)
Rebuild the Key Figures table on a blank sheet, from memory.

### Weekly Project (45 min)
**Build `My_Expenses.xlsx`:**
1. Columns: **Date · Item · Category** (Food, Transport, Data/Airtime, Bills, Family, Other) · **Amount (₦)** · **Payment** (Cash / Transfer / POS)
2. Enter at least 25 real or realistic expenses for the last 2 weeks.
3. Below or beside the table, a summary box: total spent, average expense, biggest expense, smallest expense, number of expenses, and **average per day**.
4. Professional formatting: ₦ format, dates, bold headers, borders, a title.

### Mini-Task (15 min)
Add a cell for your **monthly budget** (e.g. ₦150,000) and a formula for **budget remaining** (budget − total). Format it so a negative number shows in red: Ctrl+1 → Number → negative numbers in red.

### Log (15 min)
Weekly review: 3 biggest things learned · what confuses me · 3 shortcuts learned.

## Quiz
1. What does formatting change, and what does it never change?
2. What's the shortcut for the Format Cells dialog?
3. What's the result of `=10+2*5`? Why?
4. Write a formula for net sales if Units is in J2, UnitPrice in K2 and DiscountPct (as a whole number) in L2.
5. Difference between COUNT and COUNTA?
6. What causes #DIV/0!, #NAME? and #REF!?
7. What's the net sales total for NaijaMart 2025?

**Answers:** (1) how a value looks; never the value itself (2) Ctrl+1 (3) 20: multiplication before addition (4) `=J2*K2*(1-L2/100)` (5) COUNT counts numbers only; COUNTA counts any non-empty cell (6) division by zero/empty cell; unknown function name (typo); deleted reference (7) ₦834,046,700.
