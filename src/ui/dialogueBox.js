// Renders the NPC speech line and player input controls for a beat.
export class DialogueBox {
  constructor(container) {
    this.container = container
    this.el = null
  }

  render(beat) {
    // M2
  }

  destroy() {
    if (this.el) this.el.remove()
  }
}
