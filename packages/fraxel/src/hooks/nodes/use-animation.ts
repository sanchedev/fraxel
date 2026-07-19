import { Trigger } from '../../events/trigger.js'
import type { Animation } from '../../animation/types.js'
import { PrimaryNode } from '../../nodes/index.js'
import { Signal } from '../../reactivity/signal.js'
import { pushEffect } from '../context.js'
import { NodeReference } from './reference.js'

/**
 * The **`useAnimation`** hook creates a reference to an `AnimationPlayer` node with reactive
 * animation state, frame tracking, and imperative play/stop control.
 *
 * @returns An `AnimationReference` with reactive properties, triggers, and control methods
 *
 * @example
 * ```tsx
 * import { useAnimation, useTrigger, useEffect } from 'fraxel'
 *
 * function Character() {
 *   const anim = useAnimation()
 *
 *   useTrigger(anim.onAnimChange, (newAnim, oldAnim) => {
 *     console.log(`Switched from ${oldAnim} to ${newAnim}`)
 *   })
 *
 *   useEffect(() => {
 *     anim.play('walk')
 *   })
 *
 *   return (
 *     <animator
 *       ref={anim}
 *       animations={() => ({
 *         idle: { keyframes: idleFrames, fps: 8 },
 *         walk: { keyframes: walkFrames, fps: 8, loop: true },
 *       })}
 *     />
 *   )
 * }
 * ```
 */
export function useAnimation() {
  pushEffect('useAnimation', () => {})
  return new AnimationReference()
}

/**
 * The **`AnimationReference`** class provides reactive access to an `AnimationPlayer` node's
 * current animation, frame index, completion state, and control methods, plus animation event triggers.
 */
export class AnimationReference extends NodeReference<PrimaryNode.AnimationPlayer> {
  /** Reactive current animation name, or `null` when stopped. */
  animName = new Signal<string | null>(null).getter
  /** Reactive current frame index within the animation. */
  frameIndex = new Signal(0).getter
  /** Reactive `true` when the current animation has finished. */
  ended = new Signal(false).getter

  /** Fires when the animation changes. */
  onAnimChange = new Trigger<[newAnim: string, oldAnim: string | null]>()
  /** Fires when the animation is stopped. */
  onAnimStop = new Trigger<[anim: string]>()
  /** Fires when the frame index changes. */
  onAnimIndexChange = new Trigger<[index: number]>()
  /** Fires when the animation reaches the end. */
  onAnimEnd = new Trigger<[anim: string]>()

  /**
   * Plays an animation by name, optionally starting at a specific frame.
   *
   * @param animName The name of the animation to play
   * @param index Optional frame index to start from
   */
  play = (animName: string, index?: number) => this.node.play(animName, index)
  /** Stops the current animation. */
  stop = () => this.node.stop()
  /**
   * Sets the next animation to play after the current one ends.
   *
   * @param animName The animation name, or `null` to clear the queue
   */
  setNext = (animName: string | null) => this.node.setNext(animName)
  /** Adds a single animation definition. */
  add = (animName: string, animation: Animation) => this.node.add(animName, animation)
  /** Replaces or adds multiple animation definitions. */
  define = (animations: Record<string, Animation>) => this.node.define(animations)

  constructor() {
    super({
      type: PrimaryNode.AnimationPlayer,
      linkEvents: ({ link, on }) => {
        link(this, 'onAnimChange', 'onAnimEnd', 'onAnimIndexChange', 'onAnimEnd')
        on('onAnimChange', (name) => {
          this.animName.signal.setter(name)
          this.ended.signal.setter(false)
        })
        on('onAnimStop', () => this.animName.signal.setter(null))
        on('onAnimIndexChange', (index) => this.frameIndex.signal.setter(index))
        on('onAnimEnd', () => this.ended.signal.setter(true))
      },
      regSignal: ({ reg }) => {
        reg<AnimationReference>(this, 'animName', 'frameIndex', 'ended')
      },
    })
  }
}
