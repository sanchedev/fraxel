let ctx: AudioContext | null = null

/**
 * Returns the shared `AudioContext`, creating it lazily on first call.
 * The context starts in `suspended` state and must be resumed after a user gesture.
 *
 * @example
 * ```ts
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
