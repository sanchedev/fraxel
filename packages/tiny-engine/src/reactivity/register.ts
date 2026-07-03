import { Signal } from './signal'

export class SignalRegister {
  static #signals: Set<Signal<any>>[] = []

  static watch<T>(fn: () => T, deps: (signals: Signal<any>[]) => void) {
    this.#signals.push(new Set())
    const val = fn()
    deps(Array.from(this.#signals.at(-1) ?? []))
    this.#signals.pop()
    return val
  }

  static register(signal: Signal<any>) {
    const s = this.#signals.at(-1)
    if (s == null) return
    s.add(signal)
  }
}
