import { lazy, Suspense } from 'react'
import { findSandbox } from '../../content/sandboxes.ts'

// Each engine is its own chunk: a French page never downloads the spreadsheet or Python code.
const engines = {
  phrases: lazy(() => import('./PhraseSandbox.tsx')),
  sheet: lazy(() => import('./SheetSandbox.tsx')),
  python: lazy(() => import('./PythonSandbox.tsx')),
  web: lazy(() => import('./WebSandbox.tsx')),
}

const icons = { phrases: '🗣️', sheet: '📊', python: '🐍', web: '🌐' }

export function SandboxHost({ id, compact = false }: { id: string; compact?: boolean }) {
  const sandbox = findSandbox(id)
  if (!sandbox) return <p className="muted">Sandbox "{id}" not found.</p>
  const Engine = engines[sandbox.kind] as React.ComponentType<{ sandbox: typeof sandbox }>
  return (
    <section className={`sandbox-host ${compact ? 'compact' : ''}`}>
      <header>
        <h3>{icons[sandbox.kind]} Sandbox: {sandbox.title}</h3>
        {sandbox.description && <p className="muted small">{sandbox.description}</p>}
      </header>
      <Suspense fallback={<p className="muted">Loading sandbox…</p>}>
        {/* keyed by id: moving from one sandbox to another must not keep the previous one's code, cells or output */}
        <Engine key={sandbox.id} sandbox={sandbox} />
      </Suspense>
    </section>
  )
}
