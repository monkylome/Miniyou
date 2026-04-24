// Draggable/tappable food item for the care phase.
export class FoodItem {
  constructor(container, onFed) {
    this.container = container
    this.onFed = onFed
    this.el = null
  }

  render() {
    // M3
  }

  destroy() {
    if (this.el) this.el.remove()
  }
}
