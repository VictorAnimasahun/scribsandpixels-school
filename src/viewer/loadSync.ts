type SyncModule = typeof import('./sync.ts')

/** The sync module (and the Supabase client inside it) is a separate download, loaded only when needed. */
let syncModule: Promise<SyncModule> | null = null
export function loadSync(): Promise<SyncModule> {
  syncModule ??= import('./sync.ts').then((m) => { m.startSync(); return m })
  return syncModule
}

export type { SyncModule }
