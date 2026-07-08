import { getTexture } from '../assets/texture.js'
import type { SpriteReference } from '../hooks/index.js'
import { vector2 } from '../math/vector2.js'
import type { Animation, AnimationKeyframe } from '../nodes/animation-player.js'
import { Sprite } from '../nodes/node2d/sprite.js'
import { multiKF } from './multiple.js'
import { kfFromProp } from './properties.js'

/**
 * The **`keyframesFromSheet`** function generates keyframes from a sprite sheet texture.
 * It automatically calculates frame dimensions and margins based on the grid layout.
 *
 * @param sprite A sprite instance of `Sprite`
 * @param textureId A texture id. If it is null, the sprite texture will not change.
 * @param columns Count of sprites in horizontal.
 * @param rows Count of sprites in vertical.
 * @param range Optional `[from, to]` tuple (0-indexed, inclusive) to select a subset of frames from the sheet.
 * @returns A keyframes array
 *
 * @example
 * ```ts
 * // Full sprite sheet (all frames)
 * const allFrames = keyframesFromSheet(sprite, texture, 4, 2)
 *
 * // Only frames 0-3 (first row of a 4x2 sheet)
 * const walkFrames = keyframesFromSheet(sprite, texture, 4, 2, [0, 3])
 *
 * // Only frames 4-7 (second row of a 4x2 sheet)
 * const runFrames = keyframesFromSheet(sprite, texture, 4, 2, [4, 7])
 * ```
 */
export function keyframesFromSheet(
  sprite: Sprite,
  textureId: symbol | null | undefined,
  columns: number = 1,
  rows: number = 1,
  range?: [number, number],
): AnimationKeyframe[] {
  const texture = textureId ? getTexture(textureId) : sprite.getTexture()

  const spriteWidth = texture?.width ?? 0
  const spriteHeight = texture?.height ?? 0

  const sizeX = spriteWidth / columns
  const sizeY = spriteHeight / rows

  const count = columns * rows

  const from = Math.min(range?.[0] ?? 0, count - 1)
  const to = Math.max(range?.[1] ?? count - 1, from)

  sprite.sourceSize = vector2(sizeX, sizeY)
  const kfs = Array.from({ length: to - from + 1 }, (_, i) => {
    const index = i + from
    const x = index % columns
    const y = Math.floor(index / columns)

    return kfFromProp(sprite, 'margin', vector2(x * sizeX, y * sizeY))
  })

  return [
    multiKF([
      ...(textureId ? [kfFromProp(sprite, 'textureId', textureId)] : []),
      ...(kfs[0] ? [kfs[0]] : []),
    ]),
    ...kfs.slice(1),
  ]
}

/**
 * Options for creating an animation from a sprite sheet.
 */
export interface SpriteSheetAnimationOptions {
  /** Number of columns in the sprite sheet grid. @default 1 */
  columns?: number
  /** Number of rows in the sprite sheet grid. @default 1 */
  rows?: number
  /** Optional `[from, to]` tuple (0-indexed, inclusive) to select a subset of frames. */
  range?: [number, number]
  /** Total duration of the animation in seconds. FPS is calculated as `(columns * rows) / duration`. */
  duration: number
  /** Whether the animation should loop. @default undefined */
  loop?: boolean
}

/**
 * The **`animationFromSheet`** function creates a complete `Animation` object from a sprite sheet.
 * It combines `keyframesFromSheet` with automatic FPS calculation based on the total frame count
 * and desired duration.
 *
 * @param sprite A `Sprite` instance or a `NodeReference` to a sprite node
 * @param textureId A texture id. If `null`, the sprite texture will not change. If `undefined`, uses the sprite's current texture.
 * @param options Animation options including grid dimensions, duration, and loop settings
 * @returns A complete `Animation` object ready for `AnimationPlayer`
 *
 * @example
 * ```tsx
 * // Basic usage — 4-column sprite sheet, 1 second animation
 * // Assumes `sprite` is a Sprite node and `IDLE_TEXTURE` is a loaded texture ID
 * const idle = animationFromSheet(sprite, IDLE_TEXTURE, {
 *   columns: 4,
 *   duration: 1,
 *   loop: true,
 * })
 *
 * // With range — only first 3 frames
 * const walk = animationFromSheet(sprite, WALK_TEXTURE, {
 *   columns: 4,
 *   rows: 2,
 *   range: [0, 2],
 *   duration: 0.75,
 *   loop: true,
 * })
 *
 * // Using a SpriteReference (deferred)
 * const sprite = useSprite()
 * const anim = animationFromSheet(sprite, TEXTURE, {
 *   columns: 4,
 *   duration: 1,
 * })
 * ```
 */
export function animationFromSheet(
  sprite: Sprite | SpriteReference,
  textureId: symbol | null | undefined,
  options: SpriteSheetAnimationOptions,
): Animation {
  const node = sprite instanceof Sprite ? sprite : sprite.signal()
  if (node == null)
    return {
      keyframes: [],
      fps: 1,
      loop: false,
    }
  return {
    keyframes: keyframesFromSheet(
      node,
      textureId ?? null,
      options.columns,
      options.rows,
      options.range,
    ),
    fps: ((options.columns ?? 1) * (options.rows ?? 1)) / options.duration,
    loop: options.loop,
  }
}
