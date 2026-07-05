import { getAudioContext } from '../audio/audio-context.js'
import { SoundNotFoundError } from '../errors/assets.js'

const sounds = new Map<symbol, AudioBuffer>()

/**
 * The **`loadSound`** function loads an audio file and returns a symbol ID.
 * @param url Audio file URL
 * @returns A symbol ID referencing the loaded audio buffer
 */
export async function loadSound(url: string): Promise<symbol> {
  const ctx = getAudioContext()
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

  const id = Symbol(url)
  sounds.set(id, audioBuffer)

  return id
}

/**
 * Returns an `AudioBuffer` by its symbol ID.
 * @param id The symbol ID returned by `loadSound`
 */
export function getSound(id: symbol): AudioBuffer {
  const buffer = sounds.get(id)
  if (buffer == null) throw new SoundNotFoundError(id.toString())
  return buffer
}

/**
 * Unloads a sound from memory.
 * @param id The sound symbol ID to unload
 */
export function unloadSound(id: symbol): void {
  sounds.delete(id)
}
