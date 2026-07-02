import '../../nodes/index.js'
import type { SignalGetter } from '../../reactivity/index.js'
import { PrimaryNode } from '../../nodes/lib/enum.js'
import { renderToNodes } from '../render/to-nodes.js'
import { useEffect } from '../../hooks/use-effect.js'
import { useNode } from '../../hooks/use-node.js'
import { currentContext } from '../../hooks/context.js'
import { jsx } from '../jsx.js'
import type { Tiny } from '../types.js'
import type { Node } from '../../nodes/_node.js'

/**
 * The **`ListOptions`** interface defines the options for a `List` component.
 */
export interface ListOptions<T> {
  /**
   * The **`array`** property is a signal getter that returns the array to render.
   *
   * @example
   * ```tsx
   * const [items, setItems] = useSignal([{ id: 1 }, { id: 2 }])
   *
   * <List array={items} itemKey={(item) => item.id}>
   *   {(item) => <sprite textureId={ITEM} />}
   * </List>
   * ```
   */
  array: T[] | SignalGetter<T[]>
  /**
   * The **`key`** property extracts a unique identifier for each item.
   * Used for keyed reconciliation when the array changes.
   *
   * @example
   * ```tsx
   * <List array={items} itemKey={(item) => item.id}>
   *   {(item) => <sprite textureId={ITEM} />}
   * </List>
   * ```
   */
  itemKey: (value: T, index: number, arr: T[]) => string | symbol
  /**
   * The **`empty`** property is rendered when the array is empty.
   *
   * @example
   * ```tsx
   * <List array={items} itemKey={(item) => item.id} empty={<sprite textureId={EMPTY} />}>
   *   {(item) => <sprite textureId={ITEM} />}
   * </List>
   * ```
   */
  empty?: Tiny.Node
  /**
   * The **`children`** property is a render function called for each item in the array.
   *
   * @example
   * ```tsx
   * <List array={items} itemKey={(item) => item.id}>
   *   {(item, index) => <transform position={[0, index * 16]}>
   *     <sprite textureId={item.texture} />
   *   </transform>}
   * </List>
   * ```
   */
  children: (value: T, index: number, arr: T[]) => Tiny.Node
}

/**
 * The **`List`** component renders dynamic nodes from a reactive array with keyed reconciliation.
 * It returns a Fragment — no wrapper node is created.
 * A hidden `<transform>` is used as an anchor for reconciliation.
 *
 * @param options The list options including the reactive array, key extractor, and render function.
 * @returns A Fragment containing the anchor node.
 *
 * @example
 * ```tsx
 * import { List } from 'tiny-engine/jsx'
 * import { useSignal } from 'tiny-engine/hooks'
 *
 * function EnemyList() {
 *   const [enemies] = useSignal([
 *     { id: 1, x: 0 },
 *     { id: 2, x: 50 },
 *   ])
 *
 *   return (
 *     <List array={enemies} itemKey={(e) => e.id}>
 *       {(enemy) => <transform position={[enemy.x, 0]}>
 *         <sprite textureId={ENEMY} />
 *       </transform>}
 *     </List>
 *   )
 * }
 * ```
 */
export function List<T>({
  array,
  itemKey,
  empty: _empty,
  children,
}: ListOptions<T>): Tiny.Element {
  const anchorRef = useNode(PrimaryNode.Transform)
  const savedCtx = currentContext.slice()
  let listNodes: Node[] = []

  const reconcile = (newArr: T[]) => {
    const anchor = anchorRef.node
    const parent = anchor._parent
    if (parent == null) return

    const anchorIdx = parent._children.indexOf(anchor)

    // Build map of old nodes by key
    const oldMap = new Map<string | symbol, Node>()
    for (let i = 0; i < listNodes.length; i++) {
      const k = itemKey(listNodes[i]! as any, i, listNodes as any[])
      oldMap.set(k, listNodes[i]!)
    }

    const kept = new Map<string | symbol, Node>()

    // Phase 1: Destroy removed nodes
    for (const [k, node] of oldMap) {
      const exists = newArr.some((item, i) => itemKey(item, i, newArr) === k)
      if (!exists) {
        if (!node.isDestroyed) node.destroy()
      } else {
        kept.set(k, node)
      }
    }

    // Phase 2: Build new node list in order
    const prevCtx = currentContext.slice()
    currentContext.length = 0
    currentContext.push(...savedCtx)

    const newNodes: Node[] = []
    for (let i = 0; i < newArr.length; i++) {
      const item = newArr[i]!
      const k = itemKey(item, i, newArr)

      const existing = kept.get(k)
      if (existing != null) {
        newNodes.push(existing)
      } else {
        const rendered = renderToNodes(children(item, i, newArr))
        newNodes.push(...rendered)
        for (const n of rendered) {
          n['_parent'] = parent
          if (parent.isStarted) n.start()
        }
      }
    }

    currentContext.length = 0
    currentContext.push(...prevCtx)

    // Phase 3: Rebuild parent._children
    const before = parent._children.slice(0, anchorIdx + 1)
    const after = parent._children.slice(anchorIdx + 1)
    const oldSet = new Set(oldMap.values())
    const afterFiltered = after.filter((n) => !oldSet.has(n))
    parent._children.length = 0
    parent._children.push(...before, ...newNodes, ...afterFiltered)

    listNodes = newNodes
  }

  // Reconcile on array signal changes (runs when anchor starts + on every change)
  useEffect(() => {
    const newArr = Array.isArray(array) ? array : array()
    reconcile(newArr)
  })

  return {
    type: '',
    props: {
      children: jsx(PrimaryNode.Transform, { ref: anchorRef }),
    },
  }
}
