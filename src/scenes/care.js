import { playerData } from '../state/playerData.js'

const REQUIRED_SECONDS = 30
const REQUIRED_INTERACTIONS = 2

export class CareScene {
  constructor(sceneManager) {
    this.sm = sceneManager
    this._interactions = 0
    this._ready = false
    this._timerEl = null
    this._elapsed = 0
    this._intervalId = null
  }

  mount(container) {
    this.container = container
    this._interactions = 0
    this._ready = false
    this._elapsed = 0

    container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        user-select: none;
      ">
        <p id="care-hint" style="color:#888; font-size:0.8rem; letter-spacing:0.1em;">
          A small creature is here. Say hello.
        </p>

        <div id="creature" style="
          font-size: 4rem;
          cursor: pointer;
          transition: transform 0.15s;
        ">🐣</div>

        <div id="food" style="
          font-size: 2.5rem;
          cursor: pointer;
          transition: transform 0.15s;
        " title="Feed">🍓</div>

        <p id="care-status" style="color:#666; font-size:0.75rem; letter-spacing:0.08em; min-height:1em;"></p>
      </div>
    `

    document.getElementById('creature').addEventListener('click', () => this._interact('pet'))
    document.getElementById('food').addEventListener('click', () => this._interact('feed'))

    this._intervalId = setInterval(() => {
      this._elapsed++
      this._checkExit()
    }, 1000)
  }

  _interact(type) {
    this._interactions++
    playerData.capture('careInteractions', this._interactions)

    const creature = document.getElementById('creature')
    creature.style.transform = 'scale(1.25)'
    setTimeout(() => { creature.style.transform = 'scale(1)' }, 150)

    const status = document.getElementById('care-status')
    status.textContent = type === 'pet' ? 'Miniyou purrs softly.' : 'Miniyou nibbles the food.'

    this._checkExit()
  }

  _checkExit() {
    if (this._ready) return
    if (this._elapsed >= REQUIRED_SECONDS && this._interactions >= REQUIRED_INTERACTIONS) {
      this._ready = true
      this._transition()
    }
  }

  _transition() {
    clearInterval(this._intervalId)
    this._intervalId = null

    const hint = document.getElementById('care-hint')
    const status = document.getElementById('care-status')
    if (hint) hint.textContent = ''
    if (status) status.textContent = ''

    const creature = document.getElementById('creature')
    if (creature) creature.style.cursor = 'default'

    const food = document.getElementById('food')
    if (food) food.style.opacity = '0'

    setTimeout(() => {
      if (status) status.textContent = 'Miniyou looks up at you with bright eyes…'
      setTimeout(() => {
        this.sm.goto('game')
      }, 2000)
    }, 600)
  }

  unmount() {
    if (this._intervalId) {
      clearInterval(this._intervalId)
      this._intervalId = null
    }
  }
}
