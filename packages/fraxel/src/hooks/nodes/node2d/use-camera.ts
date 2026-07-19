import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalSetter } from '../../../reactivity/types.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'
import { Vector2, vector2, type VectorLike } from '../../../math/vector2.js'
import { Bounds } from '../../../math/bounds.js'

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
  makeCurrent = () => this.node.makeCurrent()
  /**
   * Triggers a camera shake effect.
   *
   * @param options The shake configuration
   * @param options.duration Duration of the shake in seconds
   * @param options.strength Maximum displacement in pixels
   */
  shake = (options: { duration: number; strength: number }) => this.node.shake(options)
  /**
   * Converts screen coordinates to world coordinates.
   *
   * @param screenPos The screen position to convert
   * @returns The corresponding world position
   */
  screenToWorld = (screenPos: VectorLike) => this.node.screenToWorld(vector2(screenPos))
  /**
   * Converts world coordinates to screen coordinates.
   *
   * @param worldPos The world position to convert
   * @returns The corresponding screen position
   */
  worldToScreen = (worldPos: VectorLike) => this.node.worldToScreen(vector2(worldPos))

  constructor() {
    super({
      type: PrimaryNode.Camera,
      regSignal: ({ reg }) => {
        reg<CameraReference>(this, 'zoom', 'offset', 'smoothing', 'limit')
      },
      onFrame: (node) => {
        this.zoom.signal.setter(new Vector2(node.zoom))
        this.offset.signal.setter(new Vector2(node.offset))
        this.smoothing.signal.setter(node.smoothing)
        this.limit.signal.setter(node.limit?.clone() ?? null)
      },
    })
  }
}
