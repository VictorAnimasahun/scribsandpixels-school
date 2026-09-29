import { DEFAULT_QUIZ_RULES, type Blueprint, type Difficulty, type Question, type QuizRules } from '../content/quizzes.ts'

/*
 * Gate quizzes: a pop-up quiz that blocks the day until passed. They appear
 * 1–2 times a week on random days (gateDaysForWeek).
 * - Each attempt draws the blueprint's mix of difficulties from the bank,
 *   preferring questions the learner hasn't seen, so a retry covers the same
 *   topics at the same difficulty with different questions.
 * - Failing starts a cooldown during which the whole dashboard stays locked.
 */

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

/** Deterministic PRNG so an attempt can be re-created from its seed. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Picks one attempt's questions. `seenOldestFirst` lists question ids the learner
 * has already been shown, oldest first; unseen questions always win, and once a
 * bank is exhausted the least recently seen come back first.
 */
export function drawAttempt(bank: Question[], blueprint: Blueprint, seenOldestFirst: string[], random: () => number): Question[] {
  const seenAt = new Map(seenOldestFirst.map((id, index) => [id, index]))
  const picked: Question[] = []
  for (const difficulty of DIFFICULTIES) {
    const want = blueprint[difficulty] ?? 0
    const pool = bank.filter((q) => q.difficulty === difficulty)
    const unseen = shuffle(pool.filter((q) => !seenAt.has(q.id)), random)
    const seen = pool.filter((q) => seenAt.has(q.id)).sort((a, b) => seenAt.get(a.id)! - seenAt.get(b.id)!)
    picked.push(...[...unseen, ...seen].slice(0, want))
  }
  return picked
}

function hashString(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * Gates are not daily: each week a learner gets 1 or 2 gates on random days
 * (Mon–Sat), and the pattern differs week to week and learner to learner.
 * Deterministic per (learner, course, week) so it's stable across reloads and
 * devices but can't be predicted from the content.
 */
export function gateDaysForWeek(learnerSeed: string, courseSlug: string, week: number): number[] {
  const random = seededRandom(hashString(`${learnerSeed}:${courseSlug}:${week}`))
  const count = random() < 0.5 ? 1 : 2
  return shuffle([1, 2, 3, 4, 5, 6], random).slice(0, count).sort((a, b) => a - b)
}

function normalise(text: string, { accents, caseSensitive }: { accents: boolean; caseSensitive: boolean }): string {
  let out = text.trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '').replace(/[’`]/g, "'")
  if (!caseSensitive) out = out.toLowerCase()
  if (!accents) out = out.normalize('NFD').replace(/[̀-ͯ]/g, '')
  return out
}

export type Response = number | number[] | boolean | string | string[]

export type Marked = {
  correct: boolean
  /** Typed answer right except for accents (counted correct when accents are lenient). */
  accentSlip?: boolean
}

export function markAnswer(question: Question, response: Response | undefined): Marked {
  if (response === undefined) return { correct: false } // unanswered or timed out
  switch (question.type) {
    case 'mcq':
      return { correct: response === question.answer }
    case 'multi': {
      const given = new Set(response as number[])
      return { correct: given.size === question.answers.length && question.answers.every((a) => given.has(a)) }
    }
    case 'truefalse':
      return { correct: response === question.answer }
    case 'text': {
      const caseSensitive = question.case === 'strict'
      const exact = question.accept.some((a) => normalise(a, { accents: true, caseSensitive }) === normalise(String(response), { accents: true, caseSensitive }))
      if (exact) return { correct: true }
      const loose = question.accept.some((a) => normalise(a, { accents: false, caseSensitive }) === normalise(String(response), { accents: false, caseSensitive }))
      if (!loose) return { correct: false }
      return { correct: question.accents !== 'strict', accentSlip: true }
    }
    case 'order':
      return { correct: Array.isArray(response) && response.length === question.items.length && response.every((item, i) => item === question.items[i]) }
    case 'match': {
      // response: the right-hand values in the order of the left-hand items
      const given = response as string[]
      return { correct: Array.isArray(given) && question.pairs.every(([, right], i) => given[i] === right) }
    }
  }
}

export type Result = { score: number; correct: number; total: number; passed: boolean }

export function gradeAttempt(questions: Question[], responses: Record<string, Response | undefined>, rules: QuizRules = DEFAULT_QUIZ_RULES): Result {
  const correct = questions.filter((q) => markAnswer(q, responses[q.id]).correct).length
  const score = questions.length ? correct / questions.length : 0
  return { score, correct, total: questions.length, passed: score >= rules.passMark }
}

export type GateAttempt = { finishedAt: Date; passed: boolean }

export type GateStatus =
  | { kind: 'passed' }
  | { kind: 'open'; attempt: number }
  /** Failed: everything stays locked until `until`. */
  | { kind: 'cooldown'; until: Date; attempt: number }

export function gateStatus(attempts: GateAttempt[], now: Date, rules: QuizRules = DEFAULT_QUIZ_RULES): GateStatus {
  if (attempts.some((a) => a.passed)) return { kind: 'passed' }
  const last = attempts.at(-1)
  const next = attempts.length + 1
  if (!last) return { kind: 'open', attempt: 1 }
  const until = new Date(last.finishedAt.getTime() + rules.cooldownMinutes * 60_000)
  return now < until ? { kind: 'cooldown', until, attempt: next } : { kind: 'open', attempt: next }
}

/** The dashboard and all learning materials unlock only when today's gate is passed. */
export const isLocked = (status: GateStatus) => status.kind !== 'passed'
