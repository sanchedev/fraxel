import { Trigger } from '../events/trigger.js'
import { vector2, type Vector2 } from '../math/vector2.js'
import { Viewport } from './viewport.js'

interface PointerInfo {
  position: Vector2
  previousPosition: Vector2
  delta: Vector2
  isPressed: boolean
  justPressed: boolean
  justUnpressed: boolean
  canceled: boolean
  moved: boolean
  pointerId: number | null
  pointerType: string | null
}

export class Pointer {
  static #mounted = false
  static get mounted() {
    return this.#mounted
  }

  static #pointer: PointerInfo = {
    position: vector2(0),
    previousPosition: vector2(0),
    delta: vector2(0),
    isPressed: false,
    justPressed: false,
    justUnpressed: false,
    canceled: false,
    moved: false,
    pointerId: null,
    pointerType: null,
  }

  static #handlePointerMove: (ev: PointerEvent) => void = () => {}
  static #handlePointerDown: (ev: PointerEvent) => void = () => {}
  static #handlePointerUp: (ev: PointerEvent) => void = () => {}
  static #handlePointerCancel: (ev: PointerEvent) => void = () => {}

  static mount() {
    if (this.#mounted) return

    this.#handlePointerMove = (ev: PointerEvent) => {
      if (!this.#acceptPointerEvent(ev)) return
      const position = this.#getPointerPosition(ev)
      this.#setPointerPosition(position)
      this.onPointerMove.emit(position)
    }

    this.#handlePointerDown = (ev: PointerEvent) => {
      if (this.#pointer.pointerId != null) return
      const position = this.#getPointerPosition(ev)
      this.#pointer.pointerId = ev.pointerId
      this.#pointer.pointerType = ev.pointerType
      this.#pointer.justPressed = true
      this.#setPointerPosition(position)
      this.#pointer.isPressed = true
      this.onPointerPress.emit(position)
    }

    this.#handlePointerUp = (ev: PointerEvent) => {
      if (!this.#acceptPointerEvent(ev)) return
      const position = this.#getPointerPosition(ev)
      this.#setPointerPosition(position)
      this.#pointer.isPressed = false
      this.#pointer.justUnpressed = true
      this.#pointer.pointerId = null
      this.onPointerUnpress.emit(position)
    }

    this.#handlePointerCancel = (ev: PointerEvent) => {
      if (!this.#acceptPointerEvent(ev)) return
      const position = this.#getPointerPosition(ev)
      this.#setPointerPosition(position)
      this.#pointer.isPressed = false
      this.#pointer.canceled = true
      this.#pointer.pointerId = null
    }

    window.addEventListener('pointermove', this.#handlePointerMove)
    window.addEventListener('pointerdown', this.#handlePointerDown)
    window.addEventListener('pointerup', this.#handlePointerUp)
    window.addEventListener('pointercancel', this.#handlePointerCancel)
    this.#mounted = true
  }
  static unmount() {
    if (!this.#mounted) return

    window.removeEventListener('pointermove', this.#handlePointerMove)
    window.removeEventListener('pointerdown', this.#handlePointerDown)
    window.removeEventListener('pointerup', this.#handlePointerUp)
    window.removeEventListener('pointercancel', this.#handlePointerCancel)

    this.#pointer.position.x = 0
    this.#pointer.position.y = 0
    this.#pointer.previousPosition.x = 0
    this.#pointer.previousPosition.y = 0
    this.#pointer.delta.x = 0
    this.#pointer.delta.y = 0
    this.#pointer.isPressed = false
    this.#pointer.justPressed = false
    this.#pointer.justUnpressed = false
    this.#pointer.canceled = false
    this.#pointer.moved = false
    this.#pointer.pointerId = null
    this.#pointer.pointerType = null
    this.onPointerMove.clear()
    this.onPointerPress.clear()
    this.onPointerUnpress.clear()
    this.#mounted = false
  }

  static #getPointerPosition(ev: PointerEvent): Vector2 {
    Viewport.refresh()
    if (Viewport.canvasRegion.size.x === 0 || Viewport.canvasRegion.size.y === 0) return vector2(0)

    return vector2(
      ((ev.clientX - Viewport.canvasRegion.offset.x) * Viewport.viewportSize.x) /
        Viewport.canvasRegion.size.x,
      ((ev.clientY - Viewport.canvasRegion.offset.y) * Viewport.viewportSize.y) /
        Viewport.canvasRegion.size.y,
    )
  }

  static #acceptPointerEvent(ev: PointerEvent): boolean {
    return this.#pointer.pointerId == null || this.#pointer.pointerId === ev.pointerId
  }

  static #setPointerPosition(position: Vector2) {
    this.#pointer.previousPosition.x = this.#pointer.position.x
    this.#pointer.previousPosition.y = this.#pointer.position.y
    this.#pointer.position.x = position.x
    this.#pointer.position.y = position.y
    this.#pointer.delta.x = position.x - this.#pointer.previousPosition.x
    this.#pointer.delta.y = position.y - this.#pointer.previousPosition.y
    this.#pointer.moved = this.#pointer.delta.x !== 0 || this.#pointer.delta.y !== 0
  }

  // Getters

  /**
   * The read-only **`pointerPosition`** property returns the current pointer position
   * in game coordinates (logical pixels).
   */
  static get pointerPosition(): Readonly<Vector2> {
    return this.#pointer.position
  }

  /**
   * The read-only **`isPointerPressed`** property returns whether the active pointer is currently pressed.
   * Pointer events support mouse, touch, and pen input through the browser `PointerEvent` API.
   */
  static get isPointerPressed() {
    return this.#pointer.isPressed
  }

  /** Returns `true` during the frame where the active pointer was pressed. */
  static get justPointerPressed() {
    return this.#pointer.justPressed
  }

  /** Returns `true` during the frame where the active pointer was released. */
  static get justPointerUnpressed() {
    return this.#pointer.justUnpressed
  }

  /** Returns `true` during the frame where the active pointer was canceled by the browser. */
  static get pointerCanceled() {
    return this.#pointer.canceled
  }

  /** Returns `true` during frames where the active pointer moved. */
  static get pointerMoved() {
    return this.#pointer.moved
  }

  /** The pointer movement in game coordinates since the previous pointer event. */
  static get pointerDelta(): Readonly<Vector2> {
    return this.#pointer.delta
  }

  /** The browser pointer type for the active pointer (`mouse`, `touch`, or `pen`). */
  static get pointerType() {
    return this.#pointer.pointerType
  }

  /** Clears per-frame pointer state. Called by the game loop. */
  static update() {
    this.#pointer.justPressed = false
    this.#pointer.justUnpressed = false
    this.#pointer.canceled = false
    this.#pointer.moved = false
    this.#pointer.delta.x = 0
    this.#pointer.delta.y = 0
    if (!this.#pointer.isPressed) this.#pointer.pointerType = null
  }

  // Triggers

  /**
   * The **`onPointerMove`** trigger fires when the pointer moves. The callback receives
   * the pointer position in game coordinates.
   */
  static onPointerMove = new Trigger<[position: Vector2]>()

  /**
   * The **`onPointerPress`** trigger fires when the pointer is pressed. The callback
   * receives the pointer position in game coordinates.
   */
  static onPointerPress = new Trigger<[position: Vector2]>()

  /**
   * The **`onPointerUnpress`** trigger fires when the pointer is released. The callback
   * receives the pointer position in game coordinates.
   */
  static onPointerUnpress = new Trigger<[position: Vector2]>()
}
