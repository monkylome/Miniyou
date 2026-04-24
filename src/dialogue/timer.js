// Countdown timer for timed beats. Calls onExpire when time runs out.
export class TimerService {
  constructor() {
    this._id = null
  }

  start(seconds, onExpire) {
    this.clear()
    this._id = setTimeout(onExpire, seconds * 1000)
  }

  clear() {
    if (this._id !== null) {
      clearTimeout(this._id)
      this._id = null
    }
  }
}
