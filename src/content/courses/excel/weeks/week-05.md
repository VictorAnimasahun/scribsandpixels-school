# Week 5 — Logic
**Theme:** Teach Excel to make decisions with IF, IFS, AND, OR and SWITCH.
**Big question:** *How can a spreadsheet decide something for me?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Excel Skills for Business: Intermediate I (Coursera)](https://www.coursera.org/learn/excel-intermediate-1) | Enrol (audit). Logical functions module. |
| 🌐 | [Exceljet — IF function](https://exceljet.net/functions/if-function) | Read on Monday; also IFS, AND, OR, SWITCH. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "IF function nested IFS". |
| 📊 | `NaijaMart_Sales_2025.xlsx` + `employees.csv` | Save employees.csv as **NaijaMart_HR.xlsx** on Tuesday. |

## Day 1 — Monday
**Topic:** IF
**Time:** ~1 hour

### Review (10 min)
From a blank sheet: VAT column with a locked rate, and a % of total column.

### Lesson (15 min)
`=IF(logical_test, value_if_true, value_if_false)`
| Comparison | Meaning |
|---|---|
| `=` `<>` | equal, not equal |
| `>` `<` `>=` `<=` | greater, less, or equal |

- `=IF(O2>=1000000, "Large", "Standard")`
- `=IF(F2="Wholesale", O2*5%, 0)`
- Text goes in **"quotes"**; numbers don't.
- IF can return a calculation, a number, text, or even another IF.
- Test for empty: `=IF(A2="", "Missing", A2)`

### Practice (20 min)
On the Data sheet (next empty column **S**, header **BigOrder**):
1. `=IF(O2>=1000000,"Yes","No")`, filled down. How many "Yes"? (Use filters or the COUNTIF preview below.)
2. Column **T** "WholesaleFlag": 1 if the CustomerType is Wholesale, otherwise 0. Sum the column.
Preview of next week: `=COUNTIF(S2:S2401,"Yes")` counts the Yes.

**Check:** 1. **140** orders 2. **354** wholesale orders

### Mini-Task (10 min)
A score in A2: write `=IF(A2>=50,"Pass","Fail")` and test it with 49, 50 and 75.

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Nested IF and IFS
**Time:** ~1 hour

### Review (10 min)
From memory: an IF that labels numbers ≥ 100 as "High", otherwise "Low".

### Lesson (15 min)
More than two outcomes? Nest IFs, or better, use **IFS** (Excel 2019+):
- Nested: `=IF(O2>=1000000,"Large",IF(O2>=100000,"Medium","Small"))`
- IFS: `=IFS(O2>=1000000,"Large", O2>=100000,"Medium", TRUE,"Small")`
**Order matters:** test the biggest threshold first. `TRUE` at the end means "everything else".

**Grading example (Nigerian university scale):**
`=IFS(A2>=70,"A",A2>=60,"B",A2>=50,"C",A2>=45,"D",A2>=40,"E",TRUE,"F")`

### Practice (20 min)
1. Replace column S with **OrderSize** using IFS: Large (≥ ₦1,000,000), Medium (≥ ₦100,000), Small.
2. Count each size with filters.

**Check:** Large **140** · Medium **1,391** · Small **869**

### Mini-Task (10 min)
Build the grading formula for 10 made-up exam scores and test the boundaries (69, 70, 44, 45, 39).

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** AND, OR, NOT
**Time:** ~1 hour

### Review (10 min)
From memory: IFS with 3 bands.

### Lesson (15 min)
| Function | TRUE when | Example |
|---|---|---|
| `AND(a, b, …)` | **all** conditions are true | `=AND(F2="Wholesale", O2>=1000000)` |
| `OR(a, b, …)` | **at least one** is true | `=OR(C2="Lagos", C2="Abuja")` |
| `NOT(a)` | a is false | `=NOT(M2="Cash")` |

Combine with IF: `=IF(AND(F2="Wholesale",O2>=1000000),"Key account","")`

### Practice (20 min)
Open `employees.csv`, save as **NaijaMart_HR.xlsx**, sheet **Staff**. Columns: A EmployeeID … G HireDate, I MonthlySalary.
1. Column M **HighEarner**: "Yes" if salary > ₦400,000. How many?
2. Column N **LongServiceSales**: "Eligible" if Department is Sales **and** HireDate is before 1 Jan 2020 (`G2<DATE(2020,1,1)`). How many?
3. Back in the sales data: how many orders are Wholesale **and** ≥ ₦1,000,000?

**Check:** 1. **46** 2. **26** 3. **107**

### Mini-Task (10 min)
Flag orders from **Lagos or Abuja** paid by **Cash**: `=IF(AND(OR(C2="Lagos",C2="Abuja"),M2="Cash"),"Check","")`. Count the flags.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Commission calculator
**Time:** ~1 hour

### Review (10 min)
From memory: an IF with AND, and an IF with OR.

### Lesson (15 min)
A tiered commission, with the rates kept in **input cells** (never type rates inside formulas):
| Order net sales | Rate |
|---|---|
| ≥ ₦2,000,000 | 5% |
| ≥ ₦500,000 | 3% |
| below | 2% |

Put the thresholds and rates in a small table (e.g. V1:W3) and reference them with $:
`=O2*IFS(O2>=$V$1,$W$1, O2>=$V$2,$W$2, TRUE,$W$3)`

### Practice (20 min)
1. Build the rates table and a **Commission** column (U).
2. Total commission for the year?
3. Change the top rate to 6%. What's the new total? Change it back.

**Check:** total commission at 5/3/2% = **₦26,596,692** (rounded)

### Mini-Task (10 min)
Add a rule: online orders get **no** commission. Wrap it: `=IF(F2="Online",0, …)`.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** SWITCH and cleaner logic
**Time:** ~1 hour

### Review (10 min)
Rebuild the commission formula from memory.

### Lesson (15 min)
**SWITCH** matches one value against a list, which is cleaner than many IFs testing the same cell:
`=SWITCH(C2, "Lagos","South-West", "Ibadan","South-West", "Abuja","North-Central", "Kano","North-West", "Port Harcourt","South-South", "Enugu","South-East", "Unknown")`

**Readability tips**
- **Alt+Enter** inside the formula bar adds line breaks in long formulas.
- Use input cells for every threshold.
- If a formula is longer than a line, consider a lookup table (Week 9).

### Practice (20 min)
1. Add a **Zone** column with SWITCH (geopolitical zones as above).
2. Add a **PaymentType** column: Cash → "Cash", everything else → "Electronic" (IF or SWITCH).
3. Filter: how many Electronic payments? (**1,893**)

### Mini-Task (10 min)
Rewrite a nested IF you wrote this week as IFS or SWITCH. Which is easier to read?

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: grading & commission calculator
**Time:** ~1.5 hours

### Review (15 min)
From a blank sheet: IF, IFS, AND/OR and SWITCH, one example each.

### Weekly Project (45 min)
**Build `Sales_Commission_Calculator.xlsx`:**
1. **Inputs sheet:** commission tiers (3 thresholds + rates), a bonus rule (extra ₦50,000 if a salesperson's order is ≥ ₦5,000,000), exclusions (Online = no commission).
2. **Orders sheet:** copy of the sales data with OrderSize, Commission and Bonus columns, all driven by Inputs.
3. **Summary:** total commission, total bonus, number of Large orders, number of bonus orders.
4. Test: change each input and verify the totals move.

**Part 2: Student grading sheet:** 20 students, 3 test scores each, average, grade with IFS (A–F), "Pass/Fail", and a "Needs support" flag if any score is below 40 (use OR).

### Log (15 min)
Weekly review.

## Quiz
1. What are the three arguments of IF?
2. Why must thresholds be tested from largest to smallest in IFS?
3. Write a formula: "Key" if F2 is "Wholesale" and O2 ≥ 1,000,000, otherwise blank.
4. What does `TRUE` as the last condition in IFS do?
5. When is SWITCH better than IFS?
6. Why keep rates in input cells instead of inside formulas?
7. How many NaijaMart orders are "Large" (≥ ₦1M)?

**Answers:** (1) test, value if true, value if false (2) the first TRUE condition wins, so a smaller threshold first would catch everything (3) `=IF(AND(F2="Wholesale",O2>=1000000),"Key","")` (4) catches everything else (default) (5) when testing one cell against a list of exact values (6) change once, everything updates, and the logic is visible (7) 140.
