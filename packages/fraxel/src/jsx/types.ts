import type { Trigger } from '../events/trigger.js'
import type { Fun } from '../events/types.js'
import type { NodeReference } from '../hooks/index.js'
import type { PrimaryNode } from '../nodes/lib/enum.js'
import type { NodesOptions, NodeTriggers } from '../nodes/lib/types.js'

export namespace Fraxel {
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
  /** The **`ref`** property accepts a NodeReference from a native hook.
   * @example
   * ```tsx
   * const sprite = useSprite()
   *
   * return <sprite ref={sprite} />
   * ```
   */
  ref?: NodeReference<T>
} & {
  [P in keyof NodeTriggers[T]]?: NonNullable<
    NodeTriggers[T][P] extends Trigger<infer V> ? Fun<V> : never
  >
} & Fraxel.WithChildren<NodesOptions[T]>

// JSX Declaration
declare global {
  namespace JSX {
    type Element = Fraxel.Element

    interface IntrinsicElements extends Fraxel.IntrinsicElements {}
  }
}
