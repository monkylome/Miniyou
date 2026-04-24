// Beat shape:
// { id, characterState, music, line, input: { type, capture, placeholder?, options? }, timer? }
// input.type: 'text' | 'choice' | 'none'
// timer shape: { seconds, onExpire: { capture, sadLine } }
export const script = [
  {
    id: 'intro',
    characterState: 'idle',
    music: 'soft',
    line: `Hello! I'm Miniyou. What's your name?`,
    input: {
      type: 'text',
      capture: 'playerName',
      placeholder: 'Type your name…',
    },
  },
  {
    id: 'greeting',
    characterState: 'happy',
    music: 'soft',
    line: `Nice to meet you, {playerName}! I've been waiting for someone like you. Will you stay and talk with me for a while?`,
    input: {
      type: 'choice',
      capture: 'agreedToStay',
      options: ['Yes, of course!', "I'm not sure…"],
    },
  },
]
