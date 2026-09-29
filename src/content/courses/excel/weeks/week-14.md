# Week 14 — What-if & finance
**Theme:** Goal Seek, scenarios, data tables, Solver, and the core financial functions, then the Phase 3 milestone report.
**Big question:** *What would have to change to hit our target, and what's the best decision?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Goal Seek Scenario Manager Data Table". |
| 🌐 | [Microsoft Support — Solver](https://support.microsoft.com/en-us/excel) | Search "Define and solve a problem by using Solver". Enable the add-in first. |
| 🌐 | [Exceljet — Financial functions](https://exceljet.net/functions) | PMT, FV, PV, NPV, IRR. |
| 🌐 | [Excel Skills for Business: Advanced (Coursera)](https://www.coursera.org/learn/excel-advanced) | What-if analysis module. |

## Day 1 — Monday
**Topic:** Goal Seek
**Time:** ~1 hour

### Review (10 min)
From memory: a target-vs-actual variance % formula.

### Lesson (15 min)
**Goal Seek** (Data → What-If Analysis → Goal Seek) works backwards: "set this formula cell **to** this value **by changing** that input cell."
Requirements: the target cell must contain a **formula** that depends (directly or indirectly) on the changing cell.

Example: Kano ended 2025 at ₦89,100,560 against a target of ₦94,400,000. How many extra Tecno Spark 20 phones (₦145,000 each) would have closed the gap?
- B1: extra units (start at 0) · B2: `=89100560+B1*145000` · Goal Seek: set B2 to 94400000 by changing B1.

### Practice (20 min)
1. Solve the Kano question. Round up: you can't sell part of a phone.
2. A product costs ₦118,000. What selling price gives a 25% margin? (Formula: margin = (price − cost)/price.)
3. Your expense tracker (Week 2): how much can you spend per day for the rest of the month to stay within budget?

**Check:** 1. 36.55 → **37 phones** 2. **₦157,333**

### Mini-Task (10 min)
Loan preview: with `=PMT(24%/12,36,-5000000)` in a cell, Goal Seek the loan amount that gives a ₦150,000 monthly payment. (**≈ ₦3,823,326**)

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Financial functions
**Time:** ~1 hour

### Review (10 min)
From memory: the three Goal Seek fields.

### Lesson (15 min)
| Function | Answers | Example |
|---|---|---|
| `PMT(rate, nper, pv)` | loan repayment per period | `=PMT(24%/12, 36, -5000000)` |
| `FV(rate, nper, pmt)` | future value of regular savings | `=FV(12%/12, 60, -50000)` |
| `PV(rate, nper, pmt)` | how much a stream of payments is worth today | |
| `NPER(rate, pmt, pv)` | how many periods to repay | |
| `RATE(nper, pmt, pv)` | the interest rate implied | |
| `NPV(rate, cashflows) + initial` | net present value of an investment | |
| `IRR(cashflows)` | internal rate of return | |

**Consistency rule:** monthly payments → **monthly rate (÷12)** and **number of months**.
**Sign convention:** money you pay out is negative, money you receive is positive (that's why the pv is `-5000000`).

### Practice (20 min)
1. A ₦5,000,000 business loan at 24% a year over 3 years: monthly payment? Total interest paid?
2. A ₦2,000,000 car loan at 18% over 2 years: monthly payment?
3. Saving ₦50,000 a month at 12% a year for 5 years: final amount?
4. How many months to repay ₦1,000,000 at 20% a year paying ₦50,000 a month?

**Check:** 1. **₦196,164.26**/month; total interest ₦2,061,913 (36 × payment − principal) 2. **₦99,848.20** 3. **₦4,083,483.49** 4. about **24.5 months**

### Mini-Task (10 min)
Build a loan calculator sheet: inputs (amount, annual rate, years) → monthly payment, total paid, total interest.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** Data Tables and Scenario Manager
**Time:** ~1 hour

### Review (10 min)
From memory: PMT for a monthly loan.

### Lesson (15 min)
**Data Table** (What-If Analysis → Data Table) recalculates one formula for many input values:
- **Two-variable table:** loan payment for rates (down the side) × terms (across the top). The formula goes in the top-left corner cell; Row input = the term cell, Column input = the rate cell.
**Scenario Manager** stores named sets of inputs (Best / Base / Worst case) and produces a summary report.
Example inputs for NaijaMart 2026 planning: sales growth %, average discount %, cost inflation %.

### Practice (20 min)
1. Two-variable data table: monthly payment on ₦5,000,000 for rates 15%–30% (step 2.5%) and terms 12, 24, 36, 48, 60 months.
2. A 2026 planning model: net sales 2026 = 2025 net × (1 + growth); profit = net × margin. Scenarios: Best (growth 20%, margin 17%), Base (10%, 15.5%), Worst (−5%, 13%). Create a Scenario Summary.

**Check (2):** Base: net 2026 = ₦917,451,370, profit ≈ ₦142.2M

### Mini-Task (10 min)
Add a one-variable data table: 2026 profit for growth rates from −10% to +30%.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Solver
**Time:** ~1 hour

### Review (10 min)
From memory: set up a two-variable data table.

### Lesson (15 min)
Enable it: File → Options → Add-ins → Excel Add-ins → **Solver**. (Excel for the web has a Solver add-in too.)
Solver finds the **best** value of an objective by changing several cells, **subject to constraints**. It's Goal Seek on steroids.
Parts: **Objective** (maximise or minimise a formula cell) · **Variable cells** · **Constraints** (≤ budget, ≥ minimums, integer) · **Method**: Simplex LP for linear problems.

**Problem: stock a new NaijaMart kiosk.** Budget ₦10,000,000, shelf space 200 slots, at least 10 of each product:
| Product | Unit cost | Profit per unit | Space per unit |
|---|---|---|---|
| Tecno Spark 20 | ₦118,000 | ₦27,000 | 1 |
| Oraimo Power Bank | ₦14,500 | ₦6,500 | 1 |
| Rice 50kg | ₦68,000 | ₦10,000 | 4 |
| Standing Fan | ₦28,000 | ₦10,500 | 3 |
Maximise total profit.

### Practice (20 min)
Build the model (quantities in variable cells; total cost, total space and total profit as formulas) and solve with Simplex LP, integer quantities.

**Check:** **69 phones, 61 power banks, 10 rice, 10 fans** → profit **₦2,464,500**, cost ₦9,986,500, space 200/200

### Mini-Task (10 min)
Change the budget to ₦12,000,000 and re-solve. What changes, and why? (Space becomes the binding constraint.)

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Investment decisions: NPV and IRR
**Time:** ~1 hour

### Review (10 min)
From memory: the 3 parts of a Solver model.

### Lesson (15 min)
Should NaijaMart buy a ₦4,750,000 solar system that saves ₦1,800,000 a year in diesel for 5 years, if money costs 15% a year?
- Cash flows: Year 0 = −4,750,000; Years 1–5 = +1,800,000 each
- `=NPV(15%, C3:C7) + C2` (NPV treats the first value as year 1, so add year 0 separately)
- `=IRR(C2:C7)`
**Decision rule:** NPV > 0 and IRR > cost of money → worth it.

### Practice (20 min)
Calculate the NPV and IRR. Then: what's the NPV if diesel prices drop and savings are only ₦1,300,000 a year?

**Check:** NPV **₦1,283,879** · IRR **25.9%** → invest. At ₦1,300,000/year, NPV turns negative (about −₦392,000).

### Mini-Task (10 min)
Goal Seek: what's the minimum annual saving that makes NPV = 0? (**≈ ₦1,417,000 a year**)

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Milestone: NaijaMart 2025 annual report
**Time:** ~2 hours

### Review (15 min)
From a blank workbook: PMT, a data table, and a Goal Seek.

### Weekly Project (75 min)
**Phase 3 milestone: `NaijaMart_Annual_Report_2025.xlsx`**, a workbook you could hand to a CEO:
1. **Data** (tblSales, tblProducts, tblTargets, tblRegions, with relationships). Validated and clean.
2. **Executive summary** sheet: KPIs (net sales, profit, margin, orders, average order, target achievement), 4 insight charts, 5 bullet-point findings in plain English.
3. **Analysis** sheets: pivots with slicers (region, category, month, customer type, salesperson).
4. **Targets** sheet: target vs actual by region and month, with conditional formatting.
5. **2026 Plan** sheet: scenarios (best/base/worst), a data table of profit vs growth, and the solar investment NPV.
6. Print the executive summary to a 1-page PDF.

**Key figures your report must show:** net sales ₦834,046,700 · profit ₦129,531,600 (15.5%) · 2,400 orders · target ₦844,900,000 (−1.3%) · best month December · top region Lagos (38.6%)

### Log (15 min)
Phase 3 review: what can I do now? Which skill will I use most at work?

## Quiz
1. What must be true of the cell you set in Goal Seek?
2. Write PMT for ₦2,000,000 at 18% a year over 24 months.
3. Why is the loan amount negative in PMT?
4. How does NPV in Excel treat the first cash flow?
5. What's the difference between Goal Seek and Solver?
6. What does a two-variable data table need in its top-left corner?
7. Should NaijaMart buy the solar system? Why?

**Answers:** (1) it must contain a formula depending on the changing cell (2) `=PMT(18%/12,24,-2000000)` → ₦99,848.20 (3) cash-flow sign convention: money out is negative (4) as year 1, so add year 0 separately (5) Goal Seek hits one target by changing one cell; Solver optimises with many variables and constraints (6) the formula (7) yes: NPV ₦1.28M > 0 and IRR 25.9% > 15%.
