import { getTexture, type Texture } from '../../assets/texture.js'
import { GameConfig } from '../../core/game-config.js'
import { Vector2, type VectorLike } from '../../math/vector2.js'
import { ns, propSignal, signalColor, signalVector } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode } from '../lib/registry.js'
import type { Reactive } from '../../reactivity/types.js'
import { Color, type ColorLike } from '../../math/color.js'
import { Region } from '../../math/region.js'

export interface SpriteOptions extends Node2DOptions<PrimaryNode.Sprite> {
  /**
   * The **`textureId`** property identifies the sprite's texture.
   * Must be a symbol returned by `loadTexture()`.
   *
   * @example
   * ```tsx
   * import { loadTexture } from 'fraxel'
   *
   * const BALL = await loadTexture('/assets/ball.png')
   *
   * function Ball() {
   *   return <sprite textureId={BALL} />
   * }
   * ```
   */
  textureId?: Reactive<symbol>
  /**
   * The **`margin`** property offsets the texture origin within the source image.
   * Useful for selecting a frame from a sprite sheet.
   *
   * @example
   * ```tsx
   * import { loadTexture } from 'fraxel'
   *
   * const SHEET = await loadTexture('/assets/sheet.png')
   *
   * function Player() {
   *   return <sprite textureId={SHEET} margin={[16, 0]} sourceSize={[16, 16]} />
   * }
   * ```
   */
  margin?: Reactive<VectorLike>
  /**
   * The **`sourceSize`** property defines the region of the texture to render.
   * Defaults to the full texture size if not set.
   *
   * @default texture.size
   *
   * @example
   * ```tsx
   * import { loadTexture } from 'fraxel'
   *
   * const SHEET = await loadTexture('/assets/sheet.png')
   *
   * function Player() {
   *   return <sprite textureId={SHEET} margin={[16, 0]} sourceSize={[16, 16]} />
   * }
   * ```
   */
  sourceSize?: Reactive<VectorLike>
  /**
   * The **`displaySize`** property scales the rendered output.
   * Defaults to `sourceSize` if not set.
   *
   * @default sourceSize
   *
   * @example
   * ```tsx
   * import { loadTexture } from 'fraxel'
   *
   * const TEX = await loadTexture('/assets/sprite.png')
   *
   * function Player() {
   *   return <sprite textureId={TEX} sourceSize={[16, 16]} displaySize={[32, 32]} />
   * }
   * ```
   */
  displaySize?: Reactive<VectorLike>
  /**
   * The **`flipX`** property mirrors the sprite horizontally.
   *
   * @default false
   */
  flipX?: Reactive<boolean>
  /**
   * The **`flipY`** property mirrors the sprite vertically.
   *
   * @default false
   */
  flipY?: Reactive<boolean>

  /**
   * The **`brightness`** filter adjusts the sprite's brightness.
   * `0` = black, `1` = base, `2` = white.
   *
   * @default 1
   *
   * @example
   * ```tsx
   * <sprite textureId={TEX} brightness={1.5} />
   * ```
   */
  brightness?: Reactive<number>
  /**
   * The **`grayscale`** filter converts the sprite to grayscale.
   * `0` = full color, `1` = fully grayscale.
   *
   * @default 0
   *
   * @example
   * ```tsx
   * <sprite textureId={TEX} grayscale={0.5} />
   * ```
   */
  grayscale?: Reactive<number>
  /**
   * The **`modulate`** filter multiplies the sprite's colors by an RGBA tint.
   * Each channel ranges from `0` (no intensity) to `1` (full intensity).
   *
   * @default [1, 1, 1, 1]
   *
   * @example
   * ```tsx
   * <sprite textureId={TEX} modulate={[1, 0.5, 0, 1]} />
   * ```
   */
  modulate?: Reactive<ColorLike>
  /**
   * The **`contrast`** filter adjusts the sprite's contrast.
   * `0` = no contrast, `1` = base, `2` = double contrast.
   *
   * @default 1
   *
   * @example
   * ```tsx
   * <sprite textureId={TEX} contrast={1.5} />
   * ```
   */
  contrast?: Reactive<number>
  /**
   * The **`saturate`** filter adjusts the sprite's color saturation.
   * `0` = desaturated, `1` = base, `2` = double saturation.
   *
   * @default 1
   *
   * @example
   * ```tsx
   * <sprite textureId={TEX} saturate={0.5} />
   * ```
   */
  saturate?: Reactive<number>
  /**
   * The **`hueRotate`** filter rotates the sprite's hue in degrees.
   * `0` = no rotation, `360` = full rotation.
   *
   * @default 0
   *
   * @example
   * ```tsx
   * <sprite textureId={TEX} hueRotate={90} />
   * ```
   */
  hueRotate?: Reactive<number>
  /**
   * The **`invert`** filter inverts the sprite's colors.
   * `0` = normal, `1` = fully inverted.
   *
   * @default 0
   *
   * @example
   * ```tsx
   * <sprite textureId={TEX} invert={1} />
   * ```
   */
  invert?: Reactive<number>
  /**
   * The **`opacity`** filter adjusts the sprite's transparency.
   * `0` = fully transparent, `1` = fully opaque.
   *
   * @default 1
   *
   * @example
   * ```tsx
   * <sprite textureId={TEX} opacity={0.5} />
   * ```
   */
  opacity?: Reactive<number>
}

/**
 * The **`Sprite`** node displays a texture in the game world.
 * Supports texture atlases via `margin`/`sourceSize`, display scaling, flipping, and visual filters.
 *
 * @example
 * ```tsx
 * import { loadTexture } from 'fraxel'
 * import { useSprite } from 'fraxel'
 *
 * const PLAYER = await loadTexture('/assets/player.png')
 *
 * function Player() {
 *   const sprite = useSprite()
 *
 *   return (
 *     <sprite
 *       ref={sprite}
 *       textureId={PLAYER}
 *       sourceSize={[32, 32]}
 *       displaySize={[64, 64]}
 *       brightness={1.2}
 *       modulate={[1, 0.5, 0, 1]}
 *     />
 *   )
 * }
 * ```
 */
export class Sprite extends Node2D<PrimaryNode.Sprite> {
  #textureId?: symbol | undefined
  #texture?: Texture | undefined

  /**
   * The **`margin`** property offsets the texture origin within the source image.
   * Useful for selecting a frame from a sprite sheet.
   */
  margin?: Vector2 | undefined

  /**
   * The **`sourceSize`** property defines the region of the texture to render.
   * Defaults to the full texture size if not set.
   */
  sourceSize?: Vector2 | undefined

  /**
   * The **`displaySize`** property scales the rendered output.
   * Defaults to `sourceSize` if not set.
   */
  displaySize?: Vector2 | undefined

  /**
   * The **`flipX`** property mirrors the sprite horizontally.
   */
  flipX = false

  /**
   * The **`flipY`** property mirrors the sprite vertically.
   */
  flipY = false

  #brightness = 1
  #grayscale = 0
  #modulate: Color = Color.WHITE
  #contrast = 1
  #saturate = 1
  #hueRotate = 0
  #invert = 0
  #opacity = 1

  /**
   * The **`textureId`** property identifies the sprite's texture.
   * Setting a new ID updates the sprite's visual immediately.
   */
  get textureId() {
    return this.#textureId
  }
  set textureId(value) {
    if (this.textureId === value) return
    if (value == null) {
      this.#textureId = undefined
      this.#texture = undefined
      return
    }

    this.#textureId = value
    if (this.isStarted) {
      this.#texture = getTexture(value)
    }
  }

  /**
   * The **`getTexture`** method returns the current texture.
   * @returns The current `Texture` or `undefined` if no texture is set.
   */
  getTexture() {
    return this.#texture
  }

  /** The **`brightness`** filter value. `0` = black, `1` = base, `2` = white. */
  get brightness() {
    return this.#brightness
  }
  set brightness(value) {
    this.#brightness = value
  }

  /** The **`grayscale`** filter value. `0` = color, `1` = grayscale. */
  get grayscale() {
    return this.#grayscale
  }
  set grayscale(value) {
    this.#grayscale = value
  }

  /** The **`modulate`** filter RGBA color. Each channel `0`–`1`. */
  get modulate() {
    return this.#modulate
  }
  set modulate(value) {
    this.#modulate = value
  }

  /** The **`contrast`** filter value. `0` = no contrast, `1` = base, `2` = double. */
  get contrast() {
    return this.#contrast
  }
  set contrast(value) {
    this.#contrast = value
  }

  /** The **`saturate`** filter value. `0` = desaturated, `1` = base, `2` = double. */
  get saturate() {
    return this.#saturate
  }
  set saturate(value) {
    this.#saturate = value
  }

  /** The **`hueRotate`** filter value in degrees. `0` = none, `360` = full rotation. */
  get hueRotate() {
    return this.#hueRotate
  }
  set hueRotate(value) {
    this.#hueRotate = value
  }

  /** The **`invert`** filter value. `0` = normal, `1` = fully inverted. */
  get invert() {
    return this.#invert
  }
  set invert(value) {
    this.#invert = value
  }

  /** The **`opacity`** filter value. `0` = transparent, `1` = opaque. */
  get opacity() {
    return this.#opacity
  }
  set opacity(value) {
    this.#opacity = value
  }

  constructor(options: SpriteOptions) {
    super(PrimaryNode.Sprite, options)

    type VectorNKeys = keyof {
      [P in keyof Sprite as Sprite[P] extends Vector2 | undefined ? P : never]: null
    }
    type VectorOKeys = keyof {
      [
        P in keyof typeof options as (typeof options)[P] extends
          VectorLike | Reactive<VectorLike> | undefined
          ? P
          : never
      ]: null
    }

    const vectors = (key: VectorNKeys & VectorOKeys) => {
      return ns(options[key], (vector) => propSignal(this, key, signalVector(vector)), this[key])
    }
    this.margin = vectors('margin')
    this.sourceSize = vectors('sourceSize')
    this.displaySize = vectors('displaySize')
    this.textureId = propSignal(this, 'textureId', options.textureId)
    this.flipX = propSignal(this, 'flipX', options.flipX)
    this.flipY = propSignal(this, 'flipY', options.flipY)
    this.brightness = propSignal(this, 'brightness', options.brightness)
    this.grayscale = propSignal(this, 'grayscale', options.grayscale)
    this.modulate = ns(
      options.modulate,
      (c) => propSignal(this, 'modulate', signalColor(c)),
      this.#modulate,
    )
    this.contrast = propSignal(this, 'contrast', options.contrast)
    this.saturate = propSignal(this, 'saturate', options.saturate)
    this.hueRotate = propSignal(this, 'hueRotate', options.hueRotate)
    this.invert = propSignal(this, 'invert', options.invert)
    this.opacity = propSignal(this, 'opacity', options.opacity)
  }

  /** @internal Loads the texture when the sprite starts. */
  start(): void {
    if (this.textureId) {
      this.#texture = getTexture(this.textureId)
    }
    super.start()
  }

  /** @internal Draws the sprite texture with filters. */
  draw(delta: number): void {
    if (this.#texture != null) {
      const ctx = GameConfig.ctx

      const filters: string[] = []
      if (this.#brightness !== 1) filters.push(`brightness(${this.#brightness})`)
      if (this.#grayscale !== 0) filters.push(`grayscale(${this.#grayscale})`)
      if (this.#contrast !== 1) filters.push(`contrast(${this.#contrast})`)
      if (this.#saturate !== 1) filters.push(`saturate(${this.#saturate})`)
      if (this.#hueRotate !== 0) filters.push(`hue-rotate(${this.#hueRotate}deg)`)
      if (this.#invert !== 0) filters.push(`invert(${this.#invert})`)
      if (this.#opacity !== 1) filters.push(`opacity(${this.#opacity})`)

      ctx.save()

      if (filters.length > 0) {
        ctx.filter = filters.join(' ')
      }

      const ds = this.displaySize ?? this.sourceSize

      this.#texture.draw({
        display: new Region(this.position, this.sourceSize ?? Vector2.ZERO),
        source: new Region(
          this.margin ?? Vector2.ZERO,
          this.displaySize?.toMultiplied([this.flipX ? -1 : 1, this.flipY ? -1 : 1]) ??
            Vector2.ZERO,
        ),
      })

      const isModulated = !this.#modulate.equals(Color.WHITE)

      if (isModulated) {
        ctx.filter = 'none'
        ctx.globalCompositeOperation = 'multiply'

        ctx.fillStyle = this.#modulate.toCSS()
        ctx.fillRect(this.position.x, this.position.y, ds?.x ?? 0, ds?.y ?? 0)

        ctx.globalCompositeOperation = 'source-over'
      }

      ctx.restore()
    }

    super.draw(delta)
  }
}

registerNode(PrimaryNode.Sprite, Sprite)
