# Week 7 — Text
**Theme:** Clean and reshape text: names, phone numbers, codes, emails.
**Big question:** *How do I fix 300 messy customer records without retyping them?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Exceljet — Text functions](https://exceljet.net/functions) | Filter by "Text" category; read each function on its day. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "TEXTSPLIT TEXTBEFORE TEXTAFTER". |
| 📺 | [ExcelIsFun](https://www.youtube.com/@excelisfun) | Search "clean data text functions". |
| 📊 | `messy_customers.csv` | Save as **Customers_Clean.xlsx** on Monday. |

## Day 1 — Monday
**Topic:** Meet the messy data + TRIM, PROPER, UPPER, LOWER
**Time:** ~1 hour

### Review (10 min)
From memory: a SUMIFS with a date range.

### Lesson (15 min)
Open `messy_customers.csv` and save it as **Customers_Clean.xlsx** (sheet **Raw**). Look at it: names in every case and some "Surname, First", phones in 5 formats, 24 spellings of 6 cities, dates in 4 formats, spend with ₦ and "N/A", duplicates.
**Rule:** never overwrite raw data. Build clean columns next to it with formulas.

| Function | Does | Example |
|---|---|---|
| `TRIM(text)` | removes extra spaces (leading, trailing, double) | `"  Tolu  Eze"` → `"Tolu Eze"` |
| `PROPER(text)` | Capitalises Each Word | `"TOLU EZE"` → `"Tolu Eze"` |
| `UPPER / LOWER` | all caps / all lower | emails → `LOWER` |
| `LEN(text)` | number of characters | check phone lengths |
| `CLEAN(text)` | removes non-printing characters | data from other systems |

Combine: `=PROPER(TRIM(B2))`

### Practice (20 min)
1. Column H **Name**: `=PROPER(TRIM(B2))`, filled down.
2. Column I **EmailClean**: `=LOWER(TRIM(D2))`
3. Column J **CityTrim**: `=PROPER(TRIM(E2))`. How many different spellings remain? (Copy the column → paste values elsewhere → Remove Duplicates to count.)

**Check:** raw file has **315** rows and **24** different city spellings; names like `"Ibrahim, Ngozi"` still need fixing (tomorrow).

**Sandbox:** clean the first 20 rows right here; each task checks your formula's result.

::sandbox xl-w07-text

### Mini-Task (10 min)
Count blanks: phones and emails with COUNTBLANK. (**58** blank phones, **76** blank emails)

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** LEFT, RIGHT, MID, FIND, SEARCH
**Time:** ~1 hour

### Review (10 min)
From memory: clean a name with TRIM and PROPER.

### Lesson (15 min)
| Function | Does | Example |
|---|---|---|
| `LEFT(text, n)` | first n characters | `=LEFT("NM-00042",2)` → `NM` |
| `RIGHT(text, n)` | last n characters | `=RIGHT("NM-00042",5)` → `00042` |
| `MID(text, start, n)` | n characters from a position | `=MID("08031234567",2,3)` → `803` |
| `FIND(find, text)` | position of text (case-sensitive) | `=FIND("-","Lagos - Ikeja")` → 7 |
| `SEARCH(find, text)` | same, not case-sensitive, allows wildcards | |

**Classic:** split "First Last" at the space:
- First name: `=LEFT(H2, FIND(" ",H2)-1)`
- Last name: `=MID(H2, FIND(" ",H2)+1, 100)`

### Practice (20 min)
1. In the sales data, extract the store **Area** with a formula (not Flash Fill): `=MID(D2, FIND("-",D2)+2, 50)`
2. In Customers_Clean: **FirstName** and **LastName** from the Name column.
3. Names written "Surname, First" contain a comma. Detect them: `=ISNUMBER(FIND(",",B2))`. How many? (**55**)

### Mini-Task (10 min)
Extract the numeric part of each OrderID as a number: `=VALUE(RIGHT(A2,5))`.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** SUBSTITUTE, REPLACE, joining text
**Time:** ~1 hour

### Review (10 min)
From memory: first name and last name from a full name.

### Lesson (15 min)
| Function | Does | Example |
|---|---|---|
| `SUBSTITUTE(text, old, new)` | replaces all occurrences | remove spaces: `=SUBSTITUTE(C2," ","")` |
| `REPLACE(text, start, n, new)` | replaces by position | `=REPLACE("+2348031234567",1,4,"0")` → `08031234567` |
| `&` | joins | `=G2&" "&F2` |
| `CONCAT(a, b, …)` | joins | |
| `TEXTJOIN(delim, ignore_empty, range)` | joins with a separator | `=TEXTJOIN(", ",TRUE,A2:C2)` |

**Fixing "Surname, First":** if there's a comma, rebuild the name:
`=IF(ISNUMBER(FIND(",",B2)), PROPER(TRIM(MID(B2,FIND(",",B2)+1,100))&" "&TRIM(LEFT(B2,FIND(",",B2)-1))), PROPER(TRIM(B2)))`

### Practice (20 min)
1. Update the Name column with the comma fix.
2. **Phone cleaning:** remove spaces and dashes with nested SUBSTITUTE, then turn `+234…`/`234…` into `0…`:
   - Step 1: `=SUBSTITUTE(SUBSTITUTE(C2," ",""),"-","")`
   - Step 2: `=IF(LEFT(K2,4)="+234","0"&MID(K2,5,20), IF(LEFT(K2,3)="234","0"&MID(K2,4,20), K2))`
3. Check: every non-blank phone should now have **11** characters (use LEN and COUNTIF).

**Sandbox:** do the name and phone tasks in the sandbox.

::sandbox xl-w07-text

### Mini-Task (10 min)
Create a staff email from first and last name: `=LOWER(F2&"."&G2&"@naijamart.ng")`.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Modern text functions: TEXTSPLIT, TEXTBEFORE, TEXTAFTER
**Time:** ~1 hour

### Review (10 min)
From memory: the phone-cleaning steps.

### Lesson (15 min)
Microsoft 365 made text much easier:
| Function | Example | Result |
|---|---|---|
| `TEXTBEFORE(text, delim)` | `=TEXTBEFORE("Lagos - Ikeja"," - ")` | Lagos |
| `TEXTAFTER(text, delim)` | `=TEXTAFTER("Lagos - Ikeja"," - ")` | Ikeja |
| `TEXTSPLIT(text, col_delim)` | `=TEXTSPLIT("Tolu Eze"," ")` | Tolu \| Eze (spills into 2 cells) |

The name fix becomes much shorter: `=IF(ISNUMBER(SEARCH(",",B2)), TRIM(TEXTAFTER(B2,","))&" "&TEXTBEFORE(B2,","), TRIM(B2))` (then PROPER).
(Excel 2019 and older: use LEFT/MID/FIND from Tuesday.)

### Practice (20 min)
1. Redo the Store → Area extraction with TEXTAFTER.
2. Redo First/Last name with TEXTBEFORE/TEXTAFTER.
3. From emails, extract the domain (`gmail.com`, `yahoo.com`): `=TEXTAFTER(I2,"@")`. How many use gmail? (COUNTIF)

### Mini-Task (10 min)
Split `"Rice 50kg (Local)"` into the product name and the part in brackets with TEXTBEFORE/TEXTAFTER on "(" and ")".

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Standardising categories + TEXT and VALUE
**Time:** ~1 hour

### Review (10 min)
From memory: TEXTBEFORE and TEXTAFTER on a store name.

### Lesson (15 min)
**Map messy spellings to clean values** with IF + SEARCH (or a lookup table in Week 9):
`=IF(ISNUMBER(SEARCH("lag",E2)),"Lagos", IF(ISNUMBER(SEARCH("abuja",E2)),"Abuja", IF(OR(ISNUMBER(SEARCH("port",E2)),TRIM(E2)="PH"),"Port Harcourt", PROPER(TRIM(SUBSTITUTE(E2,", Oyo",""))))))`

**Numbers stored as text** (like `"₦788,000"` or `"861,000.00"`): remove the symbols then convert: `=IFERROR(VALUE(SUBSTITUTE(SUBSTITUTE(G2,"₦",""),",","")),"")`
**TEXT(value, format)** does the opposite, number to formatted text: `=TEXT(O2,"₦#,##0")` · `=TEXT(B2,"mmmm yyyy")` → "March 2025"

### Practice (20 min)
1. **CityClean** column with the mapping formula. Check with Remove Duplicates on a copy: exactly 6 cities.
2. **SpendClean** as a real number ("N/A" → blank). How many N/A? (**77**)
3. A **Label** column: `=Name&" — "&CityClean&" — "&TEXT(SpendClean,"₦#,##0")`

**Sandbox:** finish the city and spend tasks.

::sandbox xl-w07-text

### Mini-Task (10 min)
Remove duplicate rows (Data → Remove Duplicates, all columns) on a **copy** of the sheet. How many removed? (**15**)

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: clean the customer list
**Time:** ~1.5 hours

### Review (15 min)
From a blank sheet: TRIM/PROPER, a LEFT/FIND split, SUBSTITUTE, TEXTAFTER.

### Weekly Project (45 min)
**Deliver `Customers_Clean.xlsx` as if for a client:**
1. **Raw** sheet untouched.
2. **Working** sheet with formula columns: Name (fixed order and case), FirstName, LastName, Phone (11 digits, starting 0), Email (lower case), City (6 clean values), SpendClean (number).
3. **Clean** sheet: Paste Special → Values of the final columns only, duplicates removed, sorted by LastName.
4. **Report** sheet: customers per city (COUNTIF), total and average spend per city (SUMIFS/AVERAGEIFS), number with no phone, number with no email.

**Check (after removing the 15 duplicates, 300 customers):** Lagos 56 · Abuja 51 · Port Harcourt 51 · Ibadan 51 · Enugu 49 · Kano 42

This is exactly the kind of job people pay for on Upwork and Fiverr ("data cleaning").

### Log (15 min)
Weekly review.

## Quiz
1. What does TRIM remove?
2. Write a formula for the first name from "Tolu Eze" in A2 (using FIND).
3. Difference between FIND and SEARCH?
4. Convert `+2348031234567` to `08031234567`.
5. What do TEXTBEFORE and TEXTAFTER do?
6. How do you turn `"₦788,000"` into the number 788000?
7. Why keep the raw data untouched?

**Answers:** (1) leading, trailing and repeated spaces (2) `=LEFT(A2,FIND(" ",A2)-1)` (3) FIND is case-sensitive and has no wildcards; SEARCH is not case-sensitive and allows wildcards (4) `="0"&MID(A2,5,20)` or REPLACE (5) return the text before/after a delimiter (6) `=VALUE(SUBSTITUTE(SUBSTITUTE(A2,"₦",""),",",""))` (7) so you can always check and redo the cleaning.
