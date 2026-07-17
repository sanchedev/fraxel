import type { Shape } from '../../collision/narrowphase/shapes.js'
import { Trigger } from '../../events/trigger.js'
import { Pointer } from '../../input/pointer.js'
import { Bounds, type BoundsLike } from '../../math/bounds.js'
import { Vector2, type VectorLike } from '../../math/vector2.js'
import type { Reactive } from '../../reactivity/types.js'
import { propSignal } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { registerNode } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import { DropAreaSystem, type DropKey } from './lib/drop-area-system.js'
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

/** Controls which axes a `Draggable` node can move on. */
export type DragAxis = 'x' | 'y' | 'both'

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
  /**
   * The **`axis`** property restricts dragging to one axis or allows both axes.
   *
   * @default 'both'
   *
   * @example
   * ```tsx
   * <draggable shape={shapes.rectangle(64, 64)} axis="x" />
   * <draggable shape={shapes.rectangle(64, 64)} axis="y" />
   * ```
   */
  axis?: Reactive<DragAxis>
  /**
   * The **`bounds`** property clamps the draggable node's global position.
   * It accepts any `BoundsLike` value.
   *
   * @example
   * ```tsx
   * import { bounds, shapes } from 'fraxel'
   *
   * <draggable shape={shapes.circle(24)} bounds={bounds(0, 0, 800, 600)} />
   * ```
   */
  bounds?: Reactive<BoundsLike>
  /**
   * The **`snap`** property rounds movement to a grid. A number applies to both axes.
   * Values less than or equal to `0` disable snapping on that axis.
   *
   * @example
   * ```tsx
   * <draggable shape={shapes.rectangle(64, 64)} snap={16} />
   * <draggable shape={shapes.rectangle(64, 64)} snap={[16, 0]} />
   * ```
   */
  snap?: Reactive<VectorLike>
  /**
   * The **`dropKey`** property identifies compatible `DropArea` nodes.
   * Drops are only emitted when the draggable and drop area keys match.
   *
   * @example
   * ```tsx
   * <draggable shape={shapes.circle(24)} dropKey="inventory" />
   * ```
   */
  dropKey?: Reactive<DropKey>
  /**
   * The **`dropData`** property provides data to compatible `DropArea` events.
   *
   * @example
   * ```tsx
   * <draggable shape={shapes.circle(24)} dropKey="inventory" dropData={{ itemId: 'coin' }} />
   * ```
   */
  dropData?: Reactive<unknown>
}

/**
 * The **`Draggable`** node makes its children draggable with mouse, touch, or pen input.
 * Press inside the configured `shape`, move the pointer, and release to leave the node at
 * its final position.
 *
 * @example
 * ```tsx
 * import { bounds, shapes, useDraggable, useTrigger } from 'fraxel'
 *
 * function Crate() {
 *   const draggable = useDraggable()
 *
 *   useTrigger(draggable.onDragEnd, (event) => {
 *     console.log('Dropped at', event.globalPosition)
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
export class Draggable extends Node2D<PrimaryNode.Draggable> {
  shape: Shape
  disabled: boolean = false
  axis: DragAxis = 'both'
  bounds?: BoundsLike
  snap?: VectorLike
  dropKey?: DropKey
  dropData: unknown
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
    this.axis = propSignal(this, 'axis', options.axis)
    this.bounds = propSignal(this, 'bounds', options.bounds)
    this.snap = propSignal(this, 'snap', options.snap)
    this.dropKey = propSignal(this, 'dropKey', options.dropKey)
    this.dropData = propSignal(this, 'dropData', options.dropData)

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
      DropAreaSystem.update(this)
    })

    this.#target.onPointerMove.connect(() => {
      if (!this.#dragging || this.disabled) return

      this.#moveToPointer()
    })

    this.#target.onPointerUnpress.connect(() => {
      this.#endDrag(true)
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
    if (this.#dragging && (Pointer.pointerCanceled || this.disabled)) {
      this.#endDrag(false)
    }

    super.update(delta)
  }

  #moveToPointer() {
    const previousGlobalPosition = this.globalPosition
    const nextGlobalPosition = this.#resolveGlobalPosition(
      new Vector2(Pointer.pointerPosition).subtract(this.#dragOffset),
      previousGlobalPosition,
    )

    this.globalPosition = nextGlobalPosition

    const delta = this.globalPosition.toSubtracted(previousGlobalPosition)
    this.#previousGlobalPosition = this.globalPosition
    this.onDrag.emit(this.#createEvent(delta))
    DropAreaSystem.update(this)
  }

  #resolveGlobalPosition(position: Vector2, previousGlobalPosition: Vector2) {
    return this.#applyBounds(this.#applySnap(this.#applyAxis(position, previousGlobalPosition)))
  }

  #applyAxis(position: Vector2, previousGlobalPosition: Vector2) {
    if (this.axis === 'x') return new Vector2(position.x, previousGlobalPosition.y)
    if (this.axis === 'y') return new Vector2(previousGlobalPosition.x, position.y)
    return position
  }

  #applySnap(position: Vector2) {
    if (this.snap == null) return position

    const snap = new Vector2(this.snap)
    return new Vector2(
      snap.x > 0 ? Math.round(position.x / snap.x) * snap.x : position.x,
      snap.y > 0 ? Math.round(position.y / snap.y) * snap.y : position.y,
    )
  }

  #applyBounds(position: Vector2) {
    if (this.bounds == null) return position

    const bounds = new Bounds(this.bounds)
    return new Vector2(
      Math.min(Math.max(position.x, bounds.left), bounds.right),
      Math.min(Math.max(position.y, bounds.top), bounds.bottom),
    )
  }

  #endDrag(emitDrop: boolean) {
    if (!this.#dragging) return

    this.#dragging = false

    if (emitDrop && !this.disabled) {
      DropAreaSystem.drop(this)
    } else {
      DropAreaSystem.cancel(this)
    }

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
    DropAreaSystem.cancel(this)
    this.#target.destroy()
    this.onDragStart.clear()
    this.onDrag.clear()
    this.onDragEnd.clear()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.Draggable, Draggable)
