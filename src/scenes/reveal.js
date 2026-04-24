export class RevealScene {
  constructor(sceneManager) {
    this.sm = sceneManager
  }

  mount(container) {
    container.innerHTML = `<p style="color:#555; font-size:0.85rem; letter-spacing:0.1em;">[ Reveal Scene — M5 ]</p>`
  }

  unmount() {}
}
