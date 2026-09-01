// Valid creature states that map to image files
const VALID_STATES = ['idle', 'happy', 'sad', 'mad']

function buildImageHtml(state, size = 80) {
  // Default to idle if state is invalid
  const validState = VALID_STATES.includes(state) ? state : 'idle'
  
  return `<img id="miniyou-svg" src="./sprites/miniyou-${validState}.png" width="${size}" height="${size}" style="cursor:pointer; animation: idle-float 3s ease-in-out infinite; image-rendering: pixelated;" />`
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
    wrapper.innerHTML = buildImageHtml(this._state, size)
    this.container.appendChild(wrapper)
    this.el = wrapper
    this._size = size
    return wrapper
  }

  setState(state, duration = null) {
    if (!VALID_STATES.includes(state)) return
    if (this._stateTimer) { clearTimeout(this._stateTimer); this._stateTimer = null }
    this._state = state
    if (this.el) this.el.innerHTML = buildImageHtml(state, this._size || 80)
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
