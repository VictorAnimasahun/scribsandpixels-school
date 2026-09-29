// Runs every Python sandbox task twice with real Python 3:
//  1. the reference solution must PASS every task;
//  2. the untouched starter code must FAIL at least one task (no free passes).
// Solutions live in scripts/python-solutions/ so they never ship to the browser.
import { parse } from 'yaml'
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const root = new URL('..', import.meta.url).pathname
const harness = join(root, 'scripts/python-harness.py')
const tmp = mkdtempSync(join(tmpdir(), 'pycheck-'))
let failures = 0

const run = (code, task) => {
  const spec = join(tmp, 'spec.json')
  writeFileSync(spec, JSON.stringify({ code, tests: task.tests, stdin: task.stdin, expectOutput: task.expectOutput }))
  const r = spawnSync('python3', [harness, spec], { encoding: 'utf8' })
  if (r.status !== 0) return { ok: false, err: r.stderr }
  return JSON.parse(r.stdout.trim().split('\n').pop())
}

for (const course of readdirSync(join(root, 'src/content/courses'))) {
  const dir = join(root, 'src/content/courses', course, 'sandboxes')
  if (!existsSync(dir)) continue
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.yaml'))) {
    const sandbox = parse(readFileSync(join(dir, file), 'utf8'))
    if (sandbox.kind !== 'python' || !sandbox.tasks?.length) continue
    const solutionFile = join(root, 'scripts/python-solutions', `${sandbox.id}.py`)
    if (!existsSync(solutionFile)) {
      console.log(`✗ ${sandbox.id}: no reference solution`)
      failures++
      continue
    }
    const solution = readFileSync(solutionFile, 'utf8')
    const bad = sandbox.tasks.map((t) => [t, run(solution, t)]).filter(([, r]) => !r.ok)
    const starterFailsSomething = sandbox.tasks.some((t) => !run(sandbox.starter ?? '', t).ok)
    for (const [t, r] of bad) console.log(`✗ ${sandbox.id}: "${t.prompt}" ${r.err || 'missing ' + JSON.stringify(r.missing)}`)
    if (!starterFailsSomething) console.log(`✗ ${sandbox.id}: the starter code already passes every task`)
    failures += bad.length + (starterFailsSomething ? 0 : 1)
    if (!bad.length && starterFailsSomething) console.log(`✓ ${sandbox.id} (${sandbox.tasks.length} tasks)`)
  }
}
if (failures) {
  console.log(`\n${failures} problem(s)`)
  process.exit(1)
}
