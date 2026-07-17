import { GameConfig } from '../../core/game-config.js'
import type { Vector2 } from '../../math/vector2.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode } from '../lib/registry.js'
import type { Shape } from '../../collision/narrowphase/shapes.js'
import { warnInvalidColliderParent } from '../../warn/index.js'

export interface ColliderOptions extends Node2DOptions<PrimaryNode.Collider> {
  /**
   * The **`shape`** property defines the collision shape.
   * Uses the `shapes` factory from the collision system.
   *
   * @example
   * ```tsx
   * import { shapes } from 'fraxel'
   *
   * <body>
   *   <collider shape={shapes.rectangle(32, 32)} />
   * </body>
   * ```
   */
  shape: Shape
}

/**
 * The **`Collider`** node defines a collision shape. It must be a direct child of a
 * `RigidBody` or `Detector`; the parent decides whether the shape participates in
 * physics or detection.
 *
 * @example
 * ```tsx
 * import { shapes } from 'fraxel'
 * import { useCollider } from 'fraxel'
 *
 * function Player() {
 *   const collider = useCollider()
 *
 *   return (
 *     <body>
 *       <collider ref={collider} shape={shapes.rectangle(32, 32)} />
 *     </body>
 *   )
 * }
 * ```
 */
export class Collider extends Node2D<PrimaryNode.Collider> {
  #shape: Shape

  #lastGlobalPosition: Vector2
  #lastGlobalRotation: number

  /**
   * The read-only **`shape`** property returns the collision shape.
   */
  get shape() {
    return this.#shape
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
    this.#lastGlobalPosition = this.globalPosition.clone()
    this.#lastGlobalRotation = this.globalRotation
  }

  setShape(shape: Shape): void {
    this.#shape = shape
  }

  /** @internal Warns if this collider has no direct collision owner. */
  start(): void {
    warnInvalidColliderParent(this)
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

  /** @internal Checks position and rotation changes and marks collision system dirty. */
  update(delta: number): void {
    const currentGlobalPos = this.globalPosition
    const currentGlobalRot = this.globalRotation
    if (
      !currentGlobalPos.equals(this.#lastGlobalPosition) ||
      currentGlobalRot !== this.#lastGlobalRotation
    ) {
      this.#lastGlobalPosition = currentGlobalPos.clone()
      this.#lastGlobalRotation = currentGlobalRot
    }

    super.update(delta)
  }
}

registerNode(PrimaryNode.Collider, Collider)
