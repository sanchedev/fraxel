import {
  reactive,
  type Reactive,
  type SignalGetter,
} from '../../reactivity/index.js'
import { declareDerivedHook } from '../context'
import { useComputed } from '../use-computed.js'

/**
 * The **`useMatch`** derived hook creates a computed value based on a signal's current value,
 * similar to a `switch` or `match` expression. Maps a signal value to a corresponding value
 * from a record.
 *
 * @param signal A `SignalGetter` that returns the key to match against
 * @param record A record mapping signal values to computed values
 * @param defaultValue The value to return if the signal value is not found in the record
 * @returns A `SignalGetter<K>` that reflects the matched value
 *
 * @example
 * ```tsx
 * const [state, setState] = useSignal<'idle' | 'walking' | 'jumping'>('idle')
 *
 * const animation = useMatch(state, {
 *   idle: 'idle-anim',
 *   walking: 'walk-anim',
 *   jumping: 'jump-anim',
 * })
 *
 * return <animation-player currentAnim={animation} />
 * ```
 */
export function useMatch<T extends number | string | symbol, K>(
  signal: SignalGetter<T>,
  record: Reactive<Record<T, K>>,
  defaultValue?: Reactive<K>,
) {
  declareDerivedHook('useMatch')

  const recordValue = reactive(record)
  const defaultVal = reactive(defaultValue)

  return useComputed(() => {
    const key = signal()
    if (key in recordValue()) return recordValue()[key]
    return defaultVal()
  })
}
