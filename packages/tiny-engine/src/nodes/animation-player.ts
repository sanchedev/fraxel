import { KeyframeNotFoundError } from '../errors/animation.js'
import { Event } from '../events/event.js'
import { Node, type NodeOptions } from './node.js'
import { Nodes } from './registry.js'

export interface AnimationPlayerOptions extends NodeOptions {}

/** Default **`id`** for `AnimationPlayer` and it is used for jsx tags */
export const animationPlayerNodeName = 'animation-player'

export class AnimationPlayer extends Node {
  #animations = new Map<string, Animation>()
  #currentAnim: string | null = null
  #index = 0

  /** The read-only **`currentAnim`** property returns the current animation name */
  get currentAnim() {
    return this.#currentAnim
  }
  /** The read-only **`index`** property returns the current index */
  get index() {
    return Math.floor(this.#index)
  }

  constructor(options: AnimationPlayerOptions) {
    super({ ...options, id: options.id ?? animationPlayerNodeName })
  }

  // Events
  /**
   * Detects whether `currentAnim` **change**
   */
  animationChanged = new Event(
    'animationChange',
    (newAnim: string, oldAnim: string | null) => {},
  )
  /**
   * Detects whether `stop` is **called**
   */
  animationStopped = new Event('animationStop', (anim: string) => {})
  /**
   * Detects whether this `index` **change**
   */
  animationIndexChanged = new Event(
    'animationIndexChange',
    (index: number) => {},
  )
  /**
   * Detects whether the current animation **end**
   */
  animationEnded = new Event('animationEnd', (anim: string) => {})

  // Event functions
  animationChange?(newAnim: string, oldAnim: string | null) {}
  animationStop?(anim: string) {}
  animationIndexChange?(index: number) {}
  animationEnd?(anim: string) {}

  /**
   * The **`add`** method adds an animation with a key.
   * @param animName Animation identifier
   * @param animation Animation object
   *
   * @example
   * ```tsx
   * useStart<'sprite'>((sprite) => {
   *   const animPlayer = sprite.getChild('animation-player', 'animation-player')
   *
   *   animPlayer
   *     .add('idle', {
   *       fps: 4,
   *       keyframes: kfFromSpriteSheet(sprite, 'idle', 4),
   *       loop: true,
   *     })
   *     .add('walk', {
   *       fps: 4,
   *       keyframes: kfFromSpriteSheet(sprite, 'walk', 4),
   *       loop: true,
   *     })
   *
   *   animPlayer.play('idle')
   * })
   *
   * return (
   *   <sprite textureId='idle' size={new Vector(16, 16)}>
   *     <animation-player id='animation-player' />
   *   </sprite>
   * )
   * ```
   */
  add(animName: string, animation: Animation) {
    this.#animations.set(animName, animation)
    return this
  }

  /**
   * The **`play`** method plays an animation by id.
   * @param animName Animation identifier
   * @param index Index to start (default `0`)
   *
   * @example
   * ```ts
   * animPlayer.play('idle')
   * ```
   */
  play(animName: string, index?: number) {
    if (
      this.#currentAnim === animName &&
      (index == null || Math.floor(this.#index) === index)
    )
      return
    if (this.#currentAnim != null) this.stop()
    const oldAnim = this.#currentAnim
    this.#index = index ?? 0
    this.#currentAnim = animName
    this.animationChanged.emit(animName, oldAnim)
    this.animationIndexChanged.emit(index ?? 0)
  }

  /**
   * The **`stop`** method stops the current animation.
   */
  stop() {
    if (this.#currentAnim == null) return
    this.animationStopped.emit(this.#currentAnim)
    this.#index = 0
    this.#currentAnim = null
  }

  #updateAnim(delta: number): void {
    if (this.#currentAnim == null) return

    const anim = this.#animations.get(this.#currentAnim)

    if (anim == null) return

    if (this.#index >= anim.keyframes.length) {
      if (!anim.loop) {
        const animName = this.#currentAnim
        this.stop()
        this.animationEnded.emit(animName)

        return
      }

      this.#index = 0
      this.animationIndexChanged.emit(0)
    }

    const i = Math.floor(this.#index)

    const kf = anim.keyframes[i]

    if (kf == null) throw new KeyframeNotFoundError(i)

    kf(this.#index % 1)

    this.#index += delta * anim.fps

    if (this.#index < anim.keyframes.length && i !== Math.floor(this.#index)) {
      this.animationIndexChanged.emit(Math.floor(this.#index))
    }
  }

  update(delta: number): void {
    this.#updateAnim(delta)
    super.update(delta)
  }

  cleanEvents(): void {
    this.animationChanged.clean()
    this.animationEnded.clean()
    this.animationIndexChanged.clean()
    this.animationStopped.clean()
    super.cleanEvents()
  }
}

Nodes['animation-player'] = AnimationPlayer

export interface Animation {
  /** Frames per second */
  fps: number
  /** Frames in the `Animation` */
  keyframes: AnimationKeyframe[]
  /** Whether the `Animation` should start over when it reaches the end. */
  loop?: boolean | undefined
}

export type AnimationKeyframe = (time: number) => void
