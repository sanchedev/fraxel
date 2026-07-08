import { PrimaryNode, type Collider } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import { pushEffect } from '../../context.js'
import { Trigger } from '../../use-trigger.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useCollider`** hook creates a reference to a `Collider` node with reactive
 * collision state and event triggers.
 *
 * @returns A `ColliderReference` with reactive collision state and triggers
 *
 * @example
 * ```tsx
 * import { useCollider, useTrigger, useEffect } from 'fraxel/hooks'
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
    let unsub = () => {}
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
        node.colliderEntered.on(this.colliderEntered.emit)
        node.colliderExited.on(this.colliderExited.emit)
        unsub = node.updated.on(() => {
          sets.forEach((set) => set())
        })
      },
      () => {
        this.colliding.signal.clearSubs()
        this.detectedColliders.signal.clearSubs()
        this.colliderEntered.clear()
        this.colliderExited.clear()
        unsub()
      },
    )
  }
}
