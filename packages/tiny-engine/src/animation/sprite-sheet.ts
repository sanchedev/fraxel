import { getTexture } from '../assets/texture.js'
import { Vector2 } from '../math/vector2.js'
import type { AnimationKeyframe } from '../nodes/animation-player.js'
import type { Sprite } from '../nodes/node2d/sprite.js'
import { multiKF } from './multiple.js'
import { kfFromProp } from './properties.js'

/**
 * The **`kfFromSpriteSheet`** function generates keyframes from a sprite sheet texture.
 * It automatically calculates frame dimensions and margins based on the grid layout.
 *
 * @param sprite A sprite instance of `Sprite`
 * @param textureId A texture id. If it is null, the sprite texture will not change.
 * @param spritesCountX Count of sprites in horizontal.
 * @param spritesCounty Count of sprites in vertical.
 * @param range Optional `[from, to]` tuple (0-indexed, inclusive) to select a subset of frames from the sheet.
 * @returns A keyframes array
 *
 * @example
 * ```ts
 * // Full sprite sheet (all frames)
 * const allFrames = kfFromSpriteSheet(sprite, texture, 4, 2)
 *
 * // Only frames 0-3 (first row of a 4x2 sheet)
 * const walkFrames = kfFromSpriteSheet(sprite, texture, 4, 2, [0, 3])
 *
 * // Only frames 4-7 (second row of a 4x2 sheet)
 * const runFrames = kfFromSpriteSheet(sprite, texture, 4, 2, [4, 7])
 * ```
 */
export function kfFromSpriteSheet(
  sprite: Sprite,
  textureId: symbol | null,
  spritesCountX: number = 1,
  spritesCounty: number = 1,
  range?: [number, number],
): AnimationKeyframe[] {
  const texture = textureId ? getTexture(textureId) : sprite.getTexture()

  const spriteWidth = texture?.width ?? 0
  const spriteHeight = texture?.height ?? 0

  const sizeX = spriteWidth / spritesCountX
  const sizeY = spriteHeight / spritesCounty

  const count = spritesCountX * spritesCounty

  const from = Math.min(range?.[0] ?? 0, count - 1)
  const to = Math.max(range?.[1] ?? count - 1, from)

  sprite.sourceSize = new Vector2(sizeX, sizeY)
  const kfs = Array.from({ length: to - from + 1 }, (_, i) => {
    const index = i + from
    const x = index % spritesCountX
    const y = Math.floor(index / spritesCountX)

    return kfFromProp(sprite, 'margin', new Vector2(x * sizeX, y * sizeY))
  })

  return [
    multiKF([
      ...(textureId ? [kfFromProp(sprite, 'textureId', textureId)] : []),
      ...(kfs[0] ? [kfs[0]] : []),
    ]),
    ...kfs.slice(1),
  ]
}
