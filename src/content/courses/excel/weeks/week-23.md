# Week 23 — MO-211 prep
**Theme:** Prepare for the Microsoft Office Specialist: Excel Expert exam (MO-211).
**Big question:** *Am I an Excel expert on paper as well as in practice?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Exam MO-211 — Microsoft Learn](https://learn.microsoft.com/en-us/credentials/certifications/exams/mo-211/) | Download the official skills outline. |
| 🌐 | [Microsoft Office Specialist: Expert certification](https://learn.microsoft.com/en-us/credentials/certifications/microsoft-office-specialist-expert-m365-apps/) | Requirements and badge. |
| 🌐 | [Certiport — MOS exams](https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Overview) | Booking and GMetrix practice. |
| 🌐 | [Exceljet](https://exceljet.net/) | Look up any function in the outline you haven't used. |

## Day 1 — Monday
**Topic:** The Expert objectives
**Time:** ~1 hour

### Review (10 min)
Skim your MO-210 practice results.

### Lesson (15 min)
**MO-211 format:** ~50 minutes, live project tasks, passing score 700/1000. Microsoft recommends ~150 hours of hands-on experience (you've done about 130 in this course).
**The 4 skill areas** (approximate weights):
1. **Manage workbook options and settings (15–20%):** copy macros between workbooks, reference data in other workbooks, enable macros, **version management**, restrict editing, protect worksheets and ranges, protect workbook structure, configure **formula calculation options** (manual/automatic, iterative), manage comments
2. **Manage and format data (20–25%):** fill cells with Fill Series/Flash Fill, **RANDARRAY**, **custom number formats**, advanced conditional formatting (formula rules, manage rule order), **data validation**, group and ungroup data, subtotals, remove duplicates, **Consolidate**
3. **Create advanced formulas and macros (25–30%):** nested functions (IF, IFS, SWITCH, SUMIFS, AVERAGEIFS, COUNTIFS, MAXIFS, MINIFS, AND, OR, NOT), **LET**, lookups (**XLOOKUP**, VLOOKUP, HLOOKUP, MATCH, INDEX), **FILTER, SORTBY**, date/time functions (NOW, TODAY, WEEKDAY, WORKDAY), what-if (**Goal Seek, Scenario Manager**), forecasting (**Forecast Sheet**), financial (**NPER, PMT**), formula auditing (**trace precedents/dependents, Watch Window, Evaluate Formula, error checking**), simple macros (record, rename, edit VBA)
4. **Manage advanced charts and tables (25–30%):** advanced charts (**dual-axis, box & whisker, combo, funnel, histogram, map, sunburst, waterfall**), PivotTables (fields, **slicers**, grouping, **calculated fields**, formats, data model), PivotCharts (styles, drill-down)

### Practice (20 min)
Tick each objective ✅/🟡/❌. Most will be ✅ from this course. List the ❌ items; they're likely **Consolidate, RANDARRAY, HLOOKUP, Forecast Sheet, Watch Window, iterative calculation, copying macros between workbooks, sunburst/funnel/waterfall charts**.

### Mini-Task (10 min)
Look up and try the 3 items you've never used.

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** New items: Consolidate, RANDARRAY, HLOOKUP, custom formats
**Time:** ~1 hour

### Review (10 min)
From memory: the 4 MO-211 areas.

### Lesson (15 min)
- **Consolidate** (Data → Consolidate): combine ranges from several sheets by position or by category labels (e.g. the 6 monthly 2026 sheets into one summary). Tick *Create links to source data* for live links.
- **RANDARRAY(rows, cols, min, max, integer)**: random test data, e.g. `=RANDARRAY(10,1,1,100,TRUE)`
- **HLOOKUP**: VLOOKUP for horizontal tables (row index instead of column index)
- **Custom number formats**: `0.0%` · `#,##0,"K"` · `[Red][<0]-#,##0;#,##0` · `"Order "0000` · date `ddd dd-mmm`. Sections: positive;negative;zero;text

### Practice (20 min)
1. Consolidate net sales by Region from the Jan–Jun 2026 sheets (Week 15) with Sum, using labels.
2. Generate 20 random scores with RANDARRAY.
3. Build a horizontal price table and use HLOOKUP on it.
4. Create 5 custom formats from the list.

### Mini-Task (10 min)
Explain the 4 sections of a custom number format in your log.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** New items: auditing, calculation options, forecasting
**Time:** ~1 hour

### Review (10 min)
From memory: Consolidate steps.

### Lesson (15 min)
- **Formula auditing** (Formulas tab): *Trace Precedents / Dependents* (arrows), *Remove Arrows*, *Error Checking*, *Evaluate Formula*, **Watch Window** (monitor key cells while you edit elsewhere).
- **Calculation options:** Automatic / Manual (F9 recalculates) · *Enable iterative calculation* (File → Options → Formulas) for intentional circular references.
- **Forecast Sheet** (Data → Forecast Sheet): creates an exponential-smoothing forecast and chart from dates + values.

### Practice (20 min)
1. Trace precedents of your Commission formula; trace dependents of the VAT rate cell.
2. Add the Net Sales total and the VAT rate to a Watch Window; change inputs on another sheet and watch them.
3. Forecast Sheet on monthly net sales (2025 + H1 2026) for 6 months ahead.

### Mini-Task (10 min)
Switch to Manual calculation, change an input, see nothing update, press F9. Switch back to Automatic.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Advanced charts and macro admin
**Time:** ~1 hour

### Review (10 min)
From memory: where's the Watch Window?

### Lesson (15 min)
Insert → Charts → All Charts:
| Chart | Use |
|---|---|
| **Waterfall** | how a start value becomes an end value (e.g. gross sales → discounts → net → costs → profit) |
| **Funnel** | stages (leads → quotes → orders) |
| **Sunburst** | hierarchies (Category → Product) |
| **Box & Whisker** | distributions and outliers |
| **Histogram** | frequency of values in bins |
| **Map** | geography |
**Macros admin:** rename a macro (edit its Sub name in VBA), copy a macro module between workbooks (drag it in the VBA Project Explorer), and understand the Trust Center settings.

### Practice (20 min)
1. A **waterfall**: Gross sales ₦907,677,800 → Discounts −₦73,631,100 → Net ₦834,046,700 → Cost −₦704,515,100 → Profit ₦129,531,600 (set Net and Profit as totals).
2. A sunburst of net sales by Category → Product.
3. A box & whisker of NetSales by CustomerType.
4. Copy your FormatReport macro into a new workbook.

### Mini-Task (10 min)
A histogram of order NetSales in bins of ₦250,000. Where are most orders?

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Mock tasks
**Time:** ~1 hour

### Review (10 min)
Skim your ❌ list: all should now be 🟡 or ✅.

### Lesson (15 min)
Exam technique for Expert: tasks are longer and combine skills. Plan before clicking; use the Name Box to navigate; use XLOOKUP/FILTER when allowed, but if a task says "use VLOOKUP", use VLOOKUP.

### Practice (20 min)
**Mock tasks (target 30 minutes):**
1. Protect the Data sheet so only column L can be edited. 2. Add data validation to L: whole numbers 0–15, with an error message. 3. Conditional formatting rule by formula: rows where NetSales > 2,000,000 in bold. 4. Subtotals: net sales per Region (sort first). 5. A LET formula for the average net sale of Lagos Wholesale orders. 6. XLOOKUP a product's supplier with "Unknown" if not found. 7. FILTER the Kano orders, sorted with SORTBY by NetSales descending. 8. Scenario Manager with 2 scenarios. 9. PMT for a ₦3,000,000 loan at 20% over 24 months. 10. A PivotTable with a calculated field and a slicer. 11. A combo chart with a secondary axis. 12. Record a macro that applies your custom format, and rename it.

### Mini-Task (10 min)
Note the tasks that took over 3 minutes and redo them.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: full MO-211 practice exam
**Time:** ~1.5 hours

### Review (15 min)
Redo Friday's slowest tasks.

### Weekly Project (60 min)
Take a **full-length MO-211 practice exam** (GMetrix Testing mode, or your own 30-task mock covering the whole outline), strictly timed at 50 minutes. Score it.
**Plan:** MO-210 first, then MO-211 about 2–4 weeks later. Passing both earns the **Microsoft Office Specialist: Excel Expert** credential. Put both badges on LinkedIn.

### Log (10 min)
Score, weak areas, exam dates.

## Quiz
1. Name the 4 MO-211 skill areas.
2. What does Consolidate do?
3. What are the 4 sections of a custom number format?
4. What does the Watch Window do?
5. Which chart shows how gross sales become profit?
6. How do you copy a macro to another workbook?
7. What credential do you get after passing both MO-210 and MO-211?

**Answers:** (1) workbook options and settings; manage and format data; advanced formulas and macros; advanced charts and tables (2) combines data from several ranges/sheets by position or labels (3) positive; negative; zero; text (4) monitors chosen cells while you work elsewhere (5) a waterfall chart (6) drag the module between projects in the VBA editor (7) Microsoft Office Specialist: Excel Expert.
