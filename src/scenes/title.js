export class TitleScene {
  constructor(sceneManager) {
    this.sm = sceneManager
    this._onClick = null
  }

  mount(container) {
    container.innerHTML = `
      <div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:2rem;">
        <h1 style="font-size:2.5rem; letter-spacing:0.2em; font-weight:normal;">Miniyou</h1>
        <p style="color:#888; font-size:0.95rem; letter-spacing:0.05em;">A small creature needs your help.</p>
        <button id="begin-btn">Begin</button>
      </div>
    `

    this._onClick = () => this.sm.goto('care')
    document.getElementById('begin-btn').addEventListener('click', this._onClick)
  }

  unmount() {
    const btn = document.getElementById('begin-btn')
    if (btn) btn.removeEventListener('click', this._onClick)
  }
}
