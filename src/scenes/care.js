import { playerData } from '../state/playerData.js'
import { CharacterSprite } from '../ui/characterSprite.js'

const REQUIRED_SECONDS  = 30
const REQUIRED_ACTIONS  = 2
const GLITCH_MIN_MS     = 15000
const GLITCH_MAX_MS     = 45000

const PET_LINES   = ['*purrs*', '*nuzzles you*', 'hehe~', '^_^', '*wiggles*']
const FOOD_ITEMS  = [
  { id: 'berry',  label: '🍓' },
  { id: 'cake',   label: '🍰' },
  { id: 'drop',   label: '🫐' },
]

export class CareScene {
  constructor(sceneManager) {
    this.sm          = sceneManager
    this.sprite      = null
    this._actions    = 0
    this._elapsed    = 0
    this._ready      = false
    this._tickId     = null
    this._glitchId   = null
    this._drag       = null   // { el, foodId, startX, startY, origX, origY }
    this._playArea   = null
  }

  mount(container) {
    this.container = container
    this._actions  = 0
    this._elapsed  = 0
    this._ready    = false

    container.innerHTML = `
      <div id="care-shell" style="
        width: min(480px, 100vw);
        height: min(520px, 100vh);
        display: flex;
        flex-direction: column;
        border: 1px solid #00ff4144;
      ">
        <div id="care-header" style="
          border-bottom: 1px solid #00ff4144;
          padding: 0.3rem 0.75rem;
          font-size: 0.8rem;
          letter-spacing: 0.15em;
          opacity: 0.7;
          display: flex;
          justify-content: space-between;
        ">
          <span>MINIYOU.EXE — COMPANION ACTIVE</span>
          <span id="care-timer">00:00</span>
        </div>

        <div id="care-play" style="
          flex: 1;
          position: relative;
          overflow: hidden;
        "></div>

        <div id="care-food" style="
          border-top: 1px solid #00ff4144;
          padding: 0.5rem 1rem;
          display: flex;
          gap: 1.5rem;
          justify-content: center;
        ">
          ${FOOD_ITEMS.map(f => `
            <span
              class="food-item"
              data-food="${f.id}"
              style="font-size:1.8rem; cursor:grab; user-select:none;"
            >${f.label}</span>
          `).join('')}
        </div>

        <div id="care-status" style="
          border-top: 1px solid #00ff4144;
          padding: 0.3rem 0.75rem;
          font-size: 0.9rem;
          min-height: 1.8rem;
          letter-spacing: 0.05em;
        ">
          <span style="opacity:0.5;">&gt;</span> <span id="care-status-text">_</span>
        </div>
      </div>
    `

    this._playArea = document.getElementById('care-play')

    // Render creature
    this.sprite = new CharacterSprite(this._playArea)
    this.sprite._size = 90
    this.sprite.render(90)

    const wrapper = document.getElementById('creature-wrapper')
    wrapper.style.position = 'absolute'
    wrapper.style.left = '50%'
    wrapper.style.top  = '50%'
    wrapper.style.transform = 'translate(-50%, -50%)'
    wrapper.style.transition = 'left 1.8s ease-in-out, top 1.8s ease-in-out'

    // Pet interaction
    wrapper.addEventListener('click', () => this._onPet())

    // Drag-and-drop food
    document.querySelectorAll('.food-item').forEach(el => {
      el.addEventListener('mousedown', e => this._onFoodMouseDown(e, el))
    })
    document.addEventListener('mousemove', this._onMouseMove.bind(this))
    document.addEventListener('mouseup',   this._onMouseUp.bind(this))

    // Wander tick
    this._wanderTo(50, 50)
    this._scheduleWander()

    // Cursor following
    this._playArea.addEventListener('mousemove', e => this._onCursorMove(e))

    // Timer
    this._tickId = setInterval(() => this._tick(), 1000)

    // Glitch
    this._scheduleGlitch()

    this._setStatus('_')
  }

  // ── Pet ──────────────────────────────────────────────────────────────────

  _onPet() {
    if (this._ready) return
    this._actions++
    playerData.capture('careInteractions', this._actions)
    this.sprite.setState('happy', 2000)
    this.sprite.triggerBounce()
    this._spawnParticles()
    this._setStatus(PET_LINES[Math.floor(Math.random() * PET_LINES.length)])
    this._checkExit()
  }

  // ── Particles ────────────────────────────────────────────────────────────

  _spawnParticles() {
    const wrapper = document.getElementById('creature-wrapper')
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const playRect = this._playArea.getBoundingClientRect()
    for (let i = 0; i < 7; i++) {
      const p = document.createElement('span')
      p.textContent = '+'
      p.style.cssText = `
        position: absolute;
        color: #00ff41;
        font-size: 0.9rem;
        pointer-events: none;
        left: ${rect.left - playRect.left + 20 + Math.random() * 60}px;
        top:  ${rect.top  - playRect.top  + 20 + Math.random() * 30}px;
        animation: particle-rise 0.7s ease forwards;
        animation-delay: ${Math.random() * 0.2}s;
        z-index: 10;
      `
      this._playArea.appendChild(p)
      setTimeout(() => p.remove(), 900)
    }
  }

  // ── Drag & Drop food ─────────────────────────────────────────────────────

  _onFoodMouseDown(e, el) {
    e.preventDefault()
    const clone = el.cloneNode(true)
    clone.style.cssText = `
      position: fixed;
      pointer-events: none;
      font-size: 1.8rem;
      left: ${e.clientX - 16}px;
      top:  ${e.clientY - 16}px;
      z-index: 200;
      user-select: none;
    `
    document.body.appendChild(clone)
    this._drag = { el, clone, foodId: el.dataset.food }
  }

  _onMouseMove(e) {
    if (!this._drag) return
    this._drag.clone.style.left = `${e.clientX - 16}px`
    this._drag.clone.style.top  = `${e.clientY - 16}px`
  }

  _onMouseUp(e) {
    if (!this._drag) return
    const { clone, foodId } = this._drag
    this._drag = null
    clone.remove()

    const wrapper = document.getElementById('creature-wrapper')
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const hit  = e.clientX >= rect.left && e.clientX <= rect.right
               && e.clientY >= rect.top  && e.clientY <= rect.bottom

    if (hit && !this._ready) {
      this._actions++
      playerData.capture('careInteractions', this._actions)
      this.sprite.setState('happy', 2000)
      this.sprite.triggerEat()
      const item = FOOD_ITEMS.find(f => f.id === foodId)
      this._setStatus(`Miniyou ate the ${item?.label ?? 'food'}!`)
      this._checkExit()
    }
  }

  // ── Wander ───────────────────────────────────────────────────────────────

  _wanderTo(pctX, pctY) {
    const wrapper = document.getElementById('creature-wrapper')
    if (!wrapper) return
    wrapper.style.left = `${pctX}%`
    wrapper.style.top  = `${pctY}%`
  }

  _scheduleWander() {
    const delay = 1800 + Math.random() * 1200
    this._wanderId = setTimeout(() => {
      if (this._ready) return
      const x = 15 + Math.random() * 70
      const y = 15 + Math.random() * 70
      this._wanderTo(x, y)
      this._scheduleWander()
    }, delay)
  }

  _onCursorMove(e) {
    if (this._ready) return
    const rect = this._playArea.getBoundingClientRect()
    const cx   = ((e.clientX - rect.left) / rect.width)  * 100
    const cy   = ((e.clientY - rect.top)  / rect.height) * 100
    const wrapper = document.getElementById('creature-wrapper')
    if (!wrapper) return
    const curLeft = parseFloat(wrapper.style.left) || 50
    const curTop  = parseFloat(wrapper.style.top)  || 50
    const tx = curLeft + (cx - curLeft) * 0.3
    const ty = curTop  + (cy - curTop)  * 0.3
    wrapper.style.left = `${Math.max(12, Math.min(88, tx))}%`
    wrapper.style.top  = `${Math.max(12, Math.min(88, ty))}%`
  }

  // ── Glitch ───────────────────────────────────────────────────────────────

  _scheduleGlitch() {
    const delay = GLITCH_MIN_MS + Math.random() * (GLITCH_MAX_MS - GLITCH_MIN_MS)
    this._glitchId = setTimeout(() => {
      if (!this._ready) this._fireGlitch(() => this._scheduleGlitch())
    }, delay)
  }

  _fireGlitch(onDone) {
    const shell = document.getElementById('care-shell')
    this.sprite.setState('scared')

    shell.style.animation = 'screen-shake 0.15s ease 3'
    setTimeout(() => { shell.style.animation = '' }, 450)

    // RGB ghost overlay
    const wrapper = document.getElementById('creature-wrapper')
    if (wrapper) {
      const ghost = wrapper.cloneNode(true)
      ghost.id = ''
      ghost.style.cssText = `
        position: absolute;
        left: ${wrapper.style.left};
        top:  ${wrapper.style.top};
        transform: translate(calc(-50% + 4px), calc(-50% - 2px));
        opacity: 0.35;
        filter: hue-rotate(180deg);
        pointer-events: none;
      `
      this._playArea.appendChild(ghost)
      setTimeout(() => ghost.remove(), 220)
    }

    // Corrupt status
    const original = document.getElementById('care-status-text')?.textContent ?? ''
    const corrupt  = original.replace(/[a-zA-Z]/g, () =>
      Math.random() > 0.4 ? '█' : String.fromCharCode(0x300 + Math.floor(Math.random() * 50))
    )
    this._setStatus(corrupt)
    setTimeout(() => {
      this.sprite.setState('idle')
      this._setStatus('_')
      if (onDone) onDone()
    }, 800)
  }

  // ── Timer / exit ─────────────────────────────────────────────────────────

  _tick() {
    this._elapsed++
    const m = String(Math.floor(this._elapsed / 60)).padStart(2, '0')
    const s = String(this._elapsed % 60).padStart(2, '0')
    const el = document.getElementById('care-timer')
    if (el) el.textContent = `${m}:${s}`
    this._checkExit()
  }

  _checkExit() {
    if (this._ready) return
    if (this._elapsed >= REQUIRED_SECONDS && this._actions >= REQUIRED_ACTIONS) {
      this._ready = true
      this._transition()
    }
  }

  _transition() {
    clearInterval(this._tickId)
    clearTimeout(this._wanderId)
    clearTimeout(this._glitchId)

    this._fireGlitch(() => {
      this.sprite.setState('happy')
      this._setStatus('I want to tell you something...')
      setTimeout(() => this.sm.goto('game'), 2000)
    })
  }

  _setStatus(text) {
    const el = document.getElementById('care-status-text')
    if (el) el.textContent = text
  }

  unmount() {
    clearInterval(this._tickId)
    clearTimeout(this._wanderId)
    clearTimeout(this._glitchId)
    document.removeEventListener('mousemove', this._onMouseMove.bind(this))
    document.removeEventListener('mouseup',   this._onMouseUp.bind(this))
    if (this.sprite) this.sprite.destroy()
  }
}
