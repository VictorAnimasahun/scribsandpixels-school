import type { KeyboardEvent } from 'react'

type EditorProps = { value: string; onChange: (v: string) => void; onRun?: () => void; language: string; rows?: number }

/** A plain textarea editor with Tab-indent and Ctrl/Cmd+Enter to run. */
export function CodeEditor({ value, onChange, onRun, language, rows = 12 }: EditorProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      onRun?.()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const { selectionStart: start, selectionEnd: end } = el
      const next = `${value.slice(0, start)}    ${value.slice(end)}`
      onChange(next)
      requestAnimationFrame(() => el.setSelectionRange(start + 4, start + 4))
    }
  }
  return (
    <textarea
      className="code"
      aria-label={`${language} code`}
      rows={rows}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
    />
  )
}
