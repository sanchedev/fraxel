import { Vector2 } from '../../../math/vector2.js'
import { PrimaryNode } from '../../../nodes/index.js'
import { declareDerivedHook } from '../../context.js'
import { useEvent } from '../../use-event.js'
import type { NodeReference } from '../../use-node.js'
import { useSignal } from '../../use-signal.js'
import { useCondition } from '../use-condition.js'
import { usePartialNode } from '../use-partial-node.js'

/**
 * The **`useClickable`** derived hook provides a declarative API for the `Clickable` node.
 * Returns the node reference and a reactive `hovered` boolean that tracks pointer hover state.
 *
 * @param clickable An optional existing `NodeReference` to the Clickable node
 * @returns An object with `ref` (NodeReference) and `hovered` (SignalGetter<boolean>)
 *
 * @example
 * ```tsx
 * import { useClickable } from 'diny/hooks'
 *
 * function Button() {
 *   const clickable = useClickable()
 *   const brightness = useComputed(() => (clickable.hovered() ? 1.1 : 1))
 *
 *   return (
 *     <sprite ref={clickable.ref} textureId={BTN} brightness={brightness}>
 *       <clickable size={[64, 32]} onClick={handleClick} />
 *     </sprite>
 *   )
 * }
 * ```
 */
export function useClickable(clickable?: NodeReference<PrimaryNode.Clickable>) {
  declareDerivedHook('useClickable')
  const ref = usePartialNode(PrimaryNode.Clickable, clickable)

  const hovered = useCondition(ref, 'mouseEntered', 'mouseExited')
  const [position, setPos] = useSignal(Vector2.ZERO)
  useEvent(ref, 'mouseOver', setPos)

  return {
    ref,
    hovered,
    position,
  }
}
