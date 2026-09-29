import { useEffect, useMemo, useState } from 'react'
import { resolvePhrases, type PhraseChallenge, type PhraseOption, type Sandbox } from '../../content/sandboxes.ts'
import { checkPhrase, isComplete, joinFrench, remix, similarity, tokensFor, type Choice } from '../../domain/phrases.ts'
import { loadSaved, save } from './storage.ts'

type Props = { sandbox: Extract<Sandbox, { kind: 'phrases' }> }

type Recognition = {
  lang: string
  interimResults: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
}
const RecognitionImpl = (globalThis as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }).SpeechRecognition
  ?? (globalThis as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition

function speak(text: string, lang: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.9
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.replace('_', '-').startsWith(lang.slice(0, 2)))
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}

const labelOf = (o: PhraseOption) => o.label ?? o.text

export default function PhraseSandbox({ sandbox: raw }: Props) {
  const sandbox = useMemo(() => resolvePhrases(raw.id) ?? raw, [raw])
  const lang = sandbox.voice ?? 'fr-FR'
  const [patternIndex, setPatternIndex] = useState(0)
  const [chosen, setChosen] = useState<Choice>({})
  const [challenge, setChallenge] = useState<PhraseChallenge | null>(null)
  const [verdict, setVerdict] = useState<string | null>(null)
  const [heard, setHeard] = useState<{ text: string; score: number } | null>(null)
  const [listening, setListening] = useState(false)
  const savedKey = `phrases:${raw.id}`
  const [saved, setSaved] = useState<string[]>(() => JSON.parse(loadSaved(savedKey) ?? '[]') as string[])
  useEffect(() => save(savedKey, JSON.stringify(saved)), [savedKey, saved])

  const pattern = sandbox.patterns[patternIndex]
  const phrase = joinFrench(tokensFor(pattern, chosen))
  const complete = isComplete(pattern, chosen)
  const problems = checkPhrase(pattern, chosen)
  const gloss = pattern.slots.map((s) => ('options' in s ? chosen[s.id]?.en : undefined)).filter(Boolean).join(' · ')

  const pick = (slotId: string, option: PhraseOption) => {
    setChosen((c) => ({ ...c, [slotId]: c[slotId] === option ? undefined : option }))
    setVerdict(null)
    setHeard(null)
  }

  const selectPattern = (index: number) => {
    setPatternIndex(index)
    setChosen({})
    setVerdict(null)
    setHeard(null)
  }

  const startChallenge = (c: PhraseChallenge) => {
    const index = sandbox.patterns.findIndex((p) => p.id === c.pattern)
    selectPattern(index)
    setChallenge(c)
  }

  const checkChallenge = () => {
    if (!challenge) return
    const right = pattern.slots.every((s) => !('options' in s) || (chosen[s.id] && labelOf(chosen[s.id]!) === challenge.answer[s.id]))
    setVerdict(right ? '✅ Correct!' : problems.length ? '❌ Fix the agreement first.' : '❌ That\'s a valid French phrase, but not the one asked for.')
  }

  const listen = () => {
    if (!RecognitionImpl) return
    const rec = new RecognitionImpl()
    rec.lang = lang
    rec.interimResults = false
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setHeard({ text, score: similarity(text, phrase) })
    }
    rec.onerror = (e) => setHeard({ text: `(microphone: ${e.error})`, score: 0 })
    rec.onend = () => setListening(false)
    setListening(true)
    rec.start()
  }

  return (
    <div className="sandbox phrases">
      <div className="tabs wrap">
        {sandbox.patterns.map((p, i) => (
          <button key={`${p.id}-${i}`} className={i === patternIndex ? 'on' : ''} onClick={() => { selectPattern(i); setChallenge(null) }}>{p.label}</button>
        ))}
      </div>

      {challenge && (
        <div className="challenge-banner">
          <span>🎯 Build: <b>{challenge.prompt}</b></span>
          <button className="link" onClick={() => { setChallenge(null); setVerdict(null) }}>✕</button>
        </div>
      )}

      <div className={`phrase-preview ${complete ? (problems.length ? 'bad' : 'good') : ''}`}>
        <p className="phrase">{phrase}</p>
        {gloss && <p className="gloss muted">{gloss}</p>}
        {problems.map((p, i) => <p key={i} className="problem">⚠️ {p.message}</p>)}
        {complete && !problems.length && <p className="ok-line">✓ Correct French</p>}
      </div>

      <div className="sandbox-row">
        <button className="primary" disabled={!complete} onClick={() => speak(phrase, lang)}>🔊 Listen</button>
        {RecognitionImpl && <button disabled={!complete || listening} onClick={listen}>{listening ? '🎙️ Listening…' : '🎤 Say it'}</button>}
        <button onClick={() => { setChosen(remix(pattern)); setVerdict(null); setHeard(null) }}>🎲 Remix</button>
        <button onClick={() => setChosen({})}>Clear</button>
        <button disabled={!complete || problems.length > 0 || saved.includes(phrase)} onClick={() => setSaved((s) => [phrase, ...s].slice(0, 50))}>⭐ Save</button>
        {challenge && <button className="primary" disabled={!complete} onClick={checkChallenge}>Check</button>}
      </div>
      {verdict && <p className="verdict">{verdict}</p>}
      {heard && <p className="heard">You said: « {heard.text} » · {Math.round(heard.score * 100)}% match {heard.score >= 0.8 ? '👏' : '(try again, slower)'}</p>}

      {pattern.slots.map((slot) =>
        'options' in slot ? (
          <div key={slot.id} className="slot">
            <p className="slot-label">{slot.label ?? slot.id}</p>
            <div className="tiles">
              {slot.options.map((o, i) => (
                <button key={`${o.text}-${i}`} className={`tile ${chosen[slot.id] === o ? 'on' : ''}`} onClick={() => pick(slot.id, o)} onDoubleClick={() => speak(o.text, lang)} title={o.en}>
                  <span>{labelOf(o)}</span>
                  {o.en && <small>{o.en}</small>}
                </button>
              ))}
            </div>
          </div>
        ) : null,
      )}

      {sandbox.challenges?.length ? (
        <details className="challenges" open={!challenge}>
          <summary>🎯 Challenges ({sandbox.challenges.length})</summary>
          <ol>{sandbox.challenges.map((c, i) => <li key={i}><button className="link" onClick={() => startChallenge(c)}>{c.prompt}</button></li>)}</ol>
        </details>
      ) : null}

      {saved.length > 0 && (
        <details className="saved">
          <summary>⭐ My phrases ({saved.length})</summary>
          <ul>{saved.map((s) => <li key={s}><button className="link" onClick={() => speak(s, lang)}>🔊</button> {s} <button className="link" onClick={() => setSaved((x) => x.filter((y) => y !== s))}>✕</button></li>)}</ul>
        </details>
      )}
      <p className="muted small">Tip: double-tap a tile to hear that word alone.</p>
    </div>
  )
}
