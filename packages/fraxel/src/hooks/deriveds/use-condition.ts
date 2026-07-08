import { type SignalGetter } from '../../reactivity/index.js'
import { declareDerivedHook } from '../context.js'
import { useSignal } from '../use-signal.js'
import { Trigger } from '../use-trigger.js'

/**
 * The **`useCondition`** derived hook creates a reactive boolean that toggles between `true` and `false`
 * based on two opposing triggers. Returns a `SignalGetter<boolean>` that can be used
 * with `useComputed`, reactive props, or `useEffect`.
 *
 * @param agreeTrigger The trigger that sets the condition to `true`
 * @param disagreeTrigger The trigger that sets the condition to `false`
 * @param defaultValue The initial value of the condition (defaults to `false`)
 * @returns A `SignalGetter<boolean>` that reflects the current state
 *
 * @example
 * ```tsx
 * import { useCondition, useComputed, useClickable } from 'fraxel/hooks'
 *
 * const clickable = useClickable()
 * const hover = useCondition(clickable.mouseEntered, clickable.mouseExited)
 *
 * const brightness = useComputed(() => (hover() ? 1.1 : 1))
 *
 * return <sprite brightness={brightness} />
 * ```
 *
 * @example
 * ```tsx
 * import { useCondition, useEffect, useRayCast } from 'fraxel/hooks'
 *
 * const raycast = useRayCast()
 * const isZombieDetected = useCondition(raycast.colliderEntered, raycast.colliderExited)
 *
 * useEffect(() => {
 *   anim.node.setNext(isZombieDetected() ? 'shoot' : 'idle')
 * })
 * ```
 */
export function useCondition(
  agreeTrigger: Trigger<any>,
  disagreeTrigger: Trigger<any>,
  defaultValue = false,
): SignalGetter<boolean> {
  declareDerivedHook('useCondition')

  const [condition, setCondition] = useSignal(defaultValue)

  agreeTrigger.connect(() => setCondition(true))
  disagreeTrigger.connect(() => setCondition(false))

  return condition
}
