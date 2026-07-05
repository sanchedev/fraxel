import { PrimaryNode } from '../../../nodes/index.js'
import { declareDerivedHook } from '../../context.js'
import { useComputed } from '../../use-computed.js'
import { useEvent } from '../../use-event.js'
import type { NodeReference } from '../../use-node.js'
import { useSignal } from '../../use-signal.js'
import { usePartialNode } from '../use-partial-node.js'

/**
 * The **`useTimer`** derived hook provides a declarative API for the `Timer` node.
 * Returns the node reference, reactive time/progress values, and control methods.
 *
 * @param timer An optional existing `NodeReference` to the Timer node
 * @returns An object with `ref`, `time`, `progress`, `play`, `pause`, `stop`
 *
 * @example
 * ```tsx
 * import { useTimer } from 'diny/hooks'
 *
 * function Cooldown() {
 *   const { ref, time, progress, play, pause, stop } = useTimer()
 *
 *   return (
 *     <transform>
 *       <timer ref={ref} duration={3} autoPlay />
 *       <rectangle size={[100, 10]} fillColor={[1 - progress(), progress(), 0, 1]} />
 *     </transform>
 *   )
 * }
 * ```
 */
export function useTimer(timer?: NodeReference<PrimaryNode.Timer>) {
  declareDerivedHook('useTimer')
  const ref = usePartialNode(PrimaryNode.Timer, timer)

  const [time, setTime] = useSignal(0)
  useEvent(ref, 'timeChanged', setTime)

  const progress = useComputed(() => time() / (ref.signal()?.duration ?? time()))

  const play: typeof ref.node.play = (...args) => ref.node.play(...args)
  const pause: typeof ref.node.pause = (...args) => ref.node.pause(...args)
  const stop: typeof ref.node.stop = (...args) => ref.node.stop(...args)

  return {
    ref,
    time,
    progress,
    play,
    pause,
    stop,
  }
}
