import type { Diny } from './types.js'

export function jsx<T extends Diny.Type>(type: T, props: Diny.PropsOf<T>): Diny.Element {
  return { type, props }
}
