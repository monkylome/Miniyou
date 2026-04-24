// DialogueSource interface: nextBeat() → beat | null, hasMore() → bool
// ScriptedSource wraps a static script array — swap for LLMSource later.
export class ScriptedSource {
  constructor(beats) {
    this._beats = beats
    this._index = 0
  }

  hasMore() {
    return this._index < this._beats.length
  }

  nextBeat() {
    if (!this.hasMore()) return null
    return this._beats[this._index++]
  }
}
