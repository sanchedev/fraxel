import type { Shape } from '../../collision/narrowphase/shapes.js'
import { Trigger } from '../../events/trigger.js'
import type { Vector2 } from '../../math/vector2.js'
import type { Reactive } from '../../reactivity/types.js'
import { propSignal } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { registerNode } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import type { Draggable } from './draggable.js'
import { DropAreaSystem, type DropKey } from './lib/drop-area-system.js'

export type { DropKey }

/**
 * Data emitted by `DropArea` triggers.
 */
export interface DropAreaEvent<T = unknown> {
  /** The draggable node currently interacting with this drop area. */
  draggable: Draggable
  /** The drop area that emitted the event. */
  dropArea: DropArea
  /** The shared key that matched the draggable and drop area. */
  dropKey: DropKey
  /** Data provided by the draggable `dropData` prop. */
  data: T
  /** The current local position of the drop area node. */
  position: Vector2
  /** The current global position of the drop area node. */
  globalPosition: Vector2
  /** The pointer position relative to the drop area. */
  pointerPosition: Vector2
  /** The pointer position in game coordinates. */
  globalPointerPosition: Vector2
}

/**
 * The **`DropAreaOptions`** interface defines the configuration for a `DropArea` node.
 */
export interface DropAreaOptions extends Node2DOptions<PrimaryNode.DropArea> {
  /**
   * The **`shape`** property defines the area that can receive drops.
   *
   * @example
   * ```tsx
   * import { shapes } from 'fraxel'
   *
   * <droparea shape={shapes.rectangle(160, 120)} dropKey="inventory" />
   * ```
   */
  shape: Reactive<Shape>
  /**
   * The **`dropKey`** property must match a draggable's `dropKey` to receive events.
   */
  dropKey: Reactive<DropKey>
  /**
   * The **`disabled`** property disables drop interactions.
   *
   * @default false
   */
  disabled?: Reactive<boolean>
}

/**
 * The **`DropArea`** node receives compatible draggable nodes when their `dropKey` matches.
 * If multiple compatible drop areas overlap, only the topmost area in draw order receives
 * `onDragOver`, `onDragLeave`, and `onDrop`.
 *
 * @example
 * ```tsx
 * import { shapes } from 'fraxel'
 *
 * <droparea
 *   shape={shapes.rectangle(160, 120)}
 *   dropKey="inventory"
 *   onDrop={(event) => console.log(event.data)}
 * />
 * ```
 */
export class DropArea extends Node2D<PrimaryNode.DropArea> {
  shape: Shape
  dropKey: DropKey
  disabled: boolean = false
  dragHovered: boolean = false

  /** Fires when a compatible draggable enters this drop area while dragging. */
  onDragOver = new Trigger<[event: DropAreaEvent]>()
  /** Fires when a compatible draggable leaves this drop area while dragging. */
  onDragLeave = new Trigger<[event: DropAreaEvent]>()
  /** Fires when a compatible draggable is released over this drop area. */
  onDrop = new Trigger<[event: DropAreaEvent]>()

  constructor(options: DropAreaOptions) {
    super(PrimaryNode.DropArea, options)
    this.shape = propSignal(this, 'shape', options.shape) as Shape
    this.dropKey = propSignal(this, 'dropKey', options.dropKey)
    this.disabled = propSignal(this, 'disabled', options.disabled)
    DropAreaSystem.register(this)
  }

  /** @internal Cleans up all event listeners. */
  cleanEvents(): void {
    DropAreaSystem.unregister(this)
    this.onDragOver.clear()
    this.onDragLeave.clear()
    this.onDrop.clear()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.DropArea, DropArea)
