import { KeyframeNotFoundError } from '../errors/animation.js'
import { Event } from '../events/event.js'
import { PrimaryNode } from './lib/enum.js'
import { Node, type NodeOptions } from './_node.js'
import { Nodes } from './lib/registry.js'
import type { Reactive } from '../reactivity/types.js'
import { subReactive } from '../reactivity/reactive.js'

/**
 * Options for the `AnimationPlayer` node.
 */
export interface AnimationPlayerOptions extends NodeOptions<PrimaryNode.AnimationPlayer> {
  /**
   * A function that returns a record of animation definitions.
   * The function is called when the node starts (deferred), not at construction time.
   *
   * @example
   * ```tsx
   * <animation-player
   *   animations={() => ({
   *     idle: { keyframes: idleFrames, fps: 8 },
   *     walk: { keyframes: walkFrames, fps: 8, loop: true },
   *   })}
   * />
   * ```
   */
  animations?: Reactive<Record<string, Animation>>
  /**
   * The animation to play initially. Accepts a static name or a reactive `Reactive`
   * that automatically switches animations when the signal value changes.
   *
   * @example
   * ```tsx
   * // Static
   * <animation-player animations={...} currentAnim="idle" />
   *
   * // Reactive
   * const animName = useComputed(() => isWalking() ? 'walk' : 'idle')
   * <animation-player animations={...} currentAnim={animName} />
   * ```
   */
  currentAnim?: Reactive<string>
  /**
   * When `true`, the node is automatically destroyed when the current animation ends.
   * Useful for one-shot effect animations.
   *
   * @default false
   *
   * @example
   * ```tsx
   * <animation-player
   *   animations={() => ({ explode: { keyframes: frames, fps: 12 } })}
   *   currentAnim="explode"
   *   destroyOnEnd
   * />
   * ```
   */
  destroyOnEnd?: boolean
}

export class AnimationPlayer extends Node<PrimaryNode.AnimationPlayer> {
  #animations = new Map<string, Animation>()
  #currentAnim: string | null = null
  #nextAnim: string | null = null
  #index = 0
  #destroyOnEnd = false

  /** The read-only **`currentAnim`** property returns the current animation name */
  get currentAnim() {
    return this.#currentAnim
  }
  /** The read-only **`index`** property returns the current index */
  get index() {
    return Math.floor(this.#index)
  }

  /**
   * Creates a new `AnimationPlayer` node.
   *
   * If `animations` is provided, it is invoked when the node starts.
   * If `currentAnim` is a `SignalGetter`, the player reactively tracks
   * the signal and switches animations automatically.
   *
   * @param options AnimationPlayer configuration options
   */
  constructor(options: AnimationPlayerOptions) {
    super(PrimaryNode.AnimationPlayer, options)
    this.#destroyOnEnd = options.destroyOnEnd ?? false

    this.started.on(() => {
      if (options.animations) {
        this.define(
          subReactive(options.animations!, (animations) => {
            this.#animations.clear()
            this.define(animations)
          }),
        )
      }

      if (options.currentAnim != null) {
        this.play(
          subReactive(
            options.currentAnim,
            (anim) => this.play(anim),
            (fn) => this.destroyed.on(fn),
          ),
        )
      }
    })
  }

  // Events
  /**
   * Detects when `currentAnim` **changes**
   */
  animationChanged = new Event('animationChange', (_newAnim: string, _oldAnim: string | null) => {})
  /**
   * Detects when `stop` is **called**
   */
  animationStopped = new Event('animationStop', (_anim: string) => {})
  /**
   * Detects when `index` **changes**
   */
  animationIndexChanged = new Event('animationIndexChange', (_index: number) => {})
  /**
   * Detects when the current animation **ends**
   */
  animationEnded = new Event('animationEnd', (_anim: string) => {})

  // utils
  /**
   * The **`add`** method adds an animation with a key.
   * @param animName Animation identifier
   * @param animation Animation object
   * @returns This instance for chaining
   *
   * @example
   * ```tsx
   * import { useSprite, useAnimation, useMount } from 'fraxel/hooks'
   * import { keyframesFromSheet } from 'fraxel'
   *
   * const sprite = useSprite()
   * const anim = useAnimation()
   *
   * useMount(() => {
   *   anim.node
   *     .add('idle', {
   *       fps: 4,
   *       keyframes: keyframesFromSheet(sprite.node, IDLE_TEXTURE, 4),
   *       loop: true,
   *     })
   *     .add('walk', {
   *       fps: 4,
   *       keyframes: keyframesFromSheet(sprite.node, WALK_TEXTURE, 4),
   *       loop: true,
   *     })
   *     .play('idle')
   * })
   *
   * return (
   *   <sprite ref={sprite} textureId={IDLE_TEXTURE} sourceSize={[16, 16]}>
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
   * const sprite = useSprite()
   * const anim = useAnimation()
   *
   * useMount(() => {
   *   anim.node
   *     .define({
   *       idle: {
   *         fps: 4,
   *         keyframes: keyframesFromSheet(sprite.node, IDLE_TEXTURE, 4),
   *         loop: true,
   *       },
   *       walk: {
   *         fps: 4,
   *         keyframes: keyframesFromSheet(sprite.node, WALK_TEXTURE, 4),
   *         loop: true,
   *       },
   *     })
   *     .play('idle')
   * })
   *
   * return (
   *   <sprite ref={sprite} textureId={IDLE_TEXTURE} sourceSize={[16, 16]}>
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
   * const anim = useAnimation()
   *
   * useMount(() => {
   *   anim.node.play('idle')
   * })
   *
   * return <animation-player ref={anim} />
   * ```
   */
  play(animName: string, index?: number) {
    if (this.#currentAnim === animName && (index == null || Math.floor(this.#index) === index))
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
   * const anim = useAnimation()
   *
   * useTrigger(anim.animationEnded, () => {
   *   anim.setNext('idle')
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

        if (this.#destroyOnEnd) {
          this.destroy()
          return
        }

        if (this.#nextAnim == null) return
      }

      if (this.#nextAnim != null) {
        if (this.#currentAnim != null) {
          this.stop()
        }
        this.play(this.#nextAnim)
        this.#nextAnim = null
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

/**
 * A keyframe function that receives the local time (0–1) within the frame
 * and applies the frame's visual state to the sprite.
 */
export type AnimationKeyframe = (time: number) => void
