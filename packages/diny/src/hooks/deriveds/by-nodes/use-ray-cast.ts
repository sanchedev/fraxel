import { Collider, PrimaryNode } from '../../../nodes/index.js'
import { declareDerivedHook } from '../../context.js'
import { useComputed } from '../../use-computed.js'
import { useEvent } from '../../use-event.js'
import type { NodeReference } from '../../use-node.js'
import { useSignal } from '../../use-signal.js'
import { usePartialNode } from '../use-partial-node.js'

/**
 * The **`useRayCast`** derived hook provides a declarative API for the `RayCast` node.
 * Returns the node reference, a reactive `detected` boolean, the current collider signal,
 * and a reactive `length` computed value.
 *
 * @param raycast An optional existing `NodeReference` to the RayCast node
 * @returns An object with `ref`, `detected`, `collider`, and `length`
 *
 * @example
 * ```tsx
 * import { useRayCast } from 'diny/hooks'
 *
 * function Peashooter() {
 *   const { ref, detected, collider } = useRayCast()
 *
 *   useEffect(() => {
 *     if (detected()) {
 *       console.log('Hit:', collider())
 *     }
 *   })
 *
 *   return (
 *     <ray-cast ref={ref} direction={[100, 0]} collidesWith={['zombie']} />
 *   )
 * }
 * ```
 */
export function useRayCast(raycast?: NodeReference<PrimaryNode.RayCast>) {
  declareDerivedHook('useRayCast')
  const ref = usePartialNode(PrimaryNode.RayCast, raycast)

  const [collider, setCollider] = useSignal<Collider | null>(null)
  useEvent(ref, 'colliderEntered', (c) => setCollider(c))
  useEvent(ref, 'colliderExited', () => setCollider(null))

  const detected = useComputed(() => collider() != null)

  return {
    ref,
    detected,
    collider,
  }
}
