// Displays the Miniyou creature sprite and swaps state (idle/happy/sad/hungry).
export class CharacterSprite {
  constructor(container) {
    this.container = container
    this.el = null
  }

  setState(state) {
    // M6
  }

  destroy() {
    if (this.el) this.el.remove()
  }
}
