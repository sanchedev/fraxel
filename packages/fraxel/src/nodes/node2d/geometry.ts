import { GameConfig } from '../../core/game-config.js'
import type { Vector2 } from '../../math/vector2.js'
import type { Color } from '../../math/types.js'
import { propSignal } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { Nodes } from '../lib/registry.js'
import type { Reactive } from '../../reactivity/types.js'
import type { Shape } from '../../collision/narrowphase/shapes.js'

/**
 * Options for the `Geometry` node.
 */
export interface GeometryOptions extends Node2DOptions<PrimaryNode.Geometry> {
  /**
   * The **`shape`** property defines the collision shape to render.
   * Uses the same `shapes` factory from the collision system.
   *
   * @example
   * ```tsx
   * <geometry shape={shapes.rectangle(64, 32)} />
   * <geometry shape={shapes.circle(16)} />
   * <geometry shape={shapes.capsule(64, 12)} />
   * ```
   */
  shape: Reactive<Shape>
  /**
   * The **`fillColor`** property defines the fill color of the shape.
   * Each channel ranges from `0` to `1`.
   *
   * @default [1, 1, 1, 1]
   *
   * @example
   * ```tsx
   * <geometry shape={shapes.rectangle(64, 32)} fillColor={[1, 0, 0, 1]} />
   * ```
   */
  fillColor?: Reactive<Color>
  /**
   * The **`strokeColor`** property defines the border color of the shape.
   * If not provided, no border is drawn.
   *
   * @example
   * ```tsx
   * <geometry shape={shapes.rectangle(64, 32)} strokeColor={[0, 0, 0, 1]} strokeWidth={2} />
   * ```
   */
  strokeColor?: Reactive<Color>
  /**
   * The **`strokeWidth`** property defines the border width in pixels.
   *
   * @default 1
   *
   * @example
   * ```tsx
   * <geometry shape={shapes.rectangle(64, 32)} strokeColor={[0, 0, 0, 1]} strokeWidth={3} />
   * ```
   */
  strokeWidth?: Reactive<number>
}

/**
 * The **`Geometry`** node renders a shape (rectangle, circle, or capsule) to the canvas.
 * It uses the same `shapes` factory as the collision system, making it easy to
 * visualize physics bodies with matching shapes.
 *
 * @example
 * ```tsx
 * import { shapes } from 'fraxel'
 * import { useNode } from 'fraxel/hooks'
 * import { PrimaryNode } from 'fraxel/nodes/enum'
 *
 * function Player() {
 *   const ref = useNode(PrimaryNode.Geometry)
 *
 *   return (
 *     <geometry ref={ref} shape={shapes.rectangle(40, 40)} fillColor={[1, 0, 0, 1]} />
 *   )
 * }
 * ```
 */
export class Geometry extends Node2D<PrimaryNode.Geometry> {
  shape: Shape
  fillColor: Color
  strokeColor: Color | undefined
  strokeWidth: number

  constructor(options: GeometryOptions) {
    super(PrimaryNode.Geometry, options)
    this.shape = propSignal(this, 'shape', options.shape) as Shape
    this.fillColor = propSignal(this, 'fillColor', options.fillColor) ?? [1, 1, 1, 1]
    this.strokeColor = propSignal(this, 'strokeColor', options.strokeColor)
    this.strokeWidth = propSignal(this, 'strokeWidth', options.strokeWidth) ?? 1
  }

  /**
   * The read-only **`size`** property returns the bounding dimensions of the shape.
   * Computed from the current shape type.
   */
  get size(): Vector2 {
    if (this.shape.type === 'rectangle') {
      return this.shape.size
    }
    if (this.shape.type === 'circle') {
      const d = this.shape.radius * 2
      return { x: d, y: d } as Vector2
    }
    // capsule
    if (this.shape.direction === 'vertical') {
      return { x: this.shape.radius * 2, y: this.shape.length } as Vector2
    }
    return { x: this.shape.length, y: this.shape.radius * 2 } as Vector2
  }

  /** @internal Draws the shape. */
  draw(delta: number): void {
    const ctx = GameConfig.ctx
    const [r, g, b, a] = this.fillColor

    ctx.save()
    ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`

    if (this.shape.type === 'rectangle') {
      ctx.fillRect(this.position.x, this.position.y, this.shape.size.x, this.shape.size.y)

      if (this.strokeColor) {
        const [sr, sg, sb, sa] = this.strokeColor
        ctx.strokeStyle = `rgba(${sr * 255}, ${sg * 255}, ${sb * 255}, ${sa})`
        ctx.lineWidth = this.strokeWidth
        ctx.strokeRect(this.position.x, this.position.y, this.shape.size.x, this.shape.size.y)
      }
    } else if (this.shape.type === 'circle') {
      ctx.beginPath()
      ctx.arc(this.position.x, this.position.y, this.shape.radius, 0, Math.PI * 2)
      ctx.fill()

      if (this.strokeColor) {
        const [sr, sg, sb, sa] = this.strokeColor
        ctx.strokeStyle = `rgba(${sr * 255}, ${sg * 255}, ${sb * 255}, ${sa})`
        ctx.lineWidth = this.strokeWidth
        ctx.stroke()
      }
    } else if (this.shape.type === 'capsule') {
      this.#drawCapsule()
    }

    ctx.restore()

    super.draw(delta)
  }

  #drawCapsule(): void {
    if (this.shape.type !== 'capsule') return
    const { length, radius, direction } = this.shape
    const ctx = GameConfig.ctx
    const px = this.position.x
    const py = this.position.y
    const [r, g, b, a] = this.fillColor

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
    ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`
    ctx.fill()

    if (this.strokeColor) {
      const [sr, sg, sb, sa] = this.strokeColor
      ctx.strokeStyle = `rgba(${sr * 255}, ${sg * 255}, ${sb * 255}, ${sa})`
      ctx.lineWidth = this.strokeWidth
      ctx.stroke()
    }
  }
}

Nodes.geometry = Geometry
