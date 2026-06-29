import { getTexture, type Texture } from '../assets/texture.js'
import { vectorize, Vector2, type VectorLike } from '../math/vector2.js'
import { ns } from '../utils/null-ternary.js'
import { PrimaryNode } from './enum.js'
import { Node, type NodeOptions } from './node.js'
import { Nodes } from './registry.js'

export interface SpriteOptions extends NodeOptions<PrimaryNode.Sprite> {
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
  textureId?: symbol
  /**
   * The **`margin`** property of `Sprite` represents the texture offset.
   *
   * @example
   * ```tsx
   * const IDLE_TEXTURE = await loadTexture('/assets/idle.png')
   *
   * function Player() {
   *   return (
   *     <sprite textureId={IDLE_TEXTURE} margin={new Vector2(16, 0)} />
   *   )
   * }
   * ```
   */
  margin?: VectorLike
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
   *       margin={new Vector2(16, 0)}
   *       sourceSize={new Vector2(16, 16)}
   *     />
   *   )
   * }
   * ```
   */
  sourceSize?: VectorLike
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
   *       margin={new Vector2(16, 0)}
   *       sourceSize={new Vector2(16, 16)}
   *       displaySize={new Vector2(32, 32)}
   *     />
   *   )
   * }
   * ```
   */
  displaySize?: VectorLike
  /** Whether to flip the sprite horizontally */
  flipX?: boolean
  /** Whether to flip the sprite vertically */
  flipY?: boolean
}

/**
 * The **`Sprite`** node displays a texture or sprite in the game world.
 * It supports texture atlases with margin/sourceSize, display scaling, and flipping.
 *
 * @example
 * ```tsx
 * import { loadTexture } from 'tiny-engine'
 * import { useRefNode } from 'tiny-engine/hooks'
 *
 * const PLAYER_TEXTURE = await loadTexture('/assets/player.png')
 *
 * function Player() {
 *   const sprite = useRefNode(PrimaryNode.Sprite)
 *
 *   return (
 *     <sprite
 *       ref={sprite}
 *       textureId={PLAYER_TEXTURE}
 *       sourceSize={new Vector2(32, 32)}
 *       displaySize={new Vector2(64, 64)}
 *     />
 *   )
 * }
 * ```
 */
export class Sprite extends Node<PrimaryNode.Sprite> {
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

  constructor(options: SpriteOptions) {
    super(PrimaryNode.Sprite, options)

    this.margin = ns(options.margin, vectorize, this.margin)
    this.sourceSize = ns(options.sourceSize, vectorize, this.sourceSize)
    this.displaySize = ns(options.displaySize, vectorize, this.displaySize)
    this.textureId = options.textureId ?? this.textureId
    this.flipX = options.flipX ?? this.flipX
    this.flipY = options.flipY ?? this.flipY
  }

  /** @internal Loads the texture when the sprite starts. */
  start(): void {
    if (this.textureId) {
      this.#texture = getTexture(this.textureId)
    }
    super.start()
  }

  #drawTexture() {
    if (this.#texture == null) return
    this.#texture.draw({
      position: this.position,
      margin: this.margin,
      sourceSize: this.sourceSize,
      displaySize: this.displaySize?.toMultiplied(
        new Vector2(this.flipX ? -1 : 1, this.flipY ? -1 : 1),
      ),
    })
  }

  /** @internal Draws the sprite texture. */
  draw(delta: number): void {
    this.#drawTexture()
    super.draw(delta)
  }
}

Nodes.sprite = Sprite
