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

/** Index of the nth delimiter (negative n counts from the end), or -1. */
function nthIndex(text: string, delim: string, n: number): number {
  if (!delim || n === 0) return -1
  const positions: number[] = []
  for (let i = text.indexOf(delim); i >= 0; i = text.indexOf(delim, i + delim.length)) positions.push(i)
  const pick = n > 0 ? positions[n - 1] : positions[positions.length + n]
  return pick ?? -1
}

const EXCEL_EPOCH = Date.UTC(1899, 11, 30)
const DAY_MS = 86400000
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Excel's TEXT for the formats the course uses: ₦#,##0 · 0.0 · 0.0% · dddd · d mmmm yyyy · hh:mm. */
export function formatText(value: unknown, format: string): string {
  if (typeof value !== 'number') return value === null || value === undefined ? '' : String(value)
  const bare = format.replace(/"[^"]*"/g, '')
  if (/[dyhs]/i.test(bare) || /^m+$/i.test(bare.trim()) || /m{3,}/i.test(bare)) return formatDate(value, format)
  const m = format.match(/([#0,]+)(\.([0#]+))?/)
  if (!m) return format.replace(/"/g, '')
  const prefix = format.slice(0, m.index).replace(/"/g, '')
  const suffix = format.slice(m.index! + m[0].length).replace(/"/g, '')
  const decimals = m[3]?.length ?? 0
  const x = suffix.includes('%') ? value * 100 : value
  const body = Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: m[1].includes(',') })
  return (x < 0 ? '-' : '') + prefix + body + suffix
}

function formatDate(serial: number, format: string): string {
  const d = new Date(EXCEL_EPOCH + Math.round(serial * DAY_MS))
  const tokens = /yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d|hh|h|ss|"[^"]*"/gi
  let afterHour = false
  return format.replace(tokens, (t) => {
    const lower = t.toLowerCase()
    if (t.startsWith('"')) return t.slice(1, -1)
    const pad = (n: number) => String(n).padStart(2, '0')
    let out: string
    if (lower === 'yyyy') out = String(d.getUTCFullYear())
    else if (lower === 'yy') out = pad(d.getUTCFullYear() % 100)
    else if (lower === 'mmmm') out = MONTHS[d.getUTCMonth()]
    else if (lower === 'mmm') out = MONTHS[d.getUTCMonth()].slice(0, 3)
    else if (lower === 'mm') out = afterHour ? pad(d.getUTCMinutes()) : pad(d.getUTCMonth() + 1)
    else if (lower === 'm') out = afterHour ? String(d.getUTCMinutes()) : String(d.getUTCMonth() + 1)
    else if (lower === 'dddd') out = DAYS[d.getUTCDay()]
    else if (lower === 'ddd') out = DAYS[d.getUTCDay()].slice(0, 3)
    else if (lower === 'dd') out = pad(d.getUTCDate())
    else if (lower === 'd') out = String(d.getUTCDate())
    else if (lower === 'hh') out = pad(d.getUTCHours())
    else if (lower === 'h') out = String(d.getUTCHours())
    else out = pad(d.getUTCSeconds())
    afterHour = lower === 'hh' || lower === 'h'
    return out
  })
}

/** A typed time (08:07) or ISO date (2025-03-15): stored as Excel numbers, shown as typed. */
export function typedDateTime(raw: string): number | null {
  const t = raw.trim()
  const time = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (time && Number(time[1]) < 24 && Number(time[2]) < 60) return (Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3] ?? 0)) / 86400
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return (Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) - EXCEL_EPOCH) / DAY_MS
  return null
}

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
  // fast-formula-parser's SEARCH fails on plain text; Excel's is case-insensitive with * and ? wildcards.
  SEARCH: (findText, within, start) => {
    const from = start === undefined ? 1 : num(scalar(start))
    const pattern = new RegExp(String(scalar(findText) ?? '').replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.'), 'i')
    const i = String(scalar(within) ?? '').slice(from - 1).search(pattern)
    return i < 0 ? FormulaError.VALUE : i + from
  },
  TEXT: (value, format) => formatText(scalar(value), String(scalar(format) ?? '')),
  SWITCH: (expr, ...cases) => {
    const v = scalar(expr)
    for (let i = 0; i + 1 < cases.length; i += 2) if (scalar(cases[i]) === v) return scalar(cases[i + 1])
    return cases.length % 2 === 1 ? scalar(cases[cases.length - 1]) : FormulaError.NA
  },
  TEXTBEFORE: (text, delim, instance) => {
    const t = String(scalar(text) ?? '')
    const i = nthIndex(t, String(scalar(delim)), instance === undefined ? 1 : num(scalar(instance)))
    return i < 0 ? FormulaError.NA : t.slice(0, i)
  },
  TEXTAFTER: (text, delim, instance) => {
    const t = String(scalar(text) ?? '')
    const d = String(scalar(delim))
    const i = nthIndex(t, d, instance === undefined ? 1 : num(scalar(instance)))
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
  const dateTime = typedDateTime(t)
  if (dateTime !== null) return dateTime
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
