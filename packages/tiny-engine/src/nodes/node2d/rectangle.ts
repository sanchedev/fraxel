import { GameConfig } from '../../core/game-config.js'
import { vectorize, type Vector2, type VectorLike } from '../../math/vector2.js'
import type { Color } from '../../math/types.js'
import { applySignal, propSignal } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { Nodes } from '../lib/registry.js'
import type { SignalGetter } from '../../reactivity/types.js'

/**
 * Options for the `Rectangle` node.
 */
export interface RectangleOptions extends Node2DOptions<PrimaryNode.Rectangle> {
  /**
   * The **`size`** property defines the dimensions of the rectangle.
   *
   * @example
   * ```tsx
   * <rectangle size={[64, 32]} />
   * <rectangle size={new Vector2(100, 50)} />
   * <rectangle size={32} />
   * ```
   */
  size: VectorLike | SignalGetter<VectorLike>
  /**
   * The **`fillColor`** property defines the fill color of the rectangle.
   * Each channel ranges from `0` to `1`.
   *
   * @default [1, 1, 1, 1]
   *
   * @example
   * ```tsx
   * <rectangle size={[64, 32]} fillColor={[1, 0, 0, 1]} />
   * ```
   */
  fillColor?: Color | SignalGetter<Color>
  /**
   * The **`strokeColor`** property defines the border color of the rectangle.
   * If not provided, no border is drawn.
   *
   * @example
   * ```tsx
   * <rectangle size={[64, 32]} strokeColor={[0, 0, 0, 1]} strokeWidth={2} />
   * ```
   */
  strokeColor?: Color | SignalGetter<Color>
  /**
   * The **`strokeWidth`** property defines the border width in pixels.
   *
   * @default 1
   *
   * @example
   * ```tsx
   * <rectangle size={[64, 32]} strokeColor={[0, 0, 0, 1]} strokeWidth={3} />
   * ```
   */
  strokeWidth?: number | SignalGetter<number>
}

/**
 * The **`Rectangle`** node renders a filled and optionally stroked rectangle.
 * It supports reactive props via `SignalGetter` for dynamic visuals.
 *
 * @example
 * ```tsx
 * import { useRefNode } from 'tiny-engine/hooks'
 * import { PrimaryNode } from 'tiny-engine/nodes/enum'
 *
 * function HealthBar() {
 *   const bar = useRefNode(PrimaryNode.Rectangle)
 *
 *   return (
 *     <rectangle
 *       ref={bar}
 *       position={[10, 10]}
   *       size={[100, 8]}
   *       fillColor={[0, 1, 0, 1]}
   *     />
   *   )
   * }
   * ```
 */
export class Rectangle extends Node2D<PrimaryNode.Rectangle> {
  size: Vector2
  fillColor: Color
  strokeColor: Color | undefined
  strokeWidth: number

  constructor(options: RectangleOptions) {
    super(PrimaryNode.Rectangle, options)
    this.size = propSignal(this, 'size', applySignal(options.size, vectorize))
    this.fillColor = propSignal(this, 'fillColor', options.fillColor) ?? [1, 1, 1, 1]
    this.strokeColor = propSignal(this, 'strokeColor', options.strokeColor)
    this.strokeWidth = propSignal(this, 'strokeWidth', options.strokeWidth) ?? 1
  }

  /** @internal Draws the rectangle. */
  draw(delta: number): void {
    const ctx = GameConfig.ctx
    const [r, g, b, a] = this.fillColor

    ctx.save()

    ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`
    ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)

    if (this.strokeColor) {
      const [sr, sg, sb, sa] = this.strokeColor
      ctx.strokeStyle = `rgba(${sr * 255}, ${sg * 255}, ${sb * 255}, ${sa})`
      ctx.lineWidth = this.strokeWidth
      ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y)
    }

    ctx.restore()

    super.draw(delta)
  }
}

Nodes.rectangle = Rectangle
