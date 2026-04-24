import { playerData } from '../state/playerData.js'

export class EndScene {
  constructor(sceneManager) {
    this.sm = sceneManager
    this._onClick = null
  }

  mount(container) {
    const name = playerData.get('playerName') ?? 'friend'

    container.innerHTML = `
      <div style="
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        max-width: 420px;
        padding: 0 1.5rem;
      ">
        <svg width="60" height="60" viewBox="0 0 80 80" style="opacity:0.5;">
          <circle cx="20" cy="34" r="6" fill="#f5c842"/>
          <circle cx="60" cy="34" r="6" fill="#f5c842"/>
          <circle cx="40" cy="18" r="7" fill="#f5c842"/>
          <ellipse cx="40" cy="44" rx="28" ry="24" fill="#f5c842"/>
          <!-- sad eyes -->
          <path d="M28 38 Q33 44 38 38" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M42 38 Q47 44 52 38" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M33 54 Q40 48 47 54" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>

        <div>
          <p style="opacity:0.5; font-size:0.75rem; letter-spacing:0.2em; margin-bottom:1rem;">
            SESSION ENDED
          </p>
          <p style="font-size:1.1rem; line-height:1.7; letter-spacing:0.04em;">
            Goodbye, ${name}.<br/>
            <span style="opacity:0.65;">Miniyou has disconnected.</span>
          </p>
        </div>

        <button id="restart-btn" style="letter-spacing:0.15em;">[ RESTART ]</button>
      </div>
    `

    this._onClick = () => {
      playerData.reset()
      this.sm.goto('title')
    }
    document.getElementById('restart-btn').addEventListener('click', this._onClick)
  }

  unmount() {
    const btn = document.getElementById('restart-btn')
    if (btn) btn.removeEventListener('click', this._onClick)
  }
}
