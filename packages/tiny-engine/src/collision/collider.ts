import { GameConfig } from '../core/game-config.js'
import { Event } from '../events/event.js'
import type { Vector2 } from '../math/vector2.js'
import { PrimaryNode } from '../nodes/enum.js'
import { Node, type NodeOptions } from '../nodes/node.js'
import { Nodes } from '../nodes/registry.js'
import { CollisionSystem } from './collision-system.js'
import type { Shape } from './narrowphase/shapes.js'

export interface ColliderOptions extends NodeOptions<PrimaryNode.Collider> {
  /**
   * The **`shape`** property defines the collision shape of the collider.
   *
   * @example
   * ```tsx
   * // Rectangle
   * <collider shape={shapes.rectangle(32, 32)} ... />
   *
   * // Circle
   * <collider shape={shapes.circle(16)} ... />
   * ```
   */
  shape: Shape
  /**
   * The **`group`** property defines the collision groups this collider belongs to.
   *
   * @example
   * ```tsx
   * <collider shape={...} group={['player', 'character']} ... />
   * ```
   */
  group: string[]
  /**
   * The **`collidesWith`** property defines which groups this collider can interact with.
   *
   * @example
   * ```tsx
   * <collider shape={...} group={...} collidesWith={['enemy', 'obstacle']} ... />
   * ```
   */
  collidesWith: string[]
}

/**
 * The **`Collider`** node detects collisions with other colliders based on shape, group, and collidesWith configuration.
 * It supports rectangle and circle shapes and emits events when collisions begin, continue, or end.
 *
 * @example
 * ```tsx
 * import { shapes } from 'tiny-engine'
 *
 * // Rectangle collider
 * <collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
 *
 * // Circle collider
 * <collider shape={shapes.circle(16)} group={['projectile']} collidesWith={['zombie']} />
 * ```
 */
export class Collider extends Node<PrimaryNode.Collider> {
  #shape: Shape
  #group: Set<string> = new Set()
  #collidesWith: Set<string> = new Set()

  _activeCollisions: Set<Collider> = new Set()

  #lastGlobalPosition: Vector2

  /**
   * The read-only **`shape`** property returns the collision shape of this collider.
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
   * For rectangles, returns the width and height. For circles, returns diameter x diameter.
   */
  get size(): Vector2 {
    if (this.#shape.type === 'rectangle') {
      return this.#shape.size
    }
    const d = this.#shape.radius * 2
    return { x: d, y: d } as Vector2
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
        GameConfig.ctx.arc(
          this.position.x,
          this.position.y,
          this.#shape.radius,
          0,
          Math.PI * 2,
        )
        GameConfig.ctx.fill()
        GameConfig.ctx.stroke()
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
}

Nodes.collider = Collider
