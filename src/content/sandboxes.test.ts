import { describe, expect, it } from 'vitest'
import { findSandbox, resolvePhrases, SANDBOX_EMBED, sandboxes } from './sandboxes.ts'

const weekFiles = import.meta.glob<string>('./courses/*/weeks/*.md', { query: '?raw', import: 'default', eager: true })

describe('sandbox content', () => {
  it('loads and validates every sandbox file with unique ids', () => {
    expect(sandboxes.length).toBeGreaterThan(0)
    const ids = sandboxes.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('resolves includes for phrase sandboxes', () => {
    for (const s of sandboxes.filter((x) => x.kind === 'phrases')) {
      for (const id of s.kind === 'phrases' ? s.include ?? [] : []) expect(findSandbox(id), `${s.id} includes ${id}`).toBeDefined()
      expect(resolvePhrases(s.id)!.patterns.length).toBeGreaterThan(0)
    }
  })

  it('a merged phrase lab has unique pattern ids, and every challenge opens a pattern that has its slots', () => {
    // Challenges find their pattern by id: two included sets with the same id make the second set's
    // challenges open the first set's pattern, which can't build the asked sentence.
    for (const s of sandboxes.filter((x) => x.kind === 'phrases')) {
      const merged = resolvePhrases(s.id)!
      const ids = merged.patterns.map((p) => p.id)
      expect(ids.filter((id, i) => ids.indexOf(id) !== i), `${s.id}: duplicate pattern ids`).toEqual([])
      for (const c of merged.challenges ?? []) {
        const pattern = merged.patterns.find((p) => p.id === c.pattern)
        expect(pattern, `${s.id}: "${c.prompt}" → missing pattern ${c.pattern}`).toBeDefined()
        for (const slot of pattern!.slots) {
          if (!('options' in slot)) continue
          expect(slot.options.some((o) => (o.label ?? o.text) === c.answer[slot.id]), `${s.id}: "${c.prompt}" has no option "${c.answer[slot.id]}" in slot ${slot.id}`).toBe(true)
        }
      }
    }
  })

  it('every ::sandbox embed in a lesson points at a sandbox of the same course', () => {
    for (const [path, md] of Object.entries(weekFiles)) {
      for (const line of md.split('\n')) {
        const m = line.match(SANDBOX_EMBED)
        if (!m) continue
        const sandbox = findSandbox(m[1])
        expect(sandbox, `${path} embeds unknown sandbox ${m[1]}`).toBeDefined()
        expect(sandbox!.course, `${path} embeds ${m[1]} from another course`).toBe(path.split('/')[2])
      }
    }
  })

  it('every course has at least one main sandbox', () => {
    const courses = new Set(Object.keys(weekFiles).map((p) => p.split('/')[2]))
    for (const course of courses) expect(sandboxes.some((s) => s.course === course && s.main), course).toBe(true)
  })
})
