import type { Fraxel } from './types.js'

export function jsx<T extends Fraxel.Type>(type: T, props: Fraxel.PropsOf<T>): Fraxel.Element {
  return { type, props }
}
