import { PrimaryNode } from '../../../nodes/index.js'
import { createSignalSetter, Signal } from '../../../reactivity/signal.js'
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
 *     geo.setFillColor('#f008') // semi-transparent red
 *   })
 *
 *   return (
 *     <geometry ref={geo} shape={shapes.rectangle(32, 32)} />
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
  /** Sets the rendered shape. */
  setShape = createSignalSetter(this.shape.signal, {
    value: () => this.node.shape,
    onChange: (v) => (this.node.shape = v),
  })
  /** Reactive fill color. */
  fillColor = new Signal<Color>(Color.WHITE).getter
  /** Sets the fill color. */
  setFillColor = createSignalSetter(this.fillColor.signal, {
    value: () => this.node.fillColor,
    onChange: (v) => (this.node.fillColor = v),
  })
  /** Reactive stroke color, or `undefined` for no stroke. */
  strokeColor = new Signal<Color | undefined>(undefined).getter
  /** Sets the stroke color. Pass `undefined` to remove the stroke. */
  setStrokeColor = createSignalSetter(this.strokeColor.signal, {
    value: () => this.node.strokeColor,
    onChange: (v) => (this.node.strokeColor = v),
  })
  /** Reactive stroke width in pixels. */
  strokeWidth = new Signal(1).getter
  /** Sets the stroke width in pixels. */
  setStrokeWidth = createSignalSetter(this.strokeWidth.signal, {
    value: () => this.node.strokeWidth,
    onChange: (v) => (this.node.strokeWidth = v),
  })
  /** Reactive size vector. */
  size = new Signal<Vector2>({ x: 0, y: 0 } as Vector2).getter

  constructor() {
    super({
      type: PrimaryNode.Geometry,
      onFrame: (node) => {
        this.shape.signal.setter(node.shape)
        this.fillColor.signal.setter(node.fillColor.clone())
        this.strokeColor.signal.setter(node.strokeColor?.clone())
        this.strokeWidth.signal.setter(node.strokeWidth)
        this.size.signal.setter(node.size.clone())
      },
      regSignal: ({ reg }) => {
        reg<GeometryReference>(this, 'shape', 'fillColor', 'strokeColor', 'strokeWidth', 'size')
      },
    })
  }
}
