import type { Shape } from '../../../collision/narrowphase/shapes.js'
import { Trigger } from '../../../events/trigger.js'
import { PrimaryNode } from '../../../nodes/index.js'
import type { DropAreaEvent } from '../../../nodes/node2d/drop-area.js'
import type { DropKey } from '../../../nodes/node2d/lib/drop-area-system.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalSetter } from '../../../reactivity/types.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useDropArea`** hook creates a reference to a `DropArea` node with reactive
 * hover state and drop event triggers.
 *
 * @returns A `DropAreaReference` with reactive state and drop triggers
 *
 * @example
 * ```tsx
 * import { shapes, useDropArea, useTrigger } from 'fraxel'
 *
 * function InventorySlot() {
 *   const dropArea = useDropArea()
 *
 *   useTrigger(dropArea.onDrop, (event) => {
 *     console.log('Dropped:', event.data)
 *   })
 *
 *   return <droparea ref={dropArea} shape={shapes.rectangle(160, 120)} dropKey="inventory" />
 * }
 * ```
 */
export function useDropArea() {
  pushEffect('useDropArea', () => {})
  return new DropAreaReference()
}

export class DropAreaReference extends Node2DReference<PrimaryNode.DropArea> {
  /** Reactive drop area shape. */
  shape = new Signal<Shape>(null as unknown as Shape).getter
  /** Sets the drop area shape. */
  setShape: SignalSetter<Shape> = (value) => (this.node.shape = value)
  /** Reactive key used to match compatible draggable nodes. */
  dropKey = new Signal<DropKey>(null as unknown as DropKey).getter
  /** Sets the key used to match compatible draggable nodes. */
  setDropKey: SignalSetter<DropKey> = (value) => (this.node.dropKey = value)
  /** Reactive `true` while a compatible draggable is over this drop area. */
  dragHovered = new Signal(false).getter
  /** Reactive `true` when drop interactions are disabled. */
  disabled = new Signal(false).getter
  /** Enables or disables drop interactions for this node. */
  setDisabled: SignalSetter<boolean> = (value) => (this.node.disabled = value)

  /** Fires when a compatible draggable enters this drop area while dragging. */
  onDragOver = new Trigger<[event: DropAreaEvent]>()
  /** Fires when a compatible draggable leaves this drop area while dragging. */
  onDragLeave = new Trigger<[event: DropAreaEvent]>()
  /** Fires when a compatible draggable is released over this drop area. */
  onDrop = new Trigger<[event: DropAreaEvent]>()

  constructor() {
    super({
      type: PrimaryNode.DropArea,
      linkEvents: ({ link, on }) => {
        link(this, 'onDragOver', 'onDragLeave', 'onDrop')
        on('onDragOver', () => this.dragHovered.signal.setter(true))
        on('onDragLeave', () => this.dragHovered.signal.setter(false))
      },
      regSignal: ({ reg }) => {
        reg<DropAreaReference>(this, 'shape', 'dropKey', 'dragHovered', 'disabled')
      },
      onFrame: (node) => {
        this.shape.signal.setter({ ...node.shape })
        this.dropKey.signal.setter(node.dropKey)
        this.dragHovered.signal.setter(node.dragHovered)
        this.disabled.signal.setter(node.disabled)
      },
    })
  }
}
