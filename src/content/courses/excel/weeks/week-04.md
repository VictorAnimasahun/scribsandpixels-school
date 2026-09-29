# Week 4 — Organise & print
**Theme:** Tame large data: sort, filter, freeze, find, link sheets, and print professionally.
**Big question:** *How do I find what I need in 2,400 rows in seconds?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Excel Skills for Business: Essentials (Coursera)](https://www.coursera.org/learn/excel-essentials) | Weeks 3–4 videos. |
| 🌐 | [GCFGlobal — Excel](https://edu.gcfglobal.org/en/excel/) | "Sorting Data", "Filtering Data", "Freezing Panes". |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Excel filter tricks". |
| 🌐 | [Microsoft Support — Print a worksheet](https://support.microsoft.com/en-us/excel) | Search "set print area" on Friday. |
| 📊 | `NaijaMart_Sales_2025.xlsx` | Continue. |

## Day 1 — Monday
**Topic:** Sorting
**Time:** ~1 hour

### Review (10 min)
Blank sheet: a price grid with mixed references, from memory.

### Lesson (15 min)
- **Quick sort:** click one cell in a column → Data → **A→Z** or **Z→A**. Excel sorts the whole table and keeps rows together.
- ⚠️ **Never select a single column and sort it alone.** That scrambles your data (Excel warns you; choose *Expand the selection*).
- **Multi-level sort:** Data → **Sort** → Add Level: e.g. Region A→Z, then NetSales largest→smallest.
- **Custom lists:** sort by a custom order (e.g. Low, Medium, High) under Order → Custom List.
- Keep a way back to the original order: an ID column (OrderID) lets you re-sort.

### Practice (20 min)
On the Data sheet:
1. Sort by NetSales, largest first. What's the top order? (**NM-00460 or NM-01787, Dell Inspiron 15 × 24, ₦13,239,600**)
2. Sort by Region A→Z, then NetSales Z→A. What's Enugu's biggest order? (**NM-00460, Dell Inspiron 15, ₦13,239,600**: the company's biggest order came from Enugu!)
3. Sort by OrderID A→Z to restore the original order.

### Mini-Task (10 min)
In `NaijaMart_PriceList.xlsx`, sort products by Margin % largest first. Which product has the highest margin %? (**Phone Charger (Fast), 44%**)

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Filtering
**Time:** ~1 hour

### Review (10 min)
Multi-level sort from memory: Category A→Z, then Units Z→A. Then restore the order.

### Lesson (15 min)
**Ctrl+Shift+L** turns filters on/off (arrows in the header row).
- Tick/untick values · **Search** box · Text Filters (*contains*, *begins with*) · Number Filters (*greater than*, *top 10*) · Date Filters (*this month*, *between*)
- Filter several columns at once = AND logic.
- The status bar shows *"x of 2400 records found"*.
- **SUBTOTAL** respects filters: `=SUBTOTAL(9,O2:O2401)` sums only the **visible** rows (9 = SUM). A normal SUM would include hidden rows.
- Clear all filters: Data → Clear.

### Practice (20 min)
With filters (and SUBTOTAL for totals):
1. How many orders in **Lagos - Lekki**?
2. How many **Phones** orders in **Kano**, and their net total?
3. How many orders in **December**?
4. How many **Online** orders paid by **Transfer**?
5. How many orders with net sales **≥ ₦1,000,000**?

**Check:** 1. 331 2. 17 orders, ₦19,551,300 3. 330 4. 445 5. 140

### Mini-Task (10 min)
Filter for iPhone orders (Text Filter → contains "iPhone"). How many, and what's their net total? (**11 orders, ₦25,824,000**)

### Log (5 min)
Log. Shortcut: **Ctrl+Shift+L**.

## Day 3 — Wednesday
**Topic:** Freeze panes, find & replace, go to special
**Time:** ~1 hour

### Review (10 min)
From memory: SUBTOTAL for the visible total of a filtered column.

### Lesson (15 min)
- **Freeze Panes** (View → Freeze Panes): *Freeze Top Row*, or select B2 → Freeze Panes to lock row 1 **and** column A. Headers stay visible as you scroll.
- **Find (Ctrl+F)** / **Replace (Ctrl+H)**: options include *Match entire cell contents*, *Within: Workbook*, and wildcards (`*` any text, `?` one character).
- **Go To Special (F5 → Special):** select all *Blanks*, *Formulas*, *Constants* or *Errors* in one click. Great for auditing.
- **Hide / unhide** rows and columns (right-click). Better: **Group** (Data → Group) so they can expand/collapse.

### Practice (20 min)
1. Freeze row 1 and column A on the Data sheet; scroll to check.
2. Use Find to count how many cells contain "Milo" (Find All shows the count). (**128**)
3. Replace "Lagos - Surulere" with "Lagos - Surulere (Flagship)" in the Store column, then undo.
4. Go To Special → Formulas: which columns contain formulas?

### Mini-Task (10 min)
Group columns F–I on the Data sheet and collapse them. Expand again.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Working across sheets: 3D references
**Time:** ~1 hour

### Review (10 min)
Freeze panes and find & replace from memory.

### Lesson (15 min)
- Reference another sheet: `=Data!O2` · a sheet name with spaces: `='Jan Sales'!B5`
- Another workbook: `=[Budget.xlsx]Sheet1!B2`. It works but is fragile if the file moves; avoid it when you can.
- **3D reference:** the same cell across a run of sheets: `=SUM(Jan:Mar!B5)` adds B5 on every sheet from Jan to Mar. Perfect for monthly sheets with an identical layout.
- **Group sheets** (Ctrl+click tabs) to type or format the same thing on several sheets at once. ⚠️ Ungroup afterwards!

### Practice (20 min)
New workbook **Quarterly.xlsx**:
1. Create 3 sheets: **Jan, Feb, Mar**. Group them and, in one go, create the same layout: A1 "Region", A2:A7 the six regions, B1 "Net sales".
2. Ungroup. Fill in each month's regional numbers (invent them, or later calculate them from the data).
3. Add a **Q1** sheet with `=SUM(Jan:Mar!B2)` for each region.

### Mini-Task (10 min)
Insert a new sheet **Feb2** *between* Jan and Mar with a number in B2. Does the Q1 total include it? (**Yes: 3D references include every sheet between the first and last.**)

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Page layout and printing
**Time:** ~1 hour

### Review (10 min)
Write a 3D SUM from memory.

### Lesson (15 min)
Page Layout tab and File → Print:
- **Orientation:** landscape for wide tables.
- **Scaling:** *Fit All Columns on One Page*.
- **Print Area:** select the range → Page Layout → Print Area → Set.
- **Print Titles:** *Rows to repeat at top* = $1:$1, so headers print on every page.
- **Header/Footer:** file name, page X of Y, date.
- **Page Break Preview** (View tab): drag the blue lines.
- **Export to PDF:** File → Save As → PDF. This is how you usually send reports.

### Practice (20 min)
1. Set the Summary sheet to print on one landscape page with a header "NaijaMart — Confidential" and page numbers in the footer.
2. Set the Data sheet to repeat row 1 on every printed page, fit all columns to one page wide. How many pages? (Check in Print Preview.)
3. Export the Summary sheet as PDF.

### Mini-Task (10 min)
Open the PDF and check that it looks professional. Fix anything cut off.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Milestone: household budget workbook
**Time:** ~2 hours

### Review (15 min)
Sort, filter with SUBTOTAL, freeze panes, and a 3D reference, all from a blank workbook.

### Weekly Project (75 min)
**Phase 1 milestone: `Household_Budget_2026.xlsx`**
1. **Inputs sheet:** monthly income sources (salary, side hustle…), savings goal %, and expense categories (Rent, Food, Transport, Data/Airtime, Electricity/Fuel, School fees, Family support, Church/Mosque, Savings, Other).
2. **12 monthly sheets (Jan–Dec)** with an **identical layout** (build one, then Move or Copy): category, budgeted, actual, difference (budgeted − actual), % of income. Use $ references to the Inputs sheet.
3. **Year sheet** with 3D references: total budget vs actual per category for the year.
4. Fill in at least 2 months with realistic figures.
5. Professional formatting, freeze panes, print setup (1 page per month), export Year to PDF.

**Self-check:** change your salary on Inputs. Does every sheet update?

### Log (15 min)
Phase 1 review: what can I do now? What still slows me down? My 10 favourite shortcuts.

## Quiz
1. Why should you never sort a single column on its own?
2. What does `=SUBTOTAL(9,range)` do differently from SUM?
3. How do you freeze row 1 and column A together?
4. What does `=SUM(Jan:Dec!C5)` do?
5. Why should you ungroup sheets after editing them together?
6. How do you print headers on every page?
7. How many NaijaMart orders were in December 2025?

**Answers:** (1) it separates that column from the rest of each row, scrambling the data (2) it only counts visible (filtered) rows (3) select B2 → View → Freeze Panes (4) adds C5 on every sheet from Jan to Dec (5) otherwise every edit hits all grouped sheets (6) Page Layout → Print Titles → Rows to repeat at top (7) 330.
