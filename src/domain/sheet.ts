import FormulaParser from 'fast-formula-parser'
import * as formulajs from '@formulajs/formulajs'

/*
 * A small spreadsheet engine for the Excel sandbox: one sheet, A1 references,
 * ranges, $ locks, and the functions the course teaches. fast-formula-parser
 * (MIT) parses and provides ~250 functions; the modern ones it lacks
 * (SUMIFS, XLOOKUP, TEXTJOIN, PMT…) are added below.
 */

export type CellValue = number | string | boolean | null | { error: string }

type Arg = { value: unknown; isRangeRef?: boolean; isCellRef?: boolean }

const { FormulaError } = FormulaParser as unknown as { FormulaError: { NA: unknown; VALUE: unknown; DIV0: unknown; REF: unknown; NAME: unknown; NUM: unknown } }

export function colToLetters(col: number): string {
  let s = ''
  for (let n = col; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

export function lettersToCol(letters: string): number {
  return letters.toUpperCase().split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0)
}

export function parseRef(ref: string): { col: number; row: number } {
  const m = ref.toUpperCase().replace(/\$/g, '').match(/^([A-Z]+)(\d+)$/)
  if (!m) throw new Error(`Bad cell reference ${ref}`)
  return { col: lettersToCol(m[1]), row: Number(m[2]) }
}

export const toRef = (col: number, row: number) => `${colToLetters(col)}${row}`

// ─── helpers for custom functions ─────────────────────────────────────────

const flat = (arg: Arg | undefined): unknown[] => {
  if (!arg) return []
  const v = arg.value
  return Array.isArray(v) ? (v as unknown[][]).flat() : [v]
}
const scalar = (arg: Arg | undefined): unknown => (arg === undefined ? undefined : Array.isArray(arg.value) ? (arg.value as unknown[][])[0]?.[0] : arg.value)
const num = (v: unknown): number => (typeof v === 'number' ? v : typeof v === 'boolean' ? Number(v) : Number(v ?? 0))
const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v)

/** Excel-style criteria: 5, "Lagos", ">=1000", "<>Cash", "Lag*", "?ano". */
export function matchesCriteria(value: unknown, criteria: unknown): boolean {
  if (typeof criteria === 'number' || typeof criteria === 'boolean') return value === criteria || (isNum(value) && value === Number(criteria))
  const c = String(criteria ?? '')
  const m = c.match(/^(>=|<=|<>|>|<|=)?(.*)$/s)!
  const op = m[1] ?? '='
  const operand = m[2]
  const operandNum = operand.trim() !== '' && !Number.isNaN(Number(operand)) ? Number(operand) : null
  if (operandNum !== null && isNum(value)) {
    const v = value as number
    return op === '=' ? v === operandNum : op === '<>' ? v !== operandNum : op === '>' ? v > operandNum : op === '<' ? v < operandNum : op === '>=' ? v >= operandNum : v <= operandNum
  }
  if (op === '=' || op === '<>') {
    const pattern = new RegExp('^' + operand.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i')
    const text = value === null || value === undefined ? '' : String(value)
    const hit = pattern.test(text)
    return op === '=' ? hit : !hit
  }
  if (typeof value === 'string') {
    const cmp = value.localeCompare(operand, undefined, { sensitivity: 'base' })
    return op === '>' ? cmp > 0 : op === '<' ? cmp < 0 : op === '>=' ? cmp >= 0 : cmp <= 0
  }
  return false
}

/** Rows (indexes) where every (range, criteria) pair matches. */
function matchingIndexes(pairs: Arg[]): number[] {
  const ranges = [] as unknown[][]
  const crits = [] as unknown[]
  for (let i = 0; i < pairs.length; i += 2) {
    ranges.push(flat(pairs[i]))
    crits.push(scalar(pairs[i + 1]))
  }
  const length = ranges[0]?.length ?? 0
  const out: number[] = []
  for (let i = 0; i < length; i++) if (ranges.every((r, k) => matchesCriteria(r[i], crits[k]))) out.push(i)
  return out
}

const numbersAt = (values: unknown[], idx: number[]) => idx.map((i) => values[i]).filter(isNum) as number[]

function lookupIndex(needle: unknown, haystack: unknown[], mode: number): number {
  const eq = (a: unknown, b: unknown) => (typeof a === 'string' && typeof b === 'string' ? a.toLowerCase() === b.toLowerCase() : a === b)
  const exact = haystack.findIndex((h) => eq(h, needle) || (typeof needle === 'string' && /[*?]/.test(needle) && matchesCriteria(h, needle)))
  if (exact >= 0 || mode === 0) return exact
  // -1: exact or next smaller · 1: exact or next larger
  let best = -1
  haystack.forEach((item, i) => {
    if (!isNum(item) || !isNum(needle)) return
    const h = item as number
    const n = needle as number
    if (mode === -1 && h <= n && (best < 0 || h > (haystack[best] as number))) best = i
    if (mode === 1 && h >= n && (best < 0 || h < (haystack[best] as number))) best = i
  })
  return best
}

const extraFunctions: Record<string, (...args: Arg[]) => unknown> = {
  SUMIFS: (sum, ...pairs) => numbersAt(flat(sum), matchingIndexes(pairs)).reduce((a, b) => a + b, 0),
  COUNTIFS: (...pairs) => matchingIndexes(pairs).length,
  AVERAGEIFS: (avg, ...pairs) => {
    const values = numbersAt(flat(avg), matchingIndexes(pairs))
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : FormulaError.DIV0
  },
  MAXIFS: (range, ...pairs) => {
    const values = numbersAt(flat(range), matchingIndexes(pairs))
    return values.length ? Math.max(...values) : 0
  },
  MINIFS: (range, ...pairs) => {
    const values = numbersAt(flat(range), matchingIndexes(pairs))
    return values.length ? Math.min(...values) : 0
  },
  XLOOKUP: (value, lookup, ret, notFound, mode) => {
    const i = lookupIndex(scalar(value), flat(lookup), mode ? num(scalar(mode)) : 0)
    if (i < 0) return notFound !== undefined ? scalar(notFound) : FormulaError.NA
    return flat(ret)[i] ?? null
  },
  MATCH: (value, range, type) => {
    const t = type === undefined ? 1 : num(scalar(type))
    const i = lookupIndex(scalar(value), flat(range), t === 0 ? 0 : t > 0 ? -1 : 1)
    return i < 0 ? FormulaError.NA : i + 1
  },
  XMATCH: (value, range, mode) => {
    const i = lookupIndex(scalar(value), flat(range), mode ? num(scalar(mode)) : 0)
    return i < 0 ? FormulaError.NA : i + 1
  },
  TEXTJOIN: (delim, ignoreEmpty, ...rest) => {
    const skip = Boolean(scalar(ignoreEmpty))
    return rest.flatMap(flat).filter((v) => !(skip && (v === null || v === ''))).map((v) => (v === null ? '' : String(v))).join(String(scalar(delim) ?? ''))
  },
  SWITCH: (expr, ...cases) => {
    const v = scalar(expr)
    for (let i = 0; i + 1 < cases.length; i += 2) if (scalar(cases[i]) === v) return scalar(cases[i + 1])
    return cases.length % 2 === 1 ? scalar(cases[cases.length - 1]) : FormulaError.NA
  },
  TEXTBEFORE: (text, delim) => {
    const t = String(scalar(text) ?? '')
    const i = t.indexOf(String(scalar(delim)))
    return i < 0 ? FormulaError.NA : t.slice(0, i)
  },
  TEXTAFTER: (text, delim) => {
    const t = String(scalar(text) ?? '')
    const d = String(scalar(delim))
    const i = t.indexOf(d)
    return i < 0 ? FormulaError.NA : t.slice(i + d.length)
  },
  // Basics the parser library lacks, or does differently from Excel
  MIN: (...args) => { const v = args.flatMap(flat).filter(isNum) as number[]; return v.length ? Math.min(...v) : 0 },
  MAX: (...args) => { const v = args.flatMap(flat).filter(isNum) as number[]; return v.length ? Math.max(...v) : 0 },
  COUNTA: (...args) => args.flatMap(flat).filter((v) => v !== null && v !== undefined && v !== '').length,
  COUNTBLANK: (...args) => args.flatMap(flat).filter((v) => v === null || v === undefined || v === '').length,
  MEDIAN: (...args) => {
    const v = (args.flatMap(flat).filter(isNum) as number[]).sort((a, b) => a - b)
    if (!v.length) return FormulaError.NUM
    const mid = Math.floor(v.length / 2)
    return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2
  },
  LARGE: (range, k) => { const v = (flat(range).filter(isNum) as number[]).sort((a, b) => b - a); return v[num(scalar(k)) - 1] ?? FormulaError.NUM },
  SMALL: (range, k) => { const v = (flat(range).filter(isNum) as number[]).sort((a, b) => a - b); return v[num(scalar(k)) - 1] ?? FormulaError.NUM },
  RANK: (value, range, order) => {
    const x = num(scalar(value))
    const v = flat(range).filter(isNum) as number[]
    const asc = order !== undefined && num(scalar(order)) !== 0
    return v.filter((y) => (asc ? y < x : y > x)).length + 1
  },
  CHOOSE: (index, ...options) => { const i = num(scalar(index)); return i >= 1 && i <= options.length ? scalar(options[i - 1]) : FormulaError.VALUE },
  TRIM: (text) => String(scalar(text) ?? '').trim().replace(/ {2,}/g, ' '),
  UPPER: (text) => String(scalar(text) ?? '').toUpperCase(),
  SUBSTITUTE: (text, oldText, newText) => String(scalar(text) ?? '').split(String(scalar(oldText) ?? '')).join(String(scalar(newText) ?? '')),
  VALUE: (text) => { const n = Number(String(scalar(text) ?? '').replace(/[,\s₦]/g, '')); return Number.isNaN(n) ? FormulaError.VALUE : n },
  IFNA: (value, fallback) => (String(scalar(value)) === '#N/A' ? scalar(fallback) : scalar(value)),
  CONCAT: (...args) => args.flatMap(flat).map((v) => (v === null ? '' : String(v))).join(''),
  PMT: (rate, nper, pv, fv, type) => formulajs.PMT(num(scalar(rate)), num(scalar(nper)), num(scalar(pv)), fv ? num(scalar(fv)) : 0, type ? num(scalar(type)) : 0),
  FV: (rate, nper, pmt, pv, type) => formulajs.FV(num(scalar(rate)), num(scalar(nper)), num(scalar(pmt)), pv ? num(scalar(pv)) : 0, type ? num(scalar(type)) : 0),
  PV: (rate, nper, pmt, fv, type) => formulajs.PV(num(scalar(rate)), num(scalar(nper)), num(scalar(pmt)), fv ? num(scalar(fv)) : 0, type ? num(scalar(type)) : 0),
  NPER: (rate, pmt, pv, fv, type) => formulajs.NPER(num(scalar(rate)), num(scalar(pmt)), num(scalar(pv)), fv ? num(scalar(fv)) : 0, type ? num(scalar(type)) : 0),
  NPV: (rate, ...values) => formulajs.NPV(num(scalar(rate)), ...(values.flatMap(flat).filter(isNum) as number[])),
  IRR: (values) => formulajs.IRR(flat(values).filter(isNum) as number[]),
}

// ─── the sheet ─────────────────────────────────────────────────────────────

const ERROR_TEXT = /^#(DIV\/0!|N\/A|NAME\?|NULL!|NUM!|REF!|VALUE!|ERROR!|CIRCULAR!)/

function literal(raw: string): CellValue {
  const t = raw.trim()
  if (t === '') return null
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t)
  if (/^-?\d+(\.\d+)?%$/.test(t)) return Number(t.slice(0, -1)) / 100
  if (/^(true|false)$/i.test(t)) return t.toLowerCase() === 'true'
  return raw.startsWith("'") ? raw.slice(1) : raw
}

export class Sheet {
  private raw = new Map<string, string>()
  private cache = new Map<string, CellValue>()
  private evaluating = new Set<string>()
  /** Set when a reference loop is hit; every cell in the loop becomes #CIRCULAR!. */
  private circular = false
  /** fast-formula-parser isn't re-entrant: one instance per nesting level of formula evaluation. */
  private parsers: FormulaParser[] = []

  constructor(cells: Record<string, string | number> = {}) {
    for (const [ref, value] of Object.entries(cells)) this.raw.set(ref.toUpperCase(), String(value))
  }

  private parserAt(depth: number): FormulaParser {
    this.parsers[depth] ??= new FormulaParser({
      functions: extraFunctions,
      onCell: ({ row, col }: { row: number; col: number }) => this.forParser(toRef(col, row)),
      onRange: (ref: { from: { row: number; col: number }; to: { row: number; col: number } }) => {
        const rows: unknown[][] = []
        const lastRow = Math.min(ref.to.row, this.usedRows())
        const lastCol = Math.min(ref.to.col, this.usedCols())
        for (let r = ref.from.row; r <= lastRow; r++) {
          const row: unknown[] = []
          for (let c = ref.from.col; c <= lastCol; c++) row.push(this.forParser(toRef(c, r)))
          rows.push(row)
        }
        return rows.length ? rows : [[null]]
      },
    })
    return this.parsers[depth]
  }

  getRaw(ref: string): string {
    return this.raw.get(ref.toUpperCase()) ?? ''
  }

  set(ref: string, raw: string) {
    const key = ref.toUpperCase()
    if (raw === '') this.raw.delete(key)
    else this.raw.set(key, raw)
    this.cache.clear()
  }

  refs(): string[] {
    return [...this.raw.keys()]
  }

  usedRows(): number {
    return Math.max(0, ...this.refs().map((r) => parseRef(r).row))
  }

  usedCols(): number {
    return Math.max(0, ...this.refs().map((r) => parseRef(r).col))
  }

  private forParser(ref: string): unknown {
    const v = this.get(ref)
    if (v && typeof v === 'object') return (FormulaError as Record<string, unknown>)[v.error === '#N/A' ? 'NA' : v.error === '#DIV/0!' ? 'DIV0' : 'VALUE']
    return v
  }

  get(ref: string): CellValue {
    const key = ref.toUpperCase()
    if (this.cache.has(key)) return this.cache.get(key)!
    const raw = this.raw.get(key) ?? ''
    if (!raw.startsWith('=')) return literal(raw)
    if (this.evaluating.has(key)) {
      this.circular = true
      return { error: '#CIRCULAR!' }
    }
    this.evaluating.add(key)
    let value: CellValue
    try {
      const { row, col } = parseRef(key)
      value = this.normalise(this.parserAt(this.evaluating.size - 1).parse(raw.slice(1), { sheet: 'Sheet1', row, col }))
    } catch (e) {
      const text = String(e instanceof Error ? e.message : e)
      value = { error: ERROR_TEXT.test(text) ? text.match(ERROR_TEXT)![0] : /not implemented/i.test(text) ? '#NAME?' : '#ERROR!' }
    } finally {
      this.evaluating.delete(key)
    }
    if (this.circular) value = { error: '#CIRCULAR!' }
    if (this.evaluating.size === 0) this.circular = false
    this.cache.set(key, value)
    return value
  }

  private normalise(result: unknown): CellValue {
    if (Array.isArray(result)) return this.normalise((result as unknown[][])[0]?.[0] ?? null) // no spilling in the sandbox
    if (result === null || result === undefined) return 0
    if (typeof result === 'number') return Number.isFinite(result) ? result : { error: '#NUM!' }
    if (typeof result === 'string' || typeof result === 'boolean') return result
    const text = String(result)
    if (ERROR_TEXT.test(text)) return { error: text.match(ERROR_TEXT)![0] }
    return text
  }
}

export function display(value: CellValue): string {
  if (value === null) return ''
  if (typeof value === 'object') return value.error
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (typeof value === 'number') return Number.isInteger(value) ? value.toLocaleString('en-US') : value.toLocaleString('en-US', { maximumFractionDigits: 4 })
  return value
}
