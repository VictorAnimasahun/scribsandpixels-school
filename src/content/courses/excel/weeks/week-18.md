# Week 18 — Data Model & Power Pivot
**Theme:** Relate tables in a star schema and write DAX measures, the same engine as Power BI.
**Big question:** *How do I analyse millions of rows across several tables without a single lookup?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [MyOnlineTrainingHub](https://www.myonlinetraininghub.com/) | Search "Power Pivot tutorial" and "DAX CALCULATE". |
| 🌐 | [Microsoft Learn — DAX reference](https://learn.microsoft.com/en-us/dax/) | Look up SUMX, CALCULATE, DIVIDE, TOTALYTD. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Power Pivot DAX measures". |
| 📊 | `NaijaMart_ETL.xlsx` (Week 17) | Your queries feed the model. |

> **Platform note:** Power Pivot is available in **Excel for Windows** (Microsoft 365 / Professional). On Mac or Excel for the web, you can still create relationships and pivots from the Data Model (Week 13) but not write DAX measures. Mac users: follow along conceptually and consider trying the same exercises in the free **Power BI Desktop** (Windows) or doing them on a Windows PC.

## Day 1 — Monday
**Topic:** The star schema
**Time:** ~1 hour

### Review (10 min)
From memory: combine files from a folder in Power Query.

### Lesson (15 min)
Professional models separate:
- **Fact tables**: events with numbers (every order: tblSalesAll; every monthly target: tblTargets)
- **Dimension tables**: descriptions, one row per item (Products, Regions, **Dates**)
Facts connect to dimensions through keys, forming a **star**: Products → Sales ← Regions, Dates → Sales. Always filter and group using **dimension** columns.

**A Date table** is essential for time analysis: one row per day, with Year, Quarter, Month, MonthName, MonthNumber, Weekday. Make it with Power Query or `=SEQUENCE(730,1,DATE(2025,1,1))` + formulas, as a table **tblDates**.

### Practice (20 min)
1. Build **tblDates** for 1 Jan 2025 – 31 Dec 2026 with Year, MonthNumber, MonthName (`=TEXT([@Date],"mmm")`), Quarter (`="Q"&ROUNDUP(MONTH([@Date])/3,0)`), YearMonth (`=TEXT([@Date],"yyyy-mm")`).
2. Build **tblRegions** (6 regions + Zone from Week 5).
3. Load tblSalesAll, tblProducts, tblTargets, tblDates, tblRegions **to the Data Model** (Power Query: Close & Load To → Only Create Connection + Add to the Data Model).

### Mini-Task (10 min)
Draw your star schema on paper: which table is in the centre? Which keys connect?

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Relationships in Power Pivot
**Time:** ~1 hour

### Review (10 min)
From memory: facts vs dimensions.

### Lesson (15 min)
Enable Power Pivot: File → Options → Add-ins → COM Add-ins → **Microsoft Power Pivot for Excel**.
Power Pivot → **Manage** → **Diagram View**. Drag keys to create relationships:
- tblSalesAll[ProductID] → tblProducts[ProductID]
- tblSalesAll[OrderDate] → tblDates[Date]
- tblSalesAll[Region] → tblRegions[Region]
- tblTargets[Region] → tblRegions[Region]; tblTargets needs a date key too: add a column with the first day of the month and relate it to tblDates[Date].
Mark tblDates as the **Date Table** (Design → Mark as Date Table).
Relationships are **one-to-many** (one product ↔ many sales), with the filter flowing from the "one" side.

### Practice (20 min)
Create all relationships. Then a pivot from the Data Model: Year (tblDates) in Columns, Category (tblProducts) in Rows, Sum of NetSales (tblSalesAll) in Values.

**Check:** 2025 column total ₦834,046,700 · 2026 (H1) total ₦605,179,960

### Mini-Task (10 min)
Put Region from **tblSalesAll** instead of tblRegions in Rows alongside a target value. What goes wrong? Why must you use dimension columns?

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** DAX measures
**Time:** ~1 hour

### Review (10 min)
From memory: the four relationships of the star.

### Lesson (15 min)
A **measure** is a named calculation that responds to every filter, slicer and row of the pivot. Create one: Power Pivot → Measures → New Measure (or right-click the table in the PivotTable field list → Add Measure).
```
Net Sales := SUMX(tblSalesAll, tblSalesAll[Units] * tblSalesAll[UnitPrice] * (1 - tblSalesAll[DiscountPct]/100))
Total Cost := SUMX(tblSalesAll, tblSalesAll[Units] * RELATED(tblProducts[UnitCost]))
Profit := [Net Sales] - [Total Cost]
Margin % := DIVIDE([Profit], [Net Sales])
Orders := COUNTROWS(tblSalesAll)
Avg Order := DIVIDE([Net Sales], [Orders])
Target := SUM(tblTargets[SalesTarget])
Variance := [Net Sales] - [Target]
Achievement % := DIVIDE([Net Sales], [Target])
```
- **SUMX** iterates row by row (the correct row-level maths that calculated fields couldn't do).
- **RELATED** fetches a value from the "one" side of a relationship (like XLOOKUP, but free).
- **DIVIDE** handles division by zero safely.

### Practice (20 min)
Create all 9 measures with proper formats (₦, %). Pivot: Region (tblRegions) × Year (tblDates) with Net Sales, Profit, Margin %.

**Check (2025):** Net Sales ₦834,046,700 · Profit ₦129,531,600 · Margin 15.5% · Target ₦844,900,000 · Achievement **98.7%**

### Mini-Task (10 min)
Add Achievement % by Region for 2025. Only Port Harcourt should be above 100%.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** CALCULATE
**Time:** ~1 hour

### Review (10 min)
From memory: write the Net Sales and Margin % measures.

### Lesson (15 min)
**CALCULATE(expression, filters…)** changes the filter context: the most important function in DAX.
```
Lagos Sales := CALCULATE([Net Sales], tblRegions[Region] = "Lagos")
Online Sales := CALCULATE([Net Sales], tblSalesAll[CustomerType] = "Online")
Online Share := DIVIDE([Online Sales], [Net Sales])
All Regions Sales := CALCULATE([Net Sales], ALL(tblRegions))
Region Share := DIVIDE([Net Sales], [All Regions Sales])
```
**ALL** removes filters, which is how you compute "% of total" that stays correct inside any slicer selection.

### Practice (20 min)
Create Online Share and Region Share. Pivot by Region and Year.

**Check:** 2025 Lagos Region Share = **38.6%**; 2025 Online share of net sales = **13.9%**

### Mini-Task (10 min)
Create **Wholesale Sales** and **Wholesale Share**. Add a slicer on Category and watch the shares recalculate.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Time intelligence
**Time:** ~1 hour

### Review (10 min)
From memory: a CALCULATE with one filter, and ALL for % of total.

### Lesson (15 min)
With a marked Date table, DAX handles time comparisons:
```
Sales YTD := TOTALYTD([Net Sales], tblDates[Date])
Sales LY := CALCULATE([Net Sales], SAMEPERIODLASTYEAR(tblDates[Date]))
YoY Growth % := DIVIDE([Net Sales] - [Sales LY], [Sales LY])
Sales Prev Month := CALCULATE([Net Sales], PREVIOUSMONTH(tblDates[Date]))
MoM Growth % := DIVIDE([Net Sales] - [Sales Prev Month], [Sales Prev Month])
```

### Practice (20 min)
Pivot with Year and MonthName in Rows (filter to Jan–Jun), and measures Net Sales, Sales LY, YoY Growth %.

**Check:** H1 2026 ₦605,179,960 vs H1 2025 ₦349,997,035 → **+72.9%** · Q1 2026 ₦286,246,245 vs Q1 2025 ₦177,495,205

### Mini-Task (10 min)
Which month of 2026 grew the most year-on-year? Write one sentence explaining NaijaMart's 2026 growth for a manager.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Milestone: self-refreshing monthly report
**Time:** ~2 hours

### Review (15 min)
From memory: 5 DAX measures you'd create in any sales model.

### Weekly Project (75 min)
**Phase 4 milestone: `NaijaMart_Monthly_Report.xlsx`**, built so that **next month's update = drop a file in the folder + Refresh All**:
1. Power Query: 2025 file + monthly folder → tblSalesAll; products; targets; customers (cleaned).
2. Data Model: star schema with tblDates and tblRegions, relationships, measures (Net Sales, Profit, Margin %, Orders, Avg Order, Target, Achievement %, YoY Growth %, Region Share).
3. Report sheet: pivots and pivot charts from the model, with slicers (Year, Month, Region, Category) connected to everything.
4. A "How to update" box: 3 steps.
5. **Test it:** add a fake July 2026 file → Refresh All → check that every number, chart and slicer updates. Remove it after.

### Log (15 min)
Phase 4 review: what's the most powerful thing I learned? Where could I use it at work tomorrow?

## Quiz
1. What's the difference between a fact table and a dimension table?
2. Why do you need a Date table?
3. Why SUMX instead of a calculated field for net sales?
4. What does RELATED do?
5. What does CALCULATE do? Give an example.
6. How do you compute a "% of total" that stays correct with slicers?
7. What was NaijaMart's H1 2026 growth vs H1 2025?

**Answers:** (1) facts hold events/numbers (orders); dimensions hold descriptions, one row per item (products, dates) (2) for grouping by time and for time intelligence (YTD, last year) (3) SUMX calculates row by row, then sums (4) fetches a value from the related "one" table (5) evaluates an expression under changed filters: `CALCULATE([Net Sales], tblRegions[Region]="Lagos")` (6) divide by `CALCULATE([measure], ALL(dimension))` (7) +72.9%.
