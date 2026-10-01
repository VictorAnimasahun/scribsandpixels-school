// Runs every quiz snippet that has `code` through Python 3 and prints its real
// output next to the model answer, so "what does this print?" keys can be checked.
// Snippets that call input() get the value named in the prompt ("The user types X").
import { parse } from 'yaml'
import { readFileSync, readdirSync, existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const only = process.argv[2]
// Snippets may write files; run them in a throwaway folder, never the repo.
const sandboxDir = mkdtempSync(join(tmpdir(), 'quizcode-'))
for (const course of readdirSync(join(root, 'src/content/courses'))) {
  const dir = join(root, 'src/content/courses', course, 'quizzes')
  if (!existsSync(dir)) continue
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.yaml') && (!only || f.includes(only)))) {
    const week = parse(readFileSync(join(dir, file), 'utf8'))
    for (const day of week.days) {
      const questions = [...(day.gate?.bank ?? []), ...day.quizzes.flatMap((q) => q.questions)]
      // HTML and CSS snippets aren't Python; skip them.
      for (const q of questions.filter((q) => q.code && !/^\s*(<|\/\*|@|[\w.#-]+\s*\{)/.test(q.code))) {
        const typed = [...q.prompt.matchAll(/types ([^ .?]+)(?: then ([^ .?]+))?/g)].flatMap((m) => [m[1], m[2]]).filter(Boolean)
        const r = spawnSync('python3', ['-c', q.code], { input: typed.join('\n') + '\n', encoding: 'utf8', timeout: 3000, cwd: mkdtempSync(join(sandboxDir, 'q-')) })
        const out = (r.stdout.trim() || r.stderr.trim().split('\n').pop() || '(no output)').replace(/\n/g, ' ⏎ ')
        const model = q.type === 'mcq' ? q.choices[q.answer] : q.type === 'text' ? q.accept[0] : '(n/a)'
        console.log(`${q.id.padEnd(16)} real: ${out.slice(0, 70).padEnd(70)} | key: ${model}`)
      }
    }
  }
}
