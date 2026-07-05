import type { Diny } from '../types'

export function Fragment(props: Diny.WithChildren): Diny.Element {
  return {
    type: '',
    props,
  }
}
