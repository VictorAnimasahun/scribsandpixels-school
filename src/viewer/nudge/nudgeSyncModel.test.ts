import { describe, expect, it } from 'vitest'
import { presetTracker, type Tracker } from '../../domain/nudge/trackers.ts'
import { applyNudgeSynced, diffNudge, EMPTY_NUDGE, isEmptyNudge, mergeNudge, nudgeFromRows, nudgeSyncedPart, sameNudge, sameTracker, trackerRow, type NudgeSynced } from './nudgeSyncModel.ts'
import { sanitiseNudge } from './nudgeStore.ts'

const water = presetTracker('water', 0, true)
const steps: Tracker = { id: 'c-steps001', name: 'Steps', kind: 'count', unit: 'steps', target: { direction: 'atLeast', value: 8000, per: 'day' }, preset: null, order: 9, enabled: true, reminderHour: 21 }
const state = (trackers: Tracker[], entries: Record<string, number> = {}): NudgeSynced => ({ trackers: Object.fromEntries(trackers.map((t) => [t.id, t])), entries })

describe('shape', () => {
  it('flattens entries and back, dropping entries of trackers that are gone', () => {
    const s = { ...sanitiseNudge(null), trackers: [water], entries: { water: { '2026-10-26': 6 } } }
    const synced = nudgeSyncedPart(s)
    expect(synced.entries).toEqual({ 'water|2026-10-26': 6 })
    expect(applyNudgeSynced(s, { ...synced, entries: { ...synced.entries, 'ghost|2026-10-26': 1 } }).entries).toEqual({ water: { '2026-10-26': 6 } })
  })
  it('compares trackers by value, not by how their fields happen to be ordered', () => {
    const reordered = JSON.parse(JSON.stringify({ reminderHour: water.reminderHour, enabled: water.enabled, order: water.order, preset: water.preset, target: water.target, unit: water.unit, kind: water.kind, name: water.name, id: water.id }))
    expect(JSON.stringify(reordered)).not.toBe(JSON.stringify(water))
    expect(sameTracker(reordered, water)).toBe(true)
    expect(sameTracker({ ...water, target: { ...water.target!, value: 9 } }, water)).toBe(false)
  })
})

describe('mergeNudge', () => {
  const base = state([water], { 'water|2026-10-26': 6 })
  it('keeps changes from both devices', () => {
    const laptop = state([water], { 'water|2026-10-26': 6, 'water|2026-10-27': 3 })
    const phone = state([water, steps], { 'water|2026-10-26': 6, 'c-steps001|2026-10-27': 9000 })
    expect(mergeNudge(base, laptop, phone)).toEqual(state([water, steps], { 'water|2026-10-26': 6, 'water|2026-10-27': 3, 'c-steps001|2026-10-27': 9000 }))
  })
  it('lets an un-log on either device stick (the other still has the old value)', () => {
    expect(mergeNudge(base, state([water]), base).entries).toEqual({})
    expect(mergeNudge(base, base, state([water])).entries).toEqual({})
  })
  it('a goal changed on another device arrives; this device wins only when both changed it', () => {
    const phoneGoal = { ...water, target: { ...water.target!, value: 10 } }
    expect(mergeNudge(base, base, state([phoneGoal], base.entries)).trackers.water.target!.value).toBe(10)
    const laptopGoal = { ...water, target: { ...water.target!, value: 12 } }
    expect(mergeNudge(base, state([laptopGoal], base.entries), state([phoneGoal], base.entries)).trackers.water.target!.value).toBe(12)
  })
  it('a tracker deleted elsewhere takes the entries logged here with it', () => {
    const b = state([water, steps], { 'c-steps001|2026-10-26': 8000 })
    const here = state([water, steps], { 'c-steps001|2026-10-26': 8000, 'c-steps001|2026-10-27': 9500 })
    const there = state([water])
    const merged = mergeNudge(b, here, there)
    expect(merged.trackers['c-steps001']).toBeUndefined()
    expect(merged.entries).toEqual({})
  })
})

describe('diffNudge', () => {
  it('writes only what changed, trackers before their entries', () => {
    const before = state([water], { 'water|2026-10-26': 6 })
    const after = state([water, steps], { 'water|2026-10-26': 7, 'c-steps001|2026-10-27': 9000 })
    const ops = diffNudge(before, after)
    expect(ops.trackersUpsert.map((r) => r.tracker_id)).toEqual(['c-steps001'])
    expect(ops.entriesUpsert).toEqual([{ tracker_id: 'water', logged_on: '2026-10-26', value: 7 }, { tracker_id: 'c-steps001', logged_on: '2026-10-27', value: 9000 }])
    expect(ops.trackersDelete).toEqual([])
    expect(isEmptyNudge(diffNudge(after, after))).toBe(true)
  })
  it('deletes an un-logged day, and a deleted tracker without listing its entries (the server cascades)', () => {
    const before = state([water, steps], { 'water|2026-10-26': 6, 'c-steps001|2026-10-26': 8000 })
    const ops = diffNudge(before, state([water]))
    expect(ops.entriesDelete).toEqual([{ tracker_id: 'water', logged_on: '2026-10-26' }])
    expect(ops.trackersDelete).toEqual(['c-steps001'])
  })
  it('never sends a row the server would refuse', () => {
    const bad = { ...steps, id: 'c-bad00000', name: '' }
    const ops = diffNudge(EMPTY_NUDGE, state([bad, water], { 'water|yesterday': 2, 'water|2026-10-27': 2.5 }))
    expect(ops.trackersUpsert.map((r) => r.tracker_id)).toEqual(['water'])
    expect(ops.entriesUpsert).toEqual([]) // not a date; a count of 2.5
  })
})

describe('rows', () => {
  it('round-trip: state → rows → state', () => {
    const s = state([water, steps], { 'water|2026-10-26': 6, 'c-steps001|2026-10-26': 9120 })
    const rows = Object.values(s.trackers).map(trackerRow)
    const entries = Object.entries(s.entries).map(([k, value]) => ({ tracker_id: k.split('|')[0], logged_on: k.split('|')[1], value }))
    expect(sameNudge(nudgeFromRows(rows, entries), s)).toBe(true)
    expect(nudgeFromRows(rows, entries).trackers.water.preset).toBe('water')
    expect(nudgeFromRows(rows, entries).trackers['c-steps001'].preset).toBeNull()
  })
  it('trusts rows only as far as their shape', () => {
    const rows = [trackerRow(water), { ...trackerRow(steps), kind: 'feelings' as never }]
    const out = nudgeFromRows(rows, [{ tracker_id: 'water', logged_on: '2026-10-26', value: -3 }, { tracker_id: 'c-steps001', logged_on: '2026-10-26', value: 5 }])
    expect(Object.keys(out.trackers)).toEqual(['water'])
    expect(out.entries).toEqual({})
  })
})
