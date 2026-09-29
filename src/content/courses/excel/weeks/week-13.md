# Week 13 — PivotTables II
**Theme:** Interactive pivots with slicers and timelines, calculated fields, multiple tables, and target-vs-actual analysis.
**Big question:** *Did each region hit its target, and how do I let the manager explore it themselves?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Excel Campus](https://www.excelcampus.com/) | PivotTable series: slicers and calculated fields. |
| 📺 | [MyOnlineTrainingHub](https://www.myonlinetraininghub.com/) | Search "Excel Data Model relationships". |
| 🌐 | [Exceljet — GETPIVOTDATA](https://exceljet.net/functions/getpivotdata-function) | Read on Thursday. |
| 📊 | `targets_2025.csv` | Import it as **tblTargets** on Monday. |

## Day 1 — Monday
**Topic:** Slicers and timelines
**Time:** ~1 hour

### Review (10 min)
From memory: a pivot of monthly sales with % Difference From previous month.

### Lesson (15 min)
- **Slicer** (PivotTable Analyze → Insert Slicer): big clickable filter buttons. Ctrl+click for several items.
- **Timeline** (Insert Timeline): filter by date, dragging across months, quarters or years.
- **One slicer, many pivots:** right-click the slicer → **Report Connections** → tick every pivot that should respond. This is the heart of an Excel dashboard.
- Style slicers (Slicer tab), set the number of columns, and remove the header if it's obvious.

### Practice (20 min)
1. Build 3 pivots on one sheet: net sales by Region, by Category, and by Month.
2. Add slicers for CustomerType and PaymentMethod and a Timeline for OrderDate.
3. Connect them all to all 3 pivots. Click "Wholesale" + Q4 and watch everything change.

### Mini-Task (10 min)
Import `targets_2025.csv` as a table named **tblTargets** (Region, Month, SalesTarget). Total annual target? (**₦844,900,000**)

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Calculated fields and items
**Time:** ~1 hour

### Review (10 min)
From memory: connect one slicer to several pivots.

### Lesson (15 min)
**Calculated field** (PivotTable Analyze → Fields, Items & Sets): a new value built from other fields, e.g. `Commission = NetSales * 0.03`, or `Margin % = Profit / NetSales`.
⚠️ Calculated fields work on **sums**: `=Profit/NetSales` computes *sum of profit ÷ sum of net sales*, which is correct for a margin. But a formula like `=Units*UnitPrice` computes *sum × sum* and is wrong. For row-level maths, add a column to the table instead.
**Calculated item:** combines items inside one field (e.g. "Lagos total" = the 3 Lagos stores). Use sparingly.

### Practice (20 min)
1. Make sure tblSales has **Profit** (Week 9) and **Cost** (Units × UnitCost) columns.
2. Add a calculated field **Margin %** = Profit / NetSales, formatted as %.
3. Pivot: Margin % by Category. Which category has the best and worst margin?

**Check:** overall margin **15.5%**; the category with the most profit is Fashion (₦23,344,525)

### Mini-Task (10 min)
Try the wrong calculated field `=Units*UnitPrice` and compare it with the real GrossSales. See the problem for yourself.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** Target vs actual with formulas
**Time:** ~1 hour

### Review (10 min)
From memory: why calculated fields can give wrong results.

### Lesson (15 min)
Targets are per **Region per Month**, and sales are per **order**. To compare them, bring actuals to the same level:
1. In tblTargets add **Actual** with SUMIFS on tblSales: region = [@Region] and date within the month. The Month column is text like "2025-03", so build its first day with `=DATEVALUE([@Month]&"-01")`, or add a real date column.
2. **Variance** = Actual − Target · **Variance %** = Variance / Target · **Hit?** = IF(Actual ≥ Target, "✓", "✗")

### Practice (20 min)
Build the target table and answer:
1. How many of the 72 region-months hit target?
2. Company total vs target (₦ and %)?
3. The worst miss and the best beat (region + month)?

**Check:** 1. **33 of 72** 2. actual ₦834,046,700 vs target ₦844,900,000 → **−₦10,853,300 (−1.3%)** 3. worst: **Lagos, December (−₦5,896,200)**; best: **Lagos, October (+₦5,437,245)**

### Mini-Task (10 min)
Conditional formatting: green ✓ / red ✗ on the Hit column, and a red-white-green colour scale on Variance %.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Multiple tables: the Data Model and relationships
**Time:** ~1 hour

### Review (10 min)
From memory: SUMIFS for one region-month actual.

### Lesson (15 min)
Instead of copying data between tables, let a pivot **relate** them:
1. Create a small **tblRegions** table with the 6 regions (one row each). This is a *dimension* table.
2. Data → **Relationships** → New: tblSales[Region] → tblRegions[Region]; tblTargets[Region] → tblRegions[Region].
3. Insert → PivotTable → **Add this data to the Data Model**. The field list now shows **All** tables.
4. Region from **tblRegions** in Rows; Sum of NetSales (tblSales) and Sum of SalesTarget (tblTargets) in Values.
The pivot aggregates both tables through the shared Region. You'll go much deeper in Week 18 (Power Pivot).

**GETPIVOTDATA:** click a pivot cell while writing a formula and Excel writes `=GETPIVOTDATA(…)`, a stable reference into the pivot that survives layout changes. (Turn it off in PivotTable Options if you prefer plain references.)

### Practice (20 min)
1. Build the relationship-based pivot: annual Actual vs Target per region, plus a variance column (outside the pivot, or with a calculated measure in Week 18).
2. Which region beat its annual target?

**Check:** only **Port Harcourt** (+1.6%) · Kano furthest behind (**−5.6%**)

### Mini-Task (10 min)
Use GETPIVOTDATA to pull Lagos actual into a KPI cell on another sheet.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Pivot best practices
**Time:** ~1 hour

### Review (10 min)
From memory: create a relationship between two tables.

### Lesson (15 min)
- Always build pivots on **tables** (or the Data Model), never on fixed ranges.
- **Refresh All** (Ctrl+Alt+F5) before presenting. Set "Refresh data when opening the file" in PivotTable Options.
- Preserve formatting: PivotTable Options → *Autofit column widths on update* off, *Preserve cell formatting* on.
- Clean labels: rename "Sum of NetSales" to "Net sales " (with a trailing space if Excel complains the name exists).
- Hide field buttons on PivotCharts for a clean look.
- Don't put anything directly under or beside a pivot: it grows and would overwrite it (Excel warns you).

### Practice (20 min)
Clean up all your pivots from Weeks 12–13 with these practices. Put them on well-named sheets.

### Mini-Task (10 min)
Test Refresh: add a new order to tblSales and Refresh All. Does everything update? Then delete it and refresh again.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: interactive target-vs-actual analysis
**Time:** ~1.5 hours

### Review (15 min)
From a blank workbook: a pivot with slicers connected to two pivots.

### Weekly Project (45 min)
**Build `Target_vs_Actual.xlsx`**:
1. tblSales, tblTargets, tblRegions with relationships.
2. A pivot: Region × Month, Actual vs Target.
3. The formula-based target table (Wednesday) with Hit ✓/✗ and conditional formatting.
4. Slicers (Region, CustomerType) and a timeline, connected to all pivots.
5. A KPI area: total actual, total target, variance %, number of region-months on target (33/72), using GETPIVOTDATA or formulas.
6. A combo chart: Actual (columns) vs Target (line) by month.

### Log (15 min)
Weekly review.

## Quiz
1. How do you make one slicer control several pivots?
2. Why can a calculated field give wrong results for `Units*UnitPrice`?
3. What's a dimension table, and why do relationships need one?
4. What's GETPIVOTDATA for?
5. How do you refresh every pivot at once?
6. How many region-months hit their target in 2025?
7. Which region beat its annual target?

**Answers:** (1) Report Connections (2) it computes on the sums, not row by row (3) a table with one row per item (e.g. each region once); both fact tables relate to it (4) a stable reference to a pivot value (5) Ctrl+Alt+F5 / Refresh All (6) 33 of 72 (7) Port Harcourt.
