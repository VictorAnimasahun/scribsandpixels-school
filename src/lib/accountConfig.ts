/*
 * Whether this build can offer accounts, and cheap checks that decide when to load the
 * Supabase client (a separate download) at all. Nothing here imports @supabase/supabase-js.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined

/** Set on Vercel and in .env.local; absent on the GitHub Pages copy, which then runs without accounts. */
export const accountConfig = url && key ? { url, key } : null

/** Where supabase-js keeps the session: `sb-<project ref>-auth-token` in localStorage. */
const storageKey = () => (accountConfig ? `sb-${new URL(accountConfig.url).hostname.split('.')[0]}-auth-token` : null)

/** A session saved by an earlier visit: sync should start straight away. */
export function hasStoredSession(): boolean {
  const k = storageKey()
  try {
    return !!k && !!localStorage.getItem(k)
  } catch {
    return false
  }
}

/** Arriving from a sign-in email: `?code=…` (success) or `?error=…` (an expired or used link). */
export function urlHasAuthResult(): boolean {
  const q = new URLSearchParams(window.location.search)
  return q.has('code') || q.has('error_description')
}
