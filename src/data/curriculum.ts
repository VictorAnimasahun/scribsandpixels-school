export type CurriculumStatus = 'done' | 'current' | 'locked'

export type CurriculumItem = {
  id: string
  number: string
  title: string
  description: string
  status: CurriculumStatus
}

export type DailyTask = {
  title: string
  accent: string
  description: string
  duration: string
  category: string
  level: string
  code: string[]
}

export const curriculum: CurriculumItem[] = [
  {
    id: 'web-foundations',
    number: '01',
    title: 'Web foundations',
    description: 'HTML, CSS, the mental model',
    status: 'done',
  },
  {
    id: 'javascript-instincts',
    number: '02',
    title: 'JavaScript instincts',
    description: 'Make pages think and respond',
    status: 'current',
  },
  {
    id: 'frontend-craft',
    number: '03',
    title: 'Frontend craft',
    description: 'React, interfaces, real products',
    status: 'locked',
  },
]

export type IdiomaticExpression = {
  phrase: string
}

export const idiomaticExpressions: IdiomaticExpression[] = [
  {
    phrase: 'colour in',
  },
]
export const dailyTask: DailyTask = {
  title: 'Make the browser',
  accent: 'do something.',
  description:
    'Build your first interactive page with JavaScript. No passive watching today, just one small thing that responds when you touch it.',
  duration: '35 min',
  category: 'Fundamentals',
  level: 'Beginner',
  code: [
    'const button = document',
    ".querySelector('#hello');",
    '',
    'button.addEventListener(',
    "'click', () => {",
    "  button.textContent = 'Hello!'",
    '});',
  ],
}
