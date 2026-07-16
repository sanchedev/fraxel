import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalSetter } from '../../../reactivity/types.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'
import { Vector2, vector2, type VectorLike } from '../../../math/vector2.js'
import type { Bounds } from '../../../math/bounds.js'

/**
 * The **`useCamera`** hook creates a reference to a `Camera` node with reactive
 * zoom, offset, and smoothing properties, plus imperative control methods.
 *
 * @returns A `CameraReference` with reactive properties and control methods
 *
 * @example
 * ```tsx
 * import { useCamera, useEffect } from 'fraxel'
 *
 * function MainCamera() {
 *   const camera = useCamera()
 *
 *   useEffect(() => {
 *     camera.makeCurrent()
 *     camera.setZoom(vector2(2))
 *   })
 *
 *   return <camera ref={camera} />
 * }
 * ```
 */
export function useCamera() {
  pushEffect('useCamera', () => {})
  return new CameraReference()
}

export class CameraReference extends Node2DReference<PrimaryNode.Camera> {
  /** Reactive zoom level as a Vector2 (1 = normal, 2 = zoomed in). */
  zoom = new Signal<Vector2>(vector2(1)).getter
  /** Sets the camera zoom. Accepts any `VectorLike` value. */
  setZoom: SignalSetter<VectorLike> = (value) => (this.node.zoom = vector2(value))
  /** Reactive camera offset from the target position. */
  offset = new Signal<Vector2>(Vector2.ZERO.clone()).getter
  /** Sets the camera screen-space offset. Accepts any `VectorLike` value. */
  setOffset: SignalSetter<VectorLike> = (value) => (this.node.offset = vector2(value))
  /** Reactive smoothing factor (0 = instant, higher = smoother). */
  smoothing = new Signal(0).getter
  /** Sets the camera smoothing factor. */
  setSmoothing: SignalSetter<number> = (value) => (this.node.smoothing = value)
  /** Reactive camera bounds limit, or `null` for no limit. */
  limit = new Signal<Bounds | null>(null).getter
  /** Sets the camera bounds limit. Pass `null` to remove limits. */
  setLimit: SignalSetter<Bounds | null> = (value) => (this.node.limit = value)

  /** Makes this camera the active camera for the scene. */
  makeCurrent: () => void = () => {}
  /**
   * Triggers a camera shake effect.
   *
   * @param options The shake configuration
   * @param options.duration Duration of the shake in seconds
   * @param options.strength Maximum displacement in pixels
   */
  shake: (options: { duration: number; strength: number }) => void = () => {}
  /**
   * Converts screen coordinates to world coordinates.
   *
   * @param screenPos The screen position to convert
   * @returns The corresponding world position
   */
  screenToWorld: (screenPos: VectorLike) => Vector2 = (pos) => vectorize(pos)
  /**
   * Converts world coordinates to screen coordinates.
   *
   * @param worldPos The world position to convert
   * @returns The corresponding screen position
   */
  worldToScreen: (worldPos: VectorLike) => Vector2 = (pos) => vectorize(pos)

  constructor() {
    super(
      PrimaryNode.Camera,
      (node) => {
        const sets = [
          () => {
            this.zoom.signal.setter(node.zoom)
            this.offset.signal.setter(node.offset)
            this.smoothing.signal.setter(node.smoothing)
            this.limit.signal.setter(node.limit)
          },
        ]
        sets.forEach((set) => set())
        node.onUpdate.connect(() => {
          sets.forEach((set) => set())
        })

        this.makeCurrent = () => node.makeCurrent()
        this.shake = (opts) => node.shake(opts)
        this.screenToWorld = (pos) => node.screenToWorld(vectorize(pos))
        this.worldToScreen = (pos) => node.worldToScreen(vectorize(pos))
      },
      () => {
        this.zoom.signal.clearSubs()
        this.offset.signal.clearSubs()
        this.smoothing.signal.clearSubs()
        this.limit.signal.clearSubs()
      },
    )
  }
}

function vectorize(value: VectorLike): Vector2 {
  if (value instanceof Vector2) return value
  if (Array.isArray(value)) return new Vector2(value[0], value[1])
  if (typeof value === 'object' && 'x' in value && 'y' in value)
    return new Vector2(value.x, value.y)
  return new Vector2(value, value)
}
