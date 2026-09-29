# Week 1 — Meet Excel
**Theme:** Get comfortable in the grid: cells, sheets, data entry, navigation, saving.
**Big question:** *What is a spreadsheet, and why does every office run on one?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [GCFGlobal — Excel](https://edu.gcfglobal.org/en/excel/) | Lessons "Getting Started" to "Cell Basics" this week. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Excel for beginners". Watch the first 30 minutes this week. |
| 🌐 | [Excel for the web (free)](https://www.microsoft.com/en-us/microsoft-365/free-office-online-for-the-web) | If you don't have desktop Excel, sign up on Monday. |
| 🌐 | [Exceljet — Shortcuts](https://exceljet.net/shortcuts) | Your shortcut reference for the whole course. |
| 📊 | `datasets/sales_2025.csv` | Open it on Wednesday. |

## Day 1 — Monday
**Topic:** The Excel window
**Time:** ~1 hour

### Review (10 min)
Nothing to review yet. Set up: install Excel, or sign in to Excel for the web. Create a folder called **Excel School** and put the `datasets` folder inside it.

### Lesson (15 min)
The parts of Excel:
| Part | What it is |
|---|---|
| **Workbook** | The file (.xlsx). Contains one or more sheets. |
| **Worksheet (sheet)** | One grid, with tabs at the bottom. |
| **Cell** | One box, named by column letter + row number: **B3** |
| **Range** | A block of cells: **A1:C10** (from A1 to C10) |
| **Ribbon** | The menus at the top: Home, Insert, Formulas, Data… |
| **Name Box** | Top left, shows the active cell. Type **D20** there and press Enter to jump. |
| **Formula bar** | Shows the *real* content of a cell (a cell can *display* 10% but *contain* 0.1) |
| **Status bar** | Bottom: select numbers and see their Sum, Average and Count instantly. |

A sheet has 1,048,576 rows and 16,384 columns (up to column XFD).

### Practice (20 min)
1. Create a new blank workbook.
2. Click on cell **C5**. Check the Name Box says C5.
3. Type `D20` in the Name Box and press Enter. Where are you?
4. Select A1:C4 by dragging. How many cells is that? (**12**)
5. Explore each ribbon tab for 1 minute. Hover over buttons to read their tooltips.

### Mini-Task (10 min)
In A1:A5 type 5 numbers (e.g. 10, 25, 7, 40, 18). Select them and read the **Sum, Average and Count** in the status bar. (For those numbers: Sum 100, Average 20, Count 5.)

### Log (5 min)
Write 3 sentences in a text file or notebook called `excel_log`: what I learned, what confused me, one new term.

## Day 2 — Tuesday
**Topic:** Entering and editing data
**Time:** ~1 hour

### Review (10 min)
From memory: what's a range? Where's the Name Box? Jump to cell K100 with it.

### Lesson (15 min)
Excel recognises three main kinds of data:
| Type | Aligns | Example |
|---|---|---|
| Text | Left | `Lagos`, `NM-00001` |
| Number | Right | `145000`, `0.15` |
| Date | Right (it's really a number!) | `12/03/2025` |

If a "number" is left-aligned, Excel thinks it's text. That will break your formulas later.

**Editing**
- Type and press **Enter** (moves down) or **Tab** (moves right).
- **F2** edits the cell without erasing it. **Delete** clears it. **Esc** cancels typing.
- **Ctrl+Z** undo · **Ctrl+Y** redo
- Phone numbers like 0803… lose the leading 0 because Excel treats them as numbers. Type `'08031234567` (apostrophe first) to keep it as text.

**AutoFill:** type `Monday`, then drag the small square at the bottom-right of the cell (the *fill handle*) down. Excel continues the series. It works for months, dates and number patterns (type 1 and 2, select both, drag).

### Practice (20 min)
1. In A1:A7 fill the days of the week with AutoFill.
2. In B1:B12 fill the months.
3. In C1:C10 create 5, 10, 15 … 50.
4. In D1 type `08031234567`, and in D2 type `'08031234567`. What's the difference?
5. Insert a row above row 3 (right-click the row number → Insert), then delete it.

**Check (4):** D1 shows 8031234567 (the 0 is lost, right-aligned); D2 keeps 08031234567 (text, left-aligned).

### Mini-Task (10 min)
Make a table: in row 1 type headers **Name, City, Phone, Birthday**; fill 5 rows for people you know. Make the phone numbers keep their zeros.

### Log (5 min)
Log: today's shortcut is **F2**.

## Day 3 — Wednesday
**Topic:** Moving fast in big data
**Time:** ~1 hour

### Review (10 min)
From a blank sheet: fill Jan–Dec with AutoFill; type a phone number that keeps its 0.

### Lesson (15 min)
Open `sales_2025.csv`. It has 2,400 orders. Scrolling is too slow, so use the keyboard:
| Shortcut | Does |
|---|---|
| **Ctrl + ↓ / ↑ / → / ←** | Jump to the edge of the data |
| **Ctrl + Home** | Go to A1 |
| **Ctrl + End** | Go to the last used cell |
| **Shift + arrows** | Extend the selection |
| **Ctrl + Shift + ↓** | Select from here to the bottom of the data |
| **Ctrl + A** | Select the whole data region |
| **Ctrl + Space / Shift + Space** | Select the column / the row |
| **Ctrl + Page Down / Up** | Next / previous sheet |

(On Mac, use **Cmd** for most of these, or Fn for Home/End.)

### Practice (20 min)
In `sales_2025.csv`, using **only the keyboard**:
1. What's the last row number? What's in its OrderID?
2. What's the last column letter, and its header?
3. What product is in row 101?
4. Select all of column J (Units) with the data and read the **Sum** in the status bar.

**Check:** 1. Row **2401**, `NM-02400` 2. Column **M**, `PaymentMethod` 3. **Milo 1kg Refill** 4. **22,129**

### Mini-Task (10 min)
Select UnitPrice (column K) and read the Average, Min and Max in the status bar (right-click the status bar to switch on Min/Max). **Check:** max ₦649,000 (Dell Inspiron 15), min ₦7,500.

### Log (5 min)
Log: which shortcut felt most powerful?

## Day 4 — Thursday
**Topic:** Sheets, saving and file types
**Time:** ~1 hour

### Review (10 min)
In sales_2025.csv, jump to the last row, then back to A1, then select column C, using only the keyboard.

### Lesson (15 min)
**Sheets:** double-click a tab to rename it · right-click → Insert / Delete / Move or Copy / Tab Color · **Shift+F11** new sheet
**Saving**
| Format | Keeps | Use for |
|---|---|---|
| **.xlsx** | Everything: formulas, formatting, multiple sheets, charts | Your working files, always |
| **.xlsm** | Same + macros | Week 20 |
| **.csv** | **Only the values of one sheet**, no formatting, no formulas | Exchanging raw data between systems |

⚠️ If you edit a CSV and save it as CSV, your formatting and extra sheets are **lost**. First thing to do with any CSV: **File → Save As → Excel Workbook (.xlsx)**.
File names: `NaijaMart_Sales_2025.xlsx`, not `Book1 final FINAL (2).xlsx`.
Turn on **AutoSave** (OneDrive) if you use Microsoft 365.

### Practice (20 min)
1. Save `sales_2025.csv` as **NaijaMart_Sales_2025.xlsx** in your Excel School folder.
2. Rename the sheet to **Data**. Colour its tab green.
3. Insert 2 new sheets named **Notes** and **Summary**, and move Summary to be first.
4. Right-click Data → Move or Copy → tick *Create a copy*. Rename the copy **Data_backup**.

### Mini-Task (10 min)
On the Notes sheet, write in A1:A5 five facts you discovered about the data (number of orders, first date, last date, number of columns, biggest unit price).

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Copy, cut, paste and Paste Special
**Time:** ~1 hour

### Review (10 min)
From memory: why must you save a CSV as .xlsx before working on it?

### Lesson (15 min)
| Shortcut | Does |
|---|---|
| **Ctrl + C / X / V** | Copy / cut / paste |
| **Ctrl + D** | Fill down (copies the cell above into the selection) |
| **Ctrl + R** | Fill right |
| **Ctrl + Alt + V** (Mac: Ctrl+Cmd+V) | **Paste Special** |
| **Ctrl + ;** | Today's date |

**Paste Special options you'll use constantly:** *Values* (paste the result, not the formula) · *Formats* · *Transpose* (turn rows into columns) · *Column widths*
**Double-click the fill handle** to fill down as far as the column next to it goes. Great for 2,400 rows!

### Practice (20 min)
In NaijaMart_Sales_2025.xlsx:
1. Copy the headers A1:M1, go to the Notes sheet, and **Paste Special → Transpose** in A8 so they run down a column.
2. Copy the Region column (C) to the Notes sheet column D.
3. Undo, then do it again with cut. What happens to the original?
4. On Notes, type `Checked` in F1, select F1:F10, press Ctrl+D.

### Mini-Task (10 min)
Type today's date with **Ctrl+;** in a cell. Type your 5 favourite shortcuts in the Notes sheet.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: contact list + data tour
**Time:** ~1.5 hours

### Review (15 min)
From a blank workbook: AutoFill the months, keep a leading-zero phone number, add 2 sheets, Paste Special Transpose a row.

### Weekly Project (45 min)
**Part 1: Contact list.** New workbook `My_Contacts.xlsx`:
- Headers: **First name · Last name · Phone · City · Birthday · Email**
- 20 real or invented contacts. Phones keep their zeros. Birthdays as real dates.
- Make the header row bold (Ctrl+B) and widen the columns so everything is readable (double-click the border between column letters).
- Sheet named **Contacts**, tab coloured.

**Part 2: Data tour.** In NaijaMart_Sales_2025.xlsx, answer on the Notes sheet, using shortcuts and the status bar only:
1. How many orders are there? 2. Total units sold? 3. Highest and lowest unit price? 4. What's the date of the first order and of the last? 5. What's the OrderID in row 1001?

**Check:** 1. 2,400 2. 22,129 3. ₦649,000 / ₦7,500 4. 2025-01-01 / 2025-12-31 5. NM-01000

### Mini-Task (15 min)
Watch 15 minutes of a Leila Gharani beginner video and note 2 tips.

### Log (15 min)
Weekly review: 3 biggest things learned · what still confuses me · my 5 favourite shortcuts.

## Quiz
1. What is the difference between a workbook, a worksheet and a cell?
2. What does B3:D7 mean, and how many cells is it?
3. How do you keep the leading 0 of a phone number?
4. Which shortcut jumps to the last row of your data?
5. What do you lose when saving as .csv?
6. What does Paste Special → Values do?
7. Where can you see the sum of selected cells without a formula?

**Answers:** (1) file / one grid / one box (2) the range from B3 to D7: 3 columns × 5 rows = 15 cells (3) type an apostrophe first, or format the cell as Text before typing (4) Ctrl + ↓ (5) formulas, formatting, extra sheets, charts (6) pastes the results only, not the formulas (7) the status bar.
