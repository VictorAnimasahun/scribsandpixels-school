# Week 10 — Tables & data hygiene
**Theme:** Turn ranges into Excel Tables, protect data entry with validation, and fix data structure problems.
**Big question:** *How do I build a sheet other people can't break?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Excel Tables" and "data validation drop-down". |
| 🌐 | [Exceljet — Structured references](https://exceljet.net/glossary/structured-reference) | Read on Monday. |
| 🌐 | [Excel Skills for Business: Intermediate II (Coursera)](https://www.coursera.org/learn/excel-intermediate-2) | Data validation module. |
| 📊 | `NaijaMart_Sales_2025.xlsx` · `Customers_Clean.xlsx` | |

## Day 1 — Monday
**Topic:** Excel Tables
**Time:** ~1 hour

### Review (10 min)
From memory: an XLOOKUP with IFNA.

### Lesson (15 min)
Click anywhere in the data → **Ctrl+T** → My table has headers → OK. Then name it (Table Design → Table Name): **tblSales**.
What you get:
- **Auto-expanding:** new rows and columns join the table; formulas and formatting extend automatically
- **Calculated columns:** type a formula once and it fills the whole column
- **Structured references:** `=[@Units]*[@UnitPrice]` instead of `=J2*K2`; `=SUM(tblSales[NetSales])` instead of `=SUM(O2:O2401)`
- Banded rows, filter buttons, a **Total Row** (Table Design → Total Row)
- Charts and PivotTables built on a table grow with it

**Naming convention:** tblSales, tblProducts, tblStaff. Short, no spaces.

### Practice (20 min)
1. Convert the Data sheet to a table named **tblSales**, and Products to **tblProducts**.
2. Rewrite GrossSales as `=[@Units]*[@UnitPrice]` and NetSales as `=[@GrossSales]*(1-[@DiscountPct]/100)`.
3. Turn on the Total Row; show the Sum of NetSales and the Count of OrderID.
4. On the Summary sheet, rewrite a SUMIFS with structured references: `=SUMIFS(tblSales[NetSales], tblSales[Region], X2)`.

**Check:** total row: NetSales ₦834,046,700 · count 2,400

### Mini-Task (10 min)
Add a fake order at the bottom of the table. Do the totals and formulas include it automatically? Delete it afterwards.

### Log (5 min)
Log. Shortcut: **Ctrl+T**.

## Day 2 — Tuesday
**Topic:** Data validation and drop-down lists
**Time:** ~1 hour

### Review (10 min)
From memory: convert a range to a table, name it, and write one structured reference.

### Lesson (15 min)
Data → **Data Validation** restricts what people can type:
| Allow | Example |
|---|---|
| **List** | a drop-down: `Cash,Transfer,POS,Card`, or a range/table column |
| Whole number / Decimal | Units between 1 and 500 |
| Date | order date within 2025 |
| Text length | a phone number with exactly 11 characters |
| Custom (formula) | `=COUNTIF($A:$A,A2)=1` → no duplicate IDs |

- **Input Message** tab: a hint when the cell is selected.
- **Error Alert** tab: Stop / Warning / Information.
- **Dynamic drop-down** from a table column: create a name `=tblProducts[ProductID]`, then List source `=ProductIDList`. New products appear automatically.
- Circle Invalid Data (Data Validation menu) finds existing bad entries.

### Practice (20 min)
On a new sheet **OrderEntry** (a form for new orders):
1. Region: drop-down of the 6 regions.
2. ProductID: drop-down from tblProducts (dynamic).
3. Units: whole number 1–500 with an input message.
4. OrderDate: dates in 2026 only, with a Stop alert.
5. Phone: exactly 11 characters.

### Mini-Task (10 min)
Make the Regional Report selector (Week 6) a drop-down.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** Dependent drop-downs
**Time:** ~1 hour

### Review (10 min)
From memory: a list validation from a table column.

### Lesson (15 min)
A **dependent drop-down**: choose a Category, then only that category's products appear.
**Modern way (Microsoft 365):** in a helper cell, `=FILTER(tblProducts[Product], tblProducts[Category]=B2)` spills the list; then the validation source is `=$H$2#` (the # means "the whole spill range").
**Classic way:** named ranges per category + `=INDIRECT(B2)`.

### Practice (20 min)
On OrderEntry: Category drop-down (unique categories) → Product drop-down filtered by the category → UnitPrice filled automatically with XLOOKUP.

### Mini-Task (10 min)
Test it: choose "Phones", and the product list should show only the 4 phones.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Structural cleaning tools
**Time:** ~1 hour

### Review (10 min)
From memory: the FILTER-based dependent list.

### Lesson (15 min)
| Tool | Where | Does |
|---|---|---|
| **Remove Duplicates** | Data tab | deletes duplicate rows (choose which columns define a duplicate) |
| **Text to Columns** | Data tab | splits one column by a delimiter or fixed width; also converts text-dates and text-numbers |
| **Flash Fill** | Ctrl+E | pattern-based extraction |
| **Go To Special → Blanks** | F5 | select every blank, then type `=↑` + **Ctrl+Enter** to fill each blank with the value above |
| **Convert to Number** | the green-triangle warning | fixes numbers stored as text |
| **Unique count** | `=COUNTA(UNIQUE(range))` | how many distinct values (Microsoft 365) |

**Tidy-data rules:** one row per record · one column per field · one value per cell · no merged cells or blank rows inside the data · headers in one row only.

### Practice (20 min)
1. In a copy of `messy_customers.csv`, use Text to Columns to split "Surname, First" names at the comma.
2. Use Text to Columns (Column data format: Date, DMY) to convert text dates like `10/12/2023`.
3. Count distinct products sold: `=COUNTA(UNIQUE(tblSales[Product]))` (**40**) and distinct salespeople (**27**).

### Mini-Task (10 min)
Create a small report with blank cells under repeated group names (e.g. Region listed once, blanks below) and fill the blanks with Go To Special + `=↑` + Ctrl+Enter.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Protecting sheets and inputs
**Time:** ~1 hour

### Review (10 min)
From memory: the tidy-data rules.

### Lesson (15 min)
By default every cell is **Locked**, but locking only works when the sheet is protected.
1. Select the input cells → Ctrl+1 → Protection → **untick Locked**.
2. Review → **Protect Sheet** (optional password) → allow "Select unlocked cells".
Now users can type only in the inputs. Formulas are safe.
- **Hide formulas:** Ctrl+1 → Protection → Hidden (+ protect).
- **Protect Workbook** stops adding, deleting or renaming sheets.
- ⚠️ Excel sheet passwords are **not security**; they prevent accidents, not attacks. Never rely on them for confidential data.
- **Colour code:** input cells light yellow, formulas no fill. A widely used convention.

### Practice (20 min)
Protect the OrderEntry sheet so only the input cells can be edited. Test it by trying to overwrite a formula.

### Mini-Task (10 min)
Apply the yellow-input convention to your Commission Calculator from Week 5 and protect it.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: a validated order-entry system
**Time:** ~1.5 hours

### Review (15 min)
From a blank workbook: a table, a structured SUMIFS, a list validation, and a protected input area.

### Weekly Project (45 min)
**Build `NaijaMart_OrderEntry.xlsx`:**
1. **tblProducts** and **tblStores** reference tables on a Lists sheet.
2. **tblOrders**: OrderID (auto: `="NM-"&TEXT(ROW()-1,"00000")`), OrderDate (validated), Store (drop-down), Salesperson (drop-down), Category → Product (dependent), Units (validated), UnitPrice (lookup), Discount (drop-down 0/5/10/15), NetSales (calculated column).
3. Input columns yellow; formula columns locked; sheet protected.
4. A **Dashboard** sheet with today's totals using structured references.
5. Enter 15 test orders, including deliberately wrong entries, to check the validation stops them.

### Log (15 min)
Weekly review.

## Quiz
1. Give 4 advantages of Excel Tables.
2. Write the structured reference for the sum of the NetSales column in tblSales.
3. How do you create a drop-down that updates automatically when a product is added?
4. What does `$H$2#` mean?
5. How do you fill blanks with the value above in one go?
6. Why doesn't "Locked" do anything until you protect the sheet?
7. Are sheet passwords real security?

**Answers:** (1) auto-expanding, calculated columns, structured references, total row, banded formatting, charts/pivots grow with it (2) `=SUM(tblSales[NetSales])` (3) validation list from a table column (via a name or FILTER) (4) the whole spill range starting at H2 (5) Go To Special → Blanks, type `=` + the cell above, Ctrl+Enter (6) Locked is a property that protection enforces (7) no, they only prevent accidents.
