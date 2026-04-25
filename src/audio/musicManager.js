class MusicManager {
  constructor() {
    this._audio = null
  }

  play(src, volume = 0.4) {
    if (this._audio) {
      this._audio.pause()
      this._audio = null
    }
    this._audio = new Audio(src)
    this._audio.loop = true
    this._audio.volume = volume
    this._audio.play().catch(() => {})
  }

  stop() {
    if (this._audio) {
      this._audio.pause()
      this._audio = null
    }
  }

  setVolume(v) {
    if (this._audio) this._audio.volume = v
  }
}

export const musicManager = new MusicManager()
