import { parse } from 'yaml'

/*
 * Daily quizzes, one YAML file per week: courses/<slug>/quizzes/week-NN.yaml.
 * The format and the rules (gates, cooldowns, banks) are documented in
 * src/content/QUIZZES.md. validateQuizWeek() enforces them; `npm test` runs it
 * on every file so a broken bank never reaches a learner.
 */

export type Difficulty = 'easy' | 'medium' | 'hard'

type Base = {
  id: string
  difficulty: Difficulty
  prompt: string
  /** Shown after answering. */
  explain?: string
}

export type Question =
  | (Base & { type: 'mcq'; choices: string[]; answer: number })
  | (Base & { type: 'multi'; choices: string[]; answers: number[] })
  | (Base & { type: 'truefalse'; answer: boolean })
  /** Typed answer. `accept` lists every correct form; the first is the one shown as the model answer. */
  | (Base & { type: 'text'; accept: string[]; accents?: 'strict' | 'lenient'; case?: 'strict' | 'lenient' })
  /** Put the items in the right order (items are listed in the correct order; the app shuffles them). */
  | (Base & { type: 'order'; items: string[] })
  /** Match left to right (pairs listed correctly; the app shuffles the right side). */
  | (Base & { type: 'match'; pairs: [string, string][] })

export type Blueprint = Record<Difficulty, number>

/** Pops up before the day's lesson; blocks everything until passed. */
export type GateQuiz = {
  title: string
  /** What it tests, e.g. "Week 1 · Day 2: alphabet and accents". */
  covers: string
  /** How many questions of each difficulty one attempt draws. */
  blueprint: Blueprint
  bank: Question[]
}

export type DayQuiz = {
  kind: 'rapid-fire' | 'brain-teaser' | 'mixed'
  title: string
  /** Rapid-fire only: time per question. */
  secondsPerQuestion?: number
  questions: Question[]
}

export type QuizDay = {
  day: number
  gate?: GateQuiz
  quizzes: DayQuiz[]
}

export type QuizWeek = {
  week: number
  days: QuizDay[]
}

export type QuizRules = {
  passMark: number
  cooldownMinutes: number
  /** A bank must hold at least this many attempts' worth of unseen questions per difficulty. */
  minAttemptsPerBank: number
}

export const DEFAULT_QUIZ_RULES: QuizRules = { passMark: 0.7, cooldownMinutes: 60, minAttemptsPerBank: 3 }

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export class QuizError extends Error {
  constructor(source: string, message: string) {
    super(`${source}: ${message}`)
    this.name = 'QuizError'
  }
}

function checkQuestion(q: Question, where: string, fail: (m: string) => never) {
  const id = q.id
  if (!id) fail(`${where}: question without id`)
  if (!DIFFICULTIES.includes(q.difficulty)) fail(`${id}: difficulty must be easy/medium/hard`)
  if (!q.prompt?.trim()) fail(`${id}: empty prompt`)
  switch (q.type) {
    case 'mcq':
      if (!Array.isArray(q.choices) || q.choices.length < 2) fail(`${id}: mcq needs 2+ choices`)
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) fail(`${id}: answer index out of range`)
      if (new Set(q.choices).size !== q.choices.length) fail(`${id}: duplicate choices`)
      break
    case 'multi':
      if (!Array.isArray(q.choices) || q.choices.length < 3) fail(`${id}: multi needs 3+ choices`)
      if (!q.answers?.length || q.answers.some((a) => !Number.isInteger(a) || a < 0 || a >= q.choices.length)) fail(`${id}: bad answers`)
      break
    case 'truefalse':
      if (typeof q.answer !== 'boolean') fail(`${id}: truefalse answer must be true/false`)
      break
    case 'text':
      if (!q.accept?.length || q.accept.some((a) => typeof a !== 'string' || !a.trim())) fail(`${id}: text needs accept answers`)
      break
    case 'order':
      if (!q.items || q.items.length < 3) fail(`${id}: order needs 3+ items`)
      break
    case 'match':
      if (!q.pairs || q.pairs.length < 3 || q.pairs.some((p) => !Array.isArray(p) || p.length !== 2)) fail(`${id}: match needs 3+ [left, right] pairs`)
      break
    default:
      fail(`${id}: unknown type "${(q as unknown as { type: string }).type}"`)
  }
}

export function validateQuizWeek(week: QuizWeek, source: string, rules: QuizRules = DEFAULT_QUIZ_RULES): QuizWeek {
  const fail = (message: string): never => {
    throw new QuizError(source, message)
  }
  if (!Number.isInteger(week?.week)) fail('missing week number')
  if (!Array.isArray(week.days)) fail('missing days')
  const ids = new Set<string>()
  const track = (q: Question) => {
    if (ids.has(q.id)) fail(`duplicate question id ${q.id}`)
    ids.add(q.id)
  }

  for (const day of week.days) {
    const where = `day ${day.day}`
    if (!Number.isInteger(day.day) || day.day < 1 || day.day > 6) fail(`${where}: day must be 1–6`)
    if (!day.quizzes?.length) fail(`${where}: needs at least one day quiz`)
    if (day.gate) {
      const { blueprint, bank } = day.gate
      if (!day.gate.title || !day.gate.covers) fail(`${where}: gate needs title and covers`)
      for (const d of DIFFICULTIES) {
        const need = (blueprint?.[d] ?? 0) * rules.minAttemptsPerBank
        const have = bank.filter((q) => q.difficulty === d).length
        if (have < need) fail(`${where}: gate bank has ${have} ${d} questions, needs ${need} (${rules.minAttemptsPerBank} attempts × ${blueprint[d]})`)
      }
      if (DIFFICULTIES.reduce((n, d) => n + (blueprint[d] ?? 0), 0) < 5) fail(`${where}: a gate attempt needs at least 5 questions`)
      bank.forEach((q) => { checkQuestion(q, where, fail); track(q) })
    }
    for (const quiz of day.quizzes) {
      if (!['rapid-fire', 'brain-teaser', 'mixed'].includes(quiz.kind)) fail(`${where}: unknown quiz kind ${quiz.kind}`)
      if (quiz.kind === 'rapid-fire' && !quiz.secondsPerQuestion) fail(`${where}: rapid-fire needs secondsPerQuestion`)
      if (!quiz.questions?.length) fail(`${where}: empty quiz "${quiz.title}"`)
      quiz.questions.forEach((q) => { checkQuestion(q, where, fail); track(q) })
    }
  }
  return week
}

export function parseQuizWeek(yamlText: string, source = 'quiz.yaml'): QuizWeek {
  return validateQuizWeek(parse(yamlText) as QuizWeek, source)
}
