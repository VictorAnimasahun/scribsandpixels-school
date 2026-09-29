# Week 6 — Conditional maths
**Theme:** COUNTIFS, SUMIFS, AVERAGEIFS, MAXIFS: answer business questions with one formula.
**Big question:** *How much did we sell in Lagos, of phones, in Q4, and how do I get that in one formula?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Excel Skills for Business: Intermediate I (Coursera)](https://www.coursera.org/learn/excel-intermediate-1) | Conditional functions module. |
| 🌐 | [Exceljet — SUMIFS](https://exceljet.net/functions/sumifs-function) | Read on Tuesday; also COUNTIFS, AVERAGEIFS, MAXIFS. |
| 📺 | [ExcelIsFun](https://www.youtube.com/@excelisfun) | Search "SUMIFS criteria dates". |
| 📊 | `NaijaMart_Sales_2025.xlsx` · `NaijaMart_HR.xlsx` | |

## Day 1 — Monday
**Topic:** COUNTIF and COUNTIFS
**Time:** ~1 hour

### Review (10 min)
From memory: the OrderSize IFS formula.

### Lesson (15 min)
- `=COUNTIF(range, criteria)`: count cells meeting **one** condition. `=COUNTIF(C2:C2401,"Lagos")`
- `=COUNTIFS(range1, crit1, range2, crit2, …)`: **all** conditions (AND). `=COUNTIFS(C2:C2401,"Kano", I2:I2401,"Phones")`
- **Criteria forms:** `"Lagos"` (exact) · `">=1000000"` (number comparison in quotes) · `"<>Cash"` (not) · `"*Lagos*"` (contains) · `""` (blank)
- **Use cell references** for criteria: `=COUNTIFS(C2:C2401, X2)`, so you can build a summary table with one formula filled down.
- Numbers + cell: `">="&X2`

Also: `=COUNTBLANK(range)`, `=COUNTA(range)`.

### Practice (20 min)
On the Summary sheet, build a table: the 6 regions in X2:X7 and in Y2 `=COUNTIFS(Data!$C$2:$C$2401, X2)`, filled down. Then:
1. Orders per region (the table).
2. Orders with no discount.
3. Orders ≥ ₦1,000,000 (use the NetSales column).
4. Orders in Kano for Phones.

**Check:** Lagos 951 · Abuja 514 · Port Harcourt 282 · Kano 228 · Enugu 219 · Ibadan 206 · no discount **1,217** · ≥ ₦1M **140** · Kano Phones **17**

### Mini-Task (10 min)
Count the Lagos stores' orders with a wildcard: `=COUNTIF(Data!D2:D2401,"Lagos*")` (**951**).

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** SUMIF and SUMIFS
**Time:** ~1 hour

### Review (10 min)
From memory: COUNTIFS with two conditions.

### Lesson (15 min)
`=SUMIFS(sum_range, criteria_range1, crit1, criteria_range2, crit2, …)`. The **sum range comes first**.
- `=SUMIFS(Data!$O$2:$O$2401, Data!$C$2:$C$2401, X2)`: net sales for the region in X2
- `=SUMIFS(Data!$O$2:$O$2401, Data!$C$2:$C$2401,"Lagos", Data!$I$2:$I$2401,"Phones")`
(Older `SUMIF(range, criteria, sum_range)` has a different argument order; prefer SUMIFS always.)

### Practice (20 min)
Extend your Summary table:
1. Net sales per region (column Z), with % of total (you did this by hand in Week 3; now it's automatic).
2. A new table: **net sales per Category** (10 categories).
3. A table: net sales per **CustomerType** and per **PaymentMethod**.
4. Net sales for Lagos Phones.

**Check:** Lagos ₦321,703,800 · Groceries ₦157,534,275 (the top category) · Wholesale ₦409,543,290 · Transfer ₦352,411,740 · Lagos Phones **96 orders, ₦44,661,850**

### Mini-Task (10 min)
Units sold per category with SUMIFS on column J. **Check:** Groceries 8,102 · Computers 199.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** Date criteria
**Time:** ~1 hour

### Review (10 min)
From memory: SUMIFS for one region and one category.

### Lesson (15 min)
Dates in criteria use comparison operators joined to a date:
- `=SUMIFS(O:O, B:B, ">="&DATE(2025,10,1), B:B, "<="&DATE(2025,12,31))` → Q4
- With cells: start date in X20, end date in Y20: `">="&X20` and `"<="&Y20`
- One month: `">="&DATE(2025,3,1)` and `"<"&DATE(2025,4,1)`
**Monthly table trick:** first day of each month in a column (1/1/2025, 1/2/2025…) and use `">="&X2` and `"<"&EDATE(X2,1)` (EDATE adds months; more in Week 8).

### Practice (20 min)
1. Q4 net sales and number of Q4 orders.
2. Build a **monthly net sales table** for 2025 (12 rows).
3. Which month is highest and lowest?

**Check:** Q4 **₦275,880,675** from **761** orders · best **December ₦109,612,345** · worst **January ₦43,211,125**

### Mini-Task (10 min)
Add a second criterion: December net sales for **Lagos** only.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** AVERAGEIFS, MAXIFS, MINIFS
**Time:** ~1 hour

### Review (10 min)
Rebuild the monthly table's first row from memory.

### Lesson (15 min)
Same pattern as SUMIFS: **result range first**, then criteria pairs:
- `=AVERAGEIFS(O:O, C:C, "Lagos")`: average order value in Lagos
- `=MAXIFS(O:O, C:C, "Kano")`: biggest Kano order
- `=MINIFS(K:K, I:I, "Phones")`: cheapest phone price

### Practice (20 min)
Add to the region table: **average order value** and **largest order** per region.
Which region has the highest average order value? Which has the smallest "largest order"?

**Check:** average: Ibadan **₦396,966** (highest) · Port Harcourt ₦318,051 (lowest) · largest: Lagos and Enugu ₦13,239,600 · Port Harcourt only ₦4,792,500

### Mini-Task (10 min)
Salesperson ranking: a list of the 27 salespeople (copy the column, Data → Remove Duplicates) with SUMIFS for each. Who's top? (**Tolu Eze, ₦54,011,110**)

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** HR analysis with conditional functions
**Time:** ~1 hour

### Review (10 min)
From memory: MAXIFS and AVERAGEIFS for one region.

### Lesson (15 min)
Same tools, a different department. In NaijaMart_HR.xlsx, build a **Department summary**:
| Department | Headcount | Monthly payroll | Average salary | Highest salary | Women | Men |
|---|---|---|---|---|---|---|

- Headcount: COUNTIFS · Payroll: SUMIFS · Average: AVERAGEIFS · Highest: MAXIFS · Women: COUNTIFS with Department **and** Gender="F"

### Practice (20 min)
Build the table for the 6 departments plus a total row.

**Check:** headcount Sales 52 · Operations 18 · Finance 16 · IT 13 · Marketing 11 · HR 10 · total monthly payroll **₦45,004,000** · Sales payroll ₦15,750,000

### Mini-Task (10 min)
Annual payroll cost (× 12) and each department's share (%).

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: regional sales summary
**Time:** ~1.5 hours

### Review (15 min)
From a blank sheet: COUNTIFS, SUMIFS with dates, AVERAGEIFS, MAXIFS.

### Weekly Project (45 min)
**Build a `Regional Report` sheet** (all formulas, no typed numbers):
1. **Selector cell:** type a region name in B1 (later you'll make it a drop-down).
2. For that region: orders, units, gross sales, net sales, average order, largest order, share of company sales, Q1–Q4 net sales, top category (for now: a category table with SUMIFS; spot the largest by eye).
3. **Store table** for all 9 stores: orders and net sales.
4. Format it as a one-page printable report.

**Check (stores):** Lagos - Ikeja is top with ₦131,822,325 · Abuja - Garki lowest with ₦58,221,055.

### Log (15 min)
Weekly review.

## Quiz
1. In SUMIFS, which argument comes first?
2. Write criteria for "greater than or equal to the value in X2".
3. Write the criteria pair for "all of Q4 2025".
4. What's the difference between COUNTIF and COUNTIFS?
5. How do you count cells that *contain* "Lagos"?
6. Which function gives the largest value meeting a condition?
7. What were NaijaMart's Q4 net sales?

**Answers:** (1) the sum range (2) `">="&X2` (3) `B:B,">="&DATE(2025,10,1), B:B,"<="&DATE(2025,12,31)` (4) one condition vs several (AND) (5) `"*Lagos*"` (6) MAXIFS (7) ₦275,880,675.
