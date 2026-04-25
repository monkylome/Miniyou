const STATES = {
  idle: {
    eyes: `
      <circle cx="33" cy="40" r="5" fill="#111"/>
      <circle cx="47" cy="40" r="5" fill="#111"/>
      <circle cx="34" cy="39" r="1.5" fill="white"/>
      <circle cx="48" cy="39" r="1.5" fill="white"/>`,
    mouth: `<path d="M33 50 Q40 56 47 50" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    furExtra: '',
  },
  happy: {
    eyes: `
      <path d="M28 42 Q33 36 38 42" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M42 42 Q47 36 52 42" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    mouth: `<path d="M30 50 Q40 58 50 50" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    furExtra: `
      <circle cx="10" cy="40" r="5" fill="#f5c842"/>
      <circle cx="70" cy="40" r="5" fill="#f5c842"/>`,
  },
  sad: {
    eyes: `
      <path d="M28 38 Q33 44 38 38" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M42 38 Q47 44 52 38" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    mouth: `<path d="M33 54 Q40 48 47 54" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    furExtra: `
      <circle cx="28" cy="26" r="4" fill="#f5c842" transform="translate(0, 3)"/>
      <circle cx="52" cy="26" r="4" fill="#f5c842" transform="translate(0, 3)"/>`,
  },
  hungry: {
    eyes: `
      <circle cx="33" cy="40" r="4" fill="#111"/>
      <circle cx="47" cy="40" r="4" fill="#111"/>
      <circle cx="34" cy="39" r="1" fill="white"/>
      <circle cx="48" cy="39" r="1" fill="white"/>`,
    mouth: `<ellipse cx="40" cy="52" rx="5" ry="4" fill="#111"/>`,
    furExtra: '',
  },
  scared: {
    eyes: `
      <circle cx="33" cy="40" r="6.5" fill="#111"/>
      <circle cx="47" cy="40" r="6.5" fill="#111"/>
      <circle cx="31" cy="38" r="2" fill="white"/>
      <circle cx="45" cy="38" r="2" fill="white"/>`,
    mouth: `<path d="M33 52 Q36 49 40 52 Q44 55 47 52" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    furExtra: `
      <circle cx="18" cy="30" r="5" fill="#f5c842" transform="rotate(-10, 18, 30)"/>
      <circle cx="62" cy="30" r="5" fill="#f5c842" transform="rotate(10, 62, 30)"/>`,
  },
}

function buildSVG(state, size = 80) {
  const s = STATES[state] || STATES.idle
  if (state === 'idle') {
    return `<img id="miniyou-svg" src="./sprites/miniyou-idle.png" width="${size}" height="${size}" style="cursor:pointer; animation: idle-float 5s ease-in-out infinite; image-rendering: pixelated;" />`
  }
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 80 80" style="cursor:pointer; animation: idle-float 3s ease-in-out infinite;" id="miniyou-svg">
      <!-- fur bumps -->
      <circle cx="20" cy="34" r="6" fill="#f5c842"/>
      <circle cx="14" cy="42" r="5" fill="#f5c842"/>
      <circle cx="16" cy="52" r="5" fill="#f5c842"/>
      <circle cx="60" cy="34" r="6" fill="#f5c842"/>
      <circle cx="66" cy="42" r="5" fill="#f5c842"/>
      <circle cx="64" cy="52" r="5" fill="#f5c842"/>
      <circle cx="28" cy="22" r="6" fill="#f5c842"/>
      <circle cx="40" cy="18" r="7" fill="#f5c842"/>
      <circle cx="52" cy="22" r="6" fill="#f5c842"/>
      ${s.furExtra}
      <!-- body -->
      <ellipse cx="40" cy="44" rx="28" ry="24" fill="#f5c842"/>
      <!-- face -->
      ${s.eyes}
      ${s.mouth}
    </svg>
  `
}

export class CharacterSprite {
  constructor(container) {
    this.container = container
    this.el = null
    this._state = 'idle'
    this._stateTimer = null
  }

  render(size = 80) {
    const wrapper = document.createElement('div')
    wrapper.id = 'creature-wrapper'
    wrapper.style.display = 'inline-block'
    wrapper.innerHTML = buildSVG(this._state, size)
    this.container.appendChild(wrapper)
    this.el = wrapper
    return wrapper
  }

  setState(state, duration = null) {
    if (!STATES[state]) return
    if (this._stateTimer) { clearTimeout(this._stateTimer); this._stateTimer = null }
    this._state = state
    if (this.el) this.el.innerHTML = buildSVG(state, this._size || 80)
    if (duration) {
      this._stateTimer = setTimeout(() => this.setState('idle'), duration)
    }
  }

  triggerBounce() {
    const el = this.el?.querySelector('#miniyou-svg')
    if (!el) return
    el.style.animation = 'none'
    el.offsetHeight
    el.style.animation = 'bounce 0.3s ease, idle-float 3s ease-in-out 0.3s infinite'
  }

  triggerEat() {
    const el = this.el?.querySelector('#miniyou-svg')
    if (!el) return
    el.style.animation = 'eat 0.4s ease, idle-float 3s ease-in-out 0.4s infinite'
  }

  destroy() {
    if (this._stateTimer) clearTimeout(this._stateTimer)
    if (this.el) this.el.remove()
    this.el = null
  }
}
