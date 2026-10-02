import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { Sandbox } from '../../content/sandboxes.ts'
import { colToLetters, display, parseRef, Sheet, toRef, typedDateTime } from '../../domain/sheet.ts'
import { applySolution, buildSheetCells, missingParts, taskPassed } from '../../domain/sheetSandbox.ts'
import { loadSaved, save } from './storage.ts'

type Props = { sandbox: Extract<Sandbox, { kind: 'sheet' }> }

const datasets: Record<string, () => Promise<{ default: string }>> = {
  sales_2025: () => import('../../content/courses/excel/datasets/sales_2025.csv?raw'),
  products: () => import('../../content/courses/excel/datasets/products.csv?raw'),
  employees: () => import('../../content/courses/excel/datasets/employees.csv?raw'),
  messy_customers: () => import('../../content/courses/excel/datasets/messy_customers.csv?raw'),
  'timesheet_2025-03': () => import('../../content/courses/excel/datasets/timesheet_2025-03.csv?raw'),
}

/** Saved cells are untrusted: keep only text values at sensible addresses, so a corrupted save
 *  (or one pointing at cell ZZ99999) can't crash the sandbox or make it draw a million cells. */
function readSaved(raw: string | null): Record<string, string> | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
    const cells: Record<string, string> = {}
    for (const [ref, value] of Object.entries(parsed)) {
      if (typeof value !== 'string' || !/^[A-Z]{1,2}[1-9]\d{0,3}$/.test(ref)) continue
      cells[ref] = value.slice(0, 2000)
    }
    return cells
  } catch {
    return null
  }
}

export default function SheetSandbox({ sandbox }: Props) {
  const key = `sheet:${sandbox.id}`
  const [initial, setInitial] = useState<Record<string, string> | null>(null)
  const [cells, setCells] = useState<Record<string, string> | null>(null)
  const [selected, setSelected] = useState('A1')
  const [editing, setEditing] = useState<string | null>(null)
  /** Where the edit happens: in the cell itself, or in the formula bar (never both). */
  const [editSource, setEditSource] = useState<'cell' | 'bar'>('cell')
  const [draft, setDraft] = useState('')
  const cellInputRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Load the dataset (only when this sandbox is opened) and any saved work.
  useEffect(() => {
    let cancelled = false
    const file = sandbox.dataset?.file
    ;(file ? datasets[file]().then((m) => m.default) : Promise.resolve(undefined)).then((csv) => {
      if (cancelled) return
      const start = buildSheetCells(sandbox, csv)
      setInitial(start)
      setCells(readSaved(loadSaved(key)) ?? start)
    })
    return () => { cancelled = true }
  }, [sandbox, key])

  useEffect(() => { if (cells) save(key, JSON.stringify(cells)) }, [key, cells])

  const sheet = useMemo(() => (cells ? new Sheet(cells) : null), [cells])
  const cols = Math.max(sandbox.cols ?? 8, sheet?.usedCols() ?? 0)
  const rows = Math.max(sandbox.rows ?? 20, sheet?.usedRows() ?? 0)

  if (!cells || !sheet || !initial) return <p className="muted">Loading spreadsheet…</p>

  const commit = (ref: string, raw: string) => {
    setCells((c) => {
      const next = { ...c! }
      if (raw === '') delete next[ref]
      else next[ref] = raw
      return next
    })
  }

  const move = (dCol: number, dRow: number) => {
    const { col, row } = parseRef(selected)
    setSelected(toRef(Math.min(cols, Math.max(1, col + dCol)), Math.min(rows, Math.max(1, row + dRow))))
  }

  const startEdit = (ref: string, initialText?: string, source: 'cell' | 'bar' = 'cell') => {
    setEditing(ref)
    setEditSource(source)
    setDraft(initialText ?? cells[ref] ?? '')
    if (source === 'cell') requestAnimationFrame(() => cellInputRef.current?.focus())
  }

  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (editing) return
    const moves: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], Tab: [1, 0], Enter: [0, 1] }
    if (e.key in moves && !(e.key === 'Enter' && false)) {
      e.preventDefault()
      if (e.key === 'Enter') return startEdit(selected)
      move(...moves[e.key])
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      commit(selected, '')
    } else if (e.key === 'F2') {
      e.preventDefault()
      startEdit(selected)
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      startEdit(selected, e.key)
    }
  }

  const finishEdit = (then?: [number, number]) => {
    if (editing) commit(editing, draft)
    setEditing(null)
    if (then) {
      move(...then)
      gridRef.current?.focus() // keep keyboard navigation going
    }
  }

  const tasks = sandbox.tasks ?? []
  const passed = tasks.filter((t) => taskPassed(t, sheet.get(t.cell), sheet.getRaw(t.cell))).length

  return (
    <div className="sandbox sheet">
      <div className="formula-bar">
        <span className="ref">{selected}</span>
        <input
          value={editing ? draft : cells[selected] ?? ''}
          onFocus={() => { if (!editing) startEdit(selected, undefined, 'bar') }}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); finishEdit([0, 1]) }
            if (e.key === 'Tab') { e.preventDefault(); finishEdit([1, 0]) }
            if (e.key === 'Escape') setEditing(null)
          }}
          onBlur={() => finishEdit()}
          placeholder="Type a value or a formula like =SUM(A2:A10)"
          spellCheck={false}
          autoCapitalize="off"
        />
      </div>
      <div className="grid-wrap" tabIndex={0} onKeyDown={onGridKey} ref={gridRef}>
        <table className="grid">
          <thead>
            <tr><th />{Array.from({ length: cols }, (_, c) => <th key={c}>{colToLetters(c + 1)}</th>)}</tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>
                <th>{r + 1}</th>
                {Array.from({ length: cols }, (_, c) => {
                  const ref = toRef(c + 1, r + 1)
                  const value = sheet.get(ref)
                  const isError = value !== null && typeof value === 'object'
                  return (
                    <td
                      key={ref}
                      className={`${ref === selected ? 'sel' : ''} ${typeof value === 'number' ? 'num' : ''} ${isError ? 'err' : ''} ${r === 0 ? 'head' : ''}`}
                      onClick={() => { finishEdit(); setSelected(ref) }}
                      onDoubleClick={() => startEdit(ref)}
                    >
                      {editing === ref && editSource === 'cell' ? (
                        <input
                          ref={cellInputRef}
                          className="cell-input"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); finishEdit([0, 1]) }
                            if (e.key === 'Tab') { e.preventDefault(); finishEdit([1, 0]) }
                            if (e.key === 'Escape') setEditing(null)
                          }}
                          onBlur={() => finishEdit()}
                        />
                      ) : (
                        // typed times/dates are numbers inside, but show as typed (like Excel's formatting)
                        typedDateTime(sheet.getRaw(ref)) !== null ? sheet.getRaw(ref) : display(value)
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sandbox-row">
        <button onClick={() => { if (confirm('Reset the sheet to its starting data?')) setCells(initial) }}>Reset sheet</button>
        {tasks.length > 0 && <span className="muted">{passed} / {tasks.length} tasks done</span>}
      </div>
      {tasks.length > 0 && (
        <ol className="tasks">
          {tasks.map((task, i) => {
            const ok = taskPassed(task, sheet.get(task.cell), sheet.getRaw(task.cell))
            const raw = sheet.getRaw(task.cell)
            return (
              <li key={i} className={ok ? 'pass' : ''}>
                <span>{ok ? '✅' : '⬜'} {task.prompt}</span>
                {!ok && raw && !raw.startsWith('=') && task.formula && <small className="fail-detail">Use a formula (start with =), not a typed number.</small>}
                {!ok && raw.startsWith('=') && missingParts(task, raw).length > 0 && <small className="fail-detail">Your formula must use {missingParts(task, raw).join(' and ')}.</small>}
                {!ok && !raw && <small className="muted">Hint and answer unlock after you try.</small>}
                <span className="task-actions">
                  <button className="link" onClick={() => setSelected(task.cell)}>Go to {task.cell}</button>
                  {raw && task.hint && <details><summary>💡 Hint</summary>{task.hint}</details>}
                  {raw && <button className="link" onClick={() => { if (confirm('Fill in the model answer for this task?')) setCells((c) => { const next = { ...c! }; applySolution(sandbox, task, (ref, v) => { next[ref] = v }); return next }) }}>Show answer</button>}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
