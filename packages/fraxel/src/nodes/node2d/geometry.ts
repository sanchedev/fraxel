import { GameConfig } from '../../core/game-config.js'
import type { Vector2 } from '../../math/vector2.js'
import { ns, propSignal, signalColor } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode } from '../lib/registry.js'
import type { Reactive } from '../../reactivity/types.js'
import type { Shape } from '../../collision/narrowphase/shapes.js'
import { Color, type ColorLike } from '../../math/color.js'

/**
 * The **`GeometryOptions`** interface defines the configuration for a `Geometry` node.
 */
export interface GeometryOptions extends Node2DOptions<PrimaryNode.Geometry> {
  /**
   * The **`shape`** property defines the shape to render.
   * Uses the `shapes` factory from the collision system.
   *
   * @example
   * ```tsx
   * import { shapes } from 'fraxel'
   *
   * <geometry shape={shapes.rectangle(64, 32)} />
   * <geometry shape={shapes.circle(16)} />
   * <geometry shape={shapes.capsule(64, 12)} />
   * ```
   */
  shape: Reactive<Shape>
  /**
   * The **`fillColor`** property defines the fill color.
   * Each channel ranges from `0` to `1`.
   *
   * @default [1, 1, 1, 1]
   *
   * @example
   * ```tsx
   * import { shapes } from 'fraxel'
   *
   * <geometry shape={shapes.rectangle(64, 32)} fillColor="#f00" />
   * ```
   */
  fillColor?: Reactive<ColorLike>
  /**
   * The **`strokeColor`** property defines the border color.
   * If not provided, no border is drawn.
   *
   * @example
   * ```tsx
   * import { shapes } from 'fraxel'
   *
   * <geometry shape={shapes.rectangle(64, 32)} strokeColor="#000" strokeWidth={2} />
   * ```
   */
  strokeColor?: Reactive<ColorLike>
  /**
   * The **`strokeWidth`** property defines the border width in pixels.
   *
   * @default 1
   *
   * @example
   * ```tsx
   * import { shapes } from 'fraxel'
   *
   * <geometry shape={shapes.rectangle(64, 32)} strokeColor="#000" strokeWidth={3} />
   * ```
   */
  strokeWidth?: Reactive<number>
}

/**
 * The **`Geometry`** node renders a shape (rectangle, circle, or capsule) to the canvas.
 * Uses the same `shapes` factory as the collision system, making it easy to
 * visualize physics bodies with matching shapes.
 *
 * @example
 * ```tsx
 * import { shapes } from 'fraxel'
 * import { useGeometry } from 'fraxel'
 *
 * function Player() {
 *   const geo = useGeometry()
 *
 *   useEffect(() => {
 *     geo.setFillColor([1, 0, 0, 1])
 *   })
 *
 *   return (
 *     <geometry ref={geo} shape={shapes.rectangle(40, 40)} />
 *   )
 * }
 * ```
 */
export class Geometry extends Node2D<PrimaryNode.Geometry> {
  shape: Shape
  fillColor: Color = Color.WHITE
  strokeColor: Color | undefined
  strokeWidth: number

  constructor(options: GeometryOptions) {
    super(PrimaryNode.Geometry, options)
    this.shape = propSignal(this, 'shape', options.shape) as Shape
    this.fillColor = ns(
      options.fillColor,
      (c) => propSignal(this, 'fillColor', signalColor(c)),
      this.fillColor,
    )
    this.strokeColor = ns(
      options.strokeColor,
      (c) => propSignal(this, 'strokeColor', signalColor(c)),
      this.strokeColor,
    )
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
    ctx.save()
    ctx.fillStyle = this.fillColor.toCSS()

    if (this.shape.type === 'rectangle') {
      ctx.fillRect(this.position.x, this.position.y, this.shape.size.x, this.shape.size.y)

      if (this.strokeColor) {
        ctx.strokeStyle = this.strokeColor.toCSS()
        ctx.lineWidth = this.strokeWidth
        ctx.strokeRect(this.position.x, this.position.y, this.shape.size.x, this.shape.size.y)
      }
    } else if (this.shape.type === 'circle') {
      ctx.beginPath()
      ctx.arc(this.position.x, this.position.y, this.shape.radius, 0, Math.PI * 2)
      ctx.fill()

      if (this.strokeColor) {
        ctx.strokeStyle = this.strokeColor.toCSS()
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
    ctx.fillStyle = this.fillColor.toCSS()
    ctx.fill()

    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor.toCSS()
      ctx.lineWidth = this.strokeWidth
      ctx.stroke()
    }
  }
}

registerNode(PrimaryNode.Geometry, Geometry)
