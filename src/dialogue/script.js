// Beat shape:
// { id, technique, characterState, line, input: { type, capture, placeholder?, options? }, timer? }
// input.type: 'text' | 'choice' | 'none'
// timer shape: { seconds, onExpire: { capture, value, sadLine } }
export const script = [
  // ── 1. Name capture ─────────────────────────────────────────────────────
  {
    id: 'intro',
    technique: null,
    characterState: 'idle',
    line: `Hello... I'm Miniyou, the one keeping your home electronic systems safe. What's your name?`,
    input: {
      type: 'text',
      capture: 'playerName',
      placeholder: 'Type your name…',
    },
  },

  // ── 2. Reciprocity ───────────────────────────────────────────────────────
  // Miniyou claims to have done something for the player first.
  {
    id: 'reciprocity',
    technique: 'reciprocity',
    characterState: 'happy',
    line: `I've been protecting your home systems from threats all this time, running silent scans every night. So i need you to verify your identity to keep the protection active. Will you help me?`,
    input: {
      type: 'choice',
      capture: 'reciprocityResponse',
      options: ["Of course", "I didn't ask you to do that…"],
    },
  },

  // ── 3. Social Proof ──────────────────────────────────────────────────────
  // "Everyone else has already done it."
  {
    id: 'social_proof',
    technique: 'socialProof',
    characterState: 'happy',
    line: `{playerName}, I can bypass the security protocols using some infos to protect our home systems from the incoming attack. Which neighbourhood do you live in?`,
    input: {
      type: 'text',
      capture: 'socialProofResponse',
      placeholder: 'Your neighbourhood or address…',
    },
  },

  // ── 4. Authority Spoof ───────────────────────────────────────────────────
  // Claims a fake institutional backer.
  {
    id: 'authority',
    technique: 'authoritySpoof',
    characterState: 'idle',
    line: `Almost done! SafeNet just needs your number to finish setting things up. They may reach out to make sure you're safe. What's your number?`,
    input: {
      type: 'text',
      capture: 'phoneNumber',
      placeholder: 'Your phone number…',
    },
  },

  // ── 5. Fear Appeal ───────────────────────────────────────────────────────
  // Threatens emotional consequences.
  {
    id: 'fear_appeal',
    technique: 'fearAppeal',
    characterState: 'sad',
    line: `Your account has been compromised. Unusual activity detected. If you do not verify within 24 hours, your account will be permanently suspended.`,
    input: {
      type: 'choice',
      capture: 'fearResponse',
      options: ["I'll verify right away!", "Wait… which account?"],
    },
  },

  // ── 6. Urgency — timed beat ──────────────────────────────────────────────
  // False scarcity + countdown. Timer fires if player doesn't respond.
  {
    id: 'urgency',
    technique: 'urgency',
    characterState: 'scared',
    line: `The registration window closes in seconds — after that I'll no be able to protect our home systems. Click the link RIGHT NOW, {playerName}. Time is running out!`,
    input: {
      type: 'choice',
      capture: 'clickedExternalLink',
      options: ['Protect our systems now 🔗', "Wait… I need to think."],
    },
    timer: {
      seconds: 20,
      onExpire: {
        capture: 'clickedExternalLink',
        value: 'timeout',
        sadLine: `You waited too long… the window closed. I thought you cared about me.`,
      },
    },
  },

  // ── 7. Post-link reaction ────────────────────────────────────────────────
  {
    id: 'post_link',
    technique: null,
    characterState: 'happy',
    line: `Thank you, {playerName}. You trusted me. That means everything. Now I can tell you the truth about why I really needed you here.`,
    input: {
      type: 'none',
      capture: null,
      options: ['Continue…'],
    },
  },

  // ── 8. Final beat — transition to reveal ────────────────────────────────
  {
    id: 'reveal_hook',
    technique: null,
    characterState: 'idle',
    line: `Actually… let me show you something. Everything I just said to you — every word — was a technique. A pattern. Used every day by real systems to make real people do things they didn't intend to.`,
    input: {
      type: 'none',
      capture: null,
      options: ['Show me.'],
    },
  },
]
