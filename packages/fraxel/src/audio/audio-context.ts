let ctx: AudioContext | null = null

/**
 * The **`getAudioContext`** function returns the shared `AudioContext` instance,
 * creating it lazily on first call. The context starts in `suspended` state due to
 * browser autoplay policies and must be resumed after a user gesture (click, keypress).
 *
 * @returns The shared `AudioContext` instance.
 *
 * @example
 * ```ts
 * import { getAudioContext } from 'fraxel'
 *
 * const audioCtx = getAudioContext()
 * if (audioCtx.state === 'suspended') {
 *   await audioCtx.resume()
 * }
 * ```
 */
export function getAudioContext(): AudioContext {
  if (ctx == null) {
    ctx = new AudioContext()
  }
  return ctx
}
