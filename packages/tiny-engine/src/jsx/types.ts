import type { Event } from '../events/event.js'
import type { NodeReference } from '../hooks/use-ref-node.js'
import type { PrimaryNode } from '../nodes/enum.js'
import type { NodeEvents, NodesOptions } from '../nodes/types.js'

export namespace Tiny {
  export type Type =
    | keyof JSX.IntrinsicElements
    | ((props: any) => any)
    | (new (props: any) => any)

  export interface Element<T extends Type = any> {
    type: T
    props: PropsOf<T>
    // key: string | null
  }

  export type Node =
    | Element<any>
    | string
    | number
    | null
    | undefined
    | Iterable<Node>

  export type IntrinsicElements = {
    [P in PrimaryNode]: IntrinsicElement<P>
  }

  export type WithChildren<T = {}> = Omit<T, 'children'> & {
    children?: Node
  }

  export type PropsOf<T extends Type> = T extends keyof IntrinsicElements
    ? IntrinsicElements[T]
    : T extends (props: infer P) => Node
      ? P
      : never
}

// Intrinsic Elements
export type IntrinsicElement<T extends PrimaryNode> = {
  /** The **`ref`** property can be user for `useRef` hook.
   * @example
   * ```tsx
   * const sprite = useRef()
   *
   * return <sprite ref={sprite} />
   * ```
   */
  ref?: NodeReference<T>
} & {
  [P in keyof NodeEvents[T]]?: NonNullable<
    NodeEvents[T][P] extends Event<infer U, infer V>
      ? Event<U, V>['exampleFun']
      : never
  >
} & Tiny.WithChildren<NodesOptions[T]>

// JSX Declaration
declare global {
  namespace JSX {
    type Element = Tiny.Element

    interface IntrinsicElements extends Tiny.IntrinsicElements {}
  }
}
