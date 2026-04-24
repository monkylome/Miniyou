// Drives beat playback. Accepts any DialogueSource.
export class DialogueEngine {
  constructor(source, playerData) {
    this.source = source
    this.playerData = playerData
  }

  hasMore() {
    return this.source.hasMore()
  }

  // Returns the next beat with {key} placeholders resolved from playerData.
  next() {
    const beat = this.source.nextBeat()
    if (!beat) return null
    return {
      ...beat,
      line: this._interpolate(beat.line),
    }
  }

  _interpolate(line) {
    return line.replace(/\{(\w+)\}/g, (_, key) => {
      const val = this.playerData.get(key)
      return val !== undefined ? val : `{${key}}`
    })
  }
}
