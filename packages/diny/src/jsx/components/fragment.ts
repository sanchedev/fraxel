import type { Tiny } from '../types'

export function Fragment(props: Tiny.WithChildren): Tiny.Element {
  return {
    type: '',
    props,
  }
}
