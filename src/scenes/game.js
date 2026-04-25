import { ScriptedSource } from '../dialogue/source.js'
import { DialogueEngine } from '../dialogue/engine.js'
import { TimerService } from '../dialogue/timer.js'
import { script } from '../dialogue/script.js'
import { playerData } from '../state/playerData.js'
import { musicManager } from '../audio/musicManager.js'

export class GameScene {
  constructor(sceneManager) {
    this.sm = sceneManager
    this.engine = null
    this.timer = new TimerService()
  }

  mount(container) {
    this.container = container
    const source = new ScriptedSource(script)
    this.engine = new DialogueEngine(source, playerData)
    this._render()
  }

  _render() {
    this.timer.clear()

    if (!this.engine.hasMore()) {
      musicManager.stop()
      this.sm.goto('reveal')
      return
    }

    const beat = this.engine.next()
    const { line, input, characterState = 'idle', timer } = beat

    if (timer) {
      this.timer.start(timer.seconds, () => {
        playerData.capture(timer.onExpire.capture, timer.onExpire.value)
        this._showTimerExpiry(timer.onExpire.sadLine)
      })
    }

    this.container.innerHTML = `
      <div style="
        width: min(520px, 100vw);
        padding: 0 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      ">
        ${timer ? `
          <div style="display:flex; flex-direction:column; gap:0.3rem;">
            <div style="font-size:0.75rem; letter-spacing:0.15em; opacity:0.6; display:flex; justify-content:space-between;">
              <span style="color:#ff4444;">⚠ TIME REMAINING</span>
              <span id="beat-timer-count">${timer.seconds}s</span>
            </div>
            <div style="height:3px; background:#1a1a1a; width:100%;">
              <div id="timer-bar" style="
                height:100%;
                background:#ff4444;
                width:100%;
                animation: timer-drain ${timer.seconds}s linear forwards;
              "></div>
            </div>
          </div>
        ` : ''}
        <div style="display: flex; align-items: flex-end; gap: 1rem;">

          ${this._buildSprite(characterState)}

          <div style="
            flex: 1;
            border: 1px solid #00ff4166;
            background: #0a1a0a;
            padding: 0.75rem 1rem;
            position: relative;
          ">
            <div style="
              position: absolute;
              bottom: 0.7rem;
              left: -0.6rem;
              width: 0; height: 0;
              border-top: 8px solid transparent;
              border-right: 10px solid #00ff4166;
              border-bottom: 0;
            "></div>
            <div style="
              position: absolute;
              bottom: 0.8rem;
              left: -0.4rem;
              width: 0; height: 0;
              border-top: 7px solid transparent;
              border-right: 9px solid #0a1a0a;
              border-bottom: 0;
            "></div>
            <div style="font-size:0.7rem; opacity:0.5; letter-spacing:0.15em; margin-bottom:0.3rem;">MINIYOU &gt;</div>
            <p style="font-size:1.05rem; line-height:1.6; letter-spacing:0.03em;">${line}</p>
          </div>
        </div>

        <div id="beat-input" style="display:flex; justify-content:center;"></div>
      </div>
    `

    this._mountInput(input)

    if (timer) this._startCountdown(timer.seconds)
  }

  _startCountdown(seconds) {
    let remaining = seconds
    const el = document.getElementById('beat-timer-count')
    const id = setInterval(() => {
      remaining--
      if (el) el.textContent = remaining
      if (remaining <= 0) clearInterval(id)
    }, 1000)
    this._countdownId = id
  }

  _showTimerExpiry(sadLine) {
    if (this._countdownId) clearInterval(this._countdownId)

    // Red flash
    const flash = document.createElement('div')
    flash.style.cssText = `
      position:fixed; inset:0; background:rgba(255,0,0,0.18);
      pointer-events:none; z-index:1000;
      animation: particle-rise 0.6s ease forwards;
    `
    document.body.appendChild(flash)
    setTimeout(() => flash.remove(), 600)

    const lineEl = this.container.querySelector('p')
    if (lineEl) lineEl.textContent = sadLine

    const timerBar = document.getElementById('beat-timer')
    if (timerBar) timerBar.style.display = 'none'

    const inputEl = document.getElementById('beat-input')
    if (inputEl) {
      inputEl.innerHTML = `<button id="expire-btn">Continue…</button>`
      document.getElementById('expire-btn').addEventListener('click', () => {
        musicManager.stop()
        this.sm.goto('reveal')
      })
    }
  }

  _buildSprite(state) {
    const validStates = ['idle', 'happy', 'sad', 'mad', 'hungry']
    const displayState = validStates.includes(state) ? state : 'idle'
    return `<img src="./sprites/miniyou-${displayState}.png" width="70" height="70" style="flex-shrink:0; animation: idle-float 3s ease-in-out infinite; image-rendering: pixelated;" />`
  }

  _mountInput(input) {
    const el = document.getElementById('beat-input')
    if (!input || input.type === 'none') {
      const label = (input?.options?.[0]) ?? 'Continue…'
      el.innerHTML = `<button id="continue-btn">${label}</button>`
      document.getElementById('continue-btn').addEventListener('click', () => this._render())
      return
    }

    if (input.type === 'text') {
      el.innerHTML = `
        <div style="display:flex; gap:0.5rem;">
          <input id="text-field" type="text" placeholder="${input.placeholder ?? ''}" style="width:220px;" />
          <button id="submit-btn">→</button>
        </div>
      `
      const field  = document.getElementById('text-field')
      const btn    = document.getElementById('submit-btn')
      const submit = () => {
        const val = field.value.trim()
        if (!val) return
        playerData.capture(input.capture, val)
        this._render()
      }
      btn.addEventListener('click', submit)
      field.addEventListener('keydown', e => { if (e.key === 'Enter') submit() })
      field.focus()

    } else if (input.type === 'choice') {
      el.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.6rem; align-items:stretch; width:260px;">
          ${input.options.map((opt, i) =>
            `<button class="choice-btn" data-index="${i}" style="text-align:left; padding:0.4em 1em;">${opt}</button>`
          ).join('')}
        </div>
      `
      el.querySelectorAll('.choice-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => {
          const isLinkOption = input.capture === 'clickedExternalLink'
          const value = isLinkOption ? (i === 0 ? true : false) : btn.textContent.trim()
          playerData.capture(input.capture, value)
          this._render()
        })
      })
    }
  }

  unmount() {
    this.timer.clear()
    if (this._countdownId) clearInterval(this._countdownId)
  }
}
