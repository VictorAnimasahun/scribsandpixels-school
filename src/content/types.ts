export type ResourceKind = 'video' | 'reading' | 'interactive' | 'book' | 'practice'

export type Resource = {
  title: string
  url: string
  kind: ResourceKind
  note?: string
}

export type BlockKind = 'review' | 'lesson' | 'practice' | 'mini-task' | 'project' | 'freecodecamp' | 'log' | 'other'

export type Block = {
  /** Stable within a day; progress rows are keyed on it. */
  key: string
  kind: BlockKind
  title: string
  minutes: number
  /** Markdown. */
  body: string
}

export type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

export type Day = {
  /** 1–6, Monday to Saturday. */
  number: number
  weekday: Weekday
  topic: string
  hours: number
  blocks: Block[]
}

export type QuizQuestion = {
  id: string
  prompt: string
}

export type Week = {
  number: number
  title: string
  theme: string
  bigQuestion: string
  resources: Resource[]
  days: Day[]
  quiz: QuizQuestion[]
  /** How to pass the quiz, shown under it. */
  quizNote?: string
}

/** Every week has an outline; only written weeks have a full `Week`. */
export type WeekOutline = {
  number: number
  phase: number
  title?: string
  topics: string[]
}

export type Phase = {
  number: number
  title: string
  focus: string
  firstWeek: number
  lastWeek: number
  topics: string[]
  milestone: string
  resources: Resource[]
  /** Extra phase guidance, e.g. early job applications or Canadian market prep. */
  notes: { heading: string; items: string[] }[]
  /** Week → chapter/topic mapping for a core book, if the phase follows one. */
  readingPlan?: { week: number; chapter: string; topic: string }[]
}

export type DailyBlockPlan = {
  kind: BlockKind
  label: string
  minutes: number
  description: string
}

export type Course = {
  slug: string
  title: string
  designedFor: string
  goal: string
  totalWeeks: number
  dailyStructure: DailyBlockPlan[]
  sunday: string
  rules: { title: string; detail: string }[]
  resources: (Resource & { usedIn: string })[]
  phases: Phase[]
  outlines: WeekOutline[]
  weeks: Week[]
}
