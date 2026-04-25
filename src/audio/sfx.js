let _ctx = null

function ctx() {
  if (!_ctx) _ctx = new AudioContext()
  return _ctx
}

function beep({ freq = 440, type = 'square', duration = 0.1, volume = 0.15, delay = 0 }) {
  const c = ctx()
  const osc  = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + delay)
  gain.gain.setValueAtTime(volume, c.currentTime + delay)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration)
  osc.start(c.currentTime + delay)
  osc.stop(c.currentTime + delay + duration + 0.05)
}

export const sfx = {
  pet() {
    beep({ freq: 600, type: 'sine', duration: 0.08, volume: 0.2 })
    beep({ freq: 800, type: 'sine', duration: 0.08, volume: 0.15, delay: 0.07 })
  },

  feed() {
    beep({ freq: 400, type: 'square', duration: 0.07, volume: 0.12 })
    beep({ freq: 560, type: 'square', duration: 0.07, volume: 0.12, delay: 0.08 })
    beep({ freq: 720, type: 'square', duration: 0.1,  volume: 0.12, delay: 0.16 })
  },

  dislike() {
    beep({ freq: 300, type: 'square', duration: 0.1, volume: 0.15 })
    beep({ freq: 200, type: 'square', duration: 0.15, volume: 0.12, delay: 0.1 })
  },

  bubbles() {
    for (let i = 0; i < 6; i++) {
      beep({
        freq: 700 + Math.random() * 500,
        type: 'sine',
        duration: 0.06,
        volume: 0.08,
        delay: i * 0.06,
      })
    }
  },
}
