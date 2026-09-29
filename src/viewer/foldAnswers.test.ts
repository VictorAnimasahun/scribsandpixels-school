import { describe, expect, it } from 'vitest'
import { foldAnswers } from './foldAnswers.ts'

describe('foldAnswers', () => {
  it('folds :::hint blocks', () => {
    const out = foldAnswers('Do it.\n\n:::hint\n```python\nx = 1\n```\n:::\n\nNext')
    expect(out).toContain('<details class="reveal"><summary>💡 Hint: try it yourself first</summary>')
    expect(out).toContain('x = 1')
    expect(out).not.toContain(':::')
  })

  it('folds Check answer paragraphs and keeps their label', () => {
    const out = foldAnswers('1. Je ___\n\n**Check:** 1. suis\n\nMore')
    expect(out).toContain('<summary>✅ Show answers</summary>')
    expect(out).toContain('1. suis')
    expect(foldAnswers('**Check (1):** a b')).toContain('**(1):** a b')
    expect(out).toContain('More')
  })
})
