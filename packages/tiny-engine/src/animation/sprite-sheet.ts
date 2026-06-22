import { getTexture } from '../assets/texture.js'
import { Vector2 } from '../math/vector2.js'
import type { AnimationKeyframe } from '../nodes/animation-player.js'
import type { Sprite } from '../nodes/sprite.js'
import { multiKF } from './multiple.js'
import { kfFromProp } from './properties.js'

/**
 * The **`kfFromSpriteSheet`** function returns a keyframe from a sprite sheet.
 * @param sprite A sprite instance of `Sprite`
 * @param textureId A texture id. If it is null, the sprite texture will not change.
 * @param spritesCountX Count of sprites in horizontal.
 * @param spritesCounty Count of sprites in vertical.
 * @returns A keyframes array
 *
 * @example
 * ```ts
 * animPlayer
 *   .add('idle', {
 *     fps: 4,
 *     keyframes: kfFromSpriteSheet(sprite, 'idle', 4),
 *     loop: true,
 *   })
 * ```
 */
export function kfFromSpriteSheet(
  sprite: Sprite,
  textureId: symbol | null,
  spritesCountX: number = 1,
  spritesCounty: number = 1,
): AnimationKeyframe[] {
  const texture = textureId ? getTexture(textureId) : sprite.getTexture()

  const spriteWidth = texture?.width ?? 0
  const spriteHeight = texture?.height ?? 0

  const sizeX = spriteWidth / spritesCountX
  const sizeY = spriteHeight / spritesCounty

  return [
    multiKF([
      ...(textureId ? [kfFromProp(sprite, 'textureId', textureId)] : []),
      kfFromProp(sprite, 'margin', new Vector2(0, 0)),
    ]),
    ...Array.from({ length: spritesCountX * spritesCounty - 1 }, (_, i) => {
      const x = (i + 1) % spritesCountX
      const y = Math.floor((i + 1) / spritesCountX)

      return kfFromProp(sprite, 'margin', new Vector2(x * sizeX, y * sizeY))
    }),
  ]
}
