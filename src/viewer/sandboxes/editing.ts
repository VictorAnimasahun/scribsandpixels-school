/** Phone keyboards type “smart” quotes and dashes; code needs plain ASCII. */
export function straightenQuotes(text: string): string {
  return text.replace(/[“”„‟]/g, '"').replace(/[‘’‚‛]/g, "'")
}

/** What to insert for Enter at `caret`: a newline plus the current indent, 4 more after a trailing colon. */
export function indentOnEnter(text: string, caret: number): string {
  const lineStart = text.lastIndexOf('\n', caret - 1) + 1
  const line = text.slice(lineStart, caret)
  const indent = line.match(/^ */)![0]
  return `\n${indent}${/:\s*(#.*)?$/.test(line) ? '    ' : ''}`
}
