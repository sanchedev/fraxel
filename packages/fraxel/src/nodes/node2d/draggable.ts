import type { Shape } from '../../collision/narrowphase/shapes.js'
import { Trigger } from '../../events/trigger.js'
import { Pointer } from '../../input/pointer.js'
import { Vector2 } from '../../math/vector2.js'
import type { Reactive } from '../../reactivity/types.js'
import { propSignal } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { registerNode } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { PointerTarget } from './lib/pointer-target-system.js'

/**
 * Data emitted by `Draggable` drag triggers.
 */
export interface DraggableEvent {
  /** The current local position of the draggable node. */
  position: Vector2
  /** The current global position of the draggable node. */
  globalPosition: Vector2
  /** The current pointer position relative to the draggable node. */
  pointerPosition: Vector2
  /** The current pointer position in game coordinates. */
  globalPointerPosition: Vector2
  /** The movement applied to the draggable node since the previous drag event. */
  delta: Vector2
}

/**
 * The **`DraggableOptions`** interface defines the configuration for a `Draggable` node.
 */
export interface DraggableOptions extends Node2DOptions<PrimaryNode.Draggable> {
  /**
   * The **`shape`** property defines the area where dragging can start.
   * Uses the `shapes` factory from the collision system.
   *
   * @example
   * ```tsx
   * import { shapes } from 'fraxel'
   *
   * <draggable shape={shapes.rectangle(64, 64)} />
   * <draggable shape={shapes.circle(24)} />
   * ```
   */
  shape: Reactive<Shape>
  /**
   * The **`disabled`** property disables dragging and pointer interaction.
   *
   * @default false
   */
  disabled?: Reactive<boolean>
}

/**
 * The **`Draggable`** node makes its children draggable with mouse, touch, or pen input.
 * Press inside the configured `shape`, move the pointer, and release to leave the node at
 * its final position.
 *
 * @example
 * ```tsx
 * import { shapes, useDraggable, useTrigger } from 'fraxel'
 *
 * function Crate() {
 *   const draggable = useDraggable()
 *
 *   useTrigger(draggable.onDragEnd, (event) => {
 *     console.log('Dropped at', event.globalPosition)
 *   })
 *
 *   return (
 *     <draggable ref={draggable} shape={shapes.rectangle(64, 64)}>
 *       <sprite textureId={CRATE} />
 *     </draggable>
 *   )
 * }
 * ```
 */
export class Draggable extends Node2D<PrimaryNode.Draggable> {
  shape: Shape
  disabled: boolean = false
  #target: PointerTarget
  #dragOffset: Vector2 = Vector2.ZERO
  #previousGlobalPosition: Vector2 = Vector2.ZERO
  #dragging = false

  /** Fires when dragging starts after a pointer press inside the draggable area. */
  onDragStart = new Trigger<[event: DraggableEvent]>()
  /** Fires when the draggable node moves while the pointer is held. */
  onDrag = new Trigger<[event: DraggableEvent]>()
  /** Fires when dragging ends after the pointer is released or canceled. */
  onDragEnd = new Trigger<[event: DraggableEvent]>()

  constructor(options: DraggableOptions) {
    super(PrimaryNode.Draggable, options)
    this.shape = propSignal(this, 'shape', options.shape) as Shape
    this.disabled = propSignal(this, 'disabled', options.disabled)

    this.#target = new PointerTarget({
      node: this,
      getShape: () => this.shape,
      isDisabled: () => this.disabled,
      captureAfterPress: true,
    })

    this.#target.onPointerPress.connect(() => {
      if (this.disabled) return

      const pointer = new Vector2(Pointer.pointerPosition)
      this.#dragOffset = pointer.toSubtracted(this.globalPosition)
      this.#previousGlobalPosition = this.globalPosition
      this.#dragging = true
      this.onDragStart.emit(this.#createEvent(Vector2.ZERO))
    })

    this.#target.onPointerMove.connect(() => {
      if (!this.#dragging || this.disabled) return

      this.#moveToPointer()
    })

    this.#target.onPointerUnpress.connect(() => {
      this.#endDrag()
    })
  }

  get hovered() {
    return this.#target.hovered
  }

  get pressed() {
    return this.#target.pressed
  }

  get dragging() {
    return this.#dragging
  }

  update(delta: number): void {
    if (this.#dragging && (!Pointer.isPointerPressed || Pointer.pointerCanceled || this.disabled)) {
      this.#endDrag()
    }

    super.update(delta)
  }

  #moveToPointer() {
    const nextGlobalPosition = new Vector2(Pointer.pointerPosition).subtract(this.#dragOffset)
    const previousGlobalPosition = this.globalPosition

    this.globalPosition = nextGlobalPosition

    const delta = this.globalPosition.toSubtracted(previousGlobalPosition)
    this.#previousGlobalPosition = this.globalPosition
    this.onDrag.emit(this.#createEvent(delta))
  }

  #endDrag() {
    if (!this.#dragging) return

    this.#dragging = false

    const delta = this.globalPosition.toSubtracted(this.#previousGlobalPosition)
    this.onDragEnd.emit(this.#createEvent(delta))
  }

  #createEvent(delta: Vector2): DraggableEvent {
    const globalPointerPosition = new Vector2(Pointer.pointerPosition)

    return {
      position: this.position.clone(),
      globalPosition: this.globalPosition,
      pointerPosition: globalPointerPosition.toSubtracted(this.globalPosition),
      globalPointerPosition,
      delta,
    }
  }

  /** @internal Cleans up all event listeners. */
  cleanEvents(): void {
    this.#target.destroy()
    this.onDragStart.clear()
    this.onDrag.clear()
    this.onDragEnd.clear()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.Draggable, Draggable)
