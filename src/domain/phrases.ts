import { agreementProblems, type PhraseOption, type PhrasePattern } from '../content/sandboxes.ts'

/*
 * French phrase-builder rules: turn chosen tiles into correct written French
 * (contractions, elision, punctuation spacing), generate random valid phrases,
 * and compare a spoken attempt with the target.
 */

/** à le → au, de les → des, de le → du…, then je/de/le/la/que… elide before a vowel. */
export function joinFrench(tokens: string[]): string {
  let text = tokens.filter((t) => t.trim() !== '').join(' ')
  // \b is ASCII-only in JS (it doesn't see "à" as a letter), so match on whitespace instead.
  const contract = (from: string, to: string) => {
    text = text.replace(new RegExp(`(^|\\s)${from}(?=\\s|$)`, 'gi'), `$1${to}`)
  }
  // le/la elide first ("de le ail" → "de l'ail", never "du ail"), then à/de contract.
  text = text.replace(/(^|\s)(le|la) ([aeiouyhàâæéèêëîïôœù])/gi, (_, space: string, word: string, next: string) => `${space}${word.charAt(0)}'${next}`)
  contract('à le', 'au')
  contract('à les', 'aux')
  contract('de le', 'du')
  contract('de les', 'des')
  text = text.replace(/\b(je|me|te|se|le|la|de|ne|que|ce) ([aeiouyhàâæéèêëîïôœù])/gi, (_, word: string, next: string) => `${word.slice(0, -1)}'${next}`)
  text = text.replace(/\bsi il/gi, "s'il")
  text = text.replace(/ ([,.])/g, '$1').replace(/\s+/g, ' ').trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export type Choice = Record<string, PhraseOption | undefined>

export function tokensFor(pattern: PhrasePattern, chosen: Choice): string[] {
  return pattern.slots.map((slot) => ('fixed' in slot ? slot.fixed : chosen[slot.id]?.text ?? '…'))
}

export function isComplete(pattern: PhrasePattern, chosen: Choice): boolean {
  return pattern.slots.every((slot) => 'fixed' in slot || chosen[slot.id])
}

export function checkPhrase(pattern: PhrasePattern, chosen: Choice) {
  return agreementProblems(pattern, chosen)
}

/** A random phrase that respects every agreement rule (for "Remix"). */
export function remix(pattern: PhrasePattern, random: () => number = Math.random): Choice {
  let fallback: Choice = {}
  for (let attempt = 0; attempt < 500; attempt++) {
    const chosen: Choice = {}
    for (const slot of pattern.slots) if ('options' in slot) chosen[slot.id] = slot.options[Math.floor(random() * slot.options.length)]
    if (!checkPhrase(pattern, chosen).length) return chosen
    fallback = chosen
  }
  return fallback
}

const plain = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9' ]/g, ' ').replace(/'/g, ' ').split(/\s+/).filter(Boolean)

/** Word-level similarity (0–1) between what was heard and the target phrase. */
export function similarity(heard: string, target: string): number {
  const a = plain(heard)
  const b = plain(target)
  if (!b.length) return 0
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return Math.max(0, 1 - d[a.length][b.length] / Math.max(a.length, b.length))
}
