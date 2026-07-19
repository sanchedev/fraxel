import { Trigger } from '../../events/trigger.js'
import { PrimaryNode } from '../../nodes/index.js'
import { createSignalSetter, Signal } from '../../reactivity/signal.js'
import { pushEffect } from '../context.js'
import { NodeReference } from './reference.js'

/**
 * The **`useAudio`** hook creates a reference to an `AudioPlayer` node with reactive
 * playback state and imperative play/pause/stop control.
 *
 * @returns An `AudioReference` with reactive playback state and control methods
 *
 * @example
 * ```tsx
 * import { shapes, useAudio, useTrigger } from 'fraxel'
 *
 * function SoundEffect() {
 *   const audio = useAudio()
 *
 *   useTrigger(audio.onEnd, () => {
 *     console.log('Sound finished playing')
 *   })
 *
 *   return (
 *     <audio-player ref={audio} soundId={SFX}>
 *       <clickable onClick={() => audio.play()} shape={shapes.rectangle(64, 32)} />
 *     </audio-player>
 *   )
 * }
 * ```
 */
export function useAudio() {
  pushEffect('useAudio', () => {})
  return new AudioReference()
}

/**
 * The **`AudioReference`** class provides reactive access to an `AudioPlayer` node's
 * playback state (playing, volume, rate), control methods, and audio event triggers.
 */
export class AudioReference extends NodeReference<PrimaryNode.AudioPlayer> {
  /** Reactive `true` when audio is currently playing. */
  playing = new Signal(false).getter
  /** Reactive playback volume from `0` to `1`. */
  volume = new Signal(1).getter
  /** Sets the playback volume from `0` to `1`. */
  setVolume = createSignalSetter(this.volume.signal, {
    value: () => this.node.volume,
    onChange: (v) => (this.node.volume = v),
  })
  /** Reactive playback speed multiplier. */
  playbackRate = new Signal(1).getter
  /** Sets the playback speed multiplier. */
  setPlaybackRate = createSignalSetter(this.playbackRate.signal, {
    value: () => this.node.playbackRate,
    onChange: (v) => (this.node.playbackRate = v),
  })

  /** Fires when the audio finishes playing naturally. */
  onEnd = new Trigger<[]>()
  /** Fires when an audio error occurs. */
  onError = new Trigger<[err: Error]>()

  /**
   * Starts or resumes playback.
   *
   * @param offset Optional start position in seconds
   */
  play = (offset?: number) => this.node.play(offset)
  /** Pauses playback without resetting position. */
  pause = () => this.node.pause()
  /** Stops playback and resets position to 0. */
  stop = () => this.node.stop()

  constructor() {
    super({
      type: PrimaryNode.AudioPlayer,
      linkEvents: ({ link, on }) => {
        link(this, 'onEnd', 'onError')
        on('onStart', () => this.playing.signal.setter(true))
        on('onEnd', () => this.playing.signal.setter(false))
      },
      regSignal: ({ reg }) => {
        reg<AudioReference>(this, 'playing', 'volume', 'playbackRate')
      },
      onFrame: (node) => {
        this.playing.signal.setter(node.isPlaying)
        this.volume.signal.setter(node.volume)
        this.playbackRate.signal.setter(node.playbackRate)
      },
    })
  }
}
