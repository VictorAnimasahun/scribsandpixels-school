import { describe, expect, it } from 'vitest'
import type { PhrasePattern } from '../content/sandboxes.ts'
import { checkPhrase, joinFrench, remix, similarity, tokensFor } from './phrases.ts'
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

describe('fr-w03-articles challenges', () => {
  it('produce correct French, with elision and de + le → du', async () => {
    const { findSandbox } = await import('../content/sandboxes.ts')
    const sandbox = findSandbox('fr-w03-articles')
    if (sandbox?.kind !== 'phrases') throw new Error('fr-w03-articles missing')
    const sentences = (sandbox.challenges ?? []).map((c) => {
      const pattern = sandbox.patterns.find((p) => p.id === c.pattern)!
      const chosen = Object.fromEntries(pattern.slots.flatMap((s) => ('fixed' in s ? [] : [[s.id, s.options.find((o) => o.text === c.answer[s.id])]])))
      return joinFrench(tokensFor(pattern, chosen))
    })
    expect(sentences).toEqual([
      'Il y a un sac sous la chaise.',
      'Il y a des livres sur le bureau.',
      "Il y a une bouteille d'eau derrière l'ordinateur.",
      'Il y a des clés à côté du lit.',
      'Les lunettes sont dans le sac.',
      "L'ordinateur est à côté du lit.",
      'Le téléphone est sur la table.',
      'La clé est devant la fenêtre.',
      "C'est un ordinateur.",
      'Ce sont des clés.',
    ])
  })
})

describe('fr-w05-verbs challenges', () => {
  it('produce correct French, with je → j\' and ne → n\'', async () => {
    const { findSandbox } = await import('../content/sandboxes.ts')
    const sandbox = findSandbox('fr-w05-verbs')
    if (sandbox?.kind !== 'phrases') throw new Error('fr-w05-verbs missing')
    const sentences = (sandbox.challenges ?? []).map((c) => {
      const pattern = sandbox.patterns.find((p) => p.id === c.pattern)!
      const chosen = Object.fromEntries(pattern.slots.flatMap((s) => ('fixed' in s ? [] : [[s.id, s.options.find((o) => o.text === c.answer[s.id])]])))
      return joinFrench(tokensFor(pattern, chosen))
    })
    expect(sentences).toEqual([
      'Nous parlons anglais.',
      'Ils travaillent dans une banque.',
      'Tu parles yoruba.',
      'Je travaille à Lagos.',
      "Je n'aime pas le riz.",
      'Elle ne mange pas de viande.',
      'Nous ne mangeons pas de poisson.',
      "Vous n'aimez pas les pâtes.",
    ])
  })
})

async function challengeSentences(id: string) {
  const { findSandbox } = await import('../content/sandboxes.ts')
  const sandbox = findSandbox(id)
  if (sandbox?.kind !== 'phrases') throw new Error(`${id} missing`)
  return (sandbox.challenges ?? []).map((c) => {
    const pattern = sandbox.patterns.find((p) => p.id === c.pattern)!
    const chosen = Object.fromEntries(pattern.slots.flatMap((s) => ('fixed' in s ? [] : [[s.id, s.options.find((o) => o.text === c.answer[s.id])]])))
    return joinFrench(tokensFor(pattern, chosen))
  })
}

describe('fr-w04-family and fr-w06-routine challenges', () => {
  it('possessives and avoir produce correct French', async () => {
    expect(await challengeSentences('fr-w04-family')).toEqual([
      "C'est ma mère.",
      'Ce sont ses parents.',
      "C'est mon amie.",
      "C'est son oncle.",
      "C'est son frère.",
      'Nous avons faim.',
      "J'ai trente ans.",
      'Ils ont froid.',
      'Tu as deux frères.',
    ])
  })
  it('reflexives elide me/se before a vowel, and faire agrees', async () => {
    expect(await challengeSentences('fr-w06-routine')).toEqual([
      'Je me lève à six heures.',
      'Elle se couche tard.',
      'Nous nous habillons tôt.',
      'Ils se lèvent à sept heures et demie.',
      "Je m'habille tôt.",
      'Vous faites les courses.',
      'Ils font du sport.',
      'Je fais la cuisine.',
    ])
  })
})
