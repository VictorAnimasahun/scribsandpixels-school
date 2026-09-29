# Week 9 — Lookups
**Theme:** Connect tables: pull prices, costs and employee details from one table into another.
**Big question:** *How do I find a value in another table without searching by hand?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Exceljet — XLOOKUP](https://exceljet.net/functions/xlookup-function) | Read on Tuesday; also INDEX and MATCH. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "XLOOKUP vs VLOOKUP vs INDEX MATCH". |
| 🌐 | [Excel Skills for Business: Intermediate II (Coursera)](https://www.coursera.org/learn/excel-intermediate-2) | Lookup functions module. |
| 📊 | `products.csv` · sales · HR · timesheet | Add products.csv as a **Products** sheet in NaijaMart_Sales_2025.xlsx on Monday. |

## Day 1 — Monday
**Topic:** VLOOKUP (and why it's being replaced)
**Time:** ~1 hour

### Review (10 min)
From memory: hours worked and overtime from two times.

### Lesson (15 min)
`=VLOOKUP(lookup_value, table, col_index, FALSE)`
- Looks for the value in the **first column** of the table and returns the value from column number *col_index*.
- **Always use FALSE** (exact match). Without it, VLOOKUP does an approximate match and returns wrong answers silently.
- Lock the table with $: `=VLOOKUP(G2, Products!$A$2:$G$41, 5, FALSE)` → UnitCost for the ProductID in G2

**VLOOKUP's weaknesses:** it can't look to the left · the column number breaks if someone inserts a column · it's slow on huge data. That's why XLOOKUP exists. You still need to *read* VLOOKUP because it's in millions of old files.

### Practice (20 min)
1. Import `products.csv` into your sales workbook as a sheet named **Products**.
2. On Data, add **UnitCost** with VLOOKUP from Products (column 5).
3. Add **Supplier** with VLOOKUP (column 4).

**Check:** row 2 (P040, HP Ink Cartridge 305): UnitCost **₦9,800**, Supplier **HP Nigeria**

### Mini-Task (10 min)
Try the lookup with TRUE instead of FALSE on a few rows. Do you get wrong results? Explain in your log why FALSE matters.

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** XLOOKUP
**Time:** ~1 hour

### Review (10 min)
From memory: VLOOKUP for UnitCost.

### Lesson (15 min)
`=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])`
- `=XLOOKUP(G2, Products!$A$2:$A$41, Products!$E$2:$E$41)` → UnitCost
- Exact match by default · looks **left or right** · a built-in "not found" message: `…, "Not found")`
- Return **several columns** at once: `=XLOOKUP(G2, Products!A2:A41, Products!D2:E41)` spills Supplier and UnitCost.
- Approximate match for **bands** (tax brackets, commission tiers): match_mode `-1` = exact or next smaller.
(Excel 2019 and older don't have XLOOKUP; use INDEX/MATCH from Wednesday.)

### Practice (20 min)
1. Replace the VLOOKUPs with XLOOKUP.
2. Add **Profit** = NetSales − Units × UnitCost. Total profit for the year? Overall margin (profit ÷ net sales)?
3. How many orders made a **loss** (profit < 0)? Why could that happen? (Look at their discounts.)

**Check:** total profit **₦129,531,600** · margin **15.5%** · loss-making orders **21**

### Mini-Task (10 min)
Commission tiers with approximate XLOOKUP: a table of thresholds (0, 500000, 2000000) and rates (2%, 3%, 5%); `=XLOOKUP(O2, $V$2:$V$4, $W$2:$W$4, , -1)`. Compare with your Week 5 IFS result.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** INDEX and MATCH
**Time:** ~1 hour

### Review (10 min)
From memory: XLOOKUP with a "Not found" message.

### Lesson (15 min)
- `MATCH(value, range, 0)` → the **position** of a value in a list (0 = exact)
- `INDEX(range, row_number)` → the value at that position
- Together: `=INDEX(Products!$E$2:$E$41, MATCH(G2, Products!$A$2:$A$41, 0))`
Works in every version of Excel, looks in any direction, and doesn't break when columns move. The standard before XLOOKUP.

**Two-way lookup** (row and column): `=INDEX(table, MATCH(row_value, row_headers, 0), MATCH(col_value, col_headers, 0))`
XMATCH is the modern MATCH.

### Practice (20 min)
1. Rebuild UnitCost with INDEX/MATCH.
2. On your Week 6 category × region sales grid (build it with SUMIFS if needed), write a two-way lookup: choose a category in one cell and a region in another, return the value.

### Mini-Task (10 min)
In the HR file, return the JobTitle for an employee ID typed in a cell. What's E042's job? (**Senior Sales Associate, Abuja**)

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Errors, IFERROR, and named ranges
**Time:** ~1 hour

### Review (10 min)
From memory: INDEX/MATCH.

### Lesson (15 min)
- `#N/A` from a lookup = not found. Causes: a typo, an extra space (TRIM!), a number stored as text vs a real number.
- `=IFERROR(formula, "Not found")` catches any error; `=IFNA(formula, …)` catches only #N/A (safer, because other errors still show).
- **Named ranges** make formulas readable: select Products!A2:A41 → type **ProductIDs** in the Name Box → Enter.
  `=XLOOKUP(G2, ProductIDs, ProductCosts)` reads like English.
  Manage names: Formulas → Name Manager (Ctrl+F3).

### Practice (20 min)
1. Name the Products columns (ProductIDs, ProductNames, ProductCosts, ProductPrices) and rewrite the lookups with names.
2. Type a wrong ID ("P999") in a test cell and look it up with and without IFNA.
3. Type `" P001"` (with a leading space). Why does the lookup fail? Fix it with TRIM inside the lookup value.

### Mini-Task (10 min)
Timesheet: bring each employee's **name** and **salary** from NaijaMart_HR.xlsx into the Payroll sheet with XLOOKUP (the lookup works across workbooks while both are open).

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Building an invoice
**Time:** ~1 hour

### Review (10 min)
From memory: XLOOKUP with a named range and IFNA.

### Lesson (15 min)
An **invoice template** is the classic lookup project:
- Header: company name and logo, invoice number, date, due date (`=EOMONTH(date,1)`), customer details
- Lines: the user types a **ProductID** and **Quantity**; lookups fill in Product name and UnitPrice; Line total = Qty × Price
- Totals: Subtotal, Discount %, VAT 7.5%, **Total due**
- Empty lines must stay clean: `=IF(B12="","",XLOOKUP(B12,ProductIDs,ProductNames))`

### Practice (20 min)
Build the invoice on a new sheet with 10 lines. Test it with: P001 × 2, P005 × 3, P026 × 10.

**Check:** subtotal ₦290,000 + ₦63,000 + ₦135,000 = **₦488,000** · VAT 7.5% = ₦36,600 · total **₦524,600**

### Mini-Task (10 min)
Add a "Not found" warning if an unknown product code is typed, and turn the cell red with conditional formatting (preview of Week 11: Home → Conditional Formatting → Highlight Cells Rules → Text that Contains).

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Milestone: automated invoice + payroll
**Time:** ~2 hours

### Review (15 min)
From a blank sheet: VLOOKUP, XLOOKUP, INDEX/MATCH and IFNA, one each.

### Weekly Project (75 min)
**Phase 2 milestone: two workbooks.**
1. **`NaijaMart_Invoice.xlsx`**: the invoice template from Friday, polished: company details, logo, a customer lookup (a small customer table), invoice number, due date, 15 lines, discount, VAT, total **in words** (optional challenge), and print-ready as one A4 page. Save a blank version as a template (.xltx).
2. **`NaijaMart_Payroll_March.xlsx`**: combine the HR and timesheet data: employee name, department and salary via lookups; days, hours and overtime from the timesheet; gross pay; **PAYE tax estimate** using an approximate-match lookup on a simplified tax-band table (you define the bands on an Inputs sheet); net pay.

**Self-check:** change one product price in Products. Does the invoice update? Change a salary. Does payroll update?

### Log (15 min)
Phase 2 review: which function do I now use most? What's still hard? My top 10 functions.

## Quiz
1. Why must VLOOKUP almost always end with FALSE?
2. Name 3 advantages of XLOOKUP over VLOOKUP.
3. Write INDEX/MATCH to return a price for the ID in G2.
4. IFERROR vs IFNA: which is safer, and why?
5. A lookup returns #N/A but the value looks identical. What are 2 likely causes?
6. What's NaijaMart's total profit and margin for 2025?
7. How do you keep empty invoice lines clean?

**Answers:** (1) otherwise it does an approximate match and can return wrong values silently (2) looks left, exact match by default, a built-in not-found value, doesn't break when columns are inserted, returns multiple columns (3) `=INDEX(Prices,MATCH(G2,IDs,0))` (4) IFNA, because it only hides "not found" and still shows real errors (5) extra spaces; a number stored as text (6) ₦129,531,600, 15.5% (7) `=IF(B12="","",…)`.
