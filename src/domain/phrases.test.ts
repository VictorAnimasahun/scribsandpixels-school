import { describe, expect, it } from 'vitest'
import type { PhrasePattern } from '../content/sandboxes.ts'
import { checkPhrase, joinFrench, remix, similarity } from './phrases.ts'
import { seededRandom } from './quizGate.ts'

describe('joinFrench', () => {
  it('contracts à/de with le/les', () => {
    expect(joinFrench(['je', 'vais', 'à', 'le', 'marché', '.'])).toBe('Je vais au marché.')
    expect(joinFrench(['je', 'vais', 'à', 'les', 'toilettes'])).toBe('Je vais aux toilettes')
    expect(joinFrench(['je', 'viens', 'de', 'le', 'bureau'])).toBe('Je viens du bureau')
  })

  it('elides before vowels and fixes punctuation spacing', () => {
    expect(joinFrench(['je', 'aime', 'le', 'ananas', ',', 'merci', '.'])).toBe("J'aime l'ananas, merci.")
    expect(joinFrench(['un', 'kilo', 'de', 'oignons'])).toBe("Un kilo d'oignons")
    expect(joinFrench(['ce', 'est', 'combien', '?'])).toBe("C'est combien ?")
  })
})

const market: PhrasePattern = {
  id: 'buy',
  label: 'Buying',
  slots: [
    { id: 'start', fixed: 'Je voudrais' },
    {
      id: 'art',
      options: [
        { text: 'du', tags: [], needs: { food: ['m', 'sg', 'c'] }, why: 'du = masculine, singular, before a consonant' },
        { text: 'de la', needs: { food: ['f', 'sg', 'c'] } },
        { text: 'des', needs: { food: ['pl'] } },
      ],
    },
    {
      id: 'food',
      options: [
        { text: 'riz', tags: ['m', 'sg', 'c'] },
        { text: 'viande', tags: ['f', 'sg', 'c'] },
        { text: 'tomates', tags: ['f', 'pl', 'c'] },
      ],
    },
  ],
}
const opt = (slot: string, text: string) => (market.slots.find((s) => s.id === slot) as { options: { text: string }[] }).options.find((o) => o.text === text) as never

describe('checkPhrase', () => {
  it('accepts agreeing tiles and explains mismatches', () => {
    expect(checkPhrase(market, { art: opt('art', 'du'), food: opt('food', 'riz') })).toEqual([])
    expect(checkPhrase(market, { art: opt('art', 'du'), food: opt('food', 'viande') })).toEqual([{ slot: 'art', message: 'du = masculine, singular, before a consonant' }])
  })

  it('remix always produces a valid phrase', () => {
    const random = seededRandom(4)
    for (let i = 0; i < 50; i++) expect(checkPhrase(market, remix(market, random))).toEqual([])
  })
})

describe('similarity', () => {
  it('ignores case, accents and punctuation', () => {
    expect(similarity('je voudrais du riz', 'Je voudrais du riz.')).toBe(1)
    expect(similarity('je voudrai du ri', 'Je voudrais du riz')).toBe(0.5)
    expect(similarity('ca va', 'Ça va ?')).toBe(1)
  })
})
