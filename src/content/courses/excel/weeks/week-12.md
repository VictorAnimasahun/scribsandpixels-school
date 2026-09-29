# Week 12 — PivotTables I
**Theme:** Summarise 2,400 rows in seconds, with no formulas: the most valuable Excel skill in most offices.
**Big question:** *How do I answer ten business questions in ten minutes?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Excel Campus (Jon Acampora)](https://www.excelcampus.com/) | His free PivotTable video series: start from part 1. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "PivotTable tutorial". |
| 🌐 | [Microsoft Support — Create a PivotTable](https://support.microsoft.com/en-us/excel) | Search "create a PivotTable to analyze worksheet data". |
| 📊 | `tblSales` in NaijaMart_Sales_2025.xlsx | Every pivot this week comes from the table. |

## Day 1 — Monday
**Topic:** Your first PivotTable
**Time:** ~1 hour

### Review (10 min)
From memory: a SUMIFS for net sales by region.

### Lesson (15 min)
Click in tblSales → Insert → **PivotTable** → New Worksheet.
The **field list** has 4 areas:
| Area | Does |
|---|---|
| **Rows** | groups down the side (Region) |
| **Columns** | groups across the top (CustomerType) |
| **Values** | the numbers (Sum of NetSales) |
| **Filters** | filter the whole pivot (Year, Category) |

Drag Region to Rows and NetSales to Values → done. Change the calculation: Value Field Settings → Sum / Count / Average / Max. **Number Format** from the same dialog (₦).
Pivots **don't update automatically**: **Refresh** (Alt+F5) after data changes.

### Practice (20 min)
Build pivots answering:
1. Net sales by Region. 2. Net sales by Category, sorted largest first. 3. Number of orders by PaymentMethod. 4. Average net sale by CustomerType.

**Check:** 1. matches your SUMIFS (Lagos ₦321,703,800 …) 2. Groceries top (₦157,534,275) 3. Transfer 1,075 · POS 601 · Cash 507 · Card 217 4. Wholesale **₦1,156,902** · Retail ₦211,628 · Online ₦197,194

### Mini-Task (10 min)
Double-click any number in a pivot: Excel creates a new sheet with the underlying rows ("drill-down"). Try it on Kano.

### Log (5 min)
Log. Shortcut: **Alt+F5** (refresh).

## Day 2 — Tuesday
**Topic:** Rows × columns and multiple values
**Time:** ~1 hour

### Review (10 min)
From memory: a pivot of net sales by category.

### Lesson (15 min)
- **Two dimensions:** Region in Rows, CustomerType in Columns, NetSales in Values → a cross-tab.
- **Nested rows:** Region, then Store under it. Expand/collapse with +/−.
- **Several values:** NetSales (Sum) + OrderID (Count) + NetSales (Average) side by side. Rename headers ("Net sales", "Orders", "Avg order").
- **Layout** (Design tab): *Tabular form*, *Repeat all item labels*, subtotals on/off, grand totals on/off.

### Practice (20 min)
1. Region × CustomerType cross-tab of net sales.
2. Region → Store nested, with Orders, Net sales and Average order.
3. Category × PaymentMethod count of orders.

### Mini-Task (10 min)
Apply a pivot style and the tabular layout; remove the "Row Labels" header text.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** Grouping dates and numbers
**Time:** ~1 hour

### Review (10 min)
From memory: a nested Region → Store pivot.

### Lesson (15 min)
- Put **OrderDate** in Rows: Excel groups by Years/Quarters/Months automatically (or right-click → **Group** → choose Months and Quarters).
- **Group numbers:** put Units in Rows → Group → starting at 0, by 10 → buckets 0–9, 10–19…
- **Group text manually:** select items → Group (e.g. North = Kano + Abuja).

### Practice (20 min)
1. Net sales by Quarter and Month.
2. Category in Rows, Quarters in Columns: what were Phones' sales per quarter?
3. Orders grouped by size of NetSales (bins of ₦250,000).

**Check (2):** Phones Q1 ₦29,885,950 · Q2 ₦34,904,200 · Q3 ₦30,497,150 · Q4 **₦44,691,400**

### Mini-Task (10 min)
Group the six regions into "North" (Kano, Abuja) and "South" (the rest). Which earns more? (**South ₦570,636,550 vs North ₦263,410,150**)

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Show Values As
**Time:** ~1 hour

### Review (10 min)
From memory: group dates by quarter and month.

### Lesson (15 min)
Right-click a value → **Show Values As**:
| Option | Answers |
|---|---|
| % of Grand Total | each cell's share of everything |
| % of Column Total / Row Total | the mix within a column or row |
| **Difference From** (previous month) | change vs last month |
| **% Difference From** (previous) | month-on-month growth % |
| Running Total In | cumulative year-to-date |
| Rank Largest to Smallest | a ranking |

Tip: add NetSales to Values **twice**: one as the amount, one as a %.

### Practice (20 min)
1. Region share of total net sales (%).
2. Monthly net sales with **% Difference From previous month**. Which month had the biggest jump?
3. Year-to-date running total by month.
4. Salesperson ranking.

**Check:** Lagos 38.6% · biggest jump **March (+89.7% vs February)** · December vs November +42.5% · YTD at 31 December = ₦834,046,700 · rank 1: Tolu Eze

### Mini-Task (10 min)
Category mix **within** each region (% of column total). Which region depends most on Groceries? (**Port Harcourt, 32.9%**)

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Filters, sorting, and PivotCharts
**Time:** ~1 hour

### Review (10 min)
From memory: Show Values As % of Grand Total and Running Total.

### Lesson (15 min)
- **Filters area:** e.g. CustomerType → show only Retail.
- **Label / Value filters:** Top 10 products by net sales; stores with net sales > ₦100M.
- **Sort** by value (right-click → Sort → Largest to Smallest).
- **PivotChart:** PivotTable Analyze → PivotChart. It follows the pivot's filters and layout.
- **Report Filter Pages:** one sheet per region, automatically (PivotTable Analyze → Options → Show Report Filter Pages).

### Practice (20 min)
1. Top 10 products by net sales.
2. Stores with net sales > ₦100M. (**Lagos - Ikeja, Abuja - Wuse, Lagos - Lekki**)
3. A PivotChart of monthly sales with a Region filter.
4. Report Filter Pages → one sheet per region.

### Mini-Task (10 min)
Bottom 5 salespeople by net sales. (Lowest: **Zainab Obi**, ₦15,424,715)

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: ten questions, ten pivots
**Time:** ~1.5 hours

### Review (15 min)
Build a region × quarter pivot from scratch in under 2 minutes.

### Weekly Project (45 min)
**The CEO's 10 questions**, each answered with one pivot (put them all on an `Analysis` sheet with a short written answer under each):
1. Which region sells the most, and what share?
2. Which month was best and worst?
3. Which 5 products bring in the most money?
4. What's the average order value per customer type?
5. Which payment method is most used, by count and by value?
6. Which store grew most from Q1 to Q4?
7. Which category is biggest in each region?
8. How much discount did we give per region?
9. Who are the top 3 salespeople?
10. What share of sales happens at weekends? (Add a Weekend column to tblSales first.) (**23.2%**)

### Log (15 min)
Weekly review.

## Quiz
1. Name the 4 areas of a PivotTable.
2. Why doesn't a pivot update when data changes, and how do you fix it?
3. How do you see the rows behind a pivot number?
4. How do you show month-on-month growth in a pivot?
5. What does "Show Report Filter Pages" do?
6. Why build pivots on an Excel Table?
7. What's NaijaMart's average wholesale order?

**Answers:** (1) Rows, Columns, Values, Filters (2) pivots cache the data; Refresh (Alt+F5) (3) double-click the number (4) Show Values As → % Difference From (previous) (5) creates one pivot sheet per filter item (6) the source range grows automatically (7) ₦1,156,902.
