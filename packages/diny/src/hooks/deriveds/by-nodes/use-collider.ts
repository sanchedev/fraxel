import { Collider, PrimaryNode } from '../../../nodes/index.js'
import { declareDerivedHook } from '../../context.js'
import { useEvent } from '../../use-event.js'
import type { NodeReference } from '../../use-node.js'
import { useSignal } from '../../use-signal.js'
import { usePartialNode } from '../use-partial-node.js'
import { useComputed } from '../../use-computed.js'

/**
 * The **`useCollider`** derived hook provides a declarative API for the `Collider` node.
 * Returns the node reference, a reactive `colliding` boolean, and a signal tracking
 * the currently colliding collider.
 *
 * @param collider An optional existing `NodeReference` to the Collider node
 * @returns An object with `ref`, `colliding`, and `other`
 *
 * @example
 * ```tsx
 * import { useCollider } from 'diny/hooks'
 *
 * function DamageZone() {
 *   const { ref, colliding, other } = useCollider()
 *
 *   useEffect(() => {
 *     if (colliding()) {
 *       console.log('Touching:', other())
 *     }
 *   })
 *
 *   return (
 *     <collider ref={ref} shape={shapes.circle(16)} group={['zone']} collidesWith={['player']} />
 *   )
 * }
 * ```
 */
export function useCollider(collider?: NodeReference<PrimaryNode.Collider>) {
  declareDerivedHook('useCollider')
  const ref = usePartialNode(PrimaryNode.Collider, collider)

  const [detectedColliders, setDC] = useSignal<Set<Collider>>(new Set())
  useEvent(ref, 'colliderEntered', (c) => {
    const set = new Set(detectedColliders())
    set.add(c)
    setDC(set)
  })
  useEvent(ref, 'colliderExited', (c) => {
    const set = new Set(detectedColliders())
    set.delete(c)
    setDC(set)
  })

  const colliding = useComputed(() => detectedColliders() != null)

  return {
    ref,
    colliding,
    detectedColliders,
  }
}
