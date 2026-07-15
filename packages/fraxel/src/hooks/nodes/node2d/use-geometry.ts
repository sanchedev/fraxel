import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'
import type { Shape } from '../../../collision/narrowphase/shapes.js'
import type { Vector2 } from '../../../math/vector2.js'
import { Color } from '../../../math/color.js'

/**
 * The **`useGeometry`** hook creates a reference to a `Geometry` node with reactive
 * access to shape, color, and size properties.
 *
 * @returns A `GeometryReference` with reactive geometry properties
 *
 * @example
 * ```tsx
 * import { useGeometry, useEffect } from 'fraxel'
 *
 * function Hitbox() {
 *   const geo = useGeometry()
 *
 *   useEffect(() => {
 *     geo.setFillColor([1, 0, 0, 0.5]) // semi-transparent red
 *   })
 *
 *   return (
 *     <geometry ref={geo} shape={shapes.rectangle(32, 32)}>
 *       <collider shape={shapes.rectangle(32, 32)} group={['hitbox']} />
 *     </geometry>
 *   )
 * }
 * ```
 */
export function useGeometry() {
  pushEffect('useGeometry', () => {})
  return new GeometryReference()
}

export class GeometryReference extends Node2DReference<PrimaryNode.Geometry> {
  /** Reactive collision shape. */
  shape = new Signal<Shape>(null as unknown as Shape).getter
  /** Reactive fill color. */
  fillColor = new Signal<Color>(Color.WHITE).getter
  /** Reactive stroke color, or `undefined` for no stroke. */
  strokeColor = new Signal<Color | undefined>(undefined).getter
  /** Reactive stroke width in pixels. */
  strokeWidth = new Signal(1).getter
  /** Reactive size vector. */
  size = new Signal<Vector2>({ x: 0, y: 0 } as Vector2).getter

  constructor() {
    super(
      PrimaryNode.Geometry,
      (node) => {
        const sets = [
          () => {
            this.shape.signal.setter(node.shape)
            this.fillColor.signal.setter(node.fillColor)
            this.strokeColor.signal.setter(node.strokeColor)
            this.strokeWidth.signal.setter(node.strokeWidth)
            this.size.signal.setter(node.size)
          },
        ]
        sets.forEach((set) => set())
        node.onUpdate.connect(() => {
          sets.forEach((set) => set())
        })
      },
      () => {
        this.shape.signal.clearSubs()
        this.fillColor.signal.clearSubs()
        this.strokeColor.signal.clearSubs()
        this.strokeWidth.signal.clearSubs()
        this.size.signal.clearSubs()
      },
    )
  }
}
