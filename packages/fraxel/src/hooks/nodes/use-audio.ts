import { PrimaryNode } from '../../nodes/index.js'
import { Signal } from '../../reactivity/signal.js'
import { pushEffect } from '../context.js'
import { Trigger } from '../use-trigger.js'
import { NodeReference } from './reference.js'

/**
 * The **`useAudio`** hook creates a reference to an `AudioPlayer` node with reactive
 * playback state and imperative play/pause/stop control.
 *
 * @returns An `AudioReference` with reactive playback state and control methods
 *
 * @example
 * ```tsx
 * import { useAudio, useTrigger } from 'fraxel/hooks'
 *
 * function SoundEffect() {
 *   const audio = useAudio()
 *
 *   useTrigger(audio.ended, () => {
 *     console.log('Sound finished playing')
 *   })
 *
 *   return (
 *     <audio-player ref={audio} soundId={SFX}>
 *       <clickable onClick={() => audio.play()} size={[64, 32]} />
 *     </audio-player>
 *   )
 * }
 * ```
 */
export function useAudio() {
  pushEffect('useAudio', () => {})
  return new AudioReference()
}

export class AudioReference extends NodeReference<PrimaryNode.AudioPlayer> {
  /** Reactive `true` when audio is currently playing. */
  playing = new Signal(false).getter

  /** Fires when the audio finishes playing naturally. */
  ended = new Trigger<[]>()
  /** Fires when an audio error occurs. */
  error = new Trigger<[err: Error]>()

  /** Starts or resumes playback. Optional `offset` sets the start position in seconds. */
  play: (offset?: number) => void = () => {}
  /** Pauses playback without resetting position. */
  pause: () => void = () => {}
  /** Stops playback and resets position to 0. */
  stop: () => void = () => {}

  constructor() {
    let unsubs: (() => void)[] = []
    super(
      PrimaryNode.AudioPlayer,
      (node) => {
        this.playing.signal.setter(node.isPlaying)

        unsubs.push(
          node.started.on(() => {
            this.playing.signal.setter(true)
          }),
          node.ended.on(() => {
            this.playing.signal.setter(false)
            this.ended.emit()
          }),
          node.error.on((err) => {
            this.error.emit(err)
          }),
          node.updated.on(() => {
            this.playing.signal.setter(node.isPlaying)
          }),
        )

        this.play = (offset) => node.play(offset)
        this.pause = () => node.pause()
        this.stop = () => node.stop()
      },
      () => {
        this.playing.signal.clearSubs()
        this.ended.clear()
        this.error.clear()
        unsubs.forEach((unsub) => unsub())
        unsubs = []
      },
    )
  }
}
