# Week 17 — Power Query
**Theme:** Automate data import and cleaning: record the steps once, refresh forever.
**Big question:** *How do I stop cleaning the same messy file every month?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [MyOnlineTrainingHub (Mynda Treacy)](https://www.myonlinetraininghub.com/) | Search "Power Query tutorial". Her free intro series is excellent. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Power Query combine files from folder". |
| 🌐 | [Microsoft Learn — Power Query docs](https://learn.microsoft.com/en-us/power-query/) | Reference for every transformation. |
| 📗 | *M Is for (Data) Monkey* (Puls & Escobar) | The Power Query book, if you want depth. |
| 📊 | `messy_customers.csv` · `monthly-sales/` · `products.csv` · `targets_2025.csv` | Desktop Excel recommended (Windows or Mac). |

## Day 1 — Monday
**Topic:** Your first query
**Time:** ~1 hour

### Review (10 min)
From memory: a named LAMBDA and a MAP.

### Lesson (15 min)
**Power Query** (Data → Get Data) is a data-cleaning robot inside Excel:
1. **Get** data: From Text/CSV, From Folder, From Web, From Table/Range…
2. **Transform** in the Power Query Editor: every click becomes a recorded **Applied Step** (right-hand panel).
3. **Load** the result as a table (or connection only).
4. Next month: **Refresh** (Data → Refresh All). Every step replays on the new data.
Your source file is **never modified**.

Key editor actions: change data type (the icon in each header) · remove columns · filter rows · rename · **Close & Load**.

### Practice (20 min)
New workbook **PQ_Practice.xlsx**:
1. Data → From Text/CSV → `products.csv` → **Transform Data**.
2. Remove the ReorderLevel column; add a custom column **Margin** = [UnitPrice] − [UnitCost] (Add Column → Custom Column).
3. Filter to Category = Phones or Computers. Close & Load.
4. Look at the Applied Steps. Click each one to see the data at that step.

### Mini-Task (10 min)
Open `products.csv` in Notepad, change one price, save, and click Refresh in Excel. Did the query pick it up? (Change it back afterwards.)

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Cleaning with Power Query
**Time:** ~1 hour

### Review (10 min)
From memory: the Get → Transform → Load → Refresh cycle.

### Lesson (15 min)
Right-click a column header or use the Transform tab:
| Problem | Power Query step |
|---|---|
| Extra spaces / wrong case | Format → **Trim**, **Clean**, **Capitalize Each Word**, lowercase |
| "Surname, First" | **Split Column** by delimiter (",") → then merge in the right order |
| Messy categories | **Replace Values** (e.g. "Lag0s" → "Lagos"), or a conditional column |
| Symbols in numbers | Replace "₦" and "," with nothing → change type to number; **Replace Errors** for "N/A" |
| Mixed date formats | Change Type **Using Locale** (e.g. English (United Kingdom) for dd/mm/yyyy) |
| Duplicates | Home → **Remove Rows → Remove Duplicates** |
| Blanks | Filter out, or **Fill Down** |

### Practice (20 min)
Load `messy_customers.csv` into Power Query and reproduce your Week 7 cleaning **without a single formula**: Trim + Capitalize the names, fix the comma names, clean phones (remove spaces, dashes; replace +234/234 prefixes), lower-case emails, standardise cities, convert TotalSpend to a number, remove duplicates.

**Check:** the loaded table has **300** rows; City has exactly **6** distinct values.

### Mini-Task (10 min)
Compare: how long did Week 7 take vs today? And next month, Power Query takes one click.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** Combine files from a folder
**Time:** ~1 hour

### Review (10 min)
From memory: 5 cleaning steps and where to find them.

### Lesson (15 min)
The killer feature: **Data → Get Data → From File → From Folder** → choose `monthly-sales` → **Combine & Transform**.
Power Query stacks every file with the same layout into one table, adds a Source.Name column (the file name), and **any new file dropped in the folder is included on Refresh**.
Typical steps after combining: set data types, add NetSales (Custom Column: `[Units]*[UnitPrice]*(1-[DiscountPct]/100)`), remove Source.Name or extract the month from it.

### Practice (20 min)
1. Combine the 6 files (Jan–Jun 2026) into **tblSales2026**.
2. Add NetSales. Total net sales for H1 2026?
3. Build a quick pivot of net sales by month.

**Check:** **1,682** rows · H1 2026 net sales **₦605,179,960** · best month **April 2026 (₦122,884,555)**

### Mini-Task (10 min)
Copy `sales_2026-06.csv`, rename it `sales_2026-07.csv`, drop it in the folder and Refresh. The row count should jump to 1,962. (Delete the fake file afterwards and refresh again.)

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Merge and append
**Time:** ~1 hour

### Review (10 min)
From memory: the From Folder steps.

### Lesson (15 min)
| Operation | SQL-style name | Does | Excel equivalent |
|---|---|---|---|
| **Append** | UNION | stacks tables vertically (same columns) | VSTACK |
| **Merge** | JOIN | adds columns from another table by a matching key | XLOOKUP |

**Merge:** Home → Merge Queries → choose the other table and the matching columns → Join Kind (**Left Outer** = keep all rows of the first table) → expand the columns you need.

### Practice (20 min)
1. **Append** 2025 sales (`sales_2025.csv`) and the combined 2026 table into one **tblSalesAll** (2,400 + 1,682 = **4,082** rows).
2. **Merge** tblSalesAll with products on ProductID and bring in **UnitCost**; add a **Profit** column.
3. Load and check: 2025 profit should still be ₦129,531,600.

### Mini-Task (10 min)
Try an **Anti Join** (Left Anti) between products and 2026 sales: are there products never sold in 2026?

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Unpivot and reshape
**Time:** ~1 hour

### Review (10 min)
From memory: merge = ? append = ?

### Lesson (15 min)
Reports often arrive **wide** (months as columns). Analysis needs **long** data (one row per region per month).
- **Unpivot Columns**: select the month columns → Transform → Unpivot → becomes two columns: Attribute (the month) and Value.
- **Pivot Column** does the reverse.
- **Group By** (Home): summarise inside Power Query (like a pivot), e.g. net sales by Region.

### Practice (20 min)
1. In Excel, make a **wide** version of the targets: regions down, 12 months across (use a pivot of tblTargets, copy, Paste Values).
2. Load that wide table into Power Query and **Unpivot** it back to 72 rows (Region, Month, Target).
3. With **Group By**, create net sales per Region per Month from tblSalesAll.

### Mini-Task (10 min)
Rename your queries clearly (qSales2025, qSales2026, qSalesAll, qProducts…) and organise them into groups in the Queries pane.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: clean messy data automatically
**Time:** ~1.5 hours

### Review (15 min)
From a blank workbook: import a CSV, trim/clean a column, change types, load, refresh.

### Weekly Project (45 min)
**`NaijaMart_ETL.xlsx`**, an automated data pipeline:
1. **qCustomers**: the full messy-customers cleaning.
2. **qSalesAll**: 2025 file + the 2026 folder, appended, with NetSales, merged with products (UnitCost, Supplier) and Profit.
3. **qTargets**: loaded and typed.
4. All loaded as tables, with a **Refresh All** instruction box on the first sheet.
5. Test: add a new month file to the folder → Refresh → everything grows.

This is the most sought-after "automation" skill in Excel job ads.

### Log (15 min)
Weekly review.

## Quiz
1. What does Power Query never do to your source file?
2. What are Applied Steps?
3. How do you combine 12 monthly files with the same layout?
4. Merge vs append: what's the difference?
5. What does Unpivot do, and when do you need it?
6. How do you handle dd/mm/yyyy dates on a computer set to US format?
7. What were NaijaMart's H1 2026 net sales?

**Answers:** (1) modify it (2) the recorded, replayable list of transformations (3) Get Data → From Folder → Combine & Transform (4) merge adds columns by matching a key (like XLOOKUP); append stacks rows (like VSTACK) (5) turns columns into rows (wide → long), for analysing reports with months as columns (6) Change Type → Using Locale (7) ₦605,179,960.
