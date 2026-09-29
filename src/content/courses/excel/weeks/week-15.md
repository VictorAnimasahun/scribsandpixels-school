# Week 15 — Dynamic arrays
**Theme:** Formulas that return whole tables: FILTER, SORT, UNIQUE, SEQUENCE and friends.
**Big question:** *Can one formula replace a whole report?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "dynamic arrays FILTER UNIQUE SORT". |
| 📺 | [ExcelIsFun](https://www.youtube.com/@excelisfun) | Search "dynamic array formulas". |
| 🌐 | [Exceljet — Dynamic array formulas](https://exceljet.net/articles/dynamic-array-formulas-in-excel) | Read on Monday. |
| 📊 | `tblSales` · `tblProducts` | Microsoft 365 / Excel 2021+ (or Excel for the web) required this week. |

## Day 1 — Monday
**Topic:** Spill and UNIQUE
**Time:** ~1 hour

### Review (10 min)
From memory: a PMT formula and a Goal Seek setup.

### Lesson (15 min)
A **dynamic array formula** returns many values that **spill** into neighbouring cells.
- `=UNIQUE(tblSales[Region])` → the 6 regions, one per row
- Refer to a whole spill range with **#**: `=COUNTA(H2#)`
- **#SPILL!** error = something is blocking the cells where the result wants to go. Clear them.
- `=UNIQUE(range, , TRUE)` → values that appear **exactly once**
- `=SORT(UNIQUE(tblSales[Salesperson]))` → alphabetical list
- Old-style array maths now "just works": `=tblSales[Units]*tblSales[UnitPrice]` spills 2,400 results.

### Practice (20 min)
1. A sorted unique list of salespeople. How many? Who's first alphabetically?
2. Next to it: `=SUMIFS(tblSales[NetSales], tblSales[Salesperson], H2#)`. One formula for all 27!
3. A unique list of Region + Category pairs: `=UNIQUE(tblSales[[Region]:[Store]])` (try different column pairs).

**Check:** 27 salespeople · first **Adaeze Garba**, last **Zainab Obi**

### Mini-Task (10 min)
Put `=COUNTA(UNIQUE(tblSales[Product]))` in a KPI cell (**40**).

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** FILTER
**Time:** ~1 hour

### Review (10 min)
From memory: UNIQUE + SUMIFS with a spill reference.

### Lesson (15 min)
`=FILTER(array, include, [if_empty])`
- `=FILTER(tblSales, tblSales[Region]="Lagos")`: every Lagos order, all columns
- **AND** = multiply conditions: `=FILTER(tblSales, (tblSales[Region]="Lagos")*(tblSales[NetSales]>=1000000))`
- **OR** = add conditions: `(tblSales[Region]="Kano")+(tblSales[Region]="Abuja")`
- Always give `if_empty`: `…, "No results")`
- Filter by a selector cell: `tblSales[Region]=$B$1`

### Practice (20 min)
1. Lagos orders ≥ ₦1,000,000. How many rows spill?
2. December orders from Lagos (use dates ≥ 1/12/2025). How many?
3. A "live search": a cell B1 where you type part of a product name; `=FILTER(tblSales, ISNUMBER(SEARCH(B1, tblSales[Product])), "No match")`

**Check:** 1. **53** 2. **122**

### Mini-Task (10 min)
FILTER only some columns: wrap with CHOOSECOLS: `=CHOOSECOLS(FILTER(…), 1, 2, 8, 15)` → OrderID, Date, Product, NetSales.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** SORT, SORTBY, TAKE, DROP
**Time:** ~1 hour

### Review (10 min)
From memory: FILTER with two AND conditions.

### Lesson (15 min)
- `=SORT(array, sort_index, -1)` → by the nth column, descending
- `=SORTBY(array, by_array, -1)` → sort by any column (even one not shown)
- `=TAKE(array, 10)` → first 10 rows · `=TAKE(array, -5)` → last 5 · `=DROP(array, 1)` → remove the first row
- **Top 10 orders:** `=TAKE(SORTBY(tblSales, tblSales[NetSales], -1), 10)`
- **Top N with a selector:** replace 10 with `$B$1`

### Practice (20 min)
1. Top 10 orders by net sales (show OrderID, Store, Product, NetSales with CHOOSECOLS).
2. **Top 10 products by net sales:** UNIQUE products → SUMIFS → combine with HSTACK → SORT → TAKE:
   `=TAKE(SORT(HSTACK(UNIQUE(tblSales[Product]), SUMIFS(tblSales[NetSales], tblSales[Product], UNIQUE(tblSales[Product]))), 2, -1), 10)`
3. Bottom 3 products.

**Check (2):** 1. Rice 50kg (Local) ₦68,920,800 · 2. Dell Inspiron 15 ₦55,521,950 · 3. Infinix Hot 40 ₦40,435,200 … 10. iPhone 13 (Refurbished) ₦25,824,000 · (3) bottom: School Bag ₦6,754,375

### Mini-Task (10 min)
Make the "top N" size a drop-down (5, 10, 20).

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** SEQUENCE, VSTACK, HSTACK, and GROUPBY
**Time:** ~1 hour

### Review (10 min)
From memory: top 10 orders with SORTBY + TAKE.

### Lesson (15 min)
- `=SEQUENCE(12)` → 1…12 · `=SEQUENCE(5,7)` → a 5×7 grid
- A list of month starts: `=DATE(2025, SEQUENCE(12), 1)`
- **VSTACK** stacks arrays vertically (e.g. several months' tables into one); **HSTACK** side by side.
- **GROUPBY** and **PIVOTBY** (newer Microsoft 365): a pivot as a formula:
  `=GROUPBY(tblSales[Region], tblSales[NetSales], SUM)` → totals per region, sorted options, totals row.
  `=PIVOTBY(tblSales[Region], tblSales[CustomerType], tblSales[NetSales], SUM)` → a cross-tab.
  (If your Excel doesn't have them yet, use UNIQUE + SUMIFS as on Tuesday.)

### Practice (20 min)
1. A monthly sales table with a single formula: month starts with SEQUENCE, and net sales with SUMIFS on that spill.
2. Import the 6 files in `monthly-sales/` as 6 sheets (Jan–Jun 2026) and stack them with VSTACK into one list (drop the repeated headers with DROP).
3. Try GROUPBY for net sales by Category.

**Check (2):** the stacked list has **1,682** orders, from NM-10001 to NM-11682

### Mini-Task (10 min)
A calendar for March 2026 with SEQUENCE: `=SEQUENCE(6,7,DATE(2026,3,1)-WEEKDAY(DATE(2026,3,1),2)+1)` formatted as `d`.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Building a live report with dynamic arrays
**Time:** ~1 hour

### Review (10 min)
From memory: VSTACK two tables and remove the second header.

### Lesson (15 min)
Combine everything into a report driven by selectors:
- B1 Region (drop-down from `=UNIQUE(tblSales[Region])`), B2 Category (drop-down), B3 Top N
- KPIs: `=SUM(FILTER(tblSales[NetSales], (tblSales[Region]=B1)*(tblSales[Category]=B2), 0))`
- A top-N table of orders for that region + category
- A monthly trend for the selection with SEQUENCE + SUMIFS
Charts can point at spill ranges through a named range like `=Report!$E$6#`.

### Practice (20 min)
Build the live report. Test several combinations.

### Mini-Task (10 min)
Handle "All regions": if B1 = "All", don't filter by region: `(IF(B1="All",1,tblSales[Region]=B1))`.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: a live "Top 10" report
**Time:** ~1.5 hours

### Review (15 min)
From a blank sheet: UNIQUE, FILTER, SORTBY, TAKE, SEQUENCE.

### Weekly Project (45 min)
**`Live_Top10.xlsx`:** a single sheet with no pivots, **only dynamic arrays**:
1. Selectors: Region (with "All"), CustomerType (with "All"), Top N, and a date range.
2. KPIs for the selection: net sales, orders, average order, profit.
3. Top N products, top N salespeople, top N orders.
4. A monthly trend table and chart.
5. Everything updates instantly when a selector changes.

### Log (15 min)
Weekly review.

## Quiz
1. What does # mean in `=H2#`?
2. What causes #SPILL!?
3. How do you write AND and OR conditions in FILTER?
4. Write a formula for the top 5 orders by NetSales.
5. What do VSTACK and HSTACK do?
6. What does `=DATE(2025,SEQUENCE(12),1)` produce?
7. How many Lagos orders were ≥ ₦1,000,000?

**Answers:** (1) the entire spill range that starts at H2 (2) cells in the spill area aren't empty (3) multiply for AND, add for OR (4) `=TAKE(SORTBY(tblSales,tblSales[NetSales],-1),5)` (5) stack arrays vertically / horizontally (6) the first day of each month of 2025 (7) 53.
