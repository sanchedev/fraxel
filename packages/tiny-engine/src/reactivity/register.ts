import type { Signal } from './signal'
import type { SignalGetter } from './types'

export class SignalRegister {
  static #signals: Set<Signal<any>>[] = []

  static watch<T>(fn: () => T, deps: (signals: Signal<any>[]) => void) {
    this.#signals.push(new Set())
    const val = fn()
    deps(Array.from(this.#signals.at(-1) ?? []))
    this.#signals.pop()
    return val
  }

  static watchOne<T>(
    dep: SignalGetter<T>,
    onUpdate: (value: T) => void,
  ): [T, () => void] {
    this.#signals.push(new Set())
    dep()
    const signal = Array.from(this.#signals.at(-1) ?? [])[0]! as Signal<T>
    signal.sub(onUpdate)
    this.#signals.pop()
    return [signal.value, () => signal.unsub(onUpdate)]
  }

  static register(signal: Signal<any>) {
    const s = this.#signals.at(-1)
    if (s == null) return
    s.add(signal)
  }
}
