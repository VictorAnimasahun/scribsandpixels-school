import { describe, expect, it } from 'vitest'
import { sandboxes } from '../content/sandboxes.ts'
import sales from '../content/courses/excel/datasets/sales_2025.csv?raw'
import products from '../content/courses/excel/datasets/products.csv?raw'
import employees from '../content/courses/excel/datasets/employees.csv?raw'
import { Sheet } from './sheet.ts'
import { applySolution, buildSheetCells, parseCsv, taskPassed, taskSolution } from './sheetSandbox.ts'

const csv = { sales_2025: sales, products, employees }

describe('parseCsv', () => {
  it('handles quoted commas and quotes', () => {
    expect(parseCsv('a,b\n"x, y","say ""hi"""\n')).toEqual([['a', 'b'], ['x, y', 'say "hi"']])
  })
})

describe('every Excel sandbox task is solvable and its expected answer is right', () => {
  for (const sandbox of sandboxes) {
    if (sandbox.kind !== 'sheet') continue
    it(sandbox.id, () => {
      const sheet = new Sheet(buildSheetCells(sandbox, sandbox.dataset ? csv[sandbox.dataset.file] : undefined))
      for (const task of sandbox.tasks ?? []) {
        expect(taskSolution(task) ?? task.solutionFill, `${task.cell} needs a model solution`).toBeDefined()
        applySolution(sandbox, task, (ref, raw) => sheet.set(ref, raw))
      }
      for (const task of sandbox.tasks ?? []) {
        const value = sheet.get(task.cell)
        expect(taskPassed(task, value, sheet.getRaw(task.cell)), `${sandbox.id} ${task.cell}: got ${JSON.stringify(value)}, expected ${task.expect}`).toBe(true)
      }
    })
  }
})
