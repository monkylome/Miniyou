const _state = {}

export const playerData = {
  capture(key, value) {
    _state[key] = value
  },

  get(key) {
    return _state[key]
  },

  getAll() {
    return { ..._state }
  },

  reset() {
    Object.keys(_state).forEach(k => delete _state[k])
  },
}
