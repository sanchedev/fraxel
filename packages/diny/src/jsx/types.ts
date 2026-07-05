import type { Event } from '../events/event.js'
import type { NodeReference } from '../hooks/use-node.js'
import type { PrimaryNode } from '../nodes/lib/enum.js'
import type { NodeEvents, NodesOptions } from '../nodes/lib/types.js'

export namespace Diny {
  export type Type = keyof JSX.IntrinsicElements | ((props: any) => any) | (new (props: any) => any)

  export interface Element<T extends Type = any> {
    type: T
    props: PropsOf<T>
    // key: string | null
  }

  export type Node = Element<any> | string | number | null | undefined | Iterable<Node>

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

  export type Component<P = {}> = (props: P) => Node
}

// Intrinsic Elements
export type IntrinsicElement<T extends PrimaryNode> = {
  /** The **`ref`** property can be used with the `useNode` hook.
   * @example
   * ```tsx
   * const sprite = useNode(PrimaryNode.Sprite)
   *
   * return <sprite ref={sprite} />
   * ```
   */
  ref?: NodeReference<T>
} & {
  [P in keyof NodeEvents[T]]?: NonNullable<
    NodeEvents[T][P] extends Event<infer U, infer V> ? Event<U, V>['exampleFun'] : never
  >
} & Diny.WithChildren<NodesOptions[T]>

// JSX Declaration
declare global {
  namespace JSX {
    type Element = Diny.Element

    interface IntrinsicElements extends Diny.IntrinsicElements {}
  }
}
