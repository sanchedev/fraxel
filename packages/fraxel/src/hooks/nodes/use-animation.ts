import { Trigger } from '../../events/trigger.js'
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
  play: (animName: string, index?: number) => void = () => {}
  /** Stops the current animation. */
  stop: () => void = () => {}
  /**
   * Sets the next animation to play after the current one ends.
   *
   * @param animName The animation name, or `null` to clear the queue
   */
  setNext: (animName: string | null) => void = () => {}

  constructor() {
    super(
      PrimaryNode.AnimationPlayer,
      (node) => {
        this.onAnimChange.link(node.onAnimChange)
        this.onAnimStop.link(node.onAnimStop)
        this.onAnimIndexChange.link(node.onAnimIndexChange)
        this.onAnimEnd.link(node.onAnimEnd)

        const sets = [
          () => {
            this.animName.signal.setter(node.currentAnim)
            this.frameIndex.signal.setter(node.index)
          },
        ]
        sets.forEach((set) => set())

        node.onAnimChange.connect((name) => {
          this.animName.signal.setter(name)
          this.ended.signal.setter(false)
        })
        node.onAnimStop.connect(() => {
          this.animName.signal.setter(null)
        })
        node.onAnimIndexChange.connect((index) => {
          this.frameIndex.signal.setter(index)
        })
        node.onAnimEnd.connect(() => {
          this.ended.signal.setter(true)
        })

        this.play = (animName, index) => node.play(animName, index)
        this.stop = () => node.stop()
        this.setNext = (animName) => node.setNext(animName)
      },
      () => {
        this.animName.signal.clearSubs()
        this.frameIndex.signal.clearSubs()
        this.ended.signal.clearSubs()
      },
    )
  }
}
