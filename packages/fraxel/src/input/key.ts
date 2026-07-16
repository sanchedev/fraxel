export class Key {
  static #mounted = false
  static get mounted() {
    return this.#mounted
  }

  static #keyMap = new Map<KeyString, KeyInfo>()

  static #currentKeys = new Set<string>()
  static #justKeys = new Set<string>()
  static #justKeysUnpressed = new Set<string>()

  static #handleKeyDown: (ev: KeyboardEvent) => void = () => {}
  static #handleKeyUp: (ev: KeyboardEvent) => void = () => {}

  static mount() {
    if (this.#mounted) return

    this.#handleKeyDown = (ev: KeyboardEvent) => {
      const keyString = this.getKeyString(ev)
      if (this.#keyMap.has(keyString)) ev.preventDefault()
      if (!this.#currentKeys.has(keyString)) {
        this.#justKeys.add(keyString)
      }
      this.#currentKeys.add(keyString)
    }

    this.#handleKeyUp = (ev: KeyboardEvent) => {
      const keyString = this.getKeyString(ev)
      if (this.#keyMap.has(keyString)) ev.preventDefault()
      this.#justKeysUnpressed.add(keyString)
      this.#currentKeys.delete(keyString)
    }

    window.addEventListener('keydown', this.#handleKeyDown)
    window.addEventListener('keyup', this.#handleKeyUp)
    this.#mounted = true
  }

  static unmount() {
    if (!this.mounted) return
    window.removeEventListener('keydown', this.#handleKeyDown)
    window.removeEventListener('keyup', this.#handleKeyUp)

    this.#keyMap.clear()
    this.#currentKeys.clear()
    this.#justKeys.clear()
    this.#justKeysUnpressed.clear()
    this.#mounted = false
  }

  static registerKey(keyInfo: KeyInfo): KeyString {
    const key = this.getKeyString(keyInfo)
    if (this.#keyMap.has(key)) return key
    this.#keyMap.set(key, keyInfo)
    return key
  }

  static isKeyPressed(key: KeyString): boolean {
    const keyInfo = this.#keyMap.get(key)
    if (keyInfo == null) return false
    return this.#currentKeys.has(this.getKeyString(keyInfo))
  }

  static justKeyPressed(key: KeyString): boolean {
    const keyInfo = this.#keyMap.get(key)
    if (keyInfo == null) return false
    return this.#justKeys.has(this.getKeyString(keyInfo))
  }

  static justKeyUnpressed(key: KeyString): boolean {
    const keyInfo = this.#keyMap.get(key)
    if (keyInfo == null) return false
    return this.#justKeysUnpressed.has(this.getKeyString(keyInfo))
  }

  static getKeyAxis(negativeKey: KeyString, positiveKey: KeyString): number {
    let axis = 0
    if (this.isKeyPressed(positiveKey)) axis += 1
    if (this.isKeyPressed(negativeKey)) axis -= 1
    return axis
  }

  static getKeyString(ev: KeyInfo): KeyString {
    return `${ev.key.toLowerCase()}|${ev.ctrlKey ?? false}|${ev.altKey ?? false}|${ev.shiftKey ?? false}`
  }

  static update() {
    this.#justKeys.clear()
    this.#justKeysUnpressed.clear()
  }
}

export interface KeyInfo {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}

export type KeyString = `${string}|${boolean}|${boolean}|${boolean}`
