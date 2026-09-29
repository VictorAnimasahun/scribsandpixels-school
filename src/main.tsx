import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Viewer } from './viewer/Viewer.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Viewer />
  </StrictMode>,
)
