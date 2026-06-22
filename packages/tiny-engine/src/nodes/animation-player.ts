import { KeyframeNotFoundError } from '../errors/animation.js'
import { Event } from '../events/event.js'
import { PrimaryNode } from './enum.js'
import { Node, type NodeOptions } from './node.js'
import { Nodes } from './registry.js'

export interface AnimationPlayerOptions extends NodeOptions<PrimaryNode.AnimationPlayer> {}

export class AnimationPlayer extends Node<PrimaryNode.AnimationPlayer> {
  #animations = new Map<string, Animation>()
  #currentAnim: string | null = null
  #nextAnim: string | null = null
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
    super(PrimaryNode.AnimationPlayer, options)
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

  // utils
  /**
   * The **`add`** method adds an animation with a key.
   * @param animName Animation identifier
   * @param animation Animation object
   * @returns This instance for chaining
   *
   * @example
   * ```tsx
   * const sprite = useRefNode(PrimaryNode.Sprite)
   * const anim = useRefNode(PrimaryNode.AnimationPlayer)
   *
   * useMount(() => {
   *   anim.node
   *     .add('idle', {
   *       fps: 4,
   *       keyframes: kfFromSpriteSheet(sprite.node, IDLE_TEXTURE, 4),
   *       loop: true,
   *     })
   *     .add('walk', {
   *       fps: 4,
   *       keyframes: kfFromSpriteSheet(sprite.node, WALK_TEXTURE, 4),
   *       loop: true,
   *     })
   *     .play('idle')
   * })
   *
   * return (
   *   <sprite ref={sprite} textureId={IDLE_TEXTURE} sourceSize={new Vector2(16, 16)}>
   *     <animation-player ref={anim} />
   *   </sprite>
   * )
   * ```
   */
  add(animName: string, animation: Animation) {
    this.#animations.set(animName, animation)
    return this
  }
  /**
   * The **`define`** method adds multiple animations at once.
   * @param animations Record of animation names to animation objects
   * @returns This instance for chaining
   *
   * @example
   * ```tsx
   * const sprite = useRefNode(PrimaryNode.Sprite)
   * const anim = useRefNode(PrimaryNode.AnimationPlayer)
   *
   * useMount(() => {
   *   anim.node
   *     .define({
   *       idle: {
   *         fps: 4,
   *         keyframes: kfFromSpriteSheet(sprite.node, IDLE_TEXTURE, 4),
   *         loop: true,
   *       },
   *       walk: {
   *         fps: 4,
   *         keyframes: kfFromSpriteSheet(sprite.node, WALK_TEXTURE, 4),
   *         loop: true,
   *       },
   *     })
   *     .play('idle')
   * })
   *
   * return (
   *   <sprite ref={sprite} textureId={IDLE_TEXTURE} sourceSize={new Vector2(16, 16)}>
   *     <animation-player ref={anim} />
   *   </sprite>
   * )
   * ```
   */
  define(animations: Record<string, Animation>) {
    for (const animName in animations) {
      if (!Object.hasOwn(animations, animName)) continue

      const animation = animations[animName]
      if (animation == null) continue
      this.add(animName, animation)
    }
    return this
  }

  /**
   * The **`play`** method plays an animation by name.
   * @param animName Animation identifier
   * @param index Index to start from (default `0`)
   *
   * @example
   * ```tsx
   * const anim = useRefNode(PrimaryNode.AnimationPlayer)
   *
   * useMount(() => {
   *   anim.node.play('idle')
   * })
   *
   * return <animation-player ref={anim} />
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
   * The **`setNext`** method sets the animation to play after the current one ends.
   * @param animName Animation to play next, or `null` to stop
   *
   * @example
   * ```tsx
   * const anim = useRefNode(PrimaryNode.AnimationPlayer)
   *
   * useEvent(anim, 'animationEnded', () => {
   *   anim.node.setNext('idle')
   * })
   * ```
   */
  setNext(animName: string | null) {
    this.#nextAnim = animName
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

        if (this.#nextAnim != null) {
          this.play(this.#nextAnim)
          this.#nextAnim = null
        }

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
