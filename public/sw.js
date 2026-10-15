/*
 * The school's service worker: makes the app installable and usable offline.
 *
 * - Pages: network first, so a new version of the school (or a new lesson) arrives as soon as
 *   there's a connection; the saved copy is used only when offline.
 * - Built files (/assets/*, /icons/*): their names change with every build, so a saved copy is
 *   always right; served from the cache, fetched once.
 * - Pinned CDN files (Pyodide, React, fonts): versioned URLs, saved once; this is what lets the
 *   Python sandboxes run offline after their first use.
 * - Everything else (the Supabase API, sign-in, other sites) always goes to the network and is
 *   never stored.
 * Caches are capped so a phone's storage doesn't grow with every release.
 */
const VERSION = 'v1'
const PAGES = `snp-pages-${VERSION}`
const ASSETS = `snp-assets-${VERSION}`
const CDN = `snp-cdn-${VERSION}`
const KEEP = [PAGES, ASSETS, CDN]
const SCOPE = self.registration.scope // ends with '/', e.g. https://school.scribsandpixels.com/
const CDN_HOSTS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com']

self.addEventListener('install', (event) => {
  event.waitUntil(saveShell().catch(() => undefined))
  self.skipWaiting()
})

/**
 * Save the app shell: the page plus the files it loads (main script, styles, icons, manifest).
 * Needed because the first visit loads them before this worker exists, and moving around the
 * app afterwards only changes the #/ part of the address, so they're never requested again.
 */
async function saveShell(response) {
  const page = response ?? await fetch(SCOPE, { cache: 'no-cache' })
  if (!page.ok) return
  const html = await page.clone().text()
  await (await caches.open(PAGES)).put(SCOPE, page)
  const files = new Set(), cdn = new Set()
  for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const full = new URL(url.replace(/&amp;/g, '&'), SCOPE)
    if (full.origin === self.location.origin) files.add(full.href)
    else if (CDN_HOSTS.includes(full.hostname) && full.pathname !== '/') cdn.add(full.href) // e.g. the Google Fonts stylesheet
  }
  const save = async (name, urls) => {
    const cache = await caches.open(name)
    await Promise.all([...urls].map(async (url) => {
      if (await cache.match(url, { ignoreVary: true })) return
      const res = await fetch(url)
      if (res.ok) await cache.put(url, res)
    }))
  }
  await save(ASSETS, files)
  await save(CDN, cdn)
}

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('snp-') && !KEEP.includes(key)) await caches.delete(key)
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  const sameOrigin = url.origin === self.location.origin
  if (sameOrigin && request.mode === 'navigate') return event.respondWith(page(request, event))
  if (sameOrigin && (url.pathname.startsWith(new URL('assets/', SCOPE).pathname) || url.pathname.startsWith(new URL('icons/', SCOPE).pathname))) {
    return event.respondWith(saved(request, ASSETS, 400))
  }
  if (CDN_HOSTS.includes(url.hostname) && !url.pathname.includes('/latest/')) return event.respondWith(saved(request, CDN, 300))
  if (sameOrigin && /\/(favicon\.svg|manifest\.webmanifest)$/.test(url.pathname)) return event.respondWith(saved(request, ASSETS, 400))
  // Not handled: the browser fetches it normally (API calls, sign-in, links to other sites).
})

/** Network first; the app shell from the cache when offline. Every page of the app is the same file. */
async function page(request, event) {
  const cache = await caches.open(PAGES)
  try {
    const response = await fetch(request)
    // A new release means new file names: save the new shell in the background.
    if (response.ok) event.waitUntil(saveShell(response.clone()).catch(() => undefined))
    return response
  } catch {
    return (await cache.match(SCOPE, { ignoreVary: true })) ?? new Response('You are offline and this page has not been saved yet.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}

/** Cache first; fetch and save on a miss. */
async function saved(request, name, max) {
  const cache = await caches.open(name)
  // ignoreVary: a saved file is the same whatever the request headers (module scripts send an
  // Origin header the saved copy was stored without; a server's "Vary: Origin" would miss).
  const hit = await cache.match(request, { ignoreVary: true })
  if (hit) return hit
  const response = await fetch(request)
  // Opaque responses (cross-origin scripts loaded without CORS) can't be inspected but are fine to replay.
  if (response.ok || response.type === 'opaque') {
    await cache.put(request, response.clone())
    trim(cache, max)
  }
  return response
}

/** Keep at most `max` entries, dropping the oldest first. */
async function trim(cache, max) {
  const keys = await cache.keys()
  for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key)
}
