# Week 21 — Collaboration & protection
**Theme:** Work on Excel with other people: sharing, co-authoring, protection, Office Scripts, AI assistance, and Google Sheets.
**Big question:** *How do teams use one workbook without breaking it?*

## Resources
| | Resource | How to use it |
|---|---|---|
| 🌐 | [Microsoft Support — Collaborate on Excel workbooks](https://support.microsoft.com/en-us/excel) | Search "co-authoring" and "Show Changes". |
| 🌐 | [Microsoft Learn — Office Scripts](https://learn.microsoft.com/en-us/office/dev/scripts/) | Read the overview (Wednesday). |
| 📺 | [Leila Gharani](https://www.youtube.com/@LeilaGharani) | Search "Copilot in Excel" and "Python in Excel". |
| 🌐 | [Google Sheets function list](https://support.google.com/docs/table/25273) | Thursday: compare with Excel. |

## Day 1 — Monday
**Topic:** Sharing and co-authoring
**Time:** ~1 hour

### Review (10 min)
From memory: a macro that refreshes everything and exports a PDF.

### Lesson (15 min)
- Save the file to **OneDrive or SharePoint** → **Share** → choose *Can edit* / *Can view* → send the link.
- **Co-authoring:** several people edit at the same time; you see their cursors. AutoSave must be on.
- **Sheet View** (View tab): filter/sort for yourself without disturbing others.
- **Version History** (File → Info): restore any earlier version. Your safety net.
- **Show Changes** (Review tab): who changed which cell, and when.
- ⚠️ Co-authoring doesn't work with legacy "Shared Workbook" mode or some macro features.

### Practice (20 min)
Upload your OrderEntry workbook (Week 10) to OneDrive, share it with a friend (or open it in two browsers), and edit simultaneously. Then restore an earlier version from Version History.

### Mini-Task (10 min)
Use Show Changes to see the last 5 edits.

### Log (5 min)
Log.

## Day 2 — Tuesday
**Topic:** Comments, notes and protection in shared files
**Time:** ~1 hour

### Review (10 min)
From memory: where do you find Version History?

### Lesson (15 min)
- **Comments** (threaded, Review → New Comment): conversations; **@mention** someone to notify them by email.
- **Notes** (the old yellow comments): static reminders.
- **Protection review:** Protect Sheet (locked cells), Protect Workbook (structure), **Allow Edit Ranges** (only certain ranges editable, optionally by person).
- **File-level encryption:** File → Info → Protect Workbook → **Encrypt with Password**. This one *is* real encryption; lose the password and the file is gone.
- **Sensitive data:** remove personal data before sharing (File → Info → Check for Issues → Inspect Document).

### Practice (20 min)
In a shared copy of the HR workbook: add threaded comments with @mentions, protect the formula columns, allow editing only in the input range, and run Document Inspector.

### Mini-Task (10 min)
Explain in your log the difference between sheet protection and encryption.

### Log (5 min)
Log.

## Day 3 — Wednesday
**Topic:** Office Scripts and Power Automate
**Time:** ~1 hour

### Review (10 min)
From memory: threaded comments vs notes.

### Lesson (15 min)
**Office Scripts** = the modern, web-friendly alternative to VBA (TypeScript). Automate tab in Excel for the web (and newer desktop versions) → **Record Actions** → edit the generated script. Scripts can run from a button or be scheduled with **Power Automate** (e.g. "every Monday at 8:00, refresh and email the report").
```typescript
function main(workbook: ExcelScript.Workbook) {
  const sheet = workbook.getWorksheet("Data");
  const header = sheet.getRange("A1:M1");
  header.getFormat().getFont().setBold(true);
  header.getFormat().getFill().setColor("#164F3B");
  header.getFormat().getFont().setColor("#FFFFFF");
  sheet.getRange("A:M").getFormat().autofitColumns();
}
```
(Office Scripts need a Microsoft 365 work or school account. Personal accounts may not have the Automate tab.)

### Practice (20 min)
If available: record a formatting script in Excel for the web and look at the code. If not: read the script above line by line and compare it with your VBA FormatReport macro. Which is easier to read?

### Mini-Task (10 min)
Write down 3 weekly tasks at your job that could be automated with scripts + Power Automate.

### Log (5 min)
Log.

## Day 4 — Thursday
**Topic:** AI in Excel, Python in Excel, and Google Sheets
**Time:** ~1 hour

### Review (10 min)
From memory: VBA vs Office Scripts, which runs where?

### Lesson (15 min)
**Copilot in Excel** (with a Microsoft 365 Copilot or Copilot Pro subscription): ask in plain language: *"Add a column for profit margin"*, *"Which region grew fastest?"*, *"Highlight the top 10 orders"*. It suggests formulas, charts and pivots.
➡️ **You still need to understand the formulas**, to check them. AI makes experts faster; it doesn't replace knowing what's correct. Always verify results against numbers you know (like your answer keys).
**Python in Excel** (`=PY(…)` in Microsoft 365): pandas and charts inside cells. A bridge to data science (and the ML course!).
**Google Sheets:** free, excellent for collaboration. Most functions are the same (SUMIFS, XLOOKUP, FILTER, UNIQUE). Unique to Sheets: `QUERY` (SQL-like), `IMPORTRANGE` (other files), `GOOGLEFINANCE`. Missing: Power Pivot, full Power Query, VBA (it uses Apps Script instead).

### Practice (20 min)
1. Upload `sales_2025.csv` to Google Sheets and rebuild: NetSales column, a SUMIFS by region, a pivot table, and `=QUERY(A:O,"select C, sum(O) group by C")`.
2. If you have Copilot, ask it 3 questions about the data and check each answer against your answer keys.

### Mini-Task (10 min)
Write 3 sentences: when would you choose Google Sheets over Excel, and vice versa?

### Log (5 min)
Log.

## Day 5 — Friday
**Topic:** Documentation and handover
**Time:** ~1 hour

### Review (10 min)
From memory: 2 things Google Sheets can do that Excel can't, and 2 the other way round.

### Lesson (15 min)
A workbook other people can maintain has:
- A **README / About** sheet: purpose, owner, data sources, how to update (step by step), last updated date
- Consistent **naming**: tbl…, q…, measure names in plain English
- **Colour conventions**: inputs yellow, formulas plain, outputs highlighted
- **No hard-coded numbers** in formulas: inputs on an Inputs sheet
- **Check totals**: a "Checks" area that turns red if something doesn't reconcile (e.g. sum of regions ≠ company total)

### Practice (20 min)
Add a README sheet and a Checks area to your Monthly Report (Week 18) and Dashboard (Week 19).

### Mini-Task (10 min)
Give your workbook to someone and ask them to update it using only the README. Fix whatever confused them.

### Log (5 min)
Log.

## Day 6 — Saturday
**Topic:** Milestone: interactive executive dashboard
**Time:** ~2 hours

### Review (15 min)
From memory: the 5 elements of a maintainable workbook.

### Weekly Project (75 min)
**Phase 5 milestone: `NaijaMart_Executive_Dashboard.xlsx`**, the finished product:
1. Data pipeline: Power Query (2025 + monthly folder + products + targets).
2. Model: star schema + DAX measures (or SUMIFS/dynamic arrays on Mac/web).
3. One-screen dashboard: KPI cards, 4–5 charts, slicers, polished design.
4. Automation: refresh + export buttons (VBA) or a script.
5. README, Checks, protection on formulas, shared via OneDrive with view-only access.
6. A 1-minute screen recording (Loom or similar) walking a manager through it. **Portfolio piece #1.**

### Log (15 min)
Phase 5 review.

## Quiz
1. What's needed for co-authoring?
2. Where can you restore an earlier version of a shared file?
3. Is sheet protection real security? What is?
4. What are Office Scripts, and where do they run?
5. Why must you still understand formulas if you use Copilot?
6. Name one Google Sheets function Excel doesn't have.
7. What goes on a README sheet?

**Answers:** (1) the file on OneDrive/SharePoint with AutoSave on (2) File → Info → Version History (3) no; Encrypt with Password is (4) TypeScript automation for Excel, mainly Excel for the web / Microsoft 365, schedulable with Power Automate (5) to check its answers; AI can be wrong (6) QUERY, IMPORTRANGE or GOOGLEFINANCE (7) purpose, owner, sources, how to update, last updated.
