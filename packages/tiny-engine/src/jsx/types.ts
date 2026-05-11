import type { Event } from '../events/event.js'
import type { NodeRef } from '../hooks/use-node.js'
import type {
  NodeEvents,
  NodeInstances,
  NodeName,
  NodesOptions,
} from '../nodes/types.js'

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
    | NodeInstances['node']

  export type IntrinsicElements = {
    [P in NodeName]: IntrinsicElement<P>
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
export type IntrinsicElement<T extends NodeName = 'node'> = {
  /** The **`use`** property can be user for `useNode` hook.
   * @example
   * ```tsx
   * const sprite = useNode()
   *
   * return <sprite use={sprite} />
   * ```
   */
  use?: NodeRef<NodeInstances[T]>
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
