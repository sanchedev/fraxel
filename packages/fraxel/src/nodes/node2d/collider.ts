import { GameConfig } from '../../core/game-config.js'
import { Event } from '../../events/event.js'
import type { Vector2 } from '../../math/vector2.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode } from '../lib/registry.js'
import { CollisionSystem } from '../../collision/collision-system.js'
import type { Shape } from '../../collision/narrowphase/shapes.js'

export interface ColliderOptions extends Node2DOptions<PrimaryNode.Collider> {
  /**
   * The **`shape`** property defines the collision shape.
   * Uses the `shapes` factory from the collision system.
   *
   * @example
   * ```tsx
   * import { shapes } from 'fraxel'
   *
   * <collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
   * <collider shape={shapes.circle(16)} group={['projectile']} collidesWith={['zombie']} />
   * ```
   */
  shape: Shape
  /**
   * The **`group`** property defines which collision groups this collider belongs to.
   *
   * @example
   * ```tsx
   * <collider shape={shapes.rectangle(32, 32)} group={['player', 'character']} collidesWith={['enemy']} />
   * ```
   */
  group: string[]
  /**
   * The **`collidesWith`** property defines which groups this collider can interact with.
   *
   * @example
   * ```tsx
   * <collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy', 'obstacle']} />
   * ```
   */
  collidesWith: string[]
}

/**
 * The **`Collider`** node detects overlaps with other colliders based on shape, group, and `collidesWith` configuration.
 * Supports rectangle, circle, and capsule shapes. Emits events when collisions begin, continue, or end.
 *
 * @example
 * ```tsx
 * import { shapes } from 'fraxel'
 * import { useCollider, useTrigger } from 'fraxel'
 *
 * function Player() {
 *   const collider = useCollider()
 *
 *   useTrigger(collider.colliderEntered, (other) => {
 *     console.log('Hit by:', other)
 *   })
 *
 *   return (
 *     <collider
 *       ref={collider}
 *       shape={shapes.rectangle(32, 32)}
 *       group={['player']}
 *       collidesWith={['enemy']}
 *     />
 *   )
 * }
 * ```
 */
export class Collider extends Node2D<PrimaryNode.Collider> {
  #shape: Shape
  #group: Set<string> = new Set()
  #collidesWith: Set<string> = new Set()

  _activeCollisions: Set<Collider> = new Set()

  #lastGlobalPosition: Vector2

  /**
   * The read-only **`shape`** property returns the collision shape.
   */
  get shape() {
    return this.#shape
  }

  /**
   * The read-only **`group`** property returns the set of groups this collider belongs to.
   */
  get group() {
    return this.#group
  }

  /**
   * The read-only **`collidesWith`** property returns the set of groups this collider can collide with.
   */
  get collidesWith() {
    return this.#collidesWith
  }

  /**
   * The read-only **`size`** property returns the bounding dimensions of the shape.
   * For rectangles: width × height. For circles: diameter × diameter. For capsules: computed from direction.
   */
  get size(): Vector2 {
    if (this.#shape.type === 'rectangle') {
      return this.#shape.size
    }
    if (this.#shape.type === 'circle') {
      const d = this.#shape.radius * 2
      return { x: d, y: d } as Vector2
    }
    // capsule
    if (this.#shape.direction === 'vertical') {
      return { x: this.#shape.radius * 2, y: this.#shape.length } as Vector2
    }
    return { x: this.#shape.length, y: this.#shape.radius * 2 } as Vector2
  }

  constructor(options: ColliderOptions) {
    super(PrimaryNode.Collider, options)

    this.#shape = options.shape
    this.#group = new Set(options.group)
    this.#collidesWith = new Set(options.collidesWith)
    this.#lastGlobalPosition = this.globalPosition.clone()
  }

  /**
   * The **`colliderEntered`** event fires when this collider first overlaps with another collider.
   */
  colliderEntered = new Event('colliderEnter', (_collider: Collider) => {})

  /**
   * The **`collided`** event fires every frame while this collider overlaps with another collider.
   */
  collided = new Event('collide', (_collider: Collider) => {})

  /**
   * The **`colliderExited`** event fires when this collider stops overlapping with another collider.
   */
  colliderExited = new Event('colliderExit', (_collider: Collider) => {})

  /** @internal Registers this collider with the collision system. */
  start(): void {
    CollisionSystem.register(this)
    super.start()
  }

  /** @internal Draws the collision shape for debugging. */
  draw(delta: number): void {
    if (GameConfig.testOptions.showColliders) {
      GameConfig.ctx.fillStyle = '#85b2e25c'
      GameConfig.ctx.strokeStyle = '#3f73abb4'
      GameConfig.ctx.lineWidth = 1

      if (this.#shape.type === 'circle') {
        GameConfig.ctx.beginPath()
        GameConfig.ctx.arc(this.position.x, this.position.y, this.#shape.radius, 0, Math.PI * 2)
        GameConfig.ctx.fill()
        GameConfig.ctx.stroke()
      } else if (this.#shape.type === 'capsule') {
        this.#drawCapsule()
      } else {
        GameConfig.ctx.fillRect(
          this.position.x,
          this.position.y,
          this.#shape.size.x,
          this.#shape.size.y,
        )
        GameConfig.ctx.strokeRect(
          this.position.x,
          this.position.y,
          this.#shape.size.x,
          this.#shape.size.y,
        )
      }
    }

    super.draw(delta)
  }

  #drawCapsule(): void {
    if (this.#shape.type !== 'capsule') return
    const { length, radius, direction } = this.#shape
    const ctx = GameConfig.ctx
    const px = this.position.x
    const py = this.position.y

    ctx.beginPath()

    if (direction === 'vertical') {
      const cx = px + radius
      const topY = py + radius
      const botY = py + length - radius

      ctx.arc(cx, topY, radius, Math.PI, 0)
      ctx.lineTo(cx + radius, botY)
      ctx.arc(cx, botY, radius, 0, Math.PI)
      ctx.lineTo(cx - radius, topY)
    } else {
      const cy = py + radius
      const leftX = px + radius
      const rightX = px + length - radius

      ctx.arc(leftX, cy, radius, Math.PI * 0.5, Math.PI * 1.5)
      ctx.lineTo(rightX, cy - radius)
      ctx.arc(rightX, cy, radius, -Math.PI * 0.5, Math.PI * 0.5)
      ctx.lineTo(leftX, cy + radius)
    }

    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  /** @internal Checks position changes and marks collision system dirty. */
  update(delta: number): void {
    const currentGlobalPos = this.globalPosition
    if (!currentGlobalPos.equals(this.#lastGlobalPosition)) {
      this.#lastGlobalPosition = currentGlobalPos.clone()
      CollisionSystem.setDirty()
    }

    super.update(delta)
  }

  /** @internal Unregisters this collider from the collision system. */
  destroy(): void {
    CollisionSystem.unregister(this)
    super.destroy()
  }

  /** @internal Cleans up custom event listeners. */
  cleanEvents(): void {
    this.colliderEntered.clean()
    this.collided.clean()
    this.colliderExited.clean()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.Collider, Collider)
