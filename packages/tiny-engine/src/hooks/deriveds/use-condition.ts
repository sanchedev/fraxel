import type { NodeInstances, PrimaryNode } from '../../nodes/index.js'
import { type SignalGetter } from '../../reactivity/index.js'
import { declareDerivedHook } from '../context.js'
import { useEvent, type Events, type GetEvent } from '../use-event.js'
import type { NodeReference } from '../use-node.js'
import { useSignal } from '../use-signal.js'

/**
 * The **`useCondition`** derived hook creates a reactive boolean that toggles between `true` and `false`
 * based on two opposing events on a node. Returns a `SignalGetter<boolean>` that can be used
 * with `useComputed`, reactive props, or `useEffect`.
 *
 * @param node A `NodeReference` to the node that emits the events
 * @param agreeEvent The event name that sets the condition to `true`
 * @param disagreeEvent The event name that sets the condition to `false`
 * @param defaultValue The initial value of the condition (defaults to `false`)
 * @returns A `SignalGetter<boolean>` that reflects the current state
 *
 * @example
 * ```tsx
 * const clickable = useNode(PrimaryNode.Clickable)
 * const hover = useCondition(clickable, 'mouseEntered', 'mouseExited')
 *
 * const brightness = useComputed(() => (hover() ? 1.1 : 1))
 *
 * return <sprite brightness={brightness} />
 * ```
 *
 * @example
 * ```tsx
 * const raycast = useNode(PrimaryNode.RayCast)
 * const isZombieDetected = useCondition(raycast, 'colliderEntered', 'colliderExited')
 *
 * useEffect(() => {
 *   anim.node.setNext(isZombieDetected() ? 'shoot' : 'idle')
 * })
 * ```
 */
export function useCondition<
  N extends PrimaryNode,
  A extends keyof Events<N>,
  D extends keyof Events<N>,
>(
  node: NodeReference<N>,
  agreeEvent: A,
  disagreeEvent: D,
  defaultValue = false,
): SignalGetter<boolean> {
  declareDerivedHook('useCondition')

  const [condition, setCondition] = useSignal(defaultValue)

  useEvent(node, agreeEvent, (() => {
    setCondition(true)
  }) as GetEvent<NodeInstances[N][A]>)
  useEvent(node, disagreeEvent, (() => {
    setCondition(false)
  }) as GetEvent<NodeInstances[N][D]>)

  return condition
}
