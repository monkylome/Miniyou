import { musicManager } from '../audio/musicManager.js'

export class TitleScene {
  constructor(sceneManager) {
    this.sm = sceneManager
    this._onClick = null
    this._blinkId = null
  }

  mount(container) {
    container.innerHTML = `
      <div style="
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
      ">
        <div style="font-size:0.7rem; letter-spacing:0.25em; opacity:0.45; margin-bottom:0.5rem;">
          TUCKERSOFT PRESENTS
        </div>

        <div style="position:relative; display:inline-block;">
          <svg width="100" height="100" viewBox="0 0 80 80" style="animation: idle-float 3s ease-in-out infinite; display:block; margin:0 auto;">
            <circle cx="20" cy="34" r="6" fill="#f5c842"/>
            <circle cx="14" cy="42" r="5" fill="#f5c842"/>
            <circle cx="16" cy="52" r="5" fill="#f5c842"/>
            <circle cx="60" cy="34" r="6" fill="#f5c842"/>
            <circle cx="66" cy="42" r="5" fill="#f5c842"/>
            <circle cx="64" cy="52" r="5" fill="#f5c842"/>
            <circle cx="28" cy="22" r="6" fill="#f5c842"/>
            <circle cx="40" cy="18" r="7" fill="#f5c842"/>
            <circle cx="52" cy="22" r="6" fill="#f5c842"/>
            <ellipse cx="40" cy="44" rx="28" ry="24" fill="#f5c842"/>
            <circle cx="33" cy="40" r="5" fill="#111"/>
            <circle cx="47" cy="40" r="5" fill="#111"/>
            <circle cx="34" cy="39" r="1.5" fill="white"/>
            <circle cx="48" cy="39" r="1.5" fill="white"/>
            <path d="M33 50 Q40 56 47 50" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </div>

        <div>
          <h1 style="font-size:3rem; letter-spacing:0.3em; font-weight:normal; margin-bottom:0.5rem;">
            MINIYOU
          </h1>
          <p style="opacity:0.55; font-size:0.9rem; letter-spacing:0.1em;">
            A small creature needs your help.
          </p>
        </div>

        <button id="begin-btn" style="letter-spacing:0.2em; font-size:1rem;">
          [ BEGIN ]
        </button>

        <div id="blink-prompt" style="font-size:0.7rem; letter-spacing:0.15em; opacity:0.4; margin-top:0.5rem;">
          PRESS BEGIN TO CONNECT
        </div>
      </div>
    `

    this._onClick = () => {
      musicManager.play('./audio/music/drmseq-space-station.mp3', 0.20)
      this.sm.goto('care')
    }
    document.getElementById('begin-btn').addEventListener('click', this._onClick)

    // Blinking cursor prompt
    let visible = true
    this._blinkId = setInterval(() => {
      const el = document.getElementById('blink-prompt')
      if (el) { el.style.opacity = visible ? '0.4' : '0'; visible = !visible }
    }, 700)
  }

  unmount() {
    clearInterval(this._blinkId)
    const btn = document.getElementById('begin-btn')
    if (btn) btn.removeEventListener('click', this._onClick)
  }
}
