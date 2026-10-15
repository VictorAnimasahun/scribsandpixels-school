import { useSyncExternalStore } from 'react'

/*
 * The account and sync status the UI shows. Written by sync.ts (loaded on demand); read
 * anywhere without pulling in the Supabase client.
 */

export type SyncState =
  | 'off'        // this build has no accounts, or sync hasn't started
  | 'signed-out'
  | 'loading'    // signed in; downloading the account's progress
  | 'saving'
  | 'saved'
  | 'offline'    // changes are kept here and sent when the connection is back
  | 'error'

export type AccountStatus = {
  state: SyncState
  email: string | null
  userId: string | null
  /** When this browser last finished a save or download (ms). */
  savedAt: number | null
  /** A message for the learner: why sync failed, why they were signed out, a sign-in link that expired… */
  message: string | null
}

let status: AccountStatus = { state: 'off', email: null, userId: null, savedAt: null, message: null }
const listeners = new Set<() => void>()

export function setAccountStatus(change: Partial<AccountStatus>) {
  status = { ...status, ...change }
  listeners.forEach((l) => l())
}

export const getAccountStatus = () => status

export function useAccountStatus(): AccountStatus {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => status,
  )
}

/** Signed in (whatever the sync state): checkpoint results are then permanent on the server. */
export const isSignedIn = (s: AccountStatus) => s.userId !== null
