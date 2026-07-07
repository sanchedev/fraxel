import { getTexture, type Texture } from '../../assets/texture.js'
import { GameConfig } from '../../core/game-config.js'
import { Vector2, type VectorLike } from '../../math/vector2.js'
import { ns, propSignal, signalColor, signalVector } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { Nodes } from '../lib/registry.js'
import type { Reactive } from '../../reactivity/types.js'
import { Color, type ColorLike } from '../../math/color.js'

export interface SpriteOptions extends Node2DOptions<PrimaryNode.Sprite> {
  /**
   * The **`textureId`** property of `Sprite` represents the sprite's texture.
   * The texture must be loaded with `loadTexture()` first.
   *
   * @example
   * ```tsx
   * const BALL_TEXTURE = await loadTexture('/assets/ball.png')
   *
   * function Ball() {
   *   return <sprite textureId={BALL_TEXTURE} />
   * }
   * ```
   */
  textureId?: Reactive<symbol>
  /**
   * The **`margin`** property of `Sprite` represents the texture offset.
   *
   * @example
   * ```tsx
   * const IDLE_TEXTURE = await loadTexture('/assets/idle.png')
   *
   * function Player() {
   *   return (
   *     <sprite textureId={IDLE_TEXTURE} margin={[16, 0]} />
   *   )
   * }
   * ```
   */
  margin?: Reactive<VectorLike>
  /**
   * The **`sourceSize`** property of `Sprite` represents the source size to render.
   *
   * @default texture.size
   *
   * @example
   * ```tsx
   * const IDLE_TEXTURE = await loadTexture('/assets/idle.png')
   *
   * function Player() {
   *   return (
   *     <sprite
   *       textureId={IDLE_TEXTURE}
   *       margin={[16, 0]}
   *       sourceSize={[16, 16]}
   *     />
   *   )
   * }
   * ```
   */
  sourceSize?: Reactive<VectorLike>
  /**
   * The **`displaySize`** property of `Sprite` represents the display size.
   *
   * @default this.sourceSize
   *
   * @example
   * ```tsx
   * const IDLE_TEXTURE = await loadTexture('/assets/idle.png')
   *
   * function Player() {
   *   return (
   *     <sprite
   *       textureId={IDLE_TEXTURE}
   *       margin={[16, 0]}
   *       sourceSize={[16, 16]}
   *       displaySize={[32, 32]}
   *     />
   *   )
   * }
   * ```
   */
  displaySize?: Reactive<VectorLike>
  /** Whether to flip the sprite horizontally */
  flipX?: Reactive<boolean>
  /** Whether to flip the sprite vertically */
  flipY?: Reactive<boolean>

  /**
   * The **`brightness`** filter adjusts the sprite's brightness.
   * `0` = black, `1` = base, `2` = white.
   *
   * @default 1
   *
   * @example
   * ```tsx
   * // Make sprite 50% brighter
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
   * // Half grayscale
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
   * // Orange tint
   * <sprite textureId={TEX} modulate={[1, 0.5, 0, 1]} />
   *
   * // Red channel only
   * <sprite textureId={TEX} modulate={[1, 0, 0, 1]} />
   *
   * // Semi-transparent
   * <sprite textureId={TEX} modulate={[1, 1, 1, 0.5]} />
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
   * // Rotate hue 90 degrees
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
   * The **`opacity`** filter adjusts the sprite's opacity.
   * `0` = fully transparent, `1` = fully opaque.
   *
   * @default 1
   *
   * @example
   * ```tsx
   * // 50% transparent
   * <sprite textureId={TEX} opacity={0.5} />
   * ```
   */
  opacity?: Reactive<number>
}

/**
 * The **`Sprite`** node displays a texture or sprite in the game world.
 * It supports texture atlases with margin/sourceSize, display scaling, flipping, and visual filters.
 *
 * @example
 * ```tsx
 * import { loadTexture } from 'fraxel'
 * import { useNode } from 'fraxel/hooks'
 *
 * const PLAYER_TEXTURE = await loadTexture('/assets/player.png')
 *
 * function Player() {
 *   const sprite = useNode(PrimaryNode.Sprite)
 *
 *   return (
 *     <sprite
 *       ref={sprite}
 *       textureId={PLAYER_TEXTURE}
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
   * The **`margin`** property defines the texture offset within the source image.
   * Useful for sprite sheets where each frame has a different position.
   */
  margin?: Vector2 | undefined

  /**
   * The **`sourceSize`** property defines the region of the texture to render.
   * Defaults to the full texture size if not set.
   */
  sourceSize?: Vector2 | undefined

  /**
   * The **`displaySize`** property defines the rendered size of the sprite.
   * Defaults to `sourceSize` if not set.
   */
  displaySize?: Vector2 | undefined

  /**
   * The **`flipX`** property controls horizontal mirroring of the sprite.
   */
  flipX = false

  /**
   * The **`flipY`** property controls vertical mirroring of the sprite.
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
   * Gets or sets the `textureId` of this sprite.
   * Setting a new texture updates the sprite's visual immediately.
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
   * @returns The current `Texture` or `undefined` if no texture is set
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

  /** The **`modulate`** filter color `[r, g, b, a]` with values `0`-`1`. */
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

  /** The **`hueRotate`** filter value in degrees. `0` = no rotation, `360` = full. */
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
        position: this.position,
        margin: this.margin,
        sourceSize: this.sourceSize,
        displaySize: this.displaySize?.toMultiplied([this.flipX ? -1 : 1, this.flipY ? -1 : 1]),
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

Nodes.sprite = Sprite
