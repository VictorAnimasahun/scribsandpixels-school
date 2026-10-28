import { describe, expect, it } from 'vitest'
import { sharedNudge } from './adminNudge.ts'

const B = 'learner-b'
describe('sharedNudge', () => {
  it('summarises each switched-on tracker: days logged this week and the latest value', () => {
    const trackers = [
      { user_id: B, tracker_id: 'sleep', name: 'Sleep', kind: 'duration' as const, unit: 'h', enabled: true, sort_order: 2 },
      { user_id: B, tracker_id: 'water', name: 'Water', kind: 'count' as const, unit: 'cups', enabled: true, sort_order: 1 },
      { user_id: B, tracker_id: 'mood', name: 'Mood', kind: 'scale' as const, unit: '', enabled: false, sort_order: 0 },
    ]
    const entries = [
      { user_id: B, tracker_id: 'water', logged_on: '2026-10-20', value: 9 }, // more than 7 days ago
      { user_id: B, tracker_id: 'water', logged_on: '2026-10-26', value: 6 },
      { user_id: B, tracker_id: 'water', logged_on: '2026-10-27', value: 8 },
      { user_id: B, tracker_id: 'mood', logged_on: '2026-10-27', value: 4 },
    ]
    expect(sharedNudge(trackers, entries, '2026-10-27').get(B)).toEqual([
      { name: 'Water', daysLogged: 2, latest: '8 cups on 2026-10-27' },
      { name: 'Sleep', daysLogged: 0, latest: null },
    ])
  })
  it('has nothing for learners who share nothing', () => {
    expect(sharedNudge([], [], '2026-10-27').size).toBe(0)
  })
})
