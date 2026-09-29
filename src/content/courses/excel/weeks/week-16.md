# Week 16 — LET & LAMBDA
**Theme:** Write readable formulas with LET, and create your own reusable Excel functions with LAMBDA.
**Big question:** *What if Excel doesn't have the function I need?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Exceljet — LET](https://exceljet.net/functions/let-function) · [LAMBDA](https://exceljet.net/functions/lambda-function) | Read on Monday and Wednesday. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "LAMBDA function Excel". |
| 🌐 | [Microsoft Support — LAMBDA](https://support.microsoft.com/en-us/excel) | Search "LAMBDA function". |
| 📊 | `tblSales` · `Customers_Clean.xlsx` · `NaijaMart_HR.xlsx` | Microsoft 365 required. |

## Day 1 — Monday
**Topic:** LET: variables inside formulas
**Time:** ~1 hour

### Review (10 min)
From memory: the top 10 products formula (UNIQUE + SUMIFS + SORT + TAKE).

### Lesson (15 min)
`=LET(name1, value1, name2, value2, …, calculation)`
Name the pieces of a long formula once and reuse them. It's faster (calculated once) and readable:
```
=LET(
  products, UNIQUE(tblSales[Product]),
  sales,    SUMIFS(tblSales[NetSales], tblSales[Product], products),
  TAKE(SORT(HSTACK(products, sales), 2, -1), 10)
)
```
Use **Alt+Enter** for line breaks and widen the formula bar (Ctrl+Shift+U).

### Practice (20 min)
Rewrite with LET:
1. The top 10 products formula.
2. The phone-cleaning formula from Week 7 (steps: remove spaces, remove dashes, fix +234/234).
3. The commission formula with the 3 tiers.

### Mini-Task (10 min)
Compare the old and LET versions of the phone formula. Which would a colleague understand?

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** LET for complex calculations
**Time:** ~1 hour

### Review (10 min)
From memory: a LET with two variables.

### Lesson (15 min)
LET is ideal for multi-step business logic. Example, **PAYE-style tax on a monthly salary** with bands (simplified, for practice):
```
=LET(
  annual, I2*12,
  relief, 200000 + 20%*annual,
  taxable, MAX(0, annual - relief),
  tax, IFS(taxable<=300000, taxable*7%,
           taxable<=600000, 21000 + (taxable-300000)*11%,
           TRUE, 54000 + (taxable-600000)*15%),
  tax/12
)
```
(These bands are a teaching simplification, not current tax law. Always check the latest official rules for real payroll.)

### Practice (20 min)
Add a **MonthlyTax** column to the HR table with this LET formula, then **NetPay** = salary − tax. What's the total monthly tax for all 120 staff? (**₦4,740,480**)

### Mini-Task (10 min)
Move the relief and band values into an Inputs table and reference them from the LET.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** LAMBDA: your own functions
**Time:** ~1 hour

### Review (10 min)
From memory: rewrite any IF chain as a LET.

### Lesson (15 min)
`=LAMBDA(param1, param2, …, calculation)` defines a function.
1. Test it in a cell by calling it immediately: `=LAMBDA(u,p,d, u*p*(1-d/100))(10, 14500, 5)` → 137,750
2. Save it: Formulas → **Name Manager** → New → Name: **NETSALES** → Refers to: `=LAMBDA(u,p,d, u*p*(1-d/100))`
3. Use it anywhere in the workbook: `=NETSALES([@Units],[@UnitPrice],[@DiscountPct])`

Add a description in the Name Manager comment; it shows as a tooltip.

### Practice (20 min)
Create and test these named LAMBDAs:
1. **VAT**(amount) → amount × 7.5%
2. **MARGINPCT**(price, cost) → (price − cost)/price
3. **AGEON**(birthdate, asof) → completed years
4. **CLEANPHONE**(text) → an 11-digit Nigerian number (reuse your LET from Monday)

**Check:** `=MARGINPCT(145000,118000)` → **18.6%** · `=CLEANPHONE("+234 803-123-4567")` → **08031234567**

### Mini-Task (10 min)
Use CLEANPHONE on the whole messy customers Phone column.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** MAP, BYROW, BYCOL, REDUCE, SCAN
**Time:** ~1 hour

### Review (10 min)
From memory: create a named LAMBDA in the Name Manager.

### Lesson (15 min)
Helper functions apply a LAMBDA across arrays:
| Function | Does | Example |
|---|---|---|
| `MAP(array, LAMBDA(x, …))` | transforms each value | `=MAP(C2:C316, LAMBDA(p, CLEANPHONE(p)))` |
| `BYROW(array, LAMBDA(row, …))` | one result per row | `=BYROW(B2:D21, LAMBDA(r, AVERAGE(r)))` (average of 3 test scores) |
| `BYCOL(array, LAMBDA(col, …))` | one result per column | column maxima |
| `SCAN(start, array, LAMBDA(acc, x, …))` | running values | a cumulative total: `=SCAN(0, monthly, LAMBDA(a,x,a+x))` |
| `REDUCE(start, array, LAMBDA(acc, x, …))` | one final value | |

### Practice (20 min)
1. Monthly 2025 net sales (SEQUENCE + SUMIFS), then a year-to-date running total with SCAN. What's the YTD at the end of June? (**₦349,997,035**)
2. Student grades (Week 5 project): BYROW averages of each student's 3 scores.

### Mini-Task (10 min)
MAP your CLEANPHONE over the messy phone column. Compare with the column you built with plain formulas in Week 7.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Organising a function library
**Time:** ~1 hour

### Review (10 min)
From memory: SCAN for a running total.

### Lesson (15 min)
Good practice for custom functions:
- **UPPERCASE names**, clear parameters (`units, price, discount_pct`)
- A **description** in the Name Manager
- A **"Functions" sheet** documenting each: name, parameters, example, expected result
- Test edge cases (blank cells, zero, text)
- To reuse in another workbook: copy a sheet that uses them (the names come along), or use the free **Advanced Formula Environment** add-in from Microsoft Garage.

### Practice (20 min)
Create the Functions documentation sheet for your 4+ LAMBDAs, with a test row for each.

### Mini-Task (10 min)
Make a new LAMBDA of your choice that would save you time at work.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: my custom function library
**Time:** ~1.5 hours

### Review (15 min)
From a blank workbook: a LET formula, one named LAMBDA, a MAP.

### Weekly Project (45 min)
**`My_Function_Library.xlsx`**: at least **8** documented, tested LAMBDAs useful for Nigerian business work, for example: NETSALES, VAT, MARGINPCT, CLEANPHONE, AGEON, TENUREYEARS, NAIRAWORDS (optional challenge: a number in words), WORKDAYSNG (NETWORKDAYS with a named holiday list), GRADE (A–F), COMMISSION (tiered).
Each with: name, description, parameters, 2 test cases with expected results.

### Log (15 min)
Weekly review.

## Quiz
1. What are the two benefits of LET?
2. Write a LET that calculates net sales from units, price and discount.
3. How do you save a LAMBDA as a reusable function?
4. How do you test a LAMBDA before saving it?
5. What does MAP do?
6. Which helper function gives a running total?
7. What should a well-documented custom function include?

**Answers:** (1) readability and speed (calculated once) (2) `=LET(u,J2,p,K2,d,L2,u*p*(1-d/100))` (3) Name Manager → New → Refers to `=LAMBDA(…)` (4) call it immediately: `=LAMBDA(x,…)(test value)` (5) applies a LAMBDA to every value of an array (6) SCAN (7) a clear name, description, parameters, examples and test cases.
