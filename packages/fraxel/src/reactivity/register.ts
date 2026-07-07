import { Signal } from './signal'

/**
 * The **`SignalRegister`** class provides automatic dependency tracking for the reactivity system.
 * It captures which signals are read during a watch context and registers them as dependencies.
 */
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
