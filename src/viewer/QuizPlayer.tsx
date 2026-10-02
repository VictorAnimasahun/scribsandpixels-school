import { useEffect, useMemo, useState } from 'react'
import type { Question } from '../content/quizzes.ts'
import { gradeAttempt, markAnswer, seededRandom, type Marked, type Response, type Result } from '../domain/quizGate.ts'

type Props = {
  title: string
  questions: Question[]
  secondsPerQuestion?: number
  /** Shown on the result screen, e.g. "Pass mark 70%". */
  passNote?: string
  onDone: (result: Result, responses: Record<string, Response | undefined>) => void
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** How a question is shown: shuffled choice order etc., fixed for the attempt. */
type View = { choiceOrder: number[]; orderPool: string[]; matchOptions: string[] }

function modelAnswer(q: Question): string {
  switch (q.type) {
    case 'mcq': return q.choices[q.answer]
    case 'multi': return q.answers.map((a) => q.choices[a]).join(' · ')
    case 'truefalse': return q.answer ? 'True' : 'False'
    case 'text': return q.accept[0]
    case 'order': return q.items.join(' → ')
    case 'match': return q.pairs.map(([l, r]) => `${l} = ${r}`).join(' · ')
  }
}

export function QuizPlayer({ title, questions, secondsPerQuestion, passNote, onDone }: Props) {
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000_007))
  const views = useMemo(() => {
    const random = seededRandom(seed)
    return questions.map<View>((q) => ({
      choiceOrder: 'choices' in q ? shuffled(q.choices.map((_, i) => i), random) : [],
      orderPool: q.type === 'order' ? shuffled(q.items, random) : [],
      // A right-hand value can belong to two pairs (e.g. two "TRUE"s): list each value once.
      matchOptions: q.type === 'match' ? shuffled([...new Set(q.pairs.map(([, r]) => r))], random) : [],
    }))
  }, [questions, seed])

  const [index, setIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Response | undefined>>({})
  const [marked, setMarked] = useState<Marked | null>(null)
  const [draft, setDraft] = useState<Response | undefined>(undefined)
  const [timeLeft, setTimeLeft] = useState(secondsPerQuestion ?? 0)
  const [result, setResult] = useState<Result | null>(null)

  const question = questions[index]
  const view = views[index]

  const submit = (response: Response | undefined) => {
    if (marked) return
    setResponses((r) => ({ ...r, [question.id]: response }))
    setMarked(markAnswer(question, response))
  }

  // Per-question countdown for rapid-fire; running out counts as wrong.
  useEffect(() => {
    if (!secondsPerQuestion || marked || result) return
    if (timeLeft <= 0) {
      // A typed answer that wasn't sent in time still counts; anything else is "time up".
      submit(question.type === 'text' && String(draft ?? '').trim() ? String(draft) : undefined)
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  })

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setMarked(null)
      setDraft(undefined)
      setTimeLeft(secondsPerQuestion ?? 0)
    } else {
      const final = gradeAttempt(questions, responses)
      setResult(final)
      onDone(final, responses)
    }
  }

  if (!question && !result) return <p className="muted">This quiz has no questions yet.</p>

  if (result) {
    return (
      <div className="quiz">
        <h3>{title}: result</h3>
        <p className={`score ${result.passed ? 'pass' : 'fail'}`}>
          {result.correct} / {result.total} · {Math.round(result.score * 100)}%
        </p>
        {passNote && <p className="muted">{passNote}</p>}
      </div>
    )
  }

  return (
    <div className="quiz">
      <div className="quiz-head">
        <span>{title}</span>
        <span>{index + 1} / {questions.length}</span>
        {secondsPerQuestion ? <span className={`timer ${timeLeft <= 3 ? 'low' : ''}`}>⏱ {marked ? '—' : `${timeLeft}s`}</span> : null}
      </div>
      <p className="prompt">{question.prompt}</p>
      {question.code && <pre className="q-code">{question.code}</pre>}
      {question.type === 'multi' && <p className="muted">Select all that apply.</p>}

      <Input question={question} view={view} draft={draft} setDraft={setDraft} submit={submit} locked={!!marked} />

      {marked && (
        <div className={`feedback ${marked.correct ? 'right' : 'wrong'}`}>
          <strong>{marked.correct ? (marked.accentSlip ? '✓ Correct, but watch the accents' : '✓ Correct') : responses[question.id] === undefined ? '⏱ Time up' : '✗ Not quite'}</strong>
          {!marked.correct || marked.accentSlip ? <div>Answer: <b>{modelAnswer(question)}</b></div> : null}
          {question.explain && <div className="muted">{question.explain}</div>}
          <button className="primary" onClick={next} autoFocus>{index + 1 < questions.length ? 'Next →' : 'See result'}</button>
        </div>
      )}
    </div>
  )
}

type InputProps = {
  question: Question
  view: View
  draft: Response | undefined
  setDraft: (r: Response | undefined) => void
  submit: (r: Response | undefined) => void
  locked: boolean
}

function Input({ question: q, view, draft, setDraft, submit, locked }: InputProps) {
  switch (q.type) {
    case 'mcq':
      return (
        <div className="choices">
          {view.choiceOrder.map((i) => (
            <button key={i} disabled={locked} className={locked && i === q.answer ? 'choice correct' : 'choice'} onClick={() => submit(i)}>{q.choices[i]}</button>
          ))}
        </div>
      )
    case 'truefalse':
      return (
        <div className="choices two">
          <button disabled={locked} className="choice" onClick={() => submit(true)}>True</button>
          <button disabled={locked} className="choice" onClick={() => submit(false)}>False</button>
        </div>
      )
    case 'multi': {
      const picked = (draft as number[] | undefined) ?? []
      return (
        <div className="choices">
          {view.choiceOrder.map((i) => (
            <label key={i} className={`choice check ${picked.includes(i) ? 'on' : ''}`}>
              <input type="checkbox" disabled={locked} checked={picked.includes(i)} onChange={() => setDraft(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i])} />
              {q.choices[i]}
            </label>
          ))}
          {!locked && <button className="primary" disabled={!picked.length} onClick={() => submit(picked)}>Check</button>}
        </div>
      )
    }
    case 'text':
      return (
        <form className="text-answer" onSubmit={(e) => { e.preventDefault(); if (String(draft ?? '').trim()) submit(String(draft)) }}>
          <input autoFocus disabled={locked} value={String(draft ?? '')} onChange={(e) => setDraft(e.target.value)} placeholder="Type your answer…" autoCapitalize="off" autoCorrect="off" spellCheck={false} />
          {!locked && <button className="primary" type="submit" disabled={!String(draft ?? '').trim()}>Check</button>}
        </form>
      )
    case 'order': {
      const built = (draft as string[] | undefined) ?? []
      const remaining = [...view.orderPool]
      built.forEach((item) => remaining.splice(remaining.indexOf(item), 1))
      return (
        <div className="order">
          <div className="built">{built.length ? built.map((item, i) => <span key={i} className="chip on">{item}</span>) : <span className="muted">Tap the items in the right order</span>}</div>
          <div className="pool">
            {remaining.map((item, i) => (
              <button key={`${item}-${i}`} disabled={locked} className="chip" onClick={() => setDraft([...built, item])}>{item}</button>
            ))}
          </div>
          {!locked && (
            <div className="row">
              <button disabled={!built.length} onClick={() => setDraft(built.slice(0, -1))}>Undo</button>
              <button className="primary" disabled={remaining.length > 0} onClick={() => submit(built)}>Check</button>
            </div>
          )}
        </div>
      )
    }
    case 'match': {
      const chosen = (draft as string[] | undefined) ?? q.pairs.map(() => '')
      return (
        <div className="match">
          {q.pairs.map(([left], i) => (
            <label key={left} className="match-row">
              <span>{left}</span>
              <select disabled={locked} value={chosen[i]} onChange={(e) => setDraft(chosen.map((c, j) => (j === i ? e.target.value : c)))}>
                <option value="">—</option>
                {view.matchOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          ))}
          {!locked && <button className="primary" disabled={chosen.some((c) => !c)} onClick={() => submit(chosen)}>Check</button>}
        </div>
      )
    }
  }
}
