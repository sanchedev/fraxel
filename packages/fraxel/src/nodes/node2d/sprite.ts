import { getTexture, type Texture } from '../../assets/texture.js'
import { Vector2, type VectorLike } from '../../math/vector2.js'
import { ns, propSignal, signalColor, signalVector } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { registerNode } from '../lib/registry.js'
import type { Reactive } from '../../reactivity/types.js'
import { Color, type ColorLike } from '../../math/color.js'
import { Region } from '../../math/region.js'
import { drawTextureWithFilters } from './lib/texture-render.js'

export interface SpriteOptions extends Node2DOptions<PrimaryNode.Sprite> {
  /**
   * The **`textureId`** property identifies the sprite's texture.
   * Must be a symbol returned by `loadTexture()`.
   *
   * @example
   * ```tsx
   * import { loadTexture, region } from 'fraxel'
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
   * The **`source`** property defines the region of the texture to render.
   * Combines texture offset and crop size into a single `Region`.
   *
   * @example
   * ```tsx
   * import { loadTexture, region } from 'fraxel'
   *
   * const SHEET = await loadTexture('/assets/sheet.png')
   *
   * function Player() {
   *   return <sprite textureId={SHEET} source={region(16, 0, 16, 16)} />
   * }
   * ```
   */
  source?: Reactive<Region>
  /**
   * The **`displaySize`** property scales the rendered output.
   * Defaults to the texture size if not set.
   *
   * @default texture.size
   *
   * @example
   * ```tsx
   * import { loadTexture } from 'fraxel'
   *
   * const TEX = await loadTexture('/assets/sprite.png')
   *
   * function Player() {
   *   return <sprite textureId={TEX} source={region(0, 0, 16, 16)} displaySize={[32, 32]} />
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
   * The **`tint`** filter multiplies the sprite's colors by an RGBA tint.
   * Each channel ranges from `0` (no intensity) to `1` (full intensity).
   *
   * @default [1, 1, 1, 1]
   *
   * @example
   * ```tsx
   * <sprite textureId={TEX} tint="#ff8800" />
   * ```
   */
  tint?: Reactive<ColorLike>
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
 * Supports texture atlases via `source`, display scaling, flipping, and visual filters.
 *
 * @example
 * ```tsx
 * import { loadTexture, region } from 'fraxel'
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
 *       source={region(0, 0, 32, 32)}
 *       displaySize={[64, 64]}
 *       brightness={1.2}
 *       tint="#ff8800"
 *     />
 *   )
 * }
 * ```
 */
export class Sprite extends Node2D<PrimaryNode.Sprite> {
  #textureId?: symbol | undefined
  #texture?: Texture | undefined

  #source: Region = new Region(Vector2.ZERO, Vector2.ZERO)

  /**
   * The **`source`** property defines the region of the texture to render.
   * Combines texture offset and crop size into a single `Region`.
   */
  get source(): Region {
    return this.#source
  }
  set source(region: Region) {
    const next = new Region(region.offset, region.size)
    if (this.#source.equals(next)) return
    this.#source = next
  }

  /**
   * The **`displaySize`** property scales the rendered output.
   * Defaults to the texture size if not set.
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
  #tint: Color = Color.WHITE
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

  /** The **`tint`** filter RGBA color. Each channel `0`–`1`. */
  get tint() {
    return this.#tint
  }
  set tint(value) {
    this.#tint = value
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
    this.displaySize = vectors('displaySize')
    this.textureId = propSignal(this, 'textureId', options.textureId)
    this.flipX = propSignal(this, 'flipX', options.flipX)
    this.flipY = propSignal(this, 'flipY', options.flipY)
    this.brightness = propSignal(this, 'brightness', options.brightness)
    this.grayscale = propSignal(this, 'grayscale', options.grayscale)
    this.tint = ns(options.tint, (c) => propSignal(this, 'tint', signalColor(c)), this.#tint)
    this.contrast = propSignal(this, 'contrast', options.contrast)
    this.saturate = propSignal(this, 'saturate', options.saturate)
    this.hueRotate = propSignal(this, 'hueRotate', options.hueRotate)
    this.invert = propSignal(this, 'invert', options.invert)
    this.opacity = propSignal(this, 'opacity', options.opacity)

    if (options.source != null) {
      this.#source = propSignal(this, 'source', options.source)
    }
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
      const applyFlip = (flip: boolean) => (flip ? -1 : 1)
      const flipVector = new Vector2(applyFlip(this.flipX), applyFlip(this.flipY))
      const displaySize = this.displaySize ?? new Vector2(this.#texture.width, this.#texture.height)

      drawTextureWithFilters({
        texture: this.#texture,
        position: this.position,
        source: this.#source,
        displaySize: displaySize.toMultiplied(flipVector),
        brightness: this.#brightness,
        grayscale: this.#grayscale,
        tint: this.#tint,
        contrast: this.#contrast,
        saturate: this.#saturate,
        hueRotate: this.#hueRotate,
        invert: this.#invert,
        opacity: this.#opacity,
      })
    }

    super.draw(delta)
  }
}

registerNode(PrimaryNode.Sprite, Sprite)
