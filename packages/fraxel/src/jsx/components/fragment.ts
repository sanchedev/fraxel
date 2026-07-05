import type { Fraxel } from '../types'

export function Fragment(props: Fraxel.WithChildren): Fraxel.Element {
  return {
    type: '',
    props,
  }
}
