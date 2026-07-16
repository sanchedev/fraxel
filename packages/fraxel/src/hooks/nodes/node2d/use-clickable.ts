import { PrimaryNode } from '../../../nodes/index.js'
import type { Shape } from '../../../collision/narrowphase/shapes.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalSetter } from '../../../reactivity/types.js'
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
 * import { shapes, useClickable, useTrigger, useEffect } from 'fraxel'
 *
 * function Button() {
 *   const clickable = useClickable()
 *
 *   useTrigger(clickable.onClick, (pos) => {
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
 *       <clickable ref={clickable} shape={shapes.rectangle(64, 32)} />
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
  /** Reactive clickable shape. */
  shape = new Signal<Shape>(null as unknown as Shape).getter
  /** Sets the clickable shape. */
  setShape: SignalSetter<Shape> = (value) => (this.node.shape = value)
  /** Reactive `true` when the pointer hovers over the clickable area. */
  hovered = new Signal(false).getter
  /** Reactive `true` while the pointer press started on this clickable and is still held. */
  pressed = new Signal(false).getter
  /** Reactive `true` when the clickable is disabled. */
  disabled = new Signal(false).getter
  /** Enables or disables pointer interactions for this clickable. */
  setDisabled: SignalSetter<boolean> = (value) => (this.node.disabled = value)
  /** Reactive pointer position in local coordinates. */
  pointerPosition = new Signal<Vector2>(Vector2.ZERO).getter

  /** Fires when the pointer presses inside the clickable area. */
  onPointerPress = new Trigger<[position: Vector2]>()
  /** Fires when the pointer releases inside the clickable area. */
  onPointerUnpress = new Trigger<[position: Vector2]>()
  /** Fires when the pointer moves inside the clickable area. */
  onPointerMove = new Trigger<[position: Vector2]>()
  /** Fires every frame while this is the topmost clickable under the pointer. */
  onPointerOver = new Trigger<[position: Vector2]>()
  /** Fires when the pointer enters the clickable area. */
  onPointerEnter = new Trigger<[]>()
  /** Fires when the pointer exits the clickable area. */
  onPointerExit = new Trigger<[]>()
  /** Fires when pointer press and release both happen inside this clickable area. */
  onClick = new Trigger<[position: Vector2]>()

  constructor() {
    super(
      PrimaryNode.Clickable,
      (node) => {
        this.onClick.link(node.onClick)
        this.onPointerPress.link(node.onPointerPress)
        this.onPointerUnpress.link(node.onPointerUnpress)
        this.onPointerMove.link(node.onPointerMove)
        this.onPointerOver.link(node.onPointerOver)
        this.onPointerEnter.link(node.onPointerEnter)
        this.onPointerExit.link(node.onPointerExit)

        this.disabled.signal.setter(node.disabled)
        this.shape.signal.setter(node.shape)

        node.onPointerEnter.connect(() => {
          this.hovered.signal.setter(true)
        })
        node.onPointerExit.connect(() => {
          this.hovered.signal.setter(false)
        })
        node.onPointerPress.connect(() => {
          this.pressed.signal.setter(true)
        })
        node.onPointerUnpress.connect(() => {
          this.pressed.signal.setter(false)
        })
        node.onPointerOver.connect((pos) => {
          this.pointerPosition.signal.setter(pos)
        })
        node.onUpdate.connect(() => {
          this.hovered.signal.setter(node.hovered)
          this.pressed.signal.setter(node.pressed)
          this.disabled.signal.setter(node.disabled)
          this.shape.signal.setter(node.shape)
        })
      },
      () => {
        this.shape.signal.clearSubs()
        this.hovered.signal.clearSubs()
        this.pressed.signal.clearSubs()
        this.disabled.signal.clearSubs()
        this.pointerPosition.signal.clearSubs()
      },
    )
  }
}
