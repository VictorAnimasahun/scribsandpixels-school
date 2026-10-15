/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absent on builds without accounts (the GitHub Pages copy). */
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
