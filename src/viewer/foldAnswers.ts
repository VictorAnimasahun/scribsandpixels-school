const reveal = (summary: string, body: string) => `<details class="reveal"><summary>${summary}</summary>\n\n${body}\n\n</details>`

/**
 * Keep answers out of sight until asked for: `:::hint … :::` blocks and
 * "**Check…**" answer paragraphs render folded.
 */
export function foldAnswers(text: string): string {
  const out: string[] = []
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === ':::hint') {
      const body: string[] = []
      for (i++; i < lines.length && lines[i].trim() !== ':::'; i++) body.push(lines[i])
      out.push(reveal('💡 Hint: try it yourself first', body.join('\n')))
    } else if (/^\*\*Check\b/.test(lines[i])) {
      const body: string[] = []
      for (; i < lines.length && lines[i].trim() !== ''; i++) body.push(lines[i])
      out.push(reveal('✅ Show answers', body.join('\n').replace(/^\*\*Check([^*]*)\*\*\s*/, (_, label: string) => (label.trim() ? `**${label.trim().replace(/:$/, '')}:** ` : ''))))
    } else out.push(lines[i])
  }
  return out.join('\n')
}
