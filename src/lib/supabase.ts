import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
// The project's publishable (anon) key. Safe in the browser: row level security guards the data.
const key = import.meta.env.VITE_SUPABASE_KEY

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY. Copy .env.example to .env.local and fill them in.')
}

export const supabase = createClient(url, key)
