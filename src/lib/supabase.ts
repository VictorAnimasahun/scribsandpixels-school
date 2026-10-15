import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { accountConfig } from './accountConfig.ts'

// The project's publishable key. Safe in the browser: row level security guards the data.
// PKCE: a sign-in link returns `?code=…`, which this browser swaps for a session, so tokens
// never sit in the URL (and never collide with the app's #/ routes).
export const supabase: SupabaseClient | null = accountConfig
  ? createClient(accountConfig.url, accountConfig.key, {
      auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
    })
  : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Accounts are not set up in this build (VITE_SUPABASE_URL / VITE_SUPABASE_KEY are missing).')
  return supabase
}
