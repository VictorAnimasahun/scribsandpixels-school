import { parse } from 'yaml'

/*
 * Sandboxes: hands-on playgrounds native to each subject. One YAML file per
 * sandbox in courses/<slug>/sandboxes/. A sandbox with `main: true` is the
 * course's free-play resource; any lesson block can embed one with a line
 * `::sandbox <id>`. Format and authoring rules: src/content/SANDBOXES.md.
 */

// ── French (and any language): phrase builder ──────────────────────────────
export type PhraseOption = {
  /** The French that goes into the phrase. */
  text: string
  /** What the tile shows, when it must differ from `text` (e.g. "Je (a man)"). */
  label?: string
  /** English gloss shown under the tile. */
  en?: string
  tags?: string[]
  /** Agreement: the option chosen in slot <id> must carry these tags ("a|b" = either). */
  needs?: Record<string, string[]>
  /** Shown when a `needs` rule fails. */
  why?: string
}
export type PhraseSlot = { id: string; fixed: string } | { id: string; label?: string; options: PhraseOption[] }
export type PhrasePattern = { id: string; label: string; slots: PhraseSlot[] }
export type PhraseChallenge = { prompt: string; pattern: string; answer: Record<string, string> }

// ── Excel: mini spreadsheet ────────────────────────────────────────────────
export type SheetTask = {
  prompt: string
  cell: string
  expect: number | string
  /** Allowed difference for numbers (default 0.01). */
  tolerance?: number
  /** The cell must contain a formula, not a typed number. */
  formula?: boolean
  /** Text the formula must contain (case and spaces ignored), e.g. ["$R$1"] to require an absolute reference. */
  mustUse?: string[]
  hint?: string
  /** Model answer formula; defaults to `hint` when that is a formula. Tests prove it gives `expect`. */
  solution?: string
  /** Model answer that fills whole columns (column → template with {r}) over the dataset rows. */
  solutionFill?: Record<string, string>
}
export type SheetDataset = { file: 'sales_2025' | 'products' | 'employees'; rows: number; columns: string[] }

// ── Programming: Python + web ──────────────────────────────────────────────
export type PythonTask = {
  prompt: string
  /** Lines fed to input(), in order. */
  stdin?: string[]
  /** Every line must appear in the output. */
  expectOutput?: string[]
  /** Python asserts run after the learner's code, in the same namespace. */
  tests?: string
  hint?: string
}

// ── Web: HTML / CSS / JS ───────────────────────────────────────────────────
export type WebTask = {
  prompt: string
  /** A JavaScript expression evaluated inside the preview page; truthy = done. */
  check: string
  hint?: string
}

type Base = { id: string; title: string; description?: string; main?: boolean }

export type Sandbox =
  | (Base & { kind: 'phrases'; voice?: string; include?: string[]; patterns: PhrasePattern[]; challenges?: PhraseChallenge[] })
  | (Base & {
      kind: 'sheet'
      dataset?: SheetDataset
      cells?: Record<string, string | number>
      /** Column letter → formula template filled down every dataset row; {r} is the row number. */
      formulaFill?: Record<string, string>
      cols?: number
      rows?: number
      tasks?: SheetTask[]
    })
  | (Base & { kind: 'python'; starter?: string; tasks?: PythonTask[] })
  | (Base & { kind: 'web'; html?: string; css?: string; js?: string; tasks?: WebTask[] })

export class SandboxError extends Error {
  constructor(source: string, message: string) {
    super(`${source}: ${message}`)
    this.name = 'SandboxError'
  }
}

const hasTags = (option: PhraseOption | undefined, needed: string[]) =>
  !!option && needed.every((alternatives) => alternatives.split('|').some((tag) => option.tags?.includes(tag)))

/** Which `needs` rules fail for a set of chosen options (slot id → option). */
export function agreementProblems(pattern: PhrasePattern, chosen: Record<string, PhraseOption | undefined>): { slot: string; message: string }[] {
  const problems: { slot: string; message: string }[] = []
  for (const slot of pattern.slots) {
    const option = chosen[slot.id]
    if (!option?.needs) continue
    for (const [otherId, needed] of Object.entries(option.needs)) {
      const other = chosen[otherId]
      if (other && !hasTags(other, needed)) problems.push({ slot: slot.id, message: option.why ?? `"${option.text}" doesn't agree with "${other.text}".` })
    }
  }
  return problems
}

export function validateSandbox(sandbox: Sandbox, source: string): Sandbox {
  const fail = (message: string): never => {
    throw new SandboxError(source, message)
  }
  if (!sandbox?.id || !sandbox.title) fail('needs id and title')
  switch (sandbox.kind) {
    case 'phrases': {
      if (!sandbox.patterns?.length && !sandbox.include?.length) fail('phrases sandbox needs patterns or include')
      for (const pattern of sandbox.patterns ?? []) {
        const ids = pattern.slots.map((s) => s.id)
        if (new Set(ids).size !== ids.length) fail(`${pattern.id}: duplicate slot ids`)
        const allTags = new Map(pattern.slots.map((s) => [s.id, new Set('options' in s ? s.options.flatMap((o) => o.tags ?? []) : [])]))
        for (const slot of pattern.slots) {
          if (!('options' in slot)) continue
          if (!slot.options.length) fail(`${pattern.id}.${slot.id}: no options`)
          for (const option of slot.options) {
            for (const [otherId, needed] of Object.entries(option.needs ?? {})) {
              if (!allTags.has(otherId)) fail(`${pattern.id}: "${option.text}" needs unknown slot ${otherId}`)
              for (const tag of needed.flatMap((t) => t.split('|'))) if (!allTags.get(otherId)!.has(tag)) fail(`${pattern.id}: "${option.text}" needs tag ${tag} that no option in ${otherId} has`)
            }
          }
        }
      }
      for (const challenge of sandbox.challenges ?? []) {
        const pattern = sandbox.patterns?.find((p) => p.id === challenge.pattern)
        if (!pattern) fail(`challenge "${challenge.prompt}" uses unknown pattern ${challenge.pattern}`)
        const chosen: Record<string, PhraseOption | undefined> = {}
        for (const slot of pattern!.slots) {
          if (!('options' in slot)) continue
          const text = challenge.answer[slot.id]
          const option = slot.options.find((o) => (o.label ?? o.text) === text)
          if (!option) fail(`challenge "${challenge.prompt}": "${text}" isn't an option of slot ${slot.id}`)
          chosen[slot.id] = option
        }
        const problems = agreementProblems(pattern!, chosen)
        if (problems.length) fail(`challenge "${challenge.prompt}" breaks its own rules: ${problems[0].message}`)
      }
      break
    }
    case 'sheet':
      for (const task of sandbox.tasks ?? []) {
        if (!/^[A-Z]+\d+$/.test(task.cell)) fail(`task "${task.prompt}": bad cell ${task.cell}`)
        if (task.expect === undefined) fail(`task "${task.prompt}": needs expect`)
      }
      break
    case 'python':
      for (const task of sandbox.tasks ?? []) if (!task.expectOutput?.length && !task.tests) fail(`task "${task.prompt}": needs expectOutput or tests`)
      break
    case 'web':
      for (const task of sandbox.tasks ?? []) {
        if (!task.check) fail(`task "${task.prompt}": needs a check expression`)
        try {
          new Function(`return (${task.check})`)
        } catch (e) {
          fail(`task "${task.prompt}": check isn't valid JavaScript (${(e as Error).message})`)
        }
      }
      break
    default:
      fail(`unknown kind ${(sandbox as { kind: string }).kind}`)
  }
  return sandbox
}

export function parseSandbox(yamlText: string, source = 'sandbox.yaml'): Sandbox {
  return validateSandbox(parse(yamlText) as Sandbox, source)
}

// ── registry ──────────────────────────────────────────────────────────────

const files = import.meta.glob<string>('./courses/*/sandboxes/*.yaml', { query: '?raw', import: 'default', eager: true })

export const sandboxes: (Sandbox & { course: string })[] = Object.entries(files).map(([path, text]) => ({
  ...parseSandbox(text, path),
  course: path.split('/')[2],
}))

export const findSandbox = (id: string) => sandboxes.find((s) => s.id === id)

/** A phrases sandbox with its `include`d patterns and challenges merged in. */
export function resolvePhrases(id: string): Extract<Sandbox, { kind: 'phrases' }> | undefined {
  const sandbox = findSandbox(id)
  if (!sandbox || sandbox.kind !== 'phrases') return undefined
  const included = (sandbox.include ?? []).map(resolvePhrases).filter((s) => s !== undefined)
  return {
    ...sandbox,
    patterns: [...(sandbox.patterns ?? []), ...included.flatMap((s) => s.patterns)],
    challenges: [...(sandbox.challenges ?? []), ...included.flatMap((s) => s.challenges ?? [])],
  }
}

/** `::sandbox <id>` lines in a lesson body. */
export const SANDBOX_EMBED = /^::sandbox ([\w-]+)\s*$/m
