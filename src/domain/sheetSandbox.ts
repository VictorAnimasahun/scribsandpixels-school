import type { Sandbox, SheetTask } from '../content/sandboxes.ts'
import { toRef } from './sheet.ts'

type SheetSandbox = Extract<Sandbox, { kind: 'sheet' }>

/** Minimal CSV parser (handles quoted fields with commas and doubled quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((c) => c !== '')) rows.push(row)
      row = []
    } else field += ch
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}

/** The starting cells of a sheet sandbox: dataset columns, preset cells, filled formulas. */
export function buildSheetCells(sandbox: SheetSandbox, csv?: string): Record<string, string> {
  const cells: Record<string, string> = {}
  let dataRows = 0
  if (sandbox.dataset && csv) {
    const [header, ...rows] = parseCsv(csv)
    const picked = rows.slice(0, sandbox.dataset.rows)
    dataRows = picked.length
    sandbox.dataset.columns.forEach((name, c) => {
      const source = header.indexOf(name)
      if (source < 0) throw new Error(`${sandbox.id}: dataset has no column ${name}`)
      cells[toRef(c + 1, 1)] = name
      // Text that looks like a formula or number stays literal via the leading apostrophe rule only when needed.
      // Digits with a leading 0 (phone numbers) stay text, like typing '0803… in Excel.
      picked.forEach((row, r) => { cells[toRef(c + 1, r + 2)] = /^0\d+$/.test(row[source]) ? `'${row[source]}` : row[source] })
    })
  }
  for (const [ref, value] of Object.entries(sandbox.cells ?? {})) cells[ref.toUpperCase()] = String(value)
  for (const [col, template] of Object.entries(sandbox.formulaFill ?? {}))
    for (let r = 2; r <= dataRows + 1; r++) cells[`${col.toUpperCase()}${r}`] = template.replace(/\{r\}/g, String(r))
  return cells
}

export const taskSolution = (task: SheetTask) => task.solution ?? (task.hint?.startsWith('=') ? task.hint : undefined)

/** The `mustUse` pieces a formula is missing (case and spaces ignored). */
export function missingParts(task: SheetTask, raw: string): string[] {
  const squash = (t: string) => t.replace(/\s+/g, '').toUpperCase()
  return (task.mustUse ?? []).filter((part) => !squash(raw).includes(squash(part)))
}

export function taskPassed(task: SheetTask, value: unknown, raw: string): boolean {
  if (task.formula && !raw.startsWith('=')) return false
  if (missingParts(task, raw).length) return false
  if (typeof task.expect === 'number') return typeof value === 'number' && Math.abs(value - task.expect) <= (task.tolerance ?? 0.01)
  return String(value ?? '').trim().toLowerCase() === String(task.expect).trim().toLowerCase()
}

/** Apply a task's model answer to a sheet (single cell or whole-column fill). */
export function applySolution(sandbox: SheetSandbox, task: SheetTask, set: (ref: string, raw: string) => void) {
  const rows = sandbox.dataset?.rows ?? 0
  for (const [col, template] of Object.entries(task.solutionFill ?? {}))
    for (let r = 2; r <= rows + 1; r++) set(`${col.toUpperCase()}${r}`, template.replace(/\{r\}/g, String(r)))
  const single = taskSolution(task)
  if (single) set(task.cell, single)
}
