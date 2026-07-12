import { GameConfig } from '../core/game-config.js'
import { TextureNotFoundError } from '../errors/assets.js'
import { region, type Region } from '../math/region.js'
import { vector2, Vector2 } from '../math/vector2.js'

/**
 * The **`Texture`** class wraps an `HTMLImageElement` and provides a `draw` method
 * for rendering to the canvas. Used internally by the `Sprite` node.
 */
export class Texture {
  /** The **`width`** of the texture in pixels. */
  width: number
  /** The **`height`** of the texture in pixels. */
  height: number

  constructor(
    /** The loaded `HTMLImageElement` backing this texture. */
    public image: HTMLImageElement,
  ) {
    this.width = image.width
    this.height = image.height
  }

  /**
   * The **`draw`** method renders the texture to the canvas at the given position
   * with optional source cropping, display scaling, and margin offset.
   *
   * @param options Texture draw options.
   */
  draw(options: TextureDrawOptions) {
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

    const flipX = display.size.x !== Math.abs(display.size.x)
    const flipY = display.size.y !== Math.abs(display.size.y)

    const scaleX = flipX ? -1 : 1
    const scaleY = flipY ? -1 : 1

    display.offset.multiply([scaleX, scaleY])

    GameConfig.ctx.save()
    GameConfig.ctx.scale(scaleX, scaleY)
    GameConfig.ctx.drawImage(
      this.image,
      source.offset.x,
      source.offset.y,
      source.size.x,
      source.size.y,
      display.offset.x,
      display.offset.y,
      display.size.x,
      display.size.y,
    )
    GameConfig.ctx.restore()
  }
}

interface TextureDrawOptions {
  /** Display texture region (if `display.size.equals(Vector.ZERO)` then the default value is the texture size) */
  display: Region
  /** Source texture region */
  source?: Region
}

export const textures = new Map<symbol, Texture>()

/**
 * The **`getTexture`** function returns a `Texture` by its symbol ID.
 * Throws `TextureNotFoundError` if no texture exists for the given ID.
 *
 * @param id The texture symbol ID returned by `loadTexture`.
 * @returns The `Texture` instance.
 *
 * @example
 * ```ts
 * import { getTexture } from 'fraxel'
 *
 * const tex = getTexture(PLAYER) // Texture
 * console.log(tex.width, tex.height)
 * ```
 */
export function getTexture(id: symbol) {
  const texture = textures.get(id)

  if (texture == null) throw new TextureNotFoundError(id.toString())

  return texture
}
