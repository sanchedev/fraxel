import '../../nodes/index.js'
import { subReactive, type Reactive } from '../../reactivity/index.js'
import { PrimaryNode } from '../../nodes/lib/enum.js'
import { renderToNodes } from '../render/to-nodes.js'
import { useNode } from '../../hooks/use-node.js'
import { currentContext } from '../../hooks/context.js'
import { jsx } from '../jsx.js'
import type { Diny } from '../types.js'
import type { Node } from '../../nodes/_node.js'
import { useMount } from '../../hooks/use-mount.js'
import { useRef } from '../../hooks/use-ref.js'
import { HookRequiresNodeRootError } from '../../errors/hook.js'

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
  array: Reactive<T[]>
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
  empty?: Diny.Node
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
  children: (value: T, index: number, arr: T[]) => Diny.Node
}

/**
 * The **`List`** component renders dynamic nodes from a reactive array with keyed reconciliation.
 * It returns a Fragment — no wrapper node is created.
 * A hidden `<group>` is used as an anchor for reconciliation.
 *
 * @param options The list options including the reactive array, key extractor, and render function.
 * @returns A Fragment containing the anchor node.
 *
 * @example
 * ```tsx
 * import { List } from 'diny/jsx'
 * import { useSignal } from 'diny/hooks'
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
export function List<T>({ array, itemKey, empty, children }: ListOptions<T>): Diny.Element {
  const savedCtx = currentContext.slice()
  const anchor = useNode(PrimaryNode.Group)
  const map = useRef(new Map<string | symbol, Node>())
  const emptyNode = useRef<Node | null>(null)

  const handleRegen = (arr: T[]) => {
    const prevCtx = currentContext.slice()
    currentContext.length = 0
    currentContext.push(...savedCtx)

    if (emptyNode.current != null) {
      emptyNode.current.destroy()
      emptyNode.current = null
    }

    const nodes: Node[] = []
    const oldIds = new Set(map.current.keys())
    for (let i = 0; i < arr.length; i++) {
      const props = arr[i]!
      const id = itemKey(props, i, arr)

      if (oldIds.has(id)) {
        oldIds.delete(id)
        continue
      }

      const node = renderToNodes(children(props, i, arr))
      if (node.length !== 1) throw new HookRequiresNodeRootError('internal-hook-List')

      map.current.set(id, node[0]!)
      nodes.push(node[0]!)
    }

    for (const [id, node] of map.current) {
      if (!oldIds.has(id)) continue
      map.current.delete(id)
      node.destroy()
    }

    anchor.node.addChild(...nodes)

    if (anchor.node.children.length === 0) {
      const node = renderToNodes(empty)
      if (node.length !== 1) throw new HookRequiresNodeRootError('internal-hook-List')
      emptyNode.current = node[0]!
      anchor.node.addChild(emptyNode.current)
    }

    currentContext.length = 0
    currentContext.push(...prevCtx)
  }

  useMount(() => {
    const generator = subReactive(array, handleRegen, (unsub) => {
      anchor.node.destroyed.on(unsub)
    })

    handleRegen(generator)
  })

  return jsx(PrimaryNode.Group, { ref: anchor })
}
