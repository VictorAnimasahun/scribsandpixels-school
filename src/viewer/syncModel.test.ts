import { describe, expect, it } from 'vitest'
import type { GateRecord } from './store.ts'
import { blockRow, diff, EMPTY, fromRows, isEmpty, merge, mergeRecord, sameSynced, type Synced } from './syncModel.ts'

const s = (over: Partial<Synced>): Synced => ({ ...EMPTY, ...over })
const ticks = (...keys: string[]) => Object.fromEntries(keys.map((k) => [k, true as const]))
const noDays = () => new Set<string>()
const attempt = (finishedAt: number, passed: boolean, score: number) => ({ finishedAt, passed, score })
const gate = (over: Partial<GateRecord> = {}): GateRecord => ({ triggeredAt: 1000, attempts: [], seen: [], ...over })

describe('merge', () => {
  it('first sign-in: progress made before signing in joins what the account already has', () => {
    const local = s({ checked: ticks('french:1:1:review'), studied: ticks('2026-10-14'), startedOn: { french: '2026-10-12' } })
    const remote = s({ checked: ticks('excel:1:1:lesson'), studied: ticks('2026-10-13'), startedOn: { excel: '2026-09-01' } })
    const m = merge(EMPTY, local, remote)
    expect(Object.keys(m.checked).sort()).toEqual(['excel:1:1:lesson', 'french:1:1:review'])
    expect(Object.keys(m.studied).sort()).toEqual(['2026-10-13', '2026-10-14'])
    expect(m.startedOn).toEqual({ french: '2026-10-12', excel: '2026-09-01' })
  })

  it('an untick on this device survives, even though the server still has the tick', () => {
    const base = s({ checked: ticks('a:1:1:review', 'a:1:1:lesson') })
    const local = s({ checked: ticks('a:1:1:review') }) // unticked lesson here
    const remote = base
    expect(merge(base, local, remote).checked).toEqual(ticks('a:1:1:review'))
  })

  it("another device's untick and this device's new tick both survive", () => {
    const base = s({ checked: ticks('a:1:1:review', 'a:1:1:lesson') })
    const local = s({ checked: ticks('a:1:1:review', 'a:1:1:lesson', 'a:1:1:practice') })
    const remote = s({ checked: ticks('a:1:1:review') })
    expect(Object.keys(merge(base, local, remote).checked).sort()).toEqual(['a:1:1:practice', 'a:1:1:review'])
  })

  it('best scores keep the higher one when both devices improved', () => {
    const base = s({ bestScores: { q: 0.5 } })
    expect(merge(base, s({ bestScores: { q: 0.7 } }), s({ bestScores: { q: 0.9 } })).bestScores).toEqual({ q: 0.9 })
    expect(merge(base, s({ bestScores: { q: 0.95 } }), s({ bestScores: { q: 0.9 } })).bestScores).toEqual({ q: 0.95 })
  })

  it('a re-plan on this device wins over an unchanged server; a re-plan elsewhere arrives here', () => {
    const base = s({ startedOn: { french: '2026-06-01' } })
    expect(merge(base, s({ startedOn: { french: '2026-10-19' } }), base).startedOn).toEqual({ french: '2026-10-19' })
    expect(merge(base, base, s({ startedOn: { french: '2026-10-26' } })).startedOn).toEqual({ french: '2026-10-26' })
  })

  it('the active course follows whichever side changed it', () => {
    const base = s({ activeCourse: 'french' })
    expect(merge(base, s({ activeCourse: 'excel' }), base).activeCourse).toBe('excel')
    expect(merge(base, base, s({ activeCourse: 'fullstack-ml' })).activeCourse).toBe('fullstack-ml')
  })
})

describe('mergeRecord (checkpoints and week quizzes)', () => {
  it('a result finished here replaces the provisional fail the server holds', () => {
    const remote = gate({ attempts: [attempt(2000, false, 0)] })
    const local = gate({ attempts: [attempt(2600, true, 0.83)] })
    expect(mergeRecord(local, remote)!.attempts).toEqual([attempt(2600, true, 0.83)])
  })

  it("the server's finished result beats this browser's (no undoing a fail with the tester tools)", () => {
    const remote = gate({ attempts: [attempt(2600, false, 0.5)] })
    const local = gate({ attempts: [attempt(0, false, 0.5)] }) // "End cooldown now" zeroes finishedAt
    expect(mergeRecord(local, remote)!.attempts).toEqual([attempt(2600, false, 0.5)])
  })

  it('attempts from both sides are kept, by number; seen keeps the server order then new ids', () => {
    const remote = gate({ triggeredAt: 1000, attempts: [attempt(2000, false, 0.4)], seen: ['q1', 'q2'] })
    const local = gate({ triggeredAt: 900, attempts: [attempt(2000, false, 0.4), attempt(9000, true, 0.9)], seen: ['q1', 'q2', 'q3'] })
    const m = mergeRecord(local, remote)!
    expect(m.attempts).toHaveLength(2)
    expect(m.triggeredAt).toBe(900)
    expect(m.seen).toEqual(['q1', 'q2', 'q3'])
  })

  it('a checkpoint only one side has is kept', () => {
    const m = merge(EMPTY, s({ gates: { 'a:1:2': gate() } }), s({ weekQuizzes: { 'a:1': gate() } }))
    expect(Object.keys(m.gates)).toEqual(['a:1:2'])
    expect(Object.keys(m.weekQuizzes)).toEqual(['a:1'])
  })
})

describe('diff', () => {
  it('writes ticks, unticks, study days and finished days', () => {
    const before = s({ checked: ticks('a:1:1:review', 'a:1:1:lesson'), studied: ticks('2026-10-13') })
    const after = s({ checked: ticks('a:1:1:review', 'a:1:2:review'), studied: ticks('2026-10-13', '2026-10-14') })
    const done = (c: Synced['checked']) => new Set(c['a:1:2:review'] ? ['a:1:2'] : c['a:1:1:lesson'] ? ['a:1:1'] : [])
    const ops = diff(before, after, done)
    expect(ops.blocksAdd).toEqual([{ course_slug: 'a', week: 1, day: 2, block_key: 'review' }])
    expect(ops.blocksRemove).toEqual([{ course_slug: 'a', week: 1, day: 1, block_key: 'lesson' }])
    expect(ops.studiedAdd).toEqual(['2026-10-14'])
    expect(ops.daysAdd).toEqual([{ course_slug: 'a', week: 1, day: 2 }])
    expect(ops.daysRemove).toEqual([{ course_slug: 'a', week: 1, day: 1 }])
  })

  it('a started checkpoint inserts a provisional attempt; finishing updates it', () => {
    const started = s({ gates: { 'french:3:2': gate({ attempts: [attempt(2000, false, 0)], seen: ['q1'] }) } })
    const opsStart = diff(EMPTY, started, noDays)
    expect(opsStart.checkpointsUpsert).toHaveLength(1)
    expect(opsStart.attemptsInsert).toEqual([{ kind: 'gate', key: 'french:3:2', attempt: 1, finished_at: new Date(2000).toISOString(), passed: false, score: 0 }])
    const finished = s({ gates: { 'french:3:2': gate({ attempts: [attempt(2600, true, 0.83)], seen: ['q1'] }) } })
    const opsFinish = diff(started, finished, noDays)
    expect(opsFinish.checkpointsUpsert).toHaveLength(0) // nothing about the checkpoint itself changed
    expect(opsFinish.attemptsInsert).toHaveLength(0)
    expect(opsFinish.attemptsUpdate).toEqual([{ kind: 'gate', key: 'french:3:2', attempt: 1, finished_at: new Date(2600).toISOString(), passed: true, score: 0.83 }])
  })

  it('week quizzes go to the same tables with kind "week"', () => {
    const ops = diff(EMPTY, s({ weekQuizzes: { 'excel:4': gate({ attempts: [attempt(1, true, 0.8)] }) } }), noDays)
    expect(ops.checkpointsUpsert[0]).toMatchObject({ kind: 'week', key: 'excel:4' })
    expect(ops.attemptsInsert[0]).toMatchObject({ kind: 'week', key: 'excel:4', attempt: 1, passed: true })
  })

  it('never deletes checkpoints or attempts (a reset keeps them on the server)', () => {
    const before = s({ gates: { 'a:1:1': gate({ attempts: [attempt(1, false, 0.2)] }) } })
    const ops = diff(before, EMPTY, noDays)
    expect(isEmpty(ops)).toBe(true)
  })

  it('skips keys the server would refuse instead of failing the whole save', () => {
    const after = s({
      checked: ticks('bad key', 'a:0:1:review', 'a:1:7:review', 'A:1:1:review', 'a:1:1:review:extra', 'a:1:1:review'),
      studied: ticks('yesterday', '2026-10-14'),
      startedOn: { 'Bad Slug': '2026-10-12', french: 'soon' },
      gates: { 'a:1': gate(), 'a:1:9': gate(), 'a:1:2': gate() },
    })
    const ops = diff(EMPTY, after, noDays)
    expect(ops.blocksAdd).toEqual([{ course_slug: 'a', week: 1, day: 1, block_key: 'review' }])
    expect(ops.studiedAdd).toEqual(['2026-10-14'])
    expect(ops.enrollUpsert).toEqual([])
    expect(ops.checkpointsUpsert.map((c) => c.key)).toEqual(['a:1:2'])
  })

  it('app settings are written only when they change', () => {
    expect(diff(s({ activeCourse: 'a' }), s({ activeCourse: 'a' }), noDays).appState).toBeNull()
    expect(diff(s({ activeCourse: 'a' }), s({ activeCourse: 'b' }), noDays).appState).toEqual({ activeCourse: 'b', bestScores: {} })
    expect(diff(EMPTY, s({ bestScores: { q: 0.5 } }), noDays).appState).toEqual({ activeCourse: null, bestScores: { q: 0.5 } })
  })

  it('a merge followed by a diff from the server writes exactly the local changes', () => {
    const base = s({ checked: ticks('a:1:1:review') })
    const local = s({ checked: ticks('a:1:1:review', 'a:1:1:lesson') })
    const remote = s({ checked: ticks('a:1:1:review', 'a:1:2:review') })
    const merged = merge(base, local, remote)
    const ops = diff(remote, merged, noDays)
    expect(ops.blocksAdd).toEqual([{ course_slug: 'a', week: 1, day: 1, block_key: 'lesson' }])
    expect(ops.blocksRemove).toEqual([])
  })
})

describe('rows', () => {
  it('round-trips the server rows into the app state', () => {
    const remote = fromRows({
      blocks: [{ course_slug: 'french', week: 3, day: 2, block_key: 'review' }],
      studyDays: [{ studied_on: '2026-10-14' }],
      enrollments: [{ course_slug: 'french', started_on: '2026-10-12' }],
      checkpoints: [{ kind: 'gate', key: 'french:3:2', triggered_at: new Date(1000).toISOString(), seen: ['q1'] }],
      attempts: [
        { kind: 'gate', key: 'french:3:2', attempt: 2, finished_at: new Date(3000).toISOString(), passed: true, score: 0.9 },
        { kind: 'gate', key: 'french:3:2', attempt: 1, finished_at: new Date(2000).toISOString(), passed: false, score: 0.4 },
      ],
      appState: { activeCourse: 'french', bestScores: { q: 0.9, bad: 7 } },
    })
    expect(remote.checked).toEqual(ticks('french:3:2:review'))
    expect(remote.gates['french:3:2'].attempts.map((a) => a.score)).toEqual([0.4, 0.9])
    expect(remote.bestScores).toEqual({ q: 0.9 })
    expect(remote.activeCourse).toBe('french')
    expect(diff(remote, remote, noDays)).toSatisfy(isEmpty)
  })

  it('ignores a malformed app_state', () => {
    for (const appState of [null, 'x', [1], { activeCourse: 5, bestScores: 'no' }]) {
      const r = fromRows({ blocks: [], studyDays: [], enrollments: [], checkpoints: [], attempts: [], appState })
      expect(r.activeCourse).toBeNull()
      expect(r.bestScores).toEqual({})
    }
  })

  it('blockRow parses only well-formed keys', () => {
    expect(blockRow('fullstack-ml:14:6:mini-task')).toEqual({ course_slug: 'fullstack-ml', week: 14, day: 6, block_key: 'mini-task' })
    expect(blockRow('fullstack-ml:14:6')).toBeNull()
  })

  it('sameSynced ignores key order', () => {
    expect(sameSynced(s({ checked: ticks('a', 'b') }), s({ checked: ticks('b', 'a') }))).toBe(true)
    expect(sameSynced(s({ checked: ticks('a') }), s({ checked: ticks('b') }))).toBe(false)
  })
})
