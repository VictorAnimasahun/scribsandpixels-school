import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { isNativeApp } from './lib/platform.ts'
import { Viewer } from './viewer/Viewer.tsx'

// Installable and usable offline (public/sw.js). Production builds only: in development the
// cache would hide changes. Not inside the Android app, which ships its files with it.
if (import.meta.env.PROD && 'serviceWorker' in navigator && !isNativeApp()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => {
      // no service worker (private mode, old browser): the app works online as before
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Viewer />
  </StrictMode>,
)
