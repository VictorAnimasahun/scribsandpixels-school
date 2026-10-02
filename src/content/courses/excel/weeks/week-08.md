# Week 8 — Dates & times
**Theme:** How Excel stores dates and times, and how to calculate ages, tenure, deadlines, working days and hours worked.
**Big question:** *Why is 1 January 2025 secretly the number 45658?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Exceljet — Date and time functions](https://exceljet.net/functions) | Filter by "Date and time". |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Excel dates explained". |
| 📺 | [ExcelIsFun](https://www.youtube.com/@excelisfun) | Search "time calculations payroll". |
| 📊 | `NaijaMart_HR.xlsx` · `timesheet_2025-03.csv` | Save the timesheet as **Timesheet_March.xlsx** on Thursday. |

## Day 1 — Monday
**Topic:** How dates work
**Time:** ~1 hour

### Review (10 min)
From memory: split a full name into first and last with TEXTBEFORE/TEXTAFTER.

### Lesson (15 min)
Excel stores a date as a **serial number**: days since 1 January 1900. 1 Jan 2025 = **45658**. Time is a **fraction of a day**: 12:00 = 0.5, 18:00 = 0.75.
That's why you can subtract dates: `=B2-A2` gives the number of days between them.
- Type a date in a format your system recognises (e.g. 2025-03-15). If it left-aligns, Excel sees **text**, not a date.
- Change the look with Ctrl+1 → Date/Custom: `dd/mm/yyyy`, `ddd dd mmm`, `mmmm yyyy`.

| Function | Returns |
|---|---|
| `TODAY()` / `NOW()` | today / now (they update every time the file recalculates) |
| `YEAR(d)`, `MONTH(d)`, `DAY(d)` | parts of a date |
| `DATE(y, m, d)` | builds a date |
| `WEEKDAY(d, 2)` | 1 = Monday … 7 = Sunday |
| `TEXT(d, "dddd")` | the day name |

### Practice (20 min)
In the sales data, add columns:
1. **Month**: `=MONTH(B2)` · **Year** · **DayName**: `=TEXT(B2,"dddd")`
2. **Weekend**: `=IF(WEEKDAY(B2,2)>=6,"Weekend","Weekday")`. How many weekend orders?
3. Type 45658 in a cell and format it as a date. What do you get?

**Check:** 2. **546** weekend orders 3. 01/01/2025

### Mini-Task (10 min)
Format B2 with the custom format `dddd, d mmmm yyyy`. What does the first order date show? (**Wednesday, 1 January 2025**)

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Ages and tenure
**Time:** ~1 hour

### Review (10 min)
From memory: WEEKDAY formula that flags weekends.

### Lesson (15 min)
- Years between two dates: `=DATEDIF(start, end, "y")` (completed years) · `"m"` months · `"d"` days · `"ym"` months after the full years
  (DATEDIF is hidden: it doesn't autocomplete, but it works.)
- Decimal years: `=YEARFRAC(start, end)`
- **Use a fixed "as of" date** in a cell for reports (e.g. 31/12/2025) instead of TODAY(), so results don't change every day.
- "5 years, 3 months": `=DATEDIF(G2,$P$1,"y")&" years, "&DATEDIF(G2,$P$1,"ym")&" months"`

### Practice (20 min)
In NaijaMart_HR.xlsx (as-of date **31/12/2025** in P1):
1. **Age** from DateOfBirth (column H).
2. **TenureYears** from HireDate (column G), with YEARFRAC to 1 decimal.
3. Average age, oldest, youngest. How many staff have 5+ years of service?
4. Who was hired first?

**Check:** average age **41.0** · oldest **55** · youngest **28** · 5+ years: **68** staff · first hire: **E092 Tolu Suleiman, 18/04/2015**

### Mini-Task (10 min)
Birthday list: a **NextBirthdayMonth** column with `=TEXT(H2,"mmmm")` and COUNTIF how many birthdays each month.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** Deadlines: EDATE, EOMONTH, WORKDAY, NETWORKDAYS
**Time:** ~1 hour

### Review (10 min)
From memory: DATEDIF for completed years.

### Lesson (15 min)
| Function | Returns | Example |
|---|---|---|
| `EDATE(d, n)` | same day n months later | probation ends: `=EDATE(G2,6)` |
| `EOMONTH(d, n)` | last day of the month, n months later | invoice due end of next month: `=EOMONTH(B2,1)` |
| `WORKDAY(d, n, holidays)` | the date n **working** days later | delivery in 5 working days |
| `NETWORKDAYS(start, end, holidays)` | working days between two dates | working days in March |
| `WORKDAY.INTL / NETWORKDAYS.INTL` | custom weekends (e.g. Friday–Saturday) | |

**Holidays:** list Nigerian public holidays in a range (e.g. 1 Jan, Eid dates, Easter Monday, 1 May Workers' Day, 12 June Democracy Day, 1 October Independence, 25–26 December) and pass the range as the 3rd argument.

### Practice (20 min)
1. HR: **ProbationEnd** = HireDate + 6 months.
2. Sales: **PaymentDue** = end of the month after the order.
3. Working days in March 2025 (no holidays)? And with Eid-el-Fitr on 31 March 2025 as a holiday?
4. An order placed on Friday 7 March 2025 ships in 5 working days. When does it arrive?

**Check:** 3. **21** / **20** 4. **Friday 14 March 2025**

### Mini-Task (10 min)
Create a holidays table for 2026 on its own sheet and name the range **Holidays** (Formulas → Define Name). You'll reuse it.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Time calculations: the timesheet
**Time:** ~1 hour

### Review (10 min)
From memory: working days between two dates with a holiday list.

### Lesson (15 min)
Times are fractions of a day, so:
- Hours worked: `=(D2-C2)*24` (ClockOut − ClockIn, times 24 to convert days to hours)
- Crossing midnight (night shift): `=MOD(D2-C2,1)*24`
- Show durations over 24 hours: format as `[h]:mm` (the brackets stop it resetting at 24)
- Build a time: `=TIME(8,30,0)` → 08:30
- Late? `=IF(C2>TIME(8,30,0),"Late","On time")`

### Practice (20 min)
Save `timesheet_2025-03.csv` as **Timesheet_March.xlsx**:
1. **HoursWorked** (column E) as a number with 2 decimals.
2. **Overtime** (F): hours above 8 per day: `=MAX(0,E2-8)`
3. **Late** (G): clock-in after 08:30.
4. Totals: all hours, average shift, total overtime, days with overtime, number of late arrivals.

**Check:** first row E001 on 03/03: 08:07 → 18:31 = **10.40 h** · total **3,548.90 h** · average shift **8.87 h** · overtime **383.65 h** on **310** days · late arrivals **81**

**Sandbox:** practise on E001's March: hours, overtime, late flags and working days.

::sandbox xl-w08-time

### Mini-Task (10 min)
E001's March: days worked, total hours, overtime (SUMIFS/COUNTIFS). **Check:** 19 days, 168.43 h, 18.02 h overtime.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Payroll from the timesheet
**Time:** ~1 hour

### Review (10 min)
From memory: hours between two times, and overtime above 8.

### Lesson (15 min)
Turn hours into pay, keeping rates in input cells:
- Hourly rate = monthly salary ÷ standard hours (e.g. 22 days × 8 h = 176 h)
- Overtime at 1.5× the hourly rate
- Pay = regular hours × rate + overtime hours × rate × 1.5
Bring each employee's salary from the HR file: for now, copy the 20 salaries in; next week you'll do it with a lookup.

### Practice (20 min)
On a **Payroll** sheet: one row per employee (E001–E020), with days worked (COUNTIFS), total hours (SUMIFS), overtime hours (SUMIFS), hourly rate, overtime pay, and late count.

### Mini-Task (10 min)
Flag anyone with more than 5 late arrivals in March for an HR conversation.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: timesheet & overtime calculator
**Time:** ~1.5 hours

### Review (15 min)
From a blank sheet: DATEDIF, EOMONTH, NETWORKDAYS with holidays, hours between times.

### Weekly Project (45 min)
**Finish `Timesheet_March.xlsx` as a reusable template:**
1. **Inputs:** standard day (8 h), overtime multiplier (1.5), late threshold (08:30), holiday list.
2. **Timesheet** with hours, overtime and late flag, all driven by Inputs.
3. **Payroll summary** per employee (from Friday), with a total row.
4. **Calendar check:** working days in the month (NETWORKDAYS) vs days worked, to show absence days per employee.
5. Professional formatting, printable.

### Log (15 min)
Weekly review.

## Quiz
1. How does Excel store 12:00 noon?
2. Why use a fixed "as of" date instead of TODAY() in reports?
3. Write a formula for completed years between G2 and P1.
4. What's the difference between EDATE and EOMONTH?
5. How many working days were in March 2025 (no holidays)?
6. How do you compute hours worked from ClockIn C2 and ClockOut D2?
7. What format shows durations over 24 hours?

**Answers:** (1) 0.5 (2) so results don't change every day (3) `=DATEDIF(G2,P1,"y")` (4) EDATE keeps the same day n months later; EOMONTH returns the last day of the month (5) 21 (6) `=(D2-C2)*24` (7) `[h]:mm`.
