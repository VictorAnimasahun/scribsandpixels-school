import { useRef, type KeyboardEvent } from 'react'
import { indentOnEnter, straightenQuotes } from './editing.ts'

type EditorProps = { value: string; onChange: (v: string) => void; onRun?: () => void; language: string; rows?: number }

/** Keys phones don't have (or hide), for writing code on a touchscreen. */
const KEYS: { label: string; insert?: string; action?: 'indent' | 'outdent'; title: string }[] = [
  { label: '⇥', action: 'indent', title: 'Indent (Tab)' },
  { label: '⇤', action: 'outdent', title: 'Remove indent' },
  { label: ':', insert: ':', title: 'Colon' },
  { label: '( )', insert: '()', title: 'Brackets' },
  { label: '" "', insert: '""', title: 'Quotes' },
  { label: '[ ]', insert: '[]', title: 'Square brackets' },
  { label: '=', insert: '=', title: 'Equals' },
  { label: '#', insert: '# ', title: 'Comment' },
]

/**
 * A plain textarea editor: Tab / ⇤ indent, auto-indent after ":", Ctrl/Cmd+Enter
 * to run, and a key bar for touchscreens. Curly quotes from phone keyboards are
 * turned back into straight ones so the code still runs.
 *
 * Every edit changes the textarea's text *and* caret synchronously (setRangeText),
 * then reports the new value. Moving the caret later (e.g. in requestAnimationFrame)
 * loses keystrokes typed in between, which garbles code on phones.
 */
export function CodeEditor({ value, onChange, onRun, language, rows = 12 }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const edit = (change: (el: HTMLTextAreaElement) => void) => {
    const el = ref.current
    if (!el) return
    change(el)
    onChange(el.value)
  }

  /** Insert text at the caret; `caretOffset` places the caret inside it (e.g. between brackets). */
  const insert = (text: string, caretOffset = text.length) =>
    edit((el) => {
      const start = el.selectionStart
      el.setRangeText(text, start, el.selectionEnd, 'end')
      el.setSelectionRange(start + caretOffset, start + caretOffset)
    })

  const outdent = () =>
    edit((el) => {
      const lineStart = el.value.lastIndexOf('\n', el.selectionStart - 1) + 1
      const spaces = el.value.slice(lineStart).match(/^ {1,4}/)?.[0].length ?? 0
      if (spaces) el.setRangeText('', lineStart, lineStart + spaces, 'preserve')
    })

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      onRun?.()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) outdent()
      else insert('    ')
    } else if (e.key === 'Enter' && language === 'python') {
      e.preventDefault()
      insert(indentOnEnter(e.currentTarget.value, e.currentTarget.selectionStart))
    }
  }

  return (
    <div className="code-editor">
      <textarea
        ref={ref}
        className="code"
        aria-label={`${language} code`}
        rows={rows}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          const el = e.currentTarget
          const straight = straightenQuotes(el.value)
          if (straight !== el.value) {
            // Same length, so the caret can be put straight back where it was.
            const caret = el.selectionStart
            el.value = straight
            el.setSelectionRange(caret, caret)
          }
          onChange(straight)
        }}
        onKeyDown={onKeyDown}
      />
      <div className="keybar" aria-label="Coding keys">
        {KEYS.map((k) => {
          const press = () => (k.action === 'indent' ? insert('    ') : k.action === 'outdent' ? outdent() : insert(k.insert!, k.insert!.length === 2 ? 1 : k.insert!.length))
          return (
          <button
            key={k.label}
            type="button"
            title={k.title}
            aria-label={k.title}
            // Act on press and cancel the default so the textarea keeps focus and the
            // phone keyboard stays open. (Safari then drops the click, so don't rely on it.)
            onPointerDown={(e) => {
              e.preventDefault()
              press()
            }}
            // Keyboard activation (Enter/Space on the button) still arrives as a click with detail 0.
            onClick={(e) => { if (e.detail === 0) press() }}
          >
            {k.label}
          </button>
          )
        })}
      </div>
    </div>
  )
}
