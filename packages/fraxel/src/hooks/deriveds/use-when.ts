import {
  reactive,
  type Reactive,
  type SignalGetter,
  type SignalGetterLike,
} from '../../reactivity/index.js'
import { declareDerivedHook } from '../context'
import { useComputed } from '../use-computed.js'

/**
 * The **`useWhen`** derived hook creates a computed value that toggles between two values
 * based on a boolean signal. Similar to a ternary expression but reactive.
 *
 * @param signal A `SignalGetterLike` that determines which value to return
 * @param whenTrue The value to return when the signal is `true`
 * @param whenFalse The value to return when the signal is `false`
 * @returns A `SignalGetter<T>` that reflects the current value
 *
 * @example
 * ```tsx
 * import { useCondition, useWhen, useClickable } from 'fraxel'
 *
 * const clickable = useClickable()
 * const isHovered = useCondition(clickable.onPointerEnter, clickable.onPointerExit)
 * const brightness = useWhen(isHovered, 1.2, 1.0)
 *
 * return <sprite brightness={brightness} />
 * ```
 *
 * @example
 * ```tsx
 * import { useCondition, useWhen, useRayCast } from 'fraxel'
 *
 * const raycast = useRayCast()
 * const isZombieDetected = useCondition(raycast.onColliderEnter, raycast.onColliderExit)
 * const animName = useWhen(isZombieDetected, 'shoot', 'idle')
 *
 * return <animation-player currentAnim={animName} />
 * ```
 */
export function useWhen<T>(
  signal: SignalGetterLike<boolean>,
  whenTrue: Reactive<T>,
  whenFalse: Reactive<T>,
): SignalGetter<T> {
  declareDerivedHook('useWhen')

  const trueValue = reactive(whenTrue)
  const falseValue = reactive(whenFalse)

  return useComputed(() => (signal() ? trueValue() : falseValue()))
}
