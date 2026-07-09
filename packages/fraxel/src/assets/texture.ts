import { GameConfig } from '../core/game-config.js'
import { TextureNotFoundError } from '../errors/assets.js'
import { type Vector2 } from '../math/vector2.js'

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
    const width = options.sourceSize?.x ?? this.width
    const height = options.sourceSize?.y ?? this.height

    const rWidth = options.displaySize?.x ?? width
    const rHeight = options.displaySize?.y ?? height

    const flipX = rWidth !== Math.abs(rWidth)
    const flipY = rHeight !== Math.abs(rHeight)

    const scaleX = flipX ? -1 : 1
    const scaleY = flipY ? -1 : 1

    const pos = options.position.toMultiplied([scaleX, scaleY])

    GameConfig.ctx.save()
    GameConfig.ctx.scale(scaleX, scaleY)
    GameConfig.ctx.drawImage(
      this.image,
      options.margin?.x ?? 0,
      options.margin?.y ?? 0,
      width,
      height,
      pos.x,
      pos.y,
      rWidth,
      rHeight,
    )
    GameConfig.ctx.restore()
  }
}

interface TextureDrawOptions {
  /** Position to draw */
  position: Vector2
  /** Size of the texture */
  sourceSize?: Vector2 | undefined
  /** Size of the result texture */
  displaySize?: Vector2 | undefined
  /** Offset of the texture */
  margin?: Vector2 | undefined
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
