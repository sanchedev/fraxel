import { GameConfig } from '../../core/game-config.js'
import { Vector2, type VectorLike } from '../../math/vector2.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode } from '../lib/registry.js'
import { CollisionSystem } from '../../collision/collision-system.js'
import type { CollisionOwner } from '../../collision/collision-system.js'
import { CollisionLayer, type CollisionMaskValue } from '../../collision/layers.js'
import type { Reactive } from '../../reactivity/types.js'
import { propSignal, signalVector } from '../../utils/ternaries.js'
import { Trigger } from '../../events/trigger.js'

export interface RayCastOptions extends Node2DOptions<PrimaryNode.RayCast> {
  /**
   * The **`direction`** property defines the relative endpoint of the ray from its origin.
   * The origin is the node's world position.
   *
   * @example
   * ```tsx
   * <raycast direction={[100, 0]} mask={Layers.Enemy} />
   * <raycast direction={[0, -50]} mask={Layers.Ceiling} />
   * ```
   */
  direction: Reactive<VectorLike>
  /**
   * The **`mask`** property defines which owner layers this raycast detects.
   *
   * @example
   * ```tsx
   * <raycast direction={[100, 0]} mask={Layers.Enemy | Layers.Obstacle} />
   * ```
   */
  mask?: CollisionMaskValue
}

/**
 * The **`RayCast`** node projects a ray from its position and detects the first collision owner it hits.
 *
 * @example
 * ```tsx
 * import { useRayCast, useTrigger } from 'fraxel'
 *
 * function Gun() {
 *   const ray = useRayCast()
 *
 *   useTrigger(ray.onTargetEnter, (target) => {
 *     console.log('Hit:', target)
 *   })
 *
 *   return (
 *     <raycast
 *       ref={ray}
 *       direction={[100, 0]}
 *       mask={Layers.Enemy}
 *     />
 *   )
 * }
 * ```
 */
export class RayCast extends Node2D<PrimaryNode.RayCast> {
  /**
   * The **`direction`** property defines the relative endpoint of the ray from its origin.
   */
  direction: Vector2

  #mask: CollisionMaskValue

  _target: CollisionOwner | null = null

  constructor(options: RayCastOptions) {
    super(PrimaryNode.RayCast, options)

    this.direction = propSignal(this, 'direction', signalVector(options.direction))
    this.#mask = options.mask ?? CollisionLayer.Default
  }

  /**
   * The read-only **`mask`** property returns the owner layers this raycast detects.
   */
  get mask() {
    return this.#mask
  }

  setMask(mask: CollisionMaskValue): void {
    this.#mask = mask
  }

  /**
   * The read-only **`length`** property returns the length of the direction vector.
   *
   * @example
   * ```ts
   * const rayLength = ray.length
   * ```
   */
  get length(): number {
    return Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2)
  }

  // Trigger
  onTargetEnter = new Trigger<[target: CollisionOwner]>()
  onTargetExit = new Trigger<[target: CollisionOwner]>()

  /**
   * The **`getTarget`** method returns the currently detected owner.
   * @returns The detected `RigidBody`/`Detector` or `null` if none is in range.
   *
   * @example
   * ```tsx
   * import { useRayCast, useTrigger } from 'fraxel'
   *
   * function Peashooter() {
   *   const ray = useRayCast()
   *
   *   useTrigger(ray.onTargetEnter, () => {
   *     const target = ray.getTarget()
   *     if (target) {
   *       console.log('Target at:', target.globalPosition)
   *     }
   *   })
   *
   *   return <raycast ref={ray} direction={[100, 0]} mask={Layers.Zombie} />
   * }
   * ```
   */
  getTarget(): CollisionOwner | null {
    return this._target
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

  /** @internal Cleans up custom event listeners. */
  cleanEvents(): void {
    this.onTargetEnter.clear()
    this.onTargetExit.clear()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.RayCast, RayCast)
