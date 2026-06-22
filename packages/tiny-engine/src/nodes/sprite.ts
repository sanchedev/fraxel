import { getTexture, type Texture } from '../assets/texture.js'
import { Vector2 } from '../math/vector2.js'
import { Signal } from '../reactivity/signal.js'
import type { TinyScript } from '../scripts/script.js'
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
  margin?: Vector2
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
  sourceSize?: Vector2
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
  displaySize?: Vector2
  /** Whether to flip the sprite horizontally */
  flipX?: boolean
  /** Whether to flip the sprite vertically */
  flipY?: boolean
}

export class Sprite extends Node<PrimaryNode.Sprite> {
  #textureId?: symbol | undefined
  #texture?: Texture | undefined
  margin?: Vector2 | undefined
  sourceSize?: Vector2 | undefined
  displaySize?: Vector2 | undefined

  flipX = false
  flipY = false

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

    this.margin = options.margin ?? this.margin
    this.sourceSize = options.sourceSize ?? this.sourceSize
    this.displaySize = options.displaySize ?? this.displaySize
    this.textureId = options.textureId ?? this.textureId
    this.flipX = options.flipX ?? this.flipX
    this.flipY = options.flipY ?? this.flipY
  }

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

  draw(delta: number): void {
    this.#drawTexture()
    super.draw(delta)
  }
}

Nodes.sprite = Sprite
