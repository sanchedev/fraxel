import { KeyframeNotFoundError } from '../errors/animation.js'
import { PrimaryNode } from './lib/enum.js'
import { Node, type NodeOptions } from './_node.js'
import { registerNode } from './lib/registry.js'
import type { Reactive } from '../reactivity/types.js'
import { subReactive } from '../reactivity/reactive.js'
import type { Animation } from '../animation/types.js'
import { Trigger } from '../events/trigger.js'

/**
 * The **`AnimationPlayerOptions`** interface defines the options for an `AnimationPlayer` node.
 */
export interface AnimationPlayerOptions extends NodeOptions<PrimaryNode.AnimationPlayer> {
  /**
   * The **`animations`** property is a function that returns a record of animation definitions.
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
   * The **`currentAnim`** property defines the animation to play initially.
   * Accepts a static name or a reactive getter that automatically switches
   * animations when the signal value changes.
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
   * The **`destroyOnEnd`** property determines whether the node is automatically
   * destroyed when the current animation ends. Useful for one-shot effect animations.
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

  /**
   * The read-only **`currentAnim`** property returns the current animation name,
   * or `null` when no animation is playing.
   */
  get currentAnim() {
    return this.#currentAnim
  }
  /**
   * The read-only **`index`** property returns the current frame index
   * within the active animation.
   */
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

    this.onStart.connect(() => {
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
            (fn) => this.onDestroy.connect(fn),
          ),
        )
      }
    })
  }

  // Triggers
  onAnimChange = new Trigger<[newAnim: string, oldAnim: string | null]>()
  onAnimStop = new Trigger<[anim: string]>()
  onAnimIndexChange = new Trigger<[index: number]>()
  onAnimEnd = new Trigger<[anim: string]>()

  // utils
  /**
   * The **`add`** method adds an animation with a key.
   *
   * @param animName Animation identifier
   * @param animation Animation object
   * @returns This instance for chaining
   *
   * @example
   * ```tsx
   * import { useSprite, useAnimation, useMount } from 'fraxel'
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
   *   <sprite ref={sprite} textureId={IDLE_TEXTURE} source={region(0, 0, 16, 16)}>
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
   * The **`define`** method adds multiple animations at once from a record.
   *
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
   *   <sprite ref={sprite} textureId={IDLE_TEXTURE} source={region(0, 0, 16, 16)}>
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
   * If the same animation with the same index is already playing, this method is a no-op.
   *
   * @param animName Animation identifier
   * @param index Optional index to start from (default `0`)
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
    this.onAnimChange.emit(animName, oldAnim)
    this.onAnimIndexChange.emit(index ?? 0)
  }
  /**
   * The **`setNext`** method sets the animation to play after the current one ends.
   * Pass `null` to clear the next animation.
   *
   * @param animName Animation to play next, or `null` to stop
   *
   * @example
   * ```tsx
   * const anim = useAnimation()
   *
   * useTrigger(anim.onAnimEnd, () => {
   *   anim.setNext('idle')
   * })
   * ```
   */
  setNext(animName: string | null) {
    this.#nextAnim = animName
  }

  /**
   * The **`stop`** method stops the current animation and resets the frame index to 0.
   * Emits `animationStopped` if an animation was playing.
   */
  stop() {
    if (this.#currentAnim == null) return
    this.onAnimStop.emit(this.#currentAnim)
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
        this.onAnimEnd.emit(animName)

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
      this.onAnimIndexChange.emit(0)
    }

    const i = Math.floor(this.#index)

    const kf = anim.keyframes[i]

    if (kf == null) throw new KeyframeNotFoundError(i)

    kf(this.#index % 1)

    this.#index += delta * anim.fps

    if (this.#index < anim.keyframes.length && i !== Math.floor(this.#index)) {
      this.onAnimIndexChange.emit(Math.floor(this.#index))
    }
  }

  update(delta: number): void {
    this.#updateAnim(delta)
    super.update(delta)
  }

  cleanEvents(): void {
    this.onAnimChange.clear()
    this.onAnimEnd.clear()
    this.onAnimIndexChange.clear()
    this.onAnimStop.clear()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.AnimationPlayer, AnimationPlayer)
