import { PrimaryNode, type Collider } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import { pushEffect } from '../../context.js'
import { Trigger } from '../../../events/trigger.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useRayCast`** hook creates a reference to a `RayCast` node with reactive
 * detection state and event triggers.
 *
 * @returns A `RayCastReference` with reactive detection state and triggers
 *
 * @example
 * ```tsx
 * import { useRayCast, useTrigger, useEffect } from 'fraxel'
 *
 * function Peashooter() {
 *   const raycast = useRayCast()
 *
 *   useTrigger(raycast.onColliderEnter, (collider) => {
 *     console.log('Detected:', collider)
 *   })
 *
 *   useEffect(() => {
 *     if (raycast.detected()) {
 *       console.log('Zombie ahead:', raycast.collider())
 *     }
 *   })
 *
 *   return <raycast ref={raycast} direction={[100, 0]} collidesWith={['zombie']} />
 * }
 * ```
 */
export function useRayCast() {
  pushEffect('useRayCast', () => {})
  return new RayCastReference()
}

export class RayCastReference extends Node2DReference<PrimaryNode.RayCast> {
  /** Reactive ray direction vector. */
  direction = new Signal({ x: 0, y: 0 }).getter
  /** Reactive reference to the currently detected collider, or `null`. */
  collider = new Signal<Collider | null>(null).getter
  /** Reactive `true` when a collider is detected. */
  detected = new Signal(false).getter

  /** Fires when the ray starts hitting a collider. */
  onColliderEnter = new Trigger<[collider: Collider]>()
  /** Fires when the ray stops hitting a collider. */
  onColliderExit = new Trigger<[collider: Collider]>()

  constructor() {
    super(
      PrimaryNode.RayCast,
      (node) => {
        this.onColliderEnter.link(node.onColliderEnter)
        this.onColliderExit.link(node.onColliderExit)

        const sets = [
          () => {
            this.direction.signal.setter(node.direction)
            this.collider.signal.setter(node.getCollider())
            this.detected.signal.setter(node.getCollider() != null)
          },
        ]
        sets.forEach((set) => set())

        node.onUpdate.connect(() => {
          sets.forEach((set) => set())
        })
      },
      () => {
        this.direction.signal.clearSubs()
        this.collider.signal.clearSubs()
        this.detected.signal.clearSubs()
      },
    )
  }

  /**
   * Returns the currently detected collider, or `null` if none is detected.
   *
   * @returns The detected `Collider` or `null`
   *
   * @example
   * ```tsx
   * import { useRayCast, useEffect } from 'fraxel'
   *
   * function Detector() {
   *   const raycast = useRayCast()
   *
   *   useEffect(() => {
   *     const hit = raycast.getCollider()
   *     if (hit) {
   *       console.log('Hit:', hit)
   *     }
   *   })
   *
   *   return <raycast ref={raycast} direction={[1, 0]} collidesWith={['enemy']} />
   * }
   * ```
   */
  getCollider(): Collider | null {
    return this.node.getCollider()
  }
}
