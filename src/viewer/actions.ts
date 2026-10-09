import type { ResourceKind } from '../content/types.ts'
import { localDate } from '../domain/streak.ts'
import { update } from './store.ts'
import { blockKey } from './today.ts'
import type { IconName } from './ui.tsx'

export const resourceIcon = (kind: ResourceKind): IconName =>
  kind === 'video' || kind === 'audio' ? 'play' : kind === 'reading' || kind === 'book' ? 'book' : kind === 'dataset' ? 'table' : 'code'

const timeZone = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos' } catch { return 'Africa/Lagos' }
}

export const todayDate = () => localDate(new Date(), timeZone())

/** Tick or untick a block. Ticking also records today as a study day (the streak is built from those). */
export function setBlockDone(slug: string, week: number, day: number, block: string, done: boolean) {
  const key = blockKey(slug, week, day, block)
  update((s) => {
    const checked = { ...s.checked }
    if (done) checked[key] = true
    else delete checked[key]
    return { ...s, checked, studied: done ? { ...s.studied, [todayDate()]: true } : s.studied }
  })
}
