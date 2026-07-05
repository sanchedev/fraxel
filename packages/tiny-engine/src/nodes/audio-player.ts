import { Event } from '../events/event.js'
import { PrimaryNode } from './lib/enum.js'
import { Node, type NodeOptions } from './_node.js'
import { Nodes } from './lib/registry.js'
import { getAudioContext } from '../audio/audio-context.js'
import { getSound } from '../assets/load-sound.js'

/**
 * Options for the `AudioPlayer` node.
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
   * @default false
   */
  loop?: boolean
  /**
   * The **`volume`** property sets the playback volume (0 to 1).
   * @default 1
   */
  volume?: number
  /**
   * The **`playbackRate`** property sets the playback speed.
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
 * import { useNode, useEvent } from 'tiny-engine/hooks'
 * import { PrimaryNode } from 'tiny-engine/nodes/enum'
 *
 * function Gun() {
 *   const audio = useNode(PrimaryNode.AudioPlayer)
 *   const clickable = useNode(PrimaryNode.Clickable)
 *
 *   useEvent(clickable, 'click', () => {
 *     audio.node.play()
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
 *   const audio = useNode(PrimaryNode.AudioPlayer)
 *   const collider = useNode(PrimaryNode.Collider)
 *
 *   useEvent(collider, 'colliderEntered', () => {
 *     audio.node.play()
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

  constructor(options: AudioPlayerOptions) {
    super(PrimaryNode.AudioPlayer, options)
    this.#soundId = options.soundId
    this.#loop = options.loop ?? false
    this.#volume = options.volume ?? 1
    this.#playbackRate = options.playbackRate ?? 1
    this.#persistUntilEnd = options.persistUntilEnd ?? false
  }

  /** The `ended` event fires when playback reaches the end (non-looping only). */
  ended = new Event('ended', () => {})

  /** The `error` event fires if playback fails. */
  error = new Event('error', (_err: Error) => {})

  /**
   * Starts or resumes playback.
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

  /** Pauses playback without resetting position. */
  pause(): void {
    if (!this.#isPlaying || this.#source == null) return
    const ctx = getAudioContext()
    this.#pauseOffset = (ctx.currentTime - this.#startTime) * this.#playbackRate
    this.stop()
  }

  /** Stops playback and resets position to 0. */
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

  /** Whether the sound is currently playing. */
  get isPlaying() {
    return this.#isPlaying
  }

  /** Sets the volume (0 to 1). */
  set volume(value: number) {
    this.#volume = value
    if (this.#gainNode != null) {
      this.#gainNode.gain.value = value
    }
  }

  /** Gets the current volume. */
  get volume() {
    return this.#volume
  }

  /** Sets the playback rate. */
  set playbackRate(value: number) {
    this.#playbackRate = value
    if (this.#source != null) {
      this.#source.playbackRate.value = value
    }
  }

  /** Gets the current playback rate. */
  get playbackRate() {
    return this.#playbackRate
  }

  /** @internal Cleans up audio resources on destroy. */
  destroy(): void {
    if (this.#persistUntilEnd && this.#isPlaying) {
      this.isDestroyed = true
      return
    }
    this.stop()
    super.destroy()
  }
}

Nodes['audio-player'] = AudioPlayer
