import { ScriptedSource } from '../dialogue/source.js'
import { DialogueEngine } from '../dialogue/engine.js'
import { script } from '../dialogue/script.js'
import { playerData } from '../state/playerData.js'

export class GameScene {
  constructor(sceneManager) {
    this.sm = sceneManager
    this.engine = null
  }

  mount(container) {
    this.container = container
    const source = new ScriptedSource(script)
    this.engine = new DialogueEngine(source, playerData)
    this._render()
  }

  _render() {
    if (!this.engine.hasMore()) {
      this.sm.goto('reveal')
      return
    }

    const beat = this.engine.next()
    const { line, input } = beat

    this.container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        max-width: 560px;
        width: 100%;
        padding: 0 1.5rem;
      ">
        <p id="beat-line" style="
          font-size: 1.1rem;
          line-height: 1.7;
          text-align: center;
          letter-spacing: 0.03em;
        ">${line}</p>
        <div id="beat-input"></div>
      </div>
    `

    this._mountInput(input)
  }

  _mountInput(input) {
    const el = document.getElementById('beat-input')

    if (input.type === 'text') {
      el.innerHTML = `
        <div style="display:flex; gap:0.75rem;">
          <input id="text-field" type="text" placeholder="${input.placeholder ?? ''}" style="
            background: transparent;
            border: 1px solid #d8d0c8;
            color: #d8d0c8;
            padding: 0.5em 1em;
            font-family: inherit;
            font-size: 1rem;
            letter-spacing: 0.05em;
            outline: none;
            width: 240px;
          " />
          <button id="submit-btn">→</button>
        </div>
      `
      const field = document.getElementById('text-field')
      const btn = document.getElementById('submit-btn')
      const submit = () => {
        const val = field.value.trim()
        if (!val) return
        playerData.capture(input.capture, val)
        this._render()
      }
      btn.addEventListener('click', submit)
      field.addEventListener('keydown', e => { if (e.key === 'Enter') submit() })
      field.focus()

    } else if (input.type === 'choice') {
      el.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.75rem; align-items:center;">
          ${input.options.map((opt, i) =>
            `<button class="choice-btn" data-index="${i}">${opt}</button>`
          ).join('')}
        </div>
      `
      el.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          playerData.capture(input.capture, btn.textContent)
          this._render()
        })
      })
    }
  }

  unmount() {}
}
