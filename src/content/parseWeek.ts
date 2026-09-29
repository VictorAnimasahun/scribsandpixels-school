import type { Block, BlockKind, Day, QuizQuestion, Resource, ResourceKind, Week, Weekday } from './types.ts'

/*
 * Parses one week of course content from markdown. The format (see
 * src/content/README.md) is deliberately plain so weeks drafted in a chat
 * can be pasted in as-is:
 *
 *   # Week N — Title
 *   **Theme:** …   **Big question:** …
 *   ## Resources        (table: | emoji | [title](url) | how to use it |)
 *   ## Day N — Weekday  (**Topic:** …  **Time:** ~2.5 hours, then ### blocks)
 *   ## Quiz             (numbered list, optional trailing note)
 */

const WEEKDAYS: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const RESOURCE_KINDS: Record<string, ResourceKind> = {
  '📺': 'video',
  '📗': 'reading',
  '📕': 'book',
  '🌐': 'interactive',
  '🧩': 'practice',
  '🎧': 'audio',
  '🔊': 'interactive',
  '📊': 'dataset',
}

const DEFAULT_MINUTES: Record<BlockKind, number> = {
  review: 30,
  lesson: 45,
  practice: 45,
  'mini-task': 30,
  project: 120,
  freecodecamp: 30,
  log: 10,
  other: 0,
}

type Section = { heading: string; line: number; lines: string[] }

export class ContentError extends Error {
  constructor(source: string, line: number, message: string) {
    super(`${source}:${line}: ${message}`)
    this.name = 'ContentError'
  }
}

/** Splits on headings of exactly `level` #'s, ignoring anything inside code fences. */
function splitSections(lines: string[], level: number, offset: number): { preamble: string[]; sections: Section[] } {
  const marker = '#'.repeat(level) + ' '
  const preamble: string[] = []
  const sections: Section[] = []
  let inFence = false
  lines.forEach((line, index) => {
    if (line.trimStart().startsWith('```')) inFence = !inFence
    if (!inFence && line.startsWith(marker)) {
      sections.push({ heading: line.slice(marker.length).trim(), line: offset + index + 1, lines: [] })
    } else if (sections.length) {
      sections[sections.length - 1].lines.push(line)
    } else {
      preamble.push(line)
    }
  })
  return { preamble, sections }
}

function field(lines: string[], name: string): string | undefined {
  const prefix = `**${name}:**`
  const line = lines.find((l) => l.trim().startsWith(prefix))
  return line?.trim().slice(prefix.length).trim()
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function trimBlankLines(lines: string[]): string {
  return lines.join('\n').replace(/^\s*\n/, '').trimEnd()
}

function parseResources(lines: string[], source: string, line: number): Resource[] {
  return lines
    .filter((l) => l.trim().startsWith('|') && !/^\|\s*-/.test(l.trim()))
    .map((row) => row.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
    .filter(([, title]) => title && title !== 'Resource')
    .map(([emoji, titleCell, note]) => {
      const link = titleCell.match(/\[(.+?)\]\((.+?)\)/)
      const title = link ? link[1] : titleCell.replace(/^\*+|\*+$/g, '').trim()
      if (!title) throw new ContentError(source, line, 'resource row has no title')
      return { kind: RESOURCE_KINDS[emoji] ?? 'reading', title, ...(link ? { url: link[2] } : {}), ...(note ? { note } : {}) }
    })
}

function blockKind(title: string): BlockKind {
  const t = title.toLowerCase()
  if (t.startsWith('review')) return 'review'
  if (t.startsWith('lesson')) return 'lesson'
  if (t.startsWith('practice')) return 'practice'
  if (t.startsWith('mini-task') || t.startsWith('mini task')) return 'mini-task'
  if (t.includes('project')) return 'project'
  if (t.startsWith('freecodecamp')) return 'freecodecamp'
  if (t.startsWith('log')) return 'log'
  return 'other'
}

function parseBlocks(sections: Section[]): Block[] {
  const seen = new Map<string, number>()
  return sections.map((section) => {
    const duration = section.heading.match(/\((\d+(?:\.\d+)?)\s*(min|mins|minutes|hour|hours)\)\s*$/i)
    const title = duration ? section.heading.slice(0, duration.index).trim() : section.heading
    const kind = blockKind(title)
    const minutes = duration
      ? Math.round(Number(duration[1]) * (duration[2].toLowerCase().startsWith('h') ? 60 : 1))
      : DEFAULT_MINUTES[kind]
    const base = kind === 'other' ? slug(title) : kind
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return { key: count === 1 ? base : `${base}-${count}`, kind, title, minutes, body: trimBlankLines(section.lines) }
  })
}

function parseDay(section: Section, source: string): Day {
  const heading = section.heading.match(/^Day\s+(\d+)\s*[—–-]\s*(\w+)$/i)
  if (!heading) throw new ContentError(source, section.line, `expected "Day N — Weekday", got "${section.heading}"`)
  const number = Number(heading[1])
  const weekday = WEEKDAYS.find((d) => d.toLowerCase() === heading[2].toLowerCase())
  if (!weekday || WEEKDAYS.indexOf(weekday) !== number - 1) {
    throw new ContentError(source, section.line, `Day ${number} must be ${WEEKDAYS[number - 1] ?? 'Monday–Saturday'}`)
  }
  const { preamble, sections } = splitSections(section.lines, 3, section.line)
  const topic = field(preamble, 'Topic')
  if (!topic) throw new ContentError(source, section.line, `Day ${number} is missing **Topic:**`)
  const hours = Number(field(preamble, 'Time')?.match(/\d+(\.\d+)?/)?.[0] ?? 2.5)
  const blocks = parseBlocks(sections)
  if (!blocks.length) throw new ContentError(source, section.line, `Day ${number} has no ### blocks`)
  return { number, weekday, topic, hours, blocks }
}

function parseQuiz(lines: string[], weekNumber: number): { quiz: QuizQuestion[]; quizNote?: string } {
  const quiz: QuizQuestion[] = []
  const rest: string[] = []
  for (const line of lines) {
    const item = line.match(/^\d+\.\s+(.+)$/)
    if (item) quiz.push({ id: `w${weekNumber}q${quiz.length + 1}`, prompt: item[1].trim() })
    else if (quiz.length) rest.push(line)
  }
  const quizNote = trimBlankLines(rest)
  return quizNote ? { quiz, quizNote } : { quiz }
}

export function parseWeek(markdown: string, source = 'week.md'): Week {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const top = splitSections(lines, 1, 0).sections
  if (top.length !== 1) throw new ContentError(source, 1, 'expected exactly one "# Week N — Title" heading')
  const heading = top[0].heading.match(/^Week\s+(\d+)\s*[—–-]\s*(.+)$/i)
  if (!heading) throw new ContentError(source, top[0].line, `expected "# Week N — Title", got "${top[0].heading}"`)
  const number = Number(heading[1])
  const title = heading[2].replace(/^["“]|["”]$/g, '').trim()

  const { preamble, sections } = splitSections(top[0].lines, 2, top[0].line)
  const theme = field(preamble, 'Theme') ?? ''
  const bigQuestion = (field(preamble, 'Big question') ?? '').replace(/^\*|\*$/g, '')

  let resources: Resource[] = []
  let quizPart: ReturnType<typeof parseQuiz> = { quiz: [] }
  const days: Day[] = []
  for (const section of sections) {
    if (/^resources$/i.test(section.heading)) resources = parseResources(section.lines, source, section.line)
    else if (/^quiz$/i.test(section.heading)) quizPart = parseQuiz(section.lines, number)
    else if (/^day\b/i.test(section.heading)) days.push(parseDay(section, source))
    else throw new ContentError(source, section.line, `unknown section "## ${section.heading}"`)
  }

  const numbers = days.map((d) => d.number)
  if (new Set(numbers).size !== numbers.length) throw new ContentError(source, 1, `duplicate day in Week ${number}`)
  days.sort((a, b) => a.number - b.number)

  return { number, title, theme, bigQuestion, resources, days, ...quizPart }
}
