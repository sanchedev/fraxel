import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'
import { Vector2 } from '../../../math/vector2.js'
import { Trigger } from '../../../events/trigger.js'

/**
 * The **`useClickable`** hook creates a reference to a `Clickable` node with reactive
 * hover state and click event triggers.
 *
 * @returns A `ClickableReference` with reactive hover state and triggers
 *
 * @example
 * ```tsx
 * import { useClickable, useTrigger, useEffect } from 'fraxel/hooks'
 *
 * function Button() {
 *   const clickable = useClickable()
 *
 *   useTrigger(clickable.clicked, (pos) => {
 *     console.log('Clicked at:', pos)
 *   })
 *
 *   useEffect(() => {
 *     if (clickable.hovered()) {
 *       console.log('Hovering over button')
 *     }
 *   })
 *
 *   return (
 *     <sprite textureId={BTN}>
 *       <clickable ref={clickable} size={[64, 32]} />
 *     </sprite>
 *   )
 * }
 * ```
 */
export function useClickable() {
  pushEffect('useClickable', () => {})
  return new ClickableReference()
}

export class ClickableReference extends Node2DReference<PrimaryNode.Clickable> {
  /** Reactive `true` when the pointer hovers over the clickable area. */
  hovered = new Signal(false).getter
  /** Reactive `true` when the clickable is disabled. */
  disabled = new Signal(false).getter
  /** Reactive pointer position in local coordinates. */
  mousePosition = new Signal<Vector2>(Vector2.ZERO).getter

  /** Fires on pointer release inside the clickable area. */
  clicked = new Trigger<[position: Vector2]>()
  /** Fires when the pointer enters the clickable area. */
  mouseEntered = new Trigger<[]>()
  /** Fires when the pointer exits the clickable area. */
  mouseExited = new Trigger<[]>()

  constructor() {
    super(
      PrimaryNode.Clickable,
      (node) => {
        this.disabled.signal.setter(node.disabled)

        node.mouseEntered.on(() => {
          this.hovered.signal.setter(true)
        })
        node.mouseExited.on(() => {
          this.hovered.signal.setter(false)
        })
        node.mouseOver.on((pos) => {
          this.mousePosition.signal.setter(pos)
        })
        node.updated.on(() => {
          this.disabled.signal.setter(node.disabled)
        })
        node.mouseEntered.connect(this.mouseEntered)
        node.mouseExited.connect(this.mouseExited)
        node.clicked.connect(this.clicked)
      },
      () => {
        this.hovered.signal.clearSubs()
        this.disabled.signal.clearSubs()
        this.mousePosition.signal.clearSubs()
      },
    )
  }
}
