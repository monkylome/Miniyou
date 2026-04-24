import { buildReveal } from '../reveal/engine.js'
import { playerData } from '../state/playerData.js'

export class RevealScene {
  constructor(sceneManager) {
    this.sm = sceneManager
  }

  mount(container) {
    const snapshot   = playerData.getAll()
    const techniques = buildReveal(snapshot)

    container.innerHTML = `
      <div style="
        width: min(560px, 100vw);
        height: 100vh;
        overflow-y: auto;
        padding: 2rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        scrollbar-width: thin;
        scrollbar-color: #00ff4144 transparent;
      ">
        <div style="border-bottom: 1px solid #00ff4144; padding-bottom: 1rem;">
          <div style="font-size:0.75rem; letter-spacing:0.2em; opacity:0.5; margin-bottom:0.4rem;">
            MINIYOU.EXE — POST-SESSION ANALYSIS
          </div>
          <h1 style="font-size:1.6rem; letter-spacing:0.1em; font-weight:normal;">
            Here's what just happened, ${snapshot.playerName ?? 'friend'}.
          </h1>
          <p style="opacity:0.7; font-size:0.95rem; margin-top:0.5rem; line-height:1.6;">
            Every line Miniyou said to you used a real manipulation technique.
            These same patterns appear in phishing emails, scam calls, and dark-pattern apps — every day.
          </p>
        </div>

        ${techniques.map(t => this._renderTechnique(t)).join('')}

        <div style="border-top: 1px solid #00ff4144; padding-top: 1.5rem; text-align:center;">
          <p style="opacity:0.6; font-size:0.85rem; letter-spacing:0.08em; margin-bottom:1rem;">
            Now that you can name them — you can spot them.
          </p>
          <button id="play-again-btn" style="letter-spacing:0.15em;">PLAY AGAIN</button>
        </div>
      </div>
    `

    document.getElementById('play-again-btn').addEventListener('click', () => {
      playerData.reset()
      this.sm.goto('title')
    })
  }

  _renderTechnique(t) {
    const timerBadge = t.timerExpired
      ? `<span style="color:#ff4444; font-size:0.7rem; letter-spacing:0.1em; margin-left:0.75rem;">TIMER EXPIRED</span>`
      : ''

    return `
      <div style="border: 1px solid #00ff4133; padding: 1.25rem; display:flex; flex-direction:column; gap:0.75rem;">

        <div style="display:flex; align-items:baseline; gap:0.5rem; flex-wrap:wrap;">
          <span style="font-size:1.1rem; letter-spacing:0.1em;">${t.name.toUpperCase()}</span>
          ${timerBadge}
        </div>

        <p style="opacity:0.85; font-size:0.9rem; line-height:1.6;">${t.description}</p>

        <div style="border-left: 2px solid #00ff4166; padding-left:0.75rem;">
          <div style="font-size:0.7rem; opacity:0.5; letter-spacing:0.15em; margin-bottom:0.2rem;">
            ${t.captureLabel.toUpperCase()}
          </div>
          <div style="font-size:0.95rem; opacity:0.9;">"${t.playerValue}"</div>
        </div>

        <div style="background:#0a1a0a; border:1px solid #00ff4122; padding:0.75rem;">
          <div style="font-size:0.7rem; opacity:0.5; letter-spacing:0.15em; margin-bottom:0.4rem;">
            REAL-WORLD EXAMPLE
          </div>
          <p style="font-size:0.85rem; line-height:1.6; opacity:0.8;">${t.attackExample}</p>
        </div>

      </div>
    `
  }

  unmount() {}
}
