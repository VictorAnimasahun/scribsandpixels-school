# Week 20 — Macros & VBA
**Theme:** Automate repetitive work: record macros, read and edit VBA, write simple loops, add buttons.
**Big question:** *How do I turn a 30-minute weekly task into one click?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 📺 | [Excel Campus (Jon Acampora)](https://www.excelcampus.com/) | His free "VBA for beginners" series. |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Excel macros for beginners". |
| 🌐 | [Microsoft Learn — Getting started with VBA in Office](https://learn.microsoft.com/en-us/office/vba/library-reference/concepts/getting-started-with-vba-in-office) | Reference. |
| 📊 | `NaijaMart_Sales_2025.xlsx` | Save a copy as **NaijaMart_Macros.xlsm**. |

> **Platform note:** VBA needs **desktop Excel** (Windows is best; Mac supports most of it). Excel for the web uses **Office Scripts** instead (Week 21).

## Day 1 — Monday
**Topic:** Recording your first macro
**Time:** ~1 hour

### Review (10 min)
From memory: the dashboard polish checklist.

### Lesson (15 min)
1. Show the **Developer** tab: File → Options → Customize Ribbon → tick Developer.
2. Developer → **Record Macro** → name it (no spaces: `FormatReport`) → store in *This Workbook* → OK.
3. Do the task (e.g. bold headers, ₦ format, autofit columns, freeze the top row).
4. **Stop Recording**.
5. Run it: Developer → Macros → Run (or Alt+F8).
**Save as .xlsm** (macro-enabled workbook), because .xlsx deletes macros.
**Security:** macros can contain harmful code. Only enable macros in files you trust (File → Options → Trust Center).

### Practice (20 min)
Record `FormatReport` on a raw CSV import of `sales_2025.csv`: bold, filled header row; ₦ format on UnitPrice; date format on OrderDate; autofit; freeze row 1. Test it on a fresh import.

### Mini-Task (10 min)
Record a macro with **Use Relative References** on (Developer tab) that types "Checked" and moves one cell down. Run it several times from different cells.

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Reading VBA
**Time:** ~1 hour

### Review (10 min)
From memory: record and run a macro; why .xlsm?

### Lesson (15 min)
**Alt+F11** opens the VBA Editor. Your macro is in Modules → Module1:
```vba
Sub FormatReport()
    Rows("1:1").Font.Bold = True
    Columns("K:K").NumberFormat = ChrW(8358) & "#,##0"   ' ChrW(8358) is ₦ (the VBA editor can't type it)
    Columns("A:M").EntireColumn.AutoFit
End Sub
```
- `Sub … End Sub` = one macro
- **Objects** (Workbook → Worksheet → Range) have **properties** (`.Value`, `.Font.Bold`) and **methods** (`.AutoFit`, `.Copy`)
- `Range("A1")`, `Cells(row, col)`, `ActiveSheet`, `Worksheets("Data")`
- The recorder writes lots of `Select`/`Selection`; clean code acts on ranges directly.
- **F8** steps through code line by line; **F5** runs it.

### Practice (20 min)
Open your recorded macro and simplify it: remove every `.Select` line by acting on the range directly. Run it to confirm it still works.

### Mini-Task (10 min)
Add `MsgBox "Report formatted!"` as the last line.

### Log (5 min)
Log. Shortcut: **Alt+F11**.

## Day 3 — Wednesday
**Topic:** Variables, loops and conditions
**Time:** ~1 hour

### Review (10 min)
From memory: open the VBA Editor, step through code with F8.

### Lesson (15 min)
```vba
Sub FlagBigOrders()
    Dim ws As Worksheet
    Dim lastRow As Long, r As Long
    Set ws = Worksheets("Data")
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row   ' last used row

    For r = 2 To lastRow
        If ws.Cells(r, "O").Value >= 1000000 Then
            ws.Rows(r).Interior.Color = RGB(226, 239, 218)   ' light green
        End If
    Next r

    MsgBox "Checked " & (lastRow - 1) & " orders."
End Sub
```
- `Dim` declares a variable; `Long` for whole numbers, `String` for text, `Double` for decimals
- `For … Next` loops; `If … Then … End If` decides
- `' comment` explains the code
- `.End(xlUp)` finds the last row (like Ctrl+↑ from the bottom)

### Practice (20 min)
Write `FlagBigOrders` (NetSales in column O as in your Data sheet) and run it. The message should say 2,400 orders.

### Mini-Task (10 min)
Modify it to count the big orders in a variable and show the count in the MsgBox. (**140**)

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** Practical macros
**Time:** ~1 hour

### Review (10 min)
From memory: write a For loop from 2 to the last row.

### Lesson (15 min)
Three macros you'll really use:
```vba
Sub ExportDashboardPDF()
    Worksheets("Dashboard").ExportAsFixedFormat Type:=xlTypePDF, _
        Filename:=ThisWorkbook.Path & "\Dashboard_" & Format(Date, "yyyy-mm-dd") & ".pdf"
End Sub

Sub RefreshEverything()
    ThisWorkbook.RefreshAll
    MsgBox "All queries and pivots refreshed."
End Sub

Sub CreateRegionSheets()
    Dim regions As Variant, reg As Variant
    regions = Array("Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu")
    For Each reg In regions
        Worksheets.Add(After:=Worksheets(Worksheets.Count)).Name = reg
        Worksheets(reg).Range("A1").Value = "Report for " & reg
    Next reg
End Sub
```
(On Mac, use "/" instead of "\" in file paths.)

### Practice (20 min)
Add all three to your workbook and test them. Delete the region sheets afterwards (or write a macro that deletes them, with `Application.DisplayAlerts = False`).

### Mini-Task (10 min)
Change ExportDashboardPDF to export the region currently selected in a slicer or drop-down in the file name.

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Buttons, shortcuts and error handling
**Time:** ~1 hour

### Review (10 min)
From memory: the RefreshAll macro.

### Lesson (15 min)
- **Buttons:** Insert a shape → right-click → **Assign Macro**. Label it clearly ("🔄 Refresh", "📄 Export PDF").
- **Keyboard shortcut:** Developer → Macros → Options → Ctrl+Shift+letter.
- **Speed:** `Application.ScreenUpdating = False` at the start, `True` at the end.
- **Basic error handling:**
```vba
Sub SafeExport()
    On Error GoTo Oops
    ExportDashboardPDF
    MsgBox "Exported!"
    Exit Sub
Oops:
    MsgBox "Export failed: " & Err.Description
End Sub
```
- **Personal Macro Workbook** (store macros in *Personal Macro Workbook* when recording): macros available in every file you open.

### Practice (20 min)
Add a button bar on your dashboard: Refresh, Export PDF, Format Report. Test each.

### Mini-Task (10 min)
Record a useful macro into your Personal Macro Workbook (e.g. your favourite number format) so you have it everywhere.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Project day: automate a weekly report
**Time:** ~1.5 hours

### Review (15 min)
From memory: a macro with a loop and an If.

### Weekly Project (45 min)
**`Weekly_Report_Automation.xlsm`:** one button that:
1. Refreshes all data (Power Query + pivots).
2. Formats the report sheet.
3. Creates a copy of the report for each region (loop), filtered to that region.
4. Exports each region's report as a PDF named `NaijaMart_<Region>_<date>.pdf`.
5. Shows a message: "6 regional reports exported."
Include comments in the code explaining each block, and error handling.

### Log (15 min)
Weekly review.

## Quiz
1. Why must a workbook with macros be saved as .xlsm?
2. Which shortcut opens the VBA Editor?
3. What does `Dim lastRow As Long` do?
4. How do you find the last used row in column A in VBA?
5. Why remove `.Select` from recorded code?
6. How do you attach a macro to a button?
7. How many big orders (≥ ₦1M) did your macro count?

**Answers:** (1) .xlsx can't store macros (2) Alt+F11 (3) declares a whole-number variable (4) `Cells(Rows.Count, "A").End(xlUp).Row` (5) it's slower and fragile; act on ranges directly (6) right-click a shape → Assign Macro (7) 140.
