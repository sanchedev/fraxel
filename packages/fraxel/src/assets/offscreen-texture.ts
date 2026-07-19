import { region } from '../math/region.js'
import { vector2, Vector2 } from '../math/vector2.js'
import { OffscreenCanvas } from '../core/offscreen-canvas.js'
import { GameConfig } from '../core/game-config.js'
import type { TextureDrawOptions } from './texture.js'

/**
 * The **`OffscreenTexture`** class wraps an `OffscreenCanvas` and provides
 * a `draw` method compatible with the `Texture` interface for use with
 * `drawTextureWithFilters`.
 */
export class OffscreenTexture {
  #offscreenCanvas: OffscreenCanvas

  /**
   * Creates a new `OffscreenTexture` from an `OffscreenCanvas`.
   *
   * @param offscreenCanvas - The offscreen canvas to wrap.
   */
  constructor(offscreenCanvas: OffscreenCanvas) {
    this.#offscreenCanvas = offscreenCanvas
  }

  /**
   * The **`width`** of the texture in pixels.
   */
  get width(): number {
    return this.#offscreenCanvas.width
  }

  /**
   * The **`height`** of the texture in pixels.
   */
  get height(): number {
    return this.#offscreenCanvas.height
  }

  /**
   * Draws the offscreen texture to the main canvas.
   *
   * @param options - Draw options compatible with `Texture.draw()`.
   */
  draw(options: TextureDrawOptions): void {
    const display = region(
      options.display.offset,
      options.display.size.equals(Vector2.ZERO)
        ? vector2(this.width, this.height)
        : options.display.size,
    )
    const source =
      options.source == null
        ? region(0, display.size)
        : region(
            options.source.offset,
            options.source.size.equals(Vector2.ZERO)
              ? vector2(this.width, this.height)
              : options.source.size,
          )

    const scaleX = options.flipX ? -1 : 1
    const scaleY = options.flipY ? -1 : 1

    display.offset.multiply([scaleX, scaleY])

    const ctx = options.ctx ?? GameConfig.ctx

    ctx.save()
    ctx.scale(scaleX, scaleY)

    const dx = options.flipX ? -display.offset.x - display.size.x : display.offset.x
    const dy = options.flipY ? -display.offset.y - display.size.y : display.offset.y

    ctx.drawImage(
      this.#offscreenCanvas.ctx.canvas as unknown as CanvasImageSource,
      source.offset.x,
      source.offset.y,
      source.size.x,
      source.size.y,
      dx,
      dy,
      Math.abs(display.size.x),
      Math.abs(display.size.y),
    )

    ctx.restore()
  }

  /**
   * Returns the underlying `OffscreenCanvas`.
   */
  get offscreenCanvas(): OffscreenCanvas {
    return this.#offscreenCanvas
  }
}
