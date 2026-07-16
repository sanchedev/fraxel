import { Trigger } from '../events/trigger.js'
import { vector2, type Vector2 } from '../math/vector2.js'
import { Viewport } from './viewport.js'

interface PointerInfo {
  position: Vector2
  isPressed: boolean
}

export class Pointer {
  static #mounted = false
  static get mounted() {
    return this.#mounted
  }

  static #pointer: PointerInfo = {
    position: vector2(0),
    isPressed: false,
  }

  static #handlePointerMove: (ev: PointerEvent) => void = () => {}
  static #handlePointerDown: (ev: PointerEvent) => void = () => {}
  static #handlePointerUp: (ev: PointerEvent) => void = () => {}

  static mount() {
    if (this.#mounted) return

    this.#handlePointerMove = (ev: PointerEvent) => {
      const position = this.#getPointerPosition(ev)
      this.#pointer.position.x = position.x
      this.#pointer.position.y = position.y
      this.onPointerMove.emit(position)
    }

    this.#handlePointerDown = (ev: PointerEvent) => {
      const position = this.#getPointerPosition(ev)
      this.#pointer.position.x = position.x
      this.#pointer.position.y = position.y
      this.#pointer.isPressed = true
      this.onPointerPress.emit(position)
    }

    this.#handlePointerUp = (ev: PointerEvent) => {
      const position = this.#getPointerPosition(ev)
      this.#pointer.position.x = position.x
      this.#pointer.position.y = position.y
      this.#pointer.isPressed = false
      this.onPointerUnpress.emit(position)
    }

    window.addEventListener('pointermove', this.#handlePointerMove)
    window.addEventListener('pointerdown', this.#handlePointerDown)
    window.addEventListener('pointerup', this.#handlePointerUp)
    this.#mounted = true
  }
  static unmount() {
    if (!this.#mounted) return

    window.removeEventListener('pointermove', this.#handlePointerMove)
    window.removeEventListener('pointerdown', this.#handlePointerDown)
    window.removeEventListener('pointerup', this.#handlePointerUp)

    this.#pointer.position.x = 0
    this.#pointer.position.y = 0
    this.#pointer.isPressed = false
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

  // Getters

  /**
   * The read-only **`pointerPosition`** property returns the current pointer position
   * in game coordinates (logical pixels).
   */
  static get pointerPosition(): Readonly<Vector2> {
    return this.#pointer.position
  }

  /**
   * The read-only **`isPointerPressed`** property returns whether the pointer is currently pressed.
   */
  static get isPointerPressed() {
    return this.#pointer.isPressed
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
