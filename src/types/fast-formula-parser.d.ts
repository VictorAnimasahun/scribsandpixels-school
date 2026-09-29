declare module 'fast-formula-parser' {
  export default class FormulaParser {
    constructor(config?: Record<string, unknown>)
    parse(formula: string, position: { sheet: string; row: number; col: number }, allowReturnArray?: boolean): unknown
  }
}
