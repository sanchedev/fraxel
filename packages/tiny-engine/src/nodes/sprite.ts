import { getTexture, type Texture } from '../assets/texture.js'
import { Vector2 } from '../math/vector2.js'
import { Signal } from '../reactivity/signal.js'
import { Node, type NodeOptions } from './node.js'
import { Nodes } from './registry.js'

export interface SpriteOptions extends NodeOptions {
  /**
   * The **`textureId`** property of `Sprite` represents the sprite's texture.
   * If **`textureId`** is not in the textures loaded then thow an error.
   *
   * @example
   * ```jsx
   *
   * await loadTexture('ball', 'assets/ball.png')
   *
   * function Ball() {
   *   useStart((node) => {
   *     const container = node.getChild('container')
   *     // ...
   *   })
   *
   *   return (
   *     <sprite textureId='ball' />
   *   )
   * }
   * ```
   */
  textureId?: string | Signal<string>
  /**
   * The **`margin`** property of `Sprite` represents the sprite's texture offset.
   *
   * @example
   * ```jsx
   *
   * await loadTexture('idle', 'assets/idle.png')
   *
   * function Player() {
   *   return (
   *     <sprite textureId='idle' margin={new Vector(16, 0)} />
   *   )
   * }
   * ```
   */
  margin?: Vector2 | Signal<Vector2>
  /**
   * The **`sourceSize`** property of `Sprite` represents the sprite source size.
   *
   * @default texture.size
   *
   * @example
   * ```jsx
   *
   * await loadTexture('idle', 'assets/idle.png')
   *
   * function Player() {
   *   return (
   *     <sprite
   *       textureId='idle'
   *       margin={new Vector(16, 0)}
   *       sourceSize={new Vector(16, 16)}
   *     />
   *   )
   * }
   * ```
   */
  sourceSize?: Vector2 | Signal<Vector2>
  /**
   * The **`displaySize`** property of `Sprite` represents the sprite display size.
   *
   * @default this.sourceSize
   *
   * @example
   * ```jsx
   *
   * await loadTexture('idle', 'assets/idle.png')
   *
   * function Player() {
   *   return (
   *     <sprite
   *       textureId='idle'
   *       margin={new Vector(16, 0)}
   *       sourceSize={new Vector(16, 16)}
   *       displaySize={new Vector(32, 32)}
   *     />
   *   )
   * }
   * ```
   */
  displaySize?: Vector2 | Signal<Vector2>
  flipX?: boolean | Signal<boolean>
  flipY?: boolean | Signal<boolean>
}

/** Default **`id`** for `Sprite` and it is used for jsx tags */
export const spriteNodeName = 'sprite'

export class Sprite extends Node {
  #textureId?: string | undefined
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
   */
  getTexture() {
    return this.#texture
  }

  constructor(options: SpriteOptions) {
    super({ ...options, id: options.id ?? spriteNodeName })

    if (options.margin != null) {
      if (options.margin instanceof Signal) {
        this.margin = options.margin.value
        options.margin.subscribe((val) => (this.margin = val))
      } else {
        this.margin = options.margin
      }
    }
    if (options.sourceSize != null) {
      if (options.sourceSize instanceof Signal) {
        this.sourceSize = options.sourceSize.value
        options.sourceSize.subscribe((val) => (this.sourceSize = val))
      } else {
        this.sourceSize = options.sourceSize
      }
    }
    if (options.displaySize != null) {
      if (options.displaySize instanceof Signal) {
        this.displaySize = options.displaySize.value
        options.displaySize.subscribe((val) => (this.displaySize = val))
      } else {
        this.displaySize = options.displaySize
      }
    }
    if (options.textureId != null) {
      if (options.textureId instanceof Signal) {
        this.textureId = options.textureId.value
        options.textureId.subscribe((val) => (this.textureId = val))
      } else {
        this.textureId = options.textureId
      }
    }
    if (options.flipX != null) {
      console.log(options.flipX, 'options.flipX')
      if (options.flipX instanceof Signal) {
        this.flipX = options.flipX.value
        console.log(this.flipX, 'flipX')
        console.log(options.flipX.value, 'options.flipX.value')
        options.flipX.subscribe((val) => (this.flipX = val))
      } else {
        this.flipX = options.flipX
      }
    }
    if (options.flipY != null) {
      if (options.flipY instanceof Signal) {
        this.flipY = options.flipY.value
        options.flipY.subscribe((val) => (this.flipY = val))
      } else {
        this.flipY = options.flipY
      }
    }
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
