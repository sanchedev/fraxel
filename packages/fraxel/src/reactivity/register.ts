import { Signal } from './signal.js'

/**
 * The **`SignalRegister`** class provides automatic dependency tracking for the
 * reactivity system. It captures which signals are read during a watch context
 * and registers them as dependencies, enabling `useComputed` and `useEffect` to
 * automatically re-run when dependencies change.
 *
 * @example
 * ```ts
 * import { Signal, SignalRegister } from 'fraxel'
 *
 * const x = new Signal(1)
 * const y = new Signal(2)
 *
 * const result = SignalRegister.watch(
 *   () => x.getter() + y.getter(), // reads x and y
 *   (signals) => console.log('Dependencies:', signals.length), // 2
 * )
 * ```
 */
export class SignalRegister {
  static #signals: Set<Signal<any>>[] = []

  /**
   * The **`watch`** method executes a function, captures which signals were read
   * during execution, and calls the `deps` callback with the captured signal array.
   * Supports nested watch contexts via a stack.
   *
   * @param fn The function to execute and track dependencies for.
   * @param deps Callback that receives the array of signals read during `fn`.
   * @returns The return value of `fn`.
   *
   * @example
   * ```ts
   * import { Signal, SignalRegister } from 'fraxel'
   *
   * const health = new Signal(100)
   *
   * const value = SignalRegister.watch(
   *   () => health.getter(),
   *   (signals) => console.log('Tracked', signals.length, 'signal(s)'),
   * )
   * // logs: "Tracked 1 signal(s)"
   * ```
   */
  static watch<T>(fn: () => T, deps: (signals: Signal<any>[]) => void) {
    this.#signals.push(new Set())
    const val = fn()
    deps(Array.from(this.#signals.at(-1) ?? []))
    this.#signals.pop()
    return val
  }

  /**
   * The **`register`** method adds a signal to the current watch context's dependency
   * set. Called automatically by `Signal.getter()` when invoked inside a `watch` context.
   * No-op if no watch context is active.
   *
   * @param signal The signal to register as a dependency.
   *
   * @example
   * ```ts
   * // Typically called automatically — not manually:
   * const s = new Signal(0)
   * s.getter() // internally calls SignalRegister.register(s)
   * ```
   */
  static register(signal: Signal<any>) {
    const s = this.#signals.at(-1)
    if (s == null) return
    s.add(signal)
  }
}
