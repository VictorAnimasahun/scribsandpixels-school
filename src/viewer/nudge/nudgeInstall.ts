import { useEffect } from 'react'

/*
 * Nudge installs as its own app. While Nudge is on screen the page points at Nudge's manifest,
 * icon and name, so "Install app" (Chrome, Edge, Android) or "Add to Home Screen" (iPhone) makes a
 * Nudge icon that opens #/nudge, separate from the school's. Leaving Nudge puts the school's back.
 */

const BASE = import.meta.env.BASE_URL // '/' on the main site, '/scribsandpixels-school/' on GitHub Pages

const NUDGE_HEAD = {
  manifest: `${BASE}nudge-manifest.webmanifest`,
  appleIcon: `${BASE}icons/nudge-apple-touch-icon.png`,
  appleTitle: 'Nudge',
  title: 'Nudge',
}

function headElements() {
  return {
    manifest: document.querySelector<HTMLLinkElement>('link[rel="manifest"]'),
    appleIcon: document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]'),
    appleTitle: document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]'),
  }
}

export function useNudgeInstall() {
  useEffect(() => {
    const el = headElements()
    const before = {
      manifest: el.manifest?.getAttribute('href'),
      appleIcon: el.appleIcon?.getAttribute('href'),
      appleTitle: el.appleTitle?.getAttribute('content'),
      title: document.title,
    }
    el.manifest?.setAttribute('href', NUDGE_HEAD.manifest)
    el.appleIcon?.setAttribute('href', NUDGE_HEAD.appleIcon)
    el.appleTitle?.setAttribute('content', NUDGE_HEAD.appleTitle)
    document.title = NUDGE_HEAD.title
    return () => {
      if (before.manifest) el.manifest?.setAttribute('href', before.manifest)
      if (before.appleIcon) el.appleIcon?.setAttribute('href', before.appleIcon)
      if (before.appleTitle) el.appleTitle?.setAttribute('content', before.appleTitle)
      document.title = before.title
    }
  }, [])
}
