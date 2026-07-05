import { PrimaryNode } from '../../../nodes/index.js'
import { declareDerivedHook } from '../../context.js'
import type { NodeReference } from '../../use-node.js'
import { usePartialNode } from '../use-partial-node.js'
import { useCondition } from '../use-condition.js'

/**
 * The **`useAudio`** derived hook provides a declarative API for the `AudioPlayer` node.
 * Returns the node reference, a reactive `playing` boolean, and control methods.
 *
 * @param audio An optional existing `NodeReference` to the AudioPlayer node
 * @returns An object with `ref`, `playing`, `play`, `pause`, `stop`
 *
 * @example
 * ```tsx
 * import { useAudio } from 'diny/hooks'
 *
 * function MusicPlayer() {
 *   const { ref, playing, play, stop } = useAudio()
 *
 *   return (
 *     <transform>
 *       <audio-player ref={ref} soundId={MUSIC} loop />
 *       <clickable onClick={() => playing() ? stop() : play()} />
 *     </transform>
 *   )
 * }
 * ```
 */
export function useAudio(audio?: NodeReference<PrimaryNode.AudioPlayer>) {
  declareDerivedHook('useAudio')
  const ref = usePartialNode(PrimaryNode.AudioPlayer, audio)

  const playing = useCondition(ref, 'started', 'ended')

  const play: typeof ref.node.play = (...args) => ref.node.play(...args)
  const pause: typeof ref.node.pause = (...args) => ref.node.pause(...args)
  const stop: typeof ref.node.stop = (...args) => ref.node.stop(...args)

  return {
    ref,
    playing,
    play,
    pause,
    stop,
  }
}
