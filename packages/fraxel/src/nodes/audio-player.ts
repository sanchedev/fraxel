import { Event } from '../events/event.js'
import { PrimaryNode } from './lib/enum.js'
import { Node, type NodeOptions } from './_node.js'
import { registerNode } from './lib/registry.js'
import { getAudioContext } from '../audio/audio-context.js'
import { getSound } from '../assets/load/load-sound.js'

/**
 * The **`AudioPlayerOptions`** interface defines the options for an `AudioPlayer` node.
 */
export interface AudioPlayerOptions extends NodeOptions<PrimaryNode.AudioPlayer> {
  /**
   * The **`soundId`** property defines which sound to play.
   * Obtain a sound ID via `loadSound()`.
   *
   * @example
   * ```tsx
   * <audio-player soundId={shootSound} />
   * ```
   */
  soundId: symbol
  /**
   * The **`loop`** property determines whether the sound loops.
   *
   * @default false
   */
  loop?: boolean
  /**
   * The **`volume`** property sets the playback volume (0 to 1).
   *
   * @default 1
   */
  volume?: number
  /**
   * The **`playbackRate`** property sets the playback speed.
   *
   * @default 1
   */
  playbackRate?: number
  /**
   * The **`persistUntilEnd`** property keeps the node alive until playback finishes.
   * When `true`, calling `destroy()` while audio is playing will defer destruction
   * until the sound ends. Useful for components that play a sound and are destroyed
   * immediately after.
   *
   * @default false
   *
   * @example
   * ```tsx
   * // Pea plays splat sound and destroys itself.
   * // AudioPlayer survives until the sound finishes.
   * <audio-player ref={audio} soundId={SPLAT} persistUntilEnd />
   * ```
   */
  persistUntilEnd?: boolean
}

/**
 * The **`AudioPlayer`** node plays audio buffers. It manages `AudioBufferSourceNode`
 * and `GainNode` for volume control. The `AudioContext` is created lazily on first use.
 *
 * @example
 * ```tsx
 * import { useClickable, useAudio, useTrigger } from 'fraxel/hooks'
 *
 * function Gun() {
 *   const audio = useAudio()
 *   const clickable = useClickable()
 *
 *   useTrigger(clickable.clicked, () => {
 *     audio.play()
 *   })
 *
 *   return (
 *     <sprite ref={clickable} textureId={GUN}>
 *       <audio-player ref={audio} soundId={shootSound} volume={0.8} />
 *     </sprite>
 *   )
 * }
 * ```
 *
 * For one-shot sounds on components that destroy themselves, use `persistUntilEnd`:
 *
 * @example
 * ```tsx
 * function Pea({ position }: { position: VectorLike }) {
 *   const audio = useAudio()
 *   const collider = useCollider()
 *
 *   useTrigger(collider.colliderEntered, () => {
 *     audio.play()
 *     pea.node.destroy() // audio survives until sound finishes
 *   })
 *
 *   return (
 *     <transform ref={pea} position={position}>
 *       <sprite textureId={PEA}>
 *         <collider ref={collider} ... />
 *       </sprite>
 *       <audio-player ref={audio} soundId={SPLAT} persistUntilEnd />
 *     </transform>
 *   )
 * }
 * ```
 */
export class AudioPlayer extends Node<PrimaryNode.AudioPlayer> {
  #soundId: symbol
  #source: AudioBufferSourceNode | null = null
  #gainNode: GainNode | null = null
  #loop: boolean
  #volume: number
  #playbackRate: number
  #persistUntilEnd: boolean
  #startTime = 0
  #pauseOffset = 0
  #isPlaying = false

  /**
   * Creates a new `AudioPlayer` node.
   *
   * @param options AudioPlayer configuration options
   */
  constructor(options: AudioPlayerOptions) {
    super(PrimaryNode.AudioPlayer, options)
    this.#soundId = options.soundId
    this.#loop = options.loop ?? false
    this.#volume = options.volume ?? 1
    this.#playbackRate = options.playbackRate ?? 1
    this.#persistUntilEnd = options.persistUntilEnd ?? false
  }

  /**
   * The **`ended`** event fires when playback reaches the end (non-looping only).
   */
  ended = new Event('ended', () => {})

  /**
   * The **`error`** event fires if playback fails.
   * The callback receives the error that caused the failure.
   */
  error = new Event('error', (_err: Error) => {})

  /**
   * The **`play`** method starts or resumes playback.
   *
   * @param offset Time in seconds to start from (default: 0 or pause position)
   */
  play(offset?: number): void {
    try {
      const ctx = getAudioContext()
      const buffer = getSound(this.#soundId)

      this.stop()

      this.#source = ctx.createBufferSource()
      this.#gainNode = ctx.createGain()

      this.#source.buffer = buffer
      this.#source.loop = this.#loop
      this.#source.playbackRate.value = this.#playbackRate

      this.#gainNode.gain.value = this.#volume

      this.#source.connect(this.#gainNode)
      this.#gainNode.connect(ctx.destination)

      this.#pauseOffset = offset ?? this.#pauseOffset
      this.#source.start(0, this.#pauseOffset)
      this.#startTime = ctx.currentTime - this.#pauseOffset
      this.#isPlaying = true

      this.#source.onended = () => {
        if (!this.#isPlaying) return
        this.#isPlaying = false
        this.#pauseOffset = 0
        this.ended.emit()
        if (this.#persistUntilEnd && this.isDestroyed) {
          super.destroy()
        }
      }
    } catch (err) {
      this.error.emit(err instanceof Error ? err : new Error(String(err)))
    }
  }

  /**
   * The **`pause`** method pauses playback without resetting position.
   */
  pause(): void {
    if (!this.#isPlaying || this.#source == null) return
    const ctx = getAudioContext()
    this.#pauseOffset = (ctx.currentTime - this.#startTime) * this.#playbackRate
    this.stop()
  }

  /**
   * The **`stop`** method stops playback and resets position to 0.
   */
  stop(): void {
    if (this.#source != null) {
      this.#source.onended = null
      this.#source.disconnect()
      this.#source = null
    }
    if (this.#gainNode != null) {
      this.#gainNode.disconnect()
      this.#gainNode = null
    }
    this.#isPlaying = false
  }

  /**
   * The read-only **`isPlaying`** property returns whether the sound is currently playing.
   */
  get isPlaying() {
    return this.#isPlaying
  }

  /**
   * The **`volume`** property gets or sets the playback volume (0 to 1).
   */
  set volume(value: number) {
    this.#volume = value
    if (this.#gainNode != null) {
      this.#gainNode.gain.value = value
    }
  }

  /**
   * The read-only **`volume`** property returns the current volume.
   */
  get volume() {
    return this.#volume
  }

  /**
   * The **`playbackRate`** property gets or sets the playback speed.
   */
  set playbackRate(value: number) {
    this.#playbackRate = value
    if (this.#source != null) {
      this.#source.playbackRate.value = value
    }
  }

  /**
   * The read-only **`playbackRate`** property returns the current playback rate.
   */
  get playbackRate() {
    return this.#playbackRate
  }

  /** @internal Cleans up audio resources on destroy. Respects `persistUntilEnd`. */
  destroy(): void {
    if (this.#persistUntilEnd && this.#isPlaying) {
      this.isDestroyed = true
      return
    }
    this.stop()
    super.destroy()
  }

  /** @internal Cleans up custom event listeners. */
  cleanEvents(): void {
    this.ended.clean()
    this.error.clean()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.AudioPlayer, AudioPlayer)
