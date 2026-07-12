import { GameConfig } from '../../core/game-config.js'
import { ns, propSignal, signalVector } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { registerNode } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import type { Reactive } from '../../reactivity/types.js'
import { vector2, Vector2, type VectorLike } from '../../math/vector2.js'
import type { Bounds } from '../../math/bounds.js'
import { clamp } from '../../math/utils.js'

/**
 * The **`CameraOptions`** interface defines the configuration for a `Camera` node.
 */
export interface CameraOptions extends Node2DOptions<PrimaryNode.Camera> {
  /**
   * The **`current`** property makes this camera the active one controlling the viewport.
   * Only one camera should be `current` at a time.
   *
   * @default false
   */
  current?: boolean
  /**
   * The **`zoom`** property scales the viewport.
   * Accepts a number (uniform) or `VectorLike` for non-uniform zoom.
   *
   * @default 1
   */
  zoom?: Reactive<VectorLike>
  /**
   * The **`offset`** property adds a screen-space offset to the camera view.
   * Does not modify the camera's world position.
   *
   * @default [0, 0]
   */
  offset?: Reactive<VectorLike>
  /**
   * The **`smoothing`** property controls how fast the view position catches up
   * to the camera's actual `globalPosition`. `0` = instant, higher values = smoother easing.
   * Uses exponential interpolation: `factor = 1 - Math.exp(-smoothing * delta)`.
   *
   * @default 0
   */
  smoothing?: Reactive<number>
  /**
   * The **`limit`** property defines world-space bounds the camera cannot exceed.
   * The viewport is adjusted by zoom when checking limits.
   */
  limit?: Bounds
}

/**
 * The **`Camera`** node controls the viewport by applying a transform before the scene tree is drawn.
 * Supports position, zoom, smoothed view position, world bounds, screen shake, and coordinate conversion.
 *
 * Place the `Camera` in your scene and mark it as `current` to control the view.
 * The view position can be smoothed for cinematic easing, and limits are enforced
 * on the smoothed view position.
 *
 * @example
 * ```tsx
 * import { useCamera, useEffect } from 'fraxel'
 *
 * function GameScene() {
 *   const camera = useCamera()
 *
 *   useEffect(() => {
 *     camera.makeCurrent()
 *     camera.shake({ duration: 0.5, strength: 10 })
 *   })
 *
 *   return (
 *     <>
 *       <camera ref={camera} smoothing={8} offset={[0, -40]} />
 *       <transform position={[200, 300]}>
 *         <sprite textureId={playerTexture} />
 *       </transform>
 *     </>
 *   )
 * }
 * ```
 */
export class Camera extends Node2D<PrimaryNode.Camera> {
  static #instances: Camera[] = []
  static #current: Camera | null = null

  /** The **`getCurrent`** method returns the currently active camera, or `null` if none exists. */
  static getCurrent(): Camera | null {
    return Camera.#current
  }

  #zoom: Vector2 = vector2(1)
  #offset: Vector2 = Vector2.ZERO.clone()
  #smoothing: number = 0
  #limit: Bounds | null = null

  #viewPosition: Vector2

  #shakeDuration = 0
  #shakeTime = 0
  #shakeStrength = 0
  #shakeOffset: Vector2 = Vector2.ZERO

  constructor(options: CameraOptions) {
    super(PrimaryNode.Camera, options)
    this.#zoom = ns(
      options.zoom,
      (vector) => propSignal(this, 'zoom', signalVector(vector)),
      this.#zoom,
    )
    this.#offset = ns(
      options.offset,
      (vector) => propSignal(this, 'offset', signalVector(vector)),
      this.#offset,
    )
    this.#smoothing = propSignal(this, 'smoothing', options.smoothing)
    this.#limit = options.limit ?? null

    this.#viewPosition = this.globalPosition.clone()

    Camera.#instances.push(this)
    if (options.current) {
      this.makeCurrent()
    }
  }

  /**
   * The **`makeCurrent`** method makes this camera the active one controlling the viewport.
   * Automatically deactivates the previous current camera.
   */
  makeCurrent(): void {
    Camera.#current = this
  }

  /** The **`zoom`** property gets or sets the viewport scale as a `Vector2`. */
  get zoom(): Vector2 {
    return this.#zoom
  }

  /** Sets the viewport scale. */
  set zoom(value: Vector2) {
    this.#zoom = value
  }

  /** The **`offset`** property gets or sets the screen-space offset. */
  get offset(): Vector2 {
    return this.#offset
  }

  /** Sets the screen-space offset. */
  set offset(value: Vector2) {
    this.#offset = value
  }

  /** The **`smoothing`** property gets or sets the view smoothing factor. */
  get smoothing(): number {
    return this.#smoothing
  }

  /** Sets the smoothing factor. `0` = instant, higher = smoother. */
  set smoothing(value: number) {
    this.#smoothing = value
  }

  /** The **`limit`** property gets or sets the world-space bounds. */
  get limit(): Bounds | null {
    return this.#limit
  }

  /** Sets the world-space bounds. Pass `null` to remove limits. */
  set limit(value: Bounds | null) {
    this.#limit = value
  }

  /**
   * The **`shake`** method triggers a screen shake effect.
   * @param options - Shake configuration with `duration` (seconds) and `strength` (pixels).
   */
  shake(options: { duration: number; strength: number }): void {
    this.#shakeDuration = options.duration
    this.#shakeTime = options.duration
    this.#shakeStrength = options.strength
  }

  /**
   * The **`screenToWorld`** method converts a screen-space position to world-space.
   * @param screenPos - Position in screen coordinates.
   * @returns Position in world coordinates.
   */
  screenToWorld(screenPos: Vector2): Vector2 {
    return vector2(
      (screenPos.x - GameConfig.width / 2) / this.#zoom.x + this.#viewPosition.x,
      (screenPos.y - GameConfig.height / 2) / this.#zoom.y + this.#viewPosition.y,
    )
  }

  /**
   * The **`worldToScreen`** method converts a world-space position to screen-space.
   * @param worldPos - Position in world coordinates.
   * @returns Position in screen coordinates.
   */
  worldToScreen(worldPos: Vector2): Vector2 {
    return vector2(
      (worldPos.x - this.#viewPosition.x) * this.#zoom.x + GameConfig.width / 2,
      (worldPos.y - this.#viewPosition.y) * this.#zoom.y + GameConfig.height / 2,
    )
  }

  /**
   * The **`apply`** method applies the camera transform to the canvas context.
   * Called by the Game loop before drawing the scene tree.
   * @param ctx - The canvas rendering context.
   */
  apply(ctx: CanvasRenderingContext2D): void {
    const pos = this.#viewPosition
    const halfW = GameConfig.width / 2
    const halfH = GameConfig.height / 2

    ctx.translate(
      halfW + this.#offset.x + this.#shakeOffset.x,
      halfH + this.#offset.y + this.#shakeOffset.y,
    )
    ctx.scale(this.#zoom.x, this.#zoom.y)
    ctx.translate(-pos.x, -pos.y)
  }

  /** @internal Updates smoothing, limits, and shake. */
  update(delta: number): void {
    const globalPos = this.globalPosition

    if (this.#smoothing === 0) {
      this.#viewPosition.x = globalPos.x
      this.#viewPosition.y = globalPos.y
    } else {
      const factor = 1 - Math.exp(-this.#smoothing * delta)
      this.#viewPosition.x += (globalPos.x - this.#viewPosition.x) * factor
      this.#viewPosition.y += (globalPos.y - this.#viewPosition.y) * factor
    }

    if (this.#limit) {
      const vw = GameConfig.width / this.#zoom.x
      const vh = GameConfig.height / this.#zoom.y
      const clampedX = clamp(this.#limit.left, this.#viewPosition.x, this.#limit.right - vw)
      const clampedY = clamp(this.#limit.top, this.#viewPosition.y, this.#limit.bottom - vh)
      this.position.x += clampedX - this.#viewPosition.x
      this.position.y += clampedY - this.#viewPosition.y
      this.#viewPosition.x = clampedX
      this.#viewPosition.y = clampedY
    }

    if (this.#shakeTime > 0) {
      this.#shakeTime -= delta
      const progress = Math.max(0, this.#shakeTime / this.#shakeDuration)
      const intensity = this.#shakeStrength * progress
      this.#shakeOffset.x = (Math.random() * 2 - 1) * intensity
      this.#shakeOffset.y = (Math.random() * 2 - 1) * intensity
    } else {
      this.#shakeOffset.x = 0
      this.#shakeOffset.y = 0
    }

    super.update(delta)
  }

  /** @internal Unregisters this camera from the static tracking. */
  destroy(): void {
    Camera.#instances = Camera.#instances.filter((c) => c !== this)
    if (Camera.#current === this) Camera.#current = null
    super.destroy()
  }
}

registerNode(PrimaryNode.Camera, Camera)
