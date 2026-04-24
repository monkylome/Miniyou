export class SceneManager {
  constructor(container) {
    this.container = container
    this.current = null
    this.container.style.opacity = '1'
  }

  async goto(sceneName) {
    if (this.current) {
      await this._fadeOut()
      this.current.unmount()
    }

    const scene = await this._load(sceneName)
    this.current = scene
    this.container.innerHTML = ''
    scene.mount(this.container)
    await this._fadeIn()
  }

  _fadeOut() {
    this.container.style.opacity = '0'
    return new Promise(r => setTimeout(r, 400))
  }

  _fadeIn() {
    this.container.style.opacity = '1'
    return new Promise(r => setTimeout(r, 400))
  }

  async _load(name) {
    const loaders = {
      title:  () => import('./title.js').then(m  => new m.TitleScene(this)),
      care:   () => import('./care.js').then(m   => new m.CareScene(this)),
      game:   () => import('./game.js').then(m   => new m.GameScene(this)),
      reveal: () => import('./reveal.js').then(m => new m.RevealScene(this)),
      end:    () => import('./end.js').then(m    => new m.EndScene(this)),
    }
    if (!loaders[name]) throw new Error(`Unknown scene: ${name}`)
    return loaders[name]()
  }
}
