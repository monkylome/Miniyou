export class EndScene {
  constructor(sceneManager) {
    this.sm = sceneManager
  }

  mount(container) {
    container.innerHTML = `<p style="color:#555; font-size:0.85rem; letter-spacing:0.1em;">[ End Scene — M7 ]</p>`
  }

  unmount() {}
}
