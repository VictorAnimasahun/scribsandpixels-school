import { describe, expect, it } from 'vitest'
import { colToLetters, display, lettersToCol, matchesCriteria, Sheet } from './sheet.ts'

const orders = () =>
  new Sheet({
    A1: 'Region', B1: 'Category', C1: 'Units', D1: 'UnitPrice', E1: 'DiscountPct', F1: 'Payment',
    A2: 'Lagos', B2: 'Phones', C2: 2, D2: 145000, E2: 0, F2: 'Cash',
    A3: 'Kano', B3: 'Groceries', C3: 10, D3: 13500, E3: 5, F3: 'Transfer',
    A4: 'Lagos', B4: 'Groceries', C4: 4, D4: 9200, E4: 10, F4: 'POS',
    A5: 'Abuja', B5: 'Phones', C5: 1, D5: 205000, E5: 15, F5: 'Transfer',
    H1: '7.5%',
  })

const value = (sheet: Sheet, formula: string) => {
  sheet.set('Z99', formula)
  return sheet.get('Z99')
}

describe('references', () => {
  it('converts column letters', () => {
    expect(colToLetters(1)).toBe('A')
    expect(colToLetters(28)).toBe('AB')
    expect(lettersToCol('XFD')).toBe(16384)
  })
})

describe('Sheet: Week 2–3 basics', () => {
  it('does arithmetic, precedence and absolute references', () => {
    const s = orders()
    expect(value(s, '=10+2*5')).toBe(20)
    expect(value(s, '=C2*D2')).toBe(290000)
    expect(value(s, '=C2*D2*(1-E2/100)')).toBe(290000)
    expect(value(s, '=C5*D5*(1-E5/100)*$H$1')).toBeCloseTo(13068.75)
  })

  it('handles SUM / AVERAGE / MIN / MAX / COUNT / COUNTA', () => {
    const s = orders()
    expect(value(s, '=SUM(C2:C5)')).toBe(17)
    expect(value(s, '=AVERAGE(D2:D5)')).toBe(93175)
    expect(value(s, '=MAX(D2:D5)')).toBe(205000)
    expect(value(s, '=COUNT(A1:A5)')).toBe(0)
    expect(value(s, '=COUNTA(A1:A5)')).toBe(5)
  })

  it('recalculates dependents when an input changes', () => {
    const s = orders()
    s.set('G2', '=C2*D2')
    expect(s.get('G2')).toBe(290000)
    s.set('C2', '3')
    expect(s.get('G2')).toBe(435000)
  })

  it('reports errors like Excel', () => {
    const s = orders()
    expect(value(s, '=1/0')).toEqual({ error: '#DIV/0!' })
    expect(value(s, '=SUMM(C2:C5)')).toEqual({ error: '#NAME?' })
    s.set('A10', '=A11')
    s.set('A11', '=A10')
    expect(s.get('A10')).toEqual({ error: '#CIRCULAR!' })
  })
})

describe('Sheet: Weeks 5–9 functions', () => {
  it('logic', () => {
    const s = orders()
    expect(value(s, '=IF(D2>=100000,"Big","Small")')).toBe('Big')
    expect(value(s, '=IFS(D3>=100000,"Large",D3>=10000,"Medium",TRUE,"Small")')).toBe('Medium')
    expect(value(s, '=AND(A2="Lagos",F2="Cash")')).toBe(true)
    expect(value(s, '=SWITCH(A3,"Lagos","South-West","Kano","North-West","Other")')).toBe('North-West')
  })

  it('conditional maths', () => {
    const s = orders()
    expect(value(s, '=COUNTIF(A2:A5,"Lagos")')).toBe(2)
    expect(value(s, '=COUNTIFS(A2:A5,"Lagos",B2:B5,"Phones")')).toBe(1)
    expect(value(s, '=SUMIFS(C2:C5,A2:A5,"Lagos")')).toBe(6)
    expect(value(s, '=SUMIFS(C2:C5,D2:D5,">=13500")')).toBe(13)
    expect(value(s, '=AVERAGEIFS(D2:D5,B2:B5,"Phones")')).toBe(175000)
    expect(value(s, '=MAXIFS(D2:D5,F2:F5,"Transfer")')).toBe(205000)
    expect(value(s, '=COUNTIFS(F2:F5,"<>Cash")')).toBe(3)
    expect(value(s, '=COUNTIF(A2:A5,"Lag*")')).toBe(2)
  })

  it('text', () => {
    const s = orders()
    expect(value(s, '=PROPER(TRIM("  tolu   EZE "))')).toBe('Tolu Eze')
    expect(value(s, '=LEFT("NM-00042",2)')).toBe('NM')
    expect(value(s, '=TEXTAFTER("Lagos - Ikeja"," - ")')).toBe('Ikeja')
    expect(value(s, '=TEXTJOIN(", ",TRUE,A2:A4)')).toBe('Lagos, Kano, Lagos')
    expect(value(s, '=A2&" "&B2')).toBe('Lagos Phones')
  })

  it('lookups', () => {
    const s = orders()
    expect(value(s, '=XLOOKUP("Abuja",A2:A5,D2:D5)')).toBe(205000)
    expect(value(s, '=XLOOKUP("Enugu",A2:A5,D2:D5,"Not found")')).toBe('Not found')
    expect(value(s, '=INDEX(D2:D5,MATCH("Kano",A2:A5,0))')).toBe(13500)
    expect(value(s, '=VLOOKUP("Kano",A2:D5,4,FALSE)')).toBe(13500)
    expect(value(s, '=XLOOKUP("Enugu",A2:A5,D2:D5)')).toEqual({ error: '#N/A' })
  })

  it('dates and finance', () => {
    const s = orders()
    expect(value(s, '=DATE(2025,1,1)')).toBe(45658)
    expect(value(s, '=NETWORKDAYS(DATE(2025,3,1),DATE(2025,3,31))')).toBe(21)
    expect(value(s, '=PMT(24%/12,36,-5000000)')).toBeCloseTo(196164.26, 2)
  })
})

describe('matchesCriteria', () => {
  it('handles operators, wildcards and case', () => {
    expect(matchesCriteria(5, '>=5')).toBe(true)
    expect(matchesCriteria('lagos', 'Lagos')).toBe(true)
    expect(matchesCriteria('Cash', '<>Cash')).toBe(false)
    expect(matchesCriteria('Kano', '?ano')).toBe(true)
  })
})

describe('display', () => {
  it('formats numbers with separators', () => {
    expect(display(834046700)).toBe('834,046,700')
    expect(display({ error: '#N/A' })).toBe('#N/A')
  })
})
