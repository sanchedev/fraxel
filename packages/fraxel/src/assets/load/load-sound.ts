import { getAudioContext } from '../../audio/audio-context.js'
import { SoundNotFoundError } from '../../errors/assets.js'

const sounds = new Map<symbol, AudioBuffer>()
const soundUrls = new Map<string, symbol>()
const pendingSounds = new Map<string, Promise<symbol>>()

/**
 * The **`loadSound`** function loads an audio file from a URL and returns
 * a symbol ID for referencing it. Deduplicates by URL — repeated or concurrent
 * calls with the same URL return the same symbol.
 *
 * @param url Audio file URL to load.
 * @returns A symbol ID referencing the loaded audio buffer.
 *
 * @example
 * ```ts
 * import { loadSound } from 'fraxel'
 *
 * const SHOOT = await loadSound('/assets/shoot.ogg')
 * const HIT = await loadSound('/assets/hit.ogg')
 * ```
 */
export async function loadSound(url: string): Promise<symbol> {
  const cached = soundUrls.get(url)
  if (cached != null && sounds.has(cached)) return cached

  const pending = pendingSounds.get(url)
  if (pending != null) return pending

  const promise = loadSoundBuffer(url).finally(() => {
    pendingSounds.delete(url)
  })

  pendingSounds.set(url, promise)

  return promise
}

async function loadSoundBuffer(url: string): Promise<symbol> {
  const ctx = getAudioContext()
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

  const id = Symbol(url)
  sounds.set(id, audioBuffer)
  soundUrls.set(url, id)

  return id
}

/**
 * The **`getSound`** function returns an `AudioBuffer` by its symbol ID.
 * Throws `SoundNotFoundError` if no sound exists for the given ID.
 *
 * @param id The symbol ID returned by `loadSound`.
 * @returns The `AudioBuffer` for the sound.
 *
 * @example
 * ```ts
 * import { getSound } from 'fraxel'
 *
 * const buffer = getSound(SHOOT) // AudioBuffer
 * ```
 */
export function getSound(id: symbol): AudioBuffer {
  const buffer = sounds.get(id)
  if (buffer == null) throw new SoundNotFoundError(id.toString())
  return buffer
}

/**
 * The **`unloadSound`** function removes a sound from memory by its symbol ID.
 * The sound will no longer be accessible via `getSound`.
 *
 * @param id The sound symbol ID to unload.
 *
 * @example
 * ```ts
 * import { unloadSound } from 'fraxel'
 *
 * unloadSound(SHOOT) // frees the sound from memory
 * ```
 */
export function unloadSound(id: symbol): void {
  sounds.delete(id)
  for (const [url, soundId] of soundUrls) {
    if (soundId === id) {
      soundUrls.delete(url)
      break
    }
  }
}
