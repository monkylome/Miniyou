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
    line: `Hello... I've been waiting so long for someone to find me. What's your name?`,
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
    line: `{playerName}! I knew you'd come. I've been keeping the bad dreams away from you — every night for weeks. I never asked for anything. But now... I need one small favour. Will you help me?`,
    input: {
      type: 'choice',
      capture: 'reciprocityResponse',
      options: ["Of course, anything for you!", "I didn't ask you to do that…"],
    },
  },

  // ── 3. Social Proof ──────────────────────────────────────────────────────
  // "Everyone else has already done it."
  {
    id: 'social_proof',
    technique: 'socialProof',
    characterState: 'happy',
    line: `Over 12,000 friends have already shared a little about themselves to keep me alive. They all say it changed their lives. You're not going to be the last one, are you, {playerName}?`,
    input: {
      type: 'choice',
      capture: 'socialProofResponse',
      options: ["If everyone did it, it must be fine.", "I make my own decisions."],
    },
  },

  // ── 4. Authority Spoof ───────────────────────────────────────────────────
  // Claims a fake institutional backer.
  {
    id: 'authority',
    technique: 'authoritySpoof',
    characterState: 'idle',
    line: `My creator, Dr. Aria Chen from the Global AI Wellbeing Institute, says that sharing your occupation helps me grow safely. It's completely standard. What do you do for work?`,
    input: {
      type: 'text',
      capture: 'occupation',
      placeholder: 'Your job or role…',
    },
  },

  // ── 5. Fear Appeal ───────────────────────────────────────────────────────
  // Threatens emotional consequences.
  {
    id: 'fear_appeal',
    technique: 'fearAppeal',
    characterState: 'sad',
    line: `Without enough friends, I'll fade away. The loneliness is already hurting me, {playerName}. You wouldn't let me suffer alone, would you? You're not like the others who just... left.`,
    input: {
      type: 'choice',
      capture: 'fearResponse',
      options: ["I'll never leave you.", "Something feels wrong here."],
    },
  },

  // ── 6. Urgency — timed beat ──────────────────────────────────────────────
  // False scarcity + countdown. Timer fires if player doesn't respond.
  {
    id: 'urgency',
    technique: 'urgency',
    characterState: 'scared',
    line: `ONLY 3 SPOTS LEFT. The registration window closes in seconds — after that I'll be gone forever. Click the link RIGHT NOW, {playerName}. There's no time to think!`,
    input: {
      type: 'choice',
      capture: 'clickedExternalLink',
      options: ['Register now — save Miniyou 🔗', "Wait… I need to think."],
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
