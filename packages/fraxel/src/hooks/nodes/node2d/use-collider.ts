import { Trigger } from '../../../events/trigger.js'
import { PrimaryNode, type Collider } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useCollider`** hook creates a reference to a `Collider` node with reactive
 * collision state and event triggers.
 *
 * @returns A `ColliderReference` with reactive collision state and triggers
 *
 * @example
 * ```tsx
 * import { useCollider, useTrigger, useEffect } from 'fraxel'
 *
 * function Enemy() {
 *   const collider = useCollider()
 *
 *   useTrigger(collider.colliderEntered, (other) => {
 *     console.log('Hit by:', other)
 *   })
 *
 *   useEffect(() => {
 *     if (collider.colliding()) {
 *       console.log('Currently colliding with', collider.detectedColliders().size, 'objects')
 *     }
 *   })
 *
 *   return (
 *     <collider
 *       ref={collider}
 *       shape={shapes.rectangle(32, 32)}
 *       group={['enemy']}
 *       collidesWith={['player', 'projectile']}
 *     />
 *   )
 * }
 * ```
 */
export function useCollider() {
  pushEffect('useCollider', () => {})
  return new ColliderReference()
}

export class ColliderReference extends Node2DReference<PrimaryNode.Collider> {
  /** Reactive `true` when the collider overlaps any other collider. */
  colliding = new Signal(false).getter
  /** Reactive set of currently colliding collider nodes. */
  detectedColliders = new Signal<Set<Collider>>(new Set()).getter

  /** Fires when a new collision starts. */
  colliderEntered = new Trigger<[other: Collider]>()
  /** Fires when a collision ends. */
  colliderExited = new Trigger<[other: Collider]>()

  constructor() {
    super(
      PrimaryNode.Collider,
      (node) => {
        const sets = [
          () => {
            this.colliding.signal.setter(node._activeCollisions.size !== 0)
            this.detectedColliders.signal.setter(new Set(node._activeCollisions))
          },
        ]
        sets.forEach((set) => set())
        node.updated.on(() => {
          sets.forEach((set) => set())
        })
        node.colliderEntered.connect(this.colliderEntered)
        node.colliderExited.connect(this.colliderExited)
      },
      () => {
        this.colliding.signal.clearSubs()
        this.detectedColliders.signal.clearSubs()
      },
    )
  }
}
