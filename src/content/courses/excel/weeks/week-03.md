# Week 3 — References & fill
**Theme:** The single most important concept in Excel: how references move when you copy formulas.
**Big question:** *Why does my formula work in one cell and break when I copy it?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Excel Skills for Business: Essentials (Coursera)](https://www.coursera.org/learn/excel-essentials) | Week 2 videos. |
| 🌐 | [Exceljet — Absolute and relative references](https://exceljet.net/glossary/absolute-reference) | Read on Monday. |
| 📺 | [ExcelIsFun](https://www.youtube.com/@excelisfun) | Search "absolute cell references"; Mike's explanations are the best. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Flash Fill". |
| 📊 | `NaijaMart_Sales_2025.xlsx` | Continue working in it. |

## Day 1 — Monday
**Topic:** Relative references
**Time:** ~1 hour

### Review (10 min)
From memory, on a blank sheet: 5 numbers, then their SUM, AVERAGE, MAX and COUNT.

### Lesson (15 min)
By default, references are **relative**: when you copy a formula, the references move by the same number of rows and columns.
- `=J2*K2` in N2, copied to N3, becomes `=J3*K3`. Copied to O2 (one column right), it becomes `=K2*L2`.
That's why your GrossSales column worked for 2,400 rows with one formula.

**See it:** click any cell in column N and press **F2**: the coloured boxes show which cells it uses.

### Practice (20 min)
On a new sheet **Refs**:
1. In A1:A5 type 1–5; in B1 type `=A1*2`; fill down to B5. What's in B5? (`=A5*2` → 10)
2. Copy B1 and paste it into D3. What formula appears? Why? (`=C3*2`: moved 2 columns right and 2 rows down)
3. In the Data sheet, click N500 and check its formula.

### Mini-Task (10 min)
Explain in your log, in your own words, why N500 contains `=J500*K500`.

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Absolute references ($)
**Time:** ~1 hour

### Review (10 min)
Predict the formula: `=A1+B1` in C1 copied to C10?

### Lesson (15 min)
Sometimes one cell must **not** move, like a VAT rate. Lock it with **$**:
| Reference | Column | Row | Name |
|---|---|---|---|
| `A1` | moves | moves | relative |
| `$A$1` | locked | locked | **absolute** |
| `$A1` | locked | moves | mixed |
| `A$1` | moves | locked | mixed |

**Press F4** while the cursor is on a reference to cycle through A1 → $A$1 → A$1 → $A1.

Nigerian **VAT is 7.5%**. Put the rate in **one** cell and point every formula to it:
`=O2*$R$1` (with 7.5% in R1).
If the rate changes, you edit **one** cell, not 2,400.

### Practice (20 min)
On the Data sheet:
1. In R1 type `7.5%`. In Q1 type **VAT**.
2. In Q2: `=O2*$R$1`. Fill down.
3. Sum column Q.
4. Change R1 to 10%. What happens to the total? Change it back.

**Check:** total VAT at 7.5% = **₦62,553,502.50**

### Mini-Task (10 min)
Try writing Q2 **without** the $ (`=O2*R1`) and fill down. Look at Q3's formula. Why are most results 0? (**R2, R3… are empty: the reference moved**) Then fix it.

### Log (5 min)
Log. Shortcut: **F4**.

## Day 3 — Wednesday
**Topic:** Percentages and percentage of total
**Time:** ~1 hour

### Review (10 min)
Build a VAT column on a blank sheet with the rate in one locked cell.

### Lesson (15 min)
| Question | Formula |
|---|---|
| What % is part of total? | `=part/total` → format as % |
| Increase by 15% | `=value*(1+15%)` |
| Decrease by 15% | `=value*(1-15%)` |
| % change from old to new | `=(new-old)/old` |

**Percentage of total** needs an absolute reference to the total: `=B2/$B$8`.

### Practice (20 min)
On the Summary sheet, make a table of net sales by region (type the figures in for now; you'll calculate them with SUMIFS in Week 6):
| Region | Net sales |
|---|---|
| Lagos | 321,703,800 |
| Abuja | 174,309,590 |
| Port Harcourt | 89,690,485 |
| Kano | 89,100,560 |
| Ibadan | 81,775,035 |
| Enugu | 77,467,230 |

1. Add a Total row with SUM. 2. Add a **% of total** column: `=B2/$B$8`, filled down.
3. Format as % with 1 decimal.

**Check:** total ₦834,046,700 · Lagos **38.6%** · Enugu 9.3%

### Mini-Task (10 min)
January net sales were ₦43,211,125 and December ₦109,612,345. What's the % change? (**+153.7%**)

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Mixed references: the multiplication table test
**Time:** ~1 hour

### Review (10 min)
From memory: the formula for % change, and % of total with a locked total.

### Lesson (15 min)
Mixed references lock **only** the row or **only** the column. They're essential for grids where one input runs across the top and one down the side.
**Classic test:** a 12 × 12 multiplication table from **one** formula:
- Numbers 1–12 in B1:M1 (across) and A2:A13 (down).
- In B2: `=$A2*B$1` → column A locked (always read the side), row 1 locked (always read the top).
- Fill right and down. Done.

### Practice (20 min)
1. Build the multiplication table with one formula.
2. **Price grid:** products down the side (5 NaijaMart prices, e.g. 7,500 · 25,500 · 145,000 · 349,000 · 649,000), discount rates across the top (0%, 5%, 10%, 15%, 20%). One formula gives every discounted price: `=$A2*(1-B$1)`.

**Check (grid):** 145,000 at 15% = **₦123,250** · 649,000 at 20% = **₦519,200**

### Mini-Task (10 min)
Explain to someone (or in your log) why it's `$A2` and `B$1`, not the other way round.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Fill handle tricks and Flash Fill
**Time:** ~1 hour

### Review (10 min)
Rebuild the multiplication table from a blank sheet in under 3 minutes.

### Lesson (15 min)
- **Fill series:** Home → Fill → Series (step value, stop value), e.g. dates every 7 days.
- **Fill without formatting:** drag, then click the Auto Fill Options icon.
- **Flash Fill (Ctrl+E):** Excel copies a pattern you type. Type an example in the first cell, go to the next cell, press Ctrl+E.
  - From `Lagos - Ikeja`, type `Ikeja` next to it → Ctrl+E extracts every area.
  - From `Tolu Eze`, type `Eze` → Ctrl+E extracts surnames.
Flash Fill is **not** a formula: it doesn't update if the source changes. (Week 7's text functions do.)

### Practice (20 min)
On the **Data_backup** sheet (keep the Data sheet's columns unchanged; later lessons rely on its layout):
1. Insert a column after Store called **Area** and use Flash Fill to extract the area (Ikeja, Lekki, Wuse…).
2. Insert a column after Salesperson called **SalesFirstName** and Flash Fill the first names.
3. On a new sheet, create dates for every Monday of 2026 with Fill → Series (step 7).

### Mini-Task (10 min)
Flash Fill emails: from first name `Tolu` and last name `Eze`, create `tolu.eze@naijamart.ng`. (Type one example, then Ctrl+E.)

### Log (5 min)
Log. Shortcut: **Ctrl+E**.

## Day 6 — Saturday
**Topic:** Project day: price list with VAT and discounts
**Time:** ~1.5 hours

### Review (15 min)
Blank sheet: VAT column with a locked rate, % of total, and a mixed-reference grid.

### Weekly Project (45 min)
**Build `NaijaMart_PriceList.xlsx`:**
1. Import `products.csv`, save as .xlsx.
2. Add an **Inputs** area at the top or on its own sheet: VAT rate (7.5%), Wholesale discount (10%), Staff discount (20%).
3. Add columns: **Margin (₦)** = UnitPrice − UnitCost · **Margin %** = Margin / UnitPrice · **Price incl. VAT** · **Wholesale price** · **Staff price**. All formulas must use the Inputs cells with **$** references.
4. Format everything properly. Change the VAT rate to test that everything updates.

**Check:** Tecno Spark 20: margin ₦27,000, margin % 18.6%, incl. VAT ₦155,875, wholesale ₦130,500, staff ₦116,000.

### Mini-Task (15 min)
Add a **Total** row and an **average margin %**. Which product has the highest margin %? (Sort by eye for now; sorting properly is next week.) **Check:** Phone Charger (Fast), 44%.

### Log (15 min)
Weekly review.

## Quiz
1. What happens to `=A1*B1` in C1 when copied to C2? To D1?
2. What do `$A$1`, `$A1` and `A$1` lock?
3. Which key cycles through reference types?
4. Why keep the VAT rate in one cell?
5. Write the formula for % of total with the total in B8.
6. Write the multiplication-table formula for B2.
7. What's the difference between Flash Fill and a formula?

**Answers:** (1) `=A2*B2`; `=B1*C1` (2) column and row; column only; row only (3) F4 (4) change it once and everything updates (5) `=B2/$B$8` (6) `=$A2*B$1` (7) Flash Fill pastes static values that don't update; formulas recalculate.
