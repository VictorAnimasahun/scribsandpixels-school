# Week 11 — Conditional formatting & charts
**Theme:** Make numbers speak: highlight what matters and choose the right chart.
**Big question:** *How do I make a manager understand the data in 5 seconds?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "conditional formatting formulas" and "Excel charts tips". |
| 🌐 | [Chandoo.org](https://chandoo.org/) | Browse chart ideas and examples. |
| 📗 | *Storytelling with Data* (Cole Nussbaumer Knaflic) | Chapters 2–4 if you have it. The best book on business charts. |
| 🌐 | [Microsoft Support — Create a chart](https://support.microsoft.com/en-us/excel) | Search "recommended charts". |
| 📊 | `NaijaMart_Sales_2025.xlsx` | Summary tables from Week 6. |

## Day 1 — Monday
**Topic:** Conditional formatting: built-in rules
**Time:** ~1 hour

### Review (10 min)
From memory: a drop-down from a table column.

### Lesson (15 min)
Home → **Conditional Formatting**:
| Rule | Use |
|---|---|
| Highlight Cells: Greater Than, Between, Text Contains, Duplicate Values | flag specific values |
| Top/Bottom: Top 10, Above Average | outliers |
| **Data Bars** | in-cell bar charts |
| **Colour Scales** | heat maps (green → red) |
| **Icon Sets** | arrows, traffic lights |

Manage Rules shows the order and scope of rules. Less is more: one or two rules per table.

### Practice (20 min)
1. In tblSales, highlight NetSales ≥ ₦1,000,000 in green.
2. Highlight duplicate values in the messy customers' Phone column.
3. On the monthly sales table, add Data Bars.
4. On the category × region grid, add a 3-colour scale (a heat map).

### Mini-Task (10 min)
Add icon sets (up/flat/down arrows) to a "% change vs previous month" column in your monthly table.

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Formula-based conditional formatting
**Time:** ~1 hour

### Review (10 min)
From memory: data bars and a colour scale.

### Lesson (15 min)
**New Rule → Use a formula to determine which cells to format.** The formula must return TRUE/FALSE and is written **for the first row** of the selection, with $ on the column to highlight **whole rows**:
- Highlight the whole row when Region = Lagos: select A2:Q2401 → `=$C2="Lagos"`
- Highlight weekends: `=WEEKDAY($B2,2)>=6`
- Highlight a row matching a selector cell: `=$C2=$Z$1`
- Highlight products below reorder level: `=[Stock]<[ReorderLevel]` style in plain references: `=$H2<$G2`

### Practice (20 min)
1. Highlight entire rows of Wholesale orders ≥ ₦1M.
2. Highlight the whole row of any order in the region chosen in a drop-down cell (reuse Week 10).
3. In the timesheet, highlight late arrivals (after 08:30) in orange.

**Sandbox:** write each rule as a TRUE/FALSE helper column and count what it would highlight (the first 8 tasks).

::sandbox xl-w11-rules

### Mini-Task (10 min)
Build a "search box": type any text in a cell and highlight rows whose Product contains it: `=ISNUMBER(SEARCH($Z$1,$H2))`.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** Choosing the right chart
**Time:** ~1 hour

### Review (10 min)
From memory: a formula rule that highlights whole rows.

### Lesson (15 min)
| To show… | Use | Avoid |
|---|---|---|
| Comparison of categories | **bar** (horizontal) or **column** chart, sorted | 3D anything |
| Change over time | **line** chart | pie |
| Part of a whole (2–5 parts) | pie/doughnut (sparingly), or a 100% stacked bar | pie with 10 slices |
| Two measures on one chart | **combo** chart (column + line on a secondary axis) | |
| Relationship between two numbers | **scatter** | |
| Distribution | histogram | |

**Create:** select the data → **Alt+F1** (instant chart) or Insert → Recommended Charts.

**Design rules:** a title that states the insight ("Lagos drives 39% of sales"), sorted bars, few colours (one highlight colour), delete gridlines and legends you don't need, label values directly.

### Practice (20 min)
1. Column chart of net sales by region, sorted largest to smallest, with data labels.
2. Line chart of monthly net sales for 2025.
3. Bar chart of net sales by category.
Apply the design rules to each.

### Mini-Task (10 min)
Rewrite each chart title as an insight, e.g. "Sales peak in December at ₦109.6M".

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Combo charts, secondary axes, sparklines
**Time:** ~1 hour

### Review (10 min)
From memory: which chart for trends, for comparisons, for parts of a whole?

### Lesson (15 min)
- **Combo chart:** Insert → Combo → e.g. *net sales (columns)* + *number of orders (line, secondary axis)*.
- **Actual vs target:** columns for actual, a line (or markers) for target.
- **Sparklines** (Insert → Sparklines): tiny charts inside cells, great for a row of 12 months per region.
- **Chart templates:** right-click → Save as Template to reuse your house style.

### Practice (20 min)
1. Monthly chart: net sales (columns) + orders (line on the secondary axis).
2. A table of regions × months (SUMIFS) with a **line sparkline** per region; mark the high point.

### Mini-Task (10 min)
Save your best-looking chart as a template named "NaijaMart".

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Dynamic charts
**Time:** ~1 hour

### Review (10 min)
From memory: create a combo chart with a secondary axis.

### Lesson (15 min)
A chart becomes **interactive** when its source data is driven by a selector:
1. A drop-down cell (e.g. Region).
2. A helper table with SUMIFS that uses the selected region (12 months).
3. The chart points at the helper table and changes when the selection changes.
Charts on Excel Tables also grow automatically when rows are added.

### Practice (20 min)
Build a "Monthly sales for [Region]" line chart driven by a region drop-down. Its title can also be dynamic: select the title, type `=` in the formula bar, click a cell containing `="Monthly net sales — "&Z1`.

**Sandbox:** the selector tasks (N9–N11) are the helper cells and title a dynamic chart needs. Change N1 to Abuja and watch them update.

::sandbox xl-w11-rules

### Mini-Task (10 min)
Add a second drop-down for Category and make the chart respond to both.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: visual sales report
**Time:** ~1.5 hours

### Review (15 min)
From a blank sheet: a sorted bar chart with an insight title, and a formula rule highlighting rows.

### Weekly Project (45 min)
**Build a one-page `Visual Report` sheet:**
1. KPI row: net sales, orders, average order, profit (big numbers, formatted).
2. 4 charts: monthly trend (line), region comparison (sorted bar), category mix (bar), customer type (100% stacked bar or doughnut).
3. A region × month table with a heat map and sparklines.
4. A region drop-down that drives one dynamic chart.
5. Insight titles on every chart. Print to one landscape PDF page.

### Log (15 min)
Weekly review.

## Quiz
1. Which chart type shows change over time best?
2. Why should bar charts usually be sorted?
3. Write a conditional formatting formula to highlight whole rows where Region is Abuja.
4. What is a sparkline?
5. When do you need a secondary axis?
6. What makes a good chart title?
7. How do you make a chart change with a drop-down?

**Answers:** (1) line (2) so the ranking is instantly visible (3) `=$C2="Abuja"` applied to the whole table (4) a tiny chart inside a cell (5) when two measures have very different scales (e.g. ₦ millions vs order counts) (6) one that states the insight (7) point the chart at a helper table whose formulas use the drop-down cell.
