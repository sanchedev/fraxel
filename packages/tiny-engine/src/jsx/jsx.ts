import type { Tiny } from './types.js'

export function jsx<T extends Tiny.Type>(type: T, props: Tiny.PropsOf<T>): Tiny.Element {
  return { type, props }
}
