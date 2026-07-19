import { Vector2 } from '../math/vector2.js'
import { GameConfig } from './game-config.js'

/**
 * The **`OffscreenCanvas`** class wraps the browser's `OffscreenCanvas` API
 * for off-main-thread or batched rendering operations.
 */
export class OffscreenCanvas {
  #canvas: globalThis.OffscreenCanvas
  #ctx: OffscreenCanvasRenderingContext2D

  /**
   * Creates a new `OffscreenCanvas`.
   *
   * @param width - Canvas width in pixels.
   * @param height - Canvas height in pixels.
   */
  constructor(width: number, height: number) {
    this.#canvas = new globalThis.OffscreenCanvas(width, height)
    const ctx = this.#canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D context from OffscreenCanvas')
    }
    this.#ctx = ctx

    ctx.imageSmoothingEnabled = GameConfig.ctx.imageSmoothingEnabled
  }

  /**
   * The **`width`** of the offscreen canvas in pixels.
   */
  get width(): number {
    return this.#canvas.width
  }

  /**
   * The **`height`** of the offscreen canvas in pixels.
   */
  get height(): number {
    return this.#canvas.height
  }

  /**
   * The **`ctx`** returns the 2D rendering context.
   */
  get ctx(): OffscreenCanvasRenderingContext2D {
    return this.#ctx
  }

  /**
   * Resizes the offscreen canvas.
   *
   * @param width - New width in pixels.
   * @param height - New height in pixels.
   */
  resize(width: number, height: number): void {
    this.#canvas.width = width
    this.#canvas.height = height
  }

  /**
   * Clears the entire offscreen canvas.
   */
  clear(): void {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
  }

  /**
   * Draws this offscreen canvas to a target 2D context.
   *
   * @param ctx - Target canvas rendering context.
   * @param x - Destination X position.
   * @param y - Destination Y position.
   * @param displaySize - Optional display size for scaling.
   */
  drawTo(ctx: CanvasRenderingContext2D, x: number, y: number, displaySize?: Vector2): void {
    const dw = displaySize?.x ?? this.#canvas.width
    const dh = displaySize?.y ?? this.#canvas.height
    ctx.drawImage(this.#canvas, x, y, dw, dh)
  }

  /**
   * Transfers the offscreen canvas to an `ImageBitmap` for efficient rendering.
   *
   * @returns A promise resolving to the `ImageBitmap`.
   */
  async transferToImageBitmap(): Promise<ImageBitmap> {
    return this.#canvas.transferToImageBitmap()
  }

  /**
   * Destroys the offscreen canvas and releases resources.
   */
  destroy(): void {
    this.#ctx = null!
    this.#canvas = null!
  }
}
