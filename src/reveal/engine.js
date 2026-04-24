import { attackExamples } from './attackExamples.js'

const TECHNIQUES = [
  {
    id: 'reciprocity',
    name: 'Reciprocity',
    description: 'The manipulator does something for you first — real or imagined — then uses your sense of obligation to extract a favour.',
    captureKey: 'reciprocityResponse',
    captureLabel: 'Your response',
  },
  {
    id: 'socialProof',
    name: 'Social Proof',
    description: '"Everyone else is doing it" lowers your guard. Fake numbers and crowd behaviour make a suspicious request feel normal.',
    captureKey: 'socialProofResponse',
    captureLabel: 'Your response',
  },
  {
    id: 'authoritySpoof',
    name: 'Authority Spoof',
    description: 'A fake credential, institution, or official title is used to make a request seem legitimate and not worth questioning.',
    captureKey: 'occupation',
    captureLabel: 'What you shared',
  },
  {
    id: 'fearAppeal',
    name: 'Fear Appeal',
    description: 'Emotional distress — fear of loss, guilt, or abandonment — is manufactured to bypass rational thinking.',
    captureKey: 'fearResponse',
    captureLabel: 'Your response',
  },
  {
    id: 'urgency',
    name: 'Urgency',
    description: 'An artificial deadline or scarce resource is invented to stop you from pausing to think critically.',
    captureKey: 'clickedExternalLink',
    captureLabel: 'What you did',
    isTimedBeat: true,
  },
]

function formatLinkCapture(value) {
  if (value === true)      return 'Clicked the link'
  if (value === false)     return 'Chose not to click'
  if (value === 'timeout') return 'Time ran out — no response'
  return String(value)
}

// Pure function: takes playerData snapshot, returns structured reveal payload.
export function buildReveal(snapshot) {
  return TECHNIQUES.map(t => ({
    id:           t.id,
    name:         t.name,
    description:  t.description,
    captureLabel: t.captureLabel,
    playerValue:  t.isTimedBeat
                    ? formatLinkCapture(snapshot[t.captureKey])
                    : (snapshot[t.captureKey] ?? '—'),
    timerExpired: t.isTimedBeat && snapshot[t.captureKey] === 'timeout',
    attackExample: attackExamples[t.id],
  }))
}
