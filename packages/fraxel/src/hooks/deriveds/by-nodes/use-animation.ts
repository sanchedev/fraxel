import { PrimaryNode } from '../../../nodes/index.js'
import { declareDerivedHook } from '../../context.js'
import { useEvent } from '../../use-event.js'
import type { NodeReference } from '../../use-node.js'
import { useSignal } from '../../use-signal.js'
import { usePartialNode } from '../use-partial-node.js'
import { useCondition } from '../use-condition.js'

/**
 * The **`useAnimation`** derived hook provides a declarative API for the `AnimationPlayer` node.
 * Returns the node reference, reactive `animName` and `frameIndex` signals,
 * a reactive `ended` boolean, and control methods.
 *
 * @param anim An optional existing `NodeReference` to the AnimationPlayer node
 * @returns An object with `ref`, `animName`, `frameIndex`, `ended`, `play`, `stop`, `setNext`
 *
 * @example
 * ```tsx
 * import { useAnimation } from 'fraxel/hooks'
 *
 * function Character() {
 *   const sprite = useNode(PrimaryNode.Sprite)
 *   const { ref, animName, ended, play, setNext } = useAnimation()
 *
 *   useEffect(() => {
 *     play(isWalking() ? 'walk' : 'idle')
 *   })
 *
 *   useEvent(ref, 'animationEnded', () => {
 *     setNext('idle')
 *   })
 *
 *   return (
 *     <sprite ref={sprite} textureId={CHAR}>
 *       <animation-player ref={ref} animations={() => anims} currentAnim={animName} />
 *     </sprite>
 *   )
 * }
 * ```
 */
export function useAnimation(anim?: NodeReference<PrimaryNode.AnimationPlayer>) {
  declareDerivedHook('useAnimation')
  const ref = usePartialNode(PrimaryNode.AnimationPlayer, anim)

  const [animName, setAnimName] = useSignal<string | null>(null)
  useEvent(ref, 'animationChanged', (name) => setAnimName(name))
  useEvent(ref, 'animationStopped', () => setAnimName(null))

  const [frameIndex, setFrameIndex] = useSignal(0)
  useEvent(ref, 'animationIndexChanged', setFrameIndex)

  const ended = useCondition(ref, 'animationEnded', 'animationChanged')

  const play: typeof ref.node.play = (...args) => ref.node.play(...args)
  const stop: typeof ref.node.stop = (...args) => ref.node.stop(...args)
  const setNext: typeof ref.node.setNext = (...args) => ref.node.setNext(...args)

  return {
    ref,
    animName,
    frameIndex,
    ended,
    play,
    stop,
    setNext,
  }
}
