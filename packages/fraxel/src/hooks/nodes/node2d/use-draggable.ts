import type { Shape } from '../../../collision/narrowphase/shapes.js'
import { Trigger } from '../../../events/trigger.js'
import { Bounds } from '../../../math/bounds.js'
import { vector2, Vector2, type VectorLike } from '../../../math/vector2.js'
import { PrimaryNode } from '../../../nodes/index.js'
import type { DragAxis, DraggableEvent } from '../../../nodes/node2d/draggable.js'
import type { DropKey } from '../../../nodes/node2d/lib/drop-area-system.js'
import { createSignalSetter, Signal } from '../../../reactivity/signal.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useDraggable`** hook creates a reference to a `Draggable` node with reactive
 * drag state and drag event triggers.
 *
 * @returns A `DraggableReference` with reactive state and drag triggers
 *
 * @example
 * ```tsx
 * import { bounds, shapes, useDraggable, useTrigger } from 'fraxel'
 *
 * function Crate() {
 *   const draggable = useDraggable()
 *
 *   useTrigger(draggable.onDragEnd, (event) => {
 *     console.log('Dropped at:', event.globalPosition)
 *   })
 *
 *   return (
 *     <draggable ref={draggable} shape={shapes.rectangle(64, 64)} bounds={bounds(0, 0, 800, 600)}>
 *       <sprite textureId={CRATE} />
 *     </draggable>
 *   )
 * }
 * ```
 */
export function useDraggable() {
  pushEffect('useDraggable', () => {})
  return new DraggableReference()
}

export class DraggableReference extends Node2DReference<PrimaryNode.Draggable> {
  /** Reactive draggable shape. */
  shape = new Signal<Shape>(null as unknown as Shape).getter
  /** Sets the draggable shape. */
  setShape = createSignalSetter(this.shape.signal, {
    value: () => this.node.shape,
    onChange: (v) => (this.node.shape = v),
  })
  /** Reactive `true` when the pointer hovers over the draggable area. */
  hovered = new Signal(false).getter
  /** Reactive `true` while the pointer press started on this draggable and is still held. */
  pressed = new Signal(false).getter
  /** Reactive `true` while this draggable is moving with the pointer. */
  dragging = new Signal(false).getter
  /** Reactive `true` when dragging is disabled. */
  disabled = new Signal(false).getter
  /** Enables or disables pointer dragging for this node. */
  setDisabled = createSignalSetter(this.disabled.signal, {
    value: () => this.node.disabled,
    onChange: (v) => (this.node.disabled = v),
  })
  /** Reactive drag axis constraint. */
  axis = new Signal<DragAxis>('both').getter
  /** Sets the drag axis constraint. */
  setAxis = createSignalSetter(this.axis.signal, {
    value: () => this.node.axis,
    onChange: (v) => (this.node.axis = v),
  })
  /** Reactive bounds used to clamp the draggable global position. */
  bounds = new Signal<Bounds | undefined>(undefined).getter
  /** Sets the bounds used to clamp the draggable global position. */
  setBounds = createSignalSetter(this.bounds.signal, {
    value: () => this.node.bounds?.clone(),
    onChange: (v) => (this.node.bounds = v != null ? new Bounds(v) : undefined),
  })
  /** Reactive snap grid used to round draggable movement. */
  snap = new Signal<VectorLike | undefined>(undefined).getter
  /** Sets the snap grid used to round draggable movement. */
  setSnap = createSignalSetter(this.snap.signal, {
    value: () => this.node.snap?.clone(),
    onChange: (v) => (this.node.snap = v != null ? vector2(v) : undefined),
  })
  /** Reactive drop key used to match compatible drop areas. */
  dropKey = new Signal<DropKey | undefined>(undefined).getter
  /** Sets the drop key used to match compatible drop areas. */
  setDropKey = createSignalSetter(this.dropKey.signal, {
    value: () => this.node.dropKey,
    onChange: (v) => (this.node.dropKey = v),
  })
  /** Reactive drop data passed to compatible drop area events. */
  dropData = new Signal<unknown>(undefined).getter
  /** Sets the drop data passed to compatible drop area events. */
  setDropData = createSignalSetter(this.dropData.signal, {
    value: () => this.node.dropData,
    onChange: (v) => (this.node.dropData = v),
  })
  /** Reactive pointer position in local coordinates while dragging updates. */
  pointerPosition = new Signal<Vector2>(Vector2.ZERO).getter

  /** Fires when dragging starts after a pointer press inside the draggable area. */
  onDragStart = new Trigger<[event: DraggableEvent]>()
  /** Fires when the draggable node moves while the pointer is held. */
  onDrag = new Trigger<[event: DraggableEvent]>()
  /** Fires when dragging ends after the pointer is released or canceled. */
  onDragEnd = new Trigger<[event: DraggableEvent]>()

  constructor() {
    super({
      type: PrimaryNode.Draggable,
      linkEvents: ({ link, on }) => {
        link(this, 'onDragStart', 'onDrag', 'onDragEnd')
        on('onDragStart', (event) => {
          this.dragging.signal.setter(true)
          this.pointerPosition.signal.setter(event.pointerPosition)
        })
        on('onDrag', (event) => {
          this.pointerPosition.signal.setter(event.pointerPosition)
        })
        on('onDragEnd', (event) => {
          this.dragging.signal.setter(false)
          this.pointerPosition.signal.setter(event.pointerPosition)
        })
      },
      onFrame: (node) => {
        this.shape.signal.setter({ ...node.shape })
        this.hovered.signal.setter(node.hovered)
        this.pressed.signal.setter(node.pressed)
        this.dragging.signal.setter(node.dragging)
        this.disabled.signal.setter(node.disabled)
        this.axis.signal.setter(node.axis)
        this.bounds.signal.setter(node.bounds?.clone())
        this.snap.signal.setter(node.snap?.clone())
        this.dropKey.signal.setter(node.dropKey)
        this.dropData.signal.setter(node.dropData)
      },
      regSignal: ({ reg }) => {
        reg<DraggableReference>(
          this,
          'shape',
          'hovered',
          'pressed',
          'dragging',
          'disabled',
          'axis',
          'bounds',
          'snap',
          'dropKey',
          'dropData',
          'pointerPosition',
        )
      },
    })
  }
}
