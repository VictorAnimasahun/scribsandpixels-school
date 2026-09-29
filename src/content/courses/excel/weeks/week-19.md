# Week 19 — Dashboards
**Theme:** Design one-page, interactive dashboards that busy managers actually use.
**Big question:** *What makes a dashboard useful, not just pretty?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Chandoo.org](https://chandoo.org/) | Browse the dashboard examples for layout ideas. |
| 📺 | [MyOnlineTrainingHub](https://www.myonlinetraininghub.com/) | Search "interactive Excel dashboard". |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Excel dashboard from scratch". |
| 📗 | *Storytelling with Data* | Revisit chapters on clutter and focus. |
| 📊 | `NaijaMart_Monthly_Report.xlsx` (Week 18) | Your model feeds the dashboard. |

## Day 1 — Monday
**Topic:** Dashboard design principles
**Time:** ~1 hour

### Review (10 min)
From memory: 3 DAX measures, or 3 SUMIFS KPIs if you're on Mac/web.

### Lesson (15 min)
**Start with questions, not charts.** Ask the user: *What 3–5 questions do you need answered every Monday?* For NaijaMart's CEO:
1. Are we on target this month / year? 2. Which regions and categories are driving or dragging? 3. What's the trend? 4. Who are the top performers?

**Layout (the Z-pattern):** top-left = most important (KPIs) → top-right = trend → bottom = breakdowns and details.
**Rules:** one screen, no scrolling · 5–7 visuals maximum · consistent colours (one brand colour + grey + one alert colour) · every number formatted (₦M with 1 decimal: custom format `₦#,##0.0,,"M"`) · no 3D, no gridlines · labels instead of legends · white space.

### Practice (20 min)
On paper (or in PowerPoint), sketch a dashboard answering the CEO's 4 questions: where each KPI and chart goes.

### Mini-Task (10 min)
Create the custom number format `₦#,##0.0,,"M"` and apply it to 834046700. (**₦834.0M**)

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** KPI cards
**Time:** ~1 hour

### Review (10 min)
From memory: the 4 dashboard design rules you find most important.

### Lesson (15 min)
A KPI card = a big number + a label + a comparison + a signal:
| Element | How |
|---|---|
| Big number | a merged area or shape linked to a cell: select the shape → type `=` in the formula bar → click the cell |
| Label | "Net sales (YTD)" |
| Comparison | "vs target: 98.7%" or "vs last year: +72.9%" |
| Signal | ▲▼ with a custom format: `[Color10]▲ 0.0%;[Red]▼ 0.0%` (green up, red down) |

Build KPIs with GETPIVOTDATA, CUBEVALUE (Data Model), or SUMIFS on the tables.

### Practice (20 min)
Build 4 KPI cards on a **Dashboard** sheet: Net Sales, Profit (+ margin), Achievement vs Target, Orders (+ average order). Each with a comparison and ▲▼ signal.

### Mini-Task (10 min)
Turn off gridlines (View → Gridlines), set a light background, and align the cards on a grid (Alt+drag snaps shapes to cells).

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** Dashboard charts
**Time:** ~1 hour

### Review (10 min)
From memory: link a shape to a cell.

### Lesson (15 min)
Pick the visual for each question:
| Question | Visual |
|---|---|
| Trend vs target | combo: actual columns + target line |
| Ranking (regions, products) | sorted horizontal bar, top one highlighted |
| Mix (customer types) | 100% stacked bar |
| Performance vs target by region | **bullet-style chart** (bar for actual, marker for target) or conditional-format table |
| Geography | Filled Map chart (Insert → Maps). Needs region names Excel recognises, e.g. Lagos, Kano, Rivers (Port Harcourt → *Rivers* state) |
Keep every chart in the same style (save a chart template).

### Practice (20 min)
Add to the dashboard: (1) monthly actual vs target combo, (2) region ranking bar, (3) top 10 products bar, (4) customer-type mix.

### Mini-Task (10 min)
Try a Filled Map of net sales by state (map regions to states: Lagos, FCT, Rivers, Kano, Oyo, Enugu).

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Interactivity
**Time:** ~1 hour

### Review (10 min)
From memory: which chart for trend vs target, ranking and mix?

### Lesson (15 min)
- **Slicers** (Year, Region, Category) connected to every pivot and pivot chart (Report Connections).
- **Timeline** for dates.
- For formula-driven parts: a **drop-down** cell used by the SUMIFS/FILTER formulas.
- Form controls (Developer tab → Insert): option buttons to switch a chart between "Net sales" and "Profit"; a scroll bar for "Top N".
- A **"Last refreshed"** stamp: Power Query can load a one-row query `DateTime.LocalNow()`; or simply write the date by hand when you publish.

### Practice (20 min)
Add slicers for Year, Region and Category, connect them to all pivots, and position them in a neat side panel.

### Mini-Task (10 min)
Add option buttons (Net sales / Profit) that switch the monthly chart's measure using a helper cell and CHOOSE.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Polish, performance and sharing
**Time:** ~1 hour

### Review (10 min)
From memory: connect a slicer to several pivots.

### Lesson (15 min)
**Polish checklist:** consistent fonts and sizes · aligned edges · no scrollbars or sheet tabs visible when presenting (File → Options → Advanced → display options) · hide helper sheets · freeze the view · a title with the period ("NaijaMart Sales Dashboard — 2025").
**Performance:** avoid volatile functions (OFFSET, INDIRECT, TODAY) in big models; prefer the Data Model for big data; turn off "Autofit column widths on update" on pivots.
**Sharing:** PDF for static reports; OneDrive/SharePoint link for interactive use (slicers work in Excel for the web); or recreate it in Power BI later.

### Practice (20 min)
Apply the polish checklist. Ask someone to use your dashboard without instructions for 2 minutes and note where they get stuck.

### Mini-Task (10 min)
Export a PDF of the dashboard filtered to Lagos and another to Kano.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: one-page sales dashboard
**Time:** ~1.5 hours

### Review (15 min)
Rebuild one KPI card from scratch in 5 minutes.

### Weekly Project (45 min)
**Finish `NaijaMart_Dashboard.xlsx`:** one screen, answering the CEO's 4 questions: 4 KPI cards, 4 charts, slicers for Year/Region/Category, consistent design, a refresh instruction. Then write a 5-sentence **commentary** as if emailing the CEO: what the dashboard shows this month and what to do about it.

### Log (15 min)
Weekly review.

## Quiz
1. What's the first step in designing a dashboard?
2. Describe the Z-pattern layout.
3. Write a custom number format for millions with ₦ and one decimal.
4. What are the 4 parts of a KPI card?
5. How do you make one slicer filter every chart?
6. Which functions can slow down big workbooks?
7. What's the best way to share an interactive dashboard?

**Answers:** (1) ask what questions it must answer (2) most important at the top-left, then top-right, then details below (3) `₦#,##0.0,,"M"` (4) big number, label, comparison, signal (5) Report Connections on the slicer (6) volatile functions such as OFFSET, INDIRECT, TODAY/NOW (7) a OneDrive/SharePoint link (slicers work in Excel for the web), or Power BI.
