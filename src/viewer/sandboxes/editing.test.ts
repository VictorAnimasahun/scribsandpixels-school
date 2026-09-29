import { describe, expect, it } from 'vitest'
import { indentOnEnter, straightenQuotes } from './editing.ts'

describe('straightenQuotes', () => {
  it('turns phone smart quotes into straight quotes', () => {
    expect(straightenQuotes('print(“Hello, ‘Ada’”)')).toBe(`print("Hello, 'Ada'")`)
  })
})

describe('indentOnEnter', () => {
  it('keeps the indent and adds a level after a colon', () => {
    const code = 'for i in range(3):'
    expect(indentOnEnter(code, code.length)).toBe('\n    ')
    const nested = 'def f():\n    if x:  # check'
    expect(indentOnEnter(nested, nested.length)).toBe('\n        ')
    const plain = 'def f():\n    x = 1'
    expect(indentOnEnter(plain, plain.length)).toBe('\n    ')
  })
})
