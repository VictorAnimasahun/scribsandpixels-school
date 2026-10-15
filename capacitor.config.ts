import type { CapacitorConfig } from '@capacitor/cli'

// The Android app: the same school as the website (the build in dist/), shipped inside a native
// shell. Lessons and the app itself live on the phone; accounts and sync use the same Supabase
// project as the website.
const config: CapacitorConfig = {
  appId: 'com.scribsandpixels.school',
  appName: 'Scribs & Pixels',
  webDir: 'dist',
  android: {
    // Served as https://localhost inside the app, so browser features that need a secure page work.
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
}

export default config
