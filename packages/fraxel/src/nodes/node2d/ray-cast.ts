import { GameConfig } from '../../core/game-config.js'
import { Event } from '../../events/event.js'
import { Vector2, type VectorLike } from '../../math/vector2.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { Nodes } from '../lib/registry.js'
import { CollisionSystem } from '../../collision/collision-system.js'
import type { Collider } from './collider.js'
import type { Reactive } from '../../reactivity/types.js'
import { propSignal, signalVector } from '../../utils/ternaries.js'

export interface RayCastOptions extends Node2DOptions<PrimaryNode.RayCast> {
  /**
   * The **`direction`** property defines the relative point from the raycast origin.
   * The origin is the node's position in the game world.
   *
   * @example
   * ```tsx
   * // 3 units to the right
   * <ray-cast direction={[3, 0]} ... />
   *
   * // 2 units to the left
   * <ray-cast direction={[-2, 0]} ... />
   *
   * // 3 units right and 3 units up (diagonal)
   * <ray-cast direction={[3, 3]} ... />
   * ```
   */
  direction: Reactive<VectorLike>
  /**
   * The **`collidesWith`** property defines which groups this raycast can interact with.
   *
   * @example
   * ```tsx
   * <ray-cast direction={...} collidesWith={['enemy', 'obstacle']} ... />
   * ```
   */
  collidesWith: string[]
}

/**
 * The **`RayCast`** node projects a ray from its position in a direction and detects the first collider it hits.
 * It supports both rectangle and circle collider shapes and emits events when the detected collider changes.
 *
 * @example
 * ```tsx
 * import { useNode, useEvent } from 'fraxel/hooks'
 * import { PrimaryNode } from 'fraxel'
 *
 * function Gun() {
 *   const ray = useNode(PrimaryNode.RayCast)
 *
 *   useEvent(ray, 'colliderEnter', (collider) => {
 *     console.log('Hit:', collider)
 *   })
 *
 *   return (
 *     <ray-cast
 *       ref={ray}
 *       direction={[100, 0]}
 *       collidesWith={['enemy']}
 *     />
 *   )
 * }
 * ```
 */
export class RayCast extends Node2D<PrimaryNode.RayCast> {
  /**
   * The **`direction`** property defines the relative endpoint of the raycast from its origin.
   */
  direction: Vector2

  #collidesWith: string[]

  _detectedCollider: Collider | null = null

  constructor(options: RayCastOptions) {
    super(PrimaryNode.RayCast, options)

    this.direction = propSignal(this, 'direction', signalVector(options.direction))
    this.#collidesWith = Array.from(new Set(options.collidesWith))
  }

  /**
   * The read-only **`collidesWith`** property returns the groups this raycast detects.
   */
  get collidesWith() {
    return this.#collidesWith
  }

  /**
   * The read-only **`length`** property returns the length of the raycast direction vector.
   *
   * @example
   * ```ts
   * // Ray pointing 5 units right, 12 units up
   * const length = ray.length // 13
   * ```
   */
  get length(): number {
    return Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2)
  }

  /**
   * The **`colliderEntered`** event fires when a new collider is hit by this raycast.
   */
  colliderEntered = new Event('colliderEnter', (_collider: Collider) => {})

  /**
   * The **`colliderExited`** event fires when the previously hit collider is no longer in range.
   */
  colliderExited = new Event('colliderExit', (_collider: Collider) => {})

  /**
   * The **`getCollider`** method returns the currently detected collider, or `null` if none is in range.
   * @returns The detected `Collider` or `null`.
   *
   * @example
   * ```ts
   * import { useEvent, useNode } from 'fraxel/hooks'
   * import { PrimaryNode } from 'fraxel'
   *
   * const ray = useNode(PrimaryNode.RayCast)
   *
   * useEvent(ray, 'colliderEnter', () => {
   *   const target = ray.node.getCollider()
   *   if (target) {
   *     console.log('Target found at:', target.globalPosition)
   *   }
   * })
   * ```
   */
  getCollider(): Collider | null {
    return this._detectedCollider
  }

  /** @internal Registers this raycast with the collision system. */
  start(): void {
    CollisionSystem.registerRaycast(this)
    super.start()
  }

  /** @internal Draws the raycast direction for debugging. */
  draw(delta: number): void {
    if (GameConfig.testOptions.showRayCasts) {
      const endX = this.position.x + this.direction.x
      const endY = this.position.y + this.direction.y

      GameConfig.ctx.fillStyle = '#b83c3c55'
      GameConfig.ctx.strokeStyle = '#b83c3c55'
      GameConfig.ctx.lineWidth = 1

      GameConfig.ctx.beginPath()
      GameConfig.ctx.moveTo(this.position.x, this.position.y)
      GameConfig.ctx.lineTo(endX, endY)
      GameConfig.ctx.stroke()

      const angle = Math.atan2(this.direction.y, this.direction.x)
      const headLen = 4

      GameConfig.ctx.beginPath()
      GameConfig.ctx.moveTo(endX, endY)
      GameConfig.ctx.lineTo(
        endX - headLen * Math.cos(angle - Math.PI / 6),
        endY - headLen * Math.sin(angle - Math.PI / 6),
      )
      GameConfig.ctx.lineTo(
        endX - headLen * Math.cos(angle + Math.PI / 6),
        endY - headLen * Math.sin(angle + Math.PI / 6),
      )
      GameConfig.ctx.closePath()
      GameConfig.ctx.fill()
    }

    super.draw(delta)
  }

  /** @internal Updates the raycast each frame. */
  update(delta: number): void {
    super.update(delta)
  }

  /** @internal Unregisters this raycast from the collision system. */
  destroy(): void {
    CollisionSystem.unregisterRaycast(this)
    super.destroy()
  }
}

Nodes['ray-cast'] = RayCast
