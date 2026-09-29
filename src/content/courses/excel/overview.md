# Excel: Zero to Expert — 24-Week Excel School

**Designed for:** An adult with a day job who has never used Excel seriously, or who uses it "a bit" and wants to become the person everyone asks for help.
**Goal:** Job-ready **advanced Excel** (formulas, PivotTables, Power Query, Power Pivot, dashboards, macros) plus the **Microsoft Office Specialist** certifications **MO-210 (Associate)** and **MO-211 (Expert)**.
**Time:** ~1 hour a day, Monday–Saturday, for 24 weeks (~150 hours). Every lesson uses real practice data from **NaijaMart**, a fictional Nigerian retail chain.

> **Why Excel?** It's the most-requested software skill in office job ads across Nigeria and Canada: finance, admin, operations, HR, sales, data analysis. It's also the fastest route to paid freelance work (data cleaning, reports, dashboards) while you learn other skills.

---

## How This Course Works

### Daily Structure (Mon–Sat, ~60 min)
| Block | Time | What You Do |
|---|---|---|
| Review | 10 min | Redo yesterday's key task **from a blank sheet**, without notes. |
| Lesson | 15 min | One concept: watch the video, read the explanation, try each example yourself. |
| Practice | 20 min | Exercises on the NaijaMart data. **Check your answers** against the answer keys. |
| Mini-task | 10 min | A small real-world problem using today's skill. |
| Log | 5 min | 3 sentences: what I learned, what confused me, the shortcut or function of the day. |

**Saturday** is project day: a realistic business task that combines the week's skills.
**Sunday:** Rest. Optionally, watch one Excel video for fun (Leila Gharani and ExcelIsFun are both great).

### Your Learning Rules
1. **Type every formula.** Never copy-paste a formula from a lesson; your fingers must learn the syntax.
2. **Keyboard first.** Learn one shortcut a day. Experts barely touch the mouse.
3. **Check your numbers.** Every exercise has an expected answer. If yours differs, find out why. That's where the learning is.
4. **One sheet, one purpose.** Keep raw data, calculations and reports on separate sheets.
5. **Build a portfolio.** Save every Saturday project. By Week 24 you'll have 20+ work samples.

### What You Need
- **Excel:** Microsoft 365 desktop (Windows ideal) is recommended. **Free alternative:** [Excel for the web](https://www.microsoft.com/en-us/microsoft-365/free-office-online-for-the-web) with a free Microsoft account works for Phases 1–3 and most of Phase 4.
  - Power Pivot (Week 18) is **Windows-only**. VBA (Week 20) needs desktop Excel. On a Mac or the web, those weeks have alternatives.
  - XLOOKUP, dynamic arrays and LAMBDA need **Microsoft 365 or Excel 2021+**. Excel 2016/2019 users will be told the older equivalent.
- **The NaijaMart datasets** in `datasets/`. Download the whole folder.
- **A notebook** for shortcuts, functions and "gotchas".

### The NaijaMart Datasets
| File | Rows | What it is | First used |
|---|---|---|---|
| `sales_2025.csv` | 2,400 | Every order in 2025: date, region, store, salesperson, customer type, product, units, unit price (₦), discount %, payment method | Week 2 |
| `products.csv` | 40 | Product catalogue: category, supplier, unit cost, unit price, reorder level | Week 9 |
| `employees.csv` | 120 | Staff: department, job title, region, hire date, date of birth, monthly salary, email, phone | Week 5 |
| `timesheet_2025-03.csv` | 400 | Clock-in / clock-out times for 20 staff in March 2025 | Week 8 |
| `targets_2025.csv` | 72 | Monthly sales targets per region | Week 13 |
| `messy_customers.csv` | 315 | Deliberately dirty customer list: inconsistent names, phones, cities, dates, duplicates | Weeks 7, 10, 17 |
| `monthly-sales/` | 6 files | Jan–Jun 2026 sales, one file per month (same columns as sales_2025) | Week 17 |

**Key figures for checking your work (sales_2025.csv):** 2,400 orders · 22,129 units · gross sales (Units × UnitPrice) **₦907,677,800** · net sales after discount **₦834,046,700** · biggest region Lagos (951 orders, ₦321,703,800 net).

### Master Resource List
| Resource | Type | Used In |
|---|---|---|
| [Excel Skills for Business — Macquarie University (Coursera)](https://www.coursera.org/specializations/excel) | Free-to-audit course, 4.9★ from 50k+ reviews | Phases 1–3 |
| [Leila Gharani](https://www.youtube.com/@LeilaGharani) | YouTube: clear, modern Excel | All phases |
| [ExcelIsFun (Mike Girvin)](https://www.youtube.com/@excelisfun) | YouTube: thousands of free lessons, very deep | All phases |
| [Exceljet](https://exceljet.net/) | Function reference with examples, shortcut list | All phases |
| [GCFGlobal — Excel](https://edu.gcfglobal.org/en/excel/) | Free beginner tutorials | Phase 1 |
| [Microsoft Support — Excel help & learning](https://support.microsoft.com/en-us/excel) | Official documentation and videos | All phases |
| [Chandoo.org](https://chandoo.org/) | Dashboards, formulas, templates | Phases 3–5 |
| [MyOnlineTrainingHub (Mynda Treacy)](https://www.myonlinetraininghub.com/) | Power Query, Power Pivot, dashboards | Phases 4–5 |
| [Excel Campus (Jon Acampora)](https://www.excelcampus.com/) | PivotTables, macros, VBA | Phases 3, 5 |
| [Microsoft Learn — Power Query docs](https://learn.microsoft.com/en-us/power-query/) | Official Power Query reference | Phase 4 |
| [Microsoft Office Specialist: Excel Expert (MO-211)](https://learn.microsoft.com/en-us/credentials/certifications/microsoft-office-specialist-expert-m365-apps/) | Certification page | Phase 6 |
| *Microsoft Excel 365 Bible* (Alexander & Kusleika) | Book: the complete reference | All phases |
| *M Is for (Data) Monkey* (Puls & Escobar) | Book: Power Query | Phase 4 |
| *Storytelling with Data* (Cole Nussbaumer Knaflic) | Book: charts and dashboards | Phases 3, 5 |

---

## The 6 Phases at a Glance

| Phase | Focus | Weeks | Milestone |
|---|---|---|---|
| 1 | Foundations: the grid, formatting, first formulas, references | 1–4 | A personal/household budget and a formatted sales summary |
| 2 | Formulas & functions: logic, conditional maths, text, dates, lookups | 5–9 | An automated invoice + payroll workbook |
| 3 | Data analysis: tables, validation, conditional formatting, charts, PivotTables, what-if | 10–14 | NaijaMart 2025 annual sales report |
| 4 | Modern Excel: dynamic arrays, LET/LAMBDA, Power Query, Power Pivot & DAX | 15–18 | A monthly report that refreshes itself from a folder of files |
| 5 | Dashboards & automation: design, interactivity, macros/VBA, collaboration | 19–21 | An interactive executive dashboard |
| 6 | Certification & career: MO-210, MO-211, capstone, portfolio, freelancing | 22–24 | Capstone project + certification-ready |

---

## Full Syllabus — Week by Week

### Phase 1 · Foundations
| Week | Title | You learn | Saturday project |
|---|---|---|---|
| 1 | Meet Excel | Workbooks, sheets, cells, entering and editing data, navigation, saving, Excel for the web | A contact list for 20 people |
| 2 | First formulas | Formatting (₦ currency, dates, %), arithmetic, SUM/AVERAGE/MIN/MAX/COUNT, AutoSum, order of operations | Weekly expense tracker |
| 3 | References & fill | Relative, absolute ($) and mixed references, fill handle, Flash Fill, percentages | Price list with VAT and discounts |
| 4 | Organise & print | Sort, filter, freeze panes, find & replace, multiple sheets, 3D references, page layout, printing | **Milestone:** household budget workbook |

### Phase 2 · Formulas & Functions
| Week | Title | You learn | Saturday project |
|---|---|---|---|
| 5 | Logic | IF, nested IF, IFS, AND, OR, NOT, SWITCH | Grading and commission calculator |
| 6 | Conditional maths | COUNTIF(S), SUMIF(S), AVERAGEIF(S), MAXIFS/MINIFS, COUNTA/COUNTBLANK | Regional sales summary |
| 7 | Text | LEFT/RIGHT/MID, LEN, FIND/SEARCH, TRIM, PROPER/UPPER/LOWER, CONCAT/TEXTJOIN/&, TEXT, SUBSTITUTE, TEXTSPLIT/TEXTBEFORE/TEXTAFTER | Clean a customer list |
| 8 | Dates & times | Date serials, TODAY/NOW, YEAR/MONTH/DAY, DATE, EDATE/EOMONTH, WEEKDAY, NETWORKDAYS/WORKDAY, DATEDIF, time arithmetic | Timesheet and overtime calculator |
| 9 | Lookups | VLOOKUP (and its pitfalls), XLOOKUP, INDEX/MATCH, XMATCH, IFERROR/IFNA, named ranges | **Milestone:** automated invoice + payroll |

### Phase 3 · Data Analysis
| Week | Title | You learn | Saturday project |
|---|---|---|---|
| 10 | Tables & data hygiene | Excel Tables, structured references, data validation, drop-downs, remove duplicates, text to columns | A clean, validated order-entry sheet |
| 11 | Conditional formatting & charts | Rules, data bars, icon sets, formula-based rules; column, bar, line, pie, combo charts, sparklines; chart design | Visual sales report |
| 12 | PivotTables I | Creating PivotTables, fields, summarise by, show values as, grouping dates, filters, PivotCharts | Sales by region, category and month |
| 13 | PivotTables II | Slicers, timelines, calculated fields, multiple tables and relationships, GETPIVOTDATA | Interactive target-vs-actual analysis |
| 14 | What-if & finance | Goal Seek, Scenario Manager, Data Tables, Solver; PMT, FV, PV, NPV, IRR | **Milestone:** NaijaMart 2025 annual report |

### Phase 4 · Modern Excel
| Week | Title | You learn | Saturday project |
|---|---|---|---|
| 15 | Dynamic arrays | Spill ranges, FILTER, SORT/SORTBY, UNIQUE, SEQUENCE, CHOOSECOLS, VSTACK/HSTACK, TAKE/DROP | A live "top 10" report |
| 16 | LET & LAMBDA | LET, LAMBDA, named functions, MAP/BYROW/REDUCE basics | Your own custom function library |
| 17 | Power Query | Get data (CSV, folder, web), cleaning steps, unpivot, merge and append, refresh | Clean messy data automatically |
| 18 | Data Model & Power Pivot | Relationships, star schema, DAX measures (SUM, CALCULATE, DIVIDE, time intelligence) | **Milestone:** self-refreshing monthly report |

### Phase 5 · Dashboards & Automation
| Week | Title | You learn | Saturday project |
|---|---|---|---|
| 19 | Dashboards | KPI design, layout, interactive controls, dynamic charts, design principles | A one-page sales dashboard |
| 20 | Macros & VBA | Recording macros, relative references, editing VBA, variables, loops, buttons, .xlsm security | Automate a weekly report |
| 21 | Collaboration & protection | Sharing and co-authoring, comments, protection, Office Scripts, Copilot in Excel, Excel vs Google Sheets | **Milestone:** interactive executive dashboard |

### Phase 6 · Certification & Career
| Week | Title | You learn | Saturday project |
|---|---|---|---|
| 22 | MO-210 prep | Associate exam objectives, practice tasks, a timed mock | Full MO-210 practice exam |
| 23 | MO-211 prep | Expert exam objectives, practice tasks, a timed mock | Full MO-211 practice exam |
| 24 | Capstone & career | Capstone build, portfolio, CV bullets, Excel interview tests, freelancing | **Capstone:** end-to-end business analysis |

---

## Assessment
- **Weekly quiz:** Saturday evening, self-check. Pass = you can do every item from a blank sheet.
- **Answer keys:** exercises on NaijaMart data include the expected result. If yours differs, investigate.
- **Phase milestones:** Weeks 4, 9, 14, 18, 21 and 24 (see tables).
- **Certification:** MO-210 then MO-211, taken through Certiport-authorised test centres (several in Lagos and Abuja) or online.
