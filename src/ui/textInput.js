// Single-line text input with submit handler for chat-style beats.
export class TextInput {
  constructor(container, onSubmit) {
    this.container = container
    this.onSubmit = onSubmit
    this.el = null
  }

  render(placeholder) {
    // M2
  }

  destroy() {
    if (this.el) this.el.remove()
  }
}
