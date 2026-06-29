import { Event } from '../events/event.js'
import { Vector2 } from '../math/vector2.js'

export interface InputOptions {
  /**
   * Whether to call `preventDefault()` on keyboard events.
   * Set to `false` to allow browser shortcuts and default behavior.
   * @default true
   */
  preventKeyDefaults?: boolean
}

export class Input {
  #currentKeys = new Set<string>()
  #justKeys = new Set<string>()
  #justKeysUnpressed = new Set<string>()

  #pointer = {
    position: new Vector2(0, 0),
    isPressed: false,
  }

  #canvasPos: Vector2
  #canvasSize: Vector2
  #canvasResSize: Vector2

  #handleKeyDown: (ev: KeyboardEvent) => void
  #handleKeyUp: (ev: KeyboardEvent) => void
  #handlePointerMove: (ev: PointerEvent) => void
  #handlePointerDown: (ev: PointerEvent) => void
  #handlePointerUp: (ev: PointerEvent) => void
  #handleResize: () => void

  constructor(
    canvas: HTMLCanvasElement,
    size: Vector2,
    options?: InputOptions,
  ) {
    const { preventKeyDefaults = true } = options ?? {}

    const canvasBounding = canvas.getBoundingClientRect()
    this.#canvasPos = new Vector2(canvasBounding.x, canvasBounding.y)
    this.#canvasSize = new Vector2(canvasBounding.width, canvasBounding.height)
    this.#canvasResSize = size.clone()

    this.#handleResize = () => {
      const newCanvasBounding = canvas.getBoundingClientRect()
      this.#canvasSize.x = newCanvasBounding.width
      this.#canvasSize.y = newCanvasBounding.height
      this.#canvasPos.x = newCanvasBounding.x
      this.#canvasPos.y = newCanvasBounding.y
    }

    this.#handleKeyDown = (ev: KeyboardEvent) => {
      if (preventKeyDefaults) ev.preventDefault()
      const keyString = this.#getKeyString(ev)
      this.#currentKeys.add(keyString)
      this.#justKeys.add(keyString)
    }

    this.#handleKeyUp = (ev: KeyboardEvent) => {
      if (preventKeyDefaults) ev.preventDefault()
      const keyString = this.#getKeyString(ev)
      this.#justKeysUnpressed.add(keyString)
      this.#currentKeys.delete(keyString)
    }

    this.#handlePointerMove = (ev: PointerEvent) => {
      const position = this.#getPointerPosition(ev)
      this.#pointer.position.x = position.x
      this.#pointer.position.y = position.y
      this.pointerMoved.emit(position)
    }

    this.#handlePointerDown = (ev: PointerEvent) => {
      const position = this.#getPointerPosition(ev)
      this.#pointer.position.x = position.x
      this.#pointer.position.y = position.y
      this.#pointer.isPressed = true
      this.pointerPressed.emit(position)
    }

    this.#handlePointerUp = (ev: PointerEvent) => {
      const position = this.#getPointerPosition(ev)
      this.#pointer.position.x = position.x
      this.#pointer.position.y = position.y
      this.#pointer.isPressed = false
      this.pointerUnpressed.emit(position)
    }

    window.addEventListener('resize', this.#handleResize)
    window.addEventListener('keydown', this.#handleKeyDown)
    window.addEventListener('keyup', this.#handleKeyUp)
    window.addEventListener('pointermove', this.#handlePointerMove)
    window.addEventListener('pointerdown', this.#handlePointerDown)
    window.addEventListener('pointerup', this.#handlePointerUp)
  }

  #getPointerPosition(ev: PointerEvent): Vector2 {
    return new Vector2(
      (clamp(0, ev.x - this.#canvasPos.x, this.#canvasSize.x) *
        this.#canvasResSize.x) /
        this.#canvasSize.x,
      (clamp(0, ev.y - this.#canvasPos.y, this.#canvasSize.y) *
        this.#canvasResSize.y) /
        this.#canvasSize.y,
    )
  }

  #getKeyString(ev: LikeKeyboardEvent) {
    return `${ev.key.toLowerCase()}|${ev.ctrlKey}|${ev.altKey}|${ev.shiftKey}`
  }

  isJustKeyPressed(
    key: string,
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
  ) {
    return this.#justKeys.has(
      this.#getKeyString({
        key,
        ctrlKey,
        altKey,
        shiftKey,
      }),
    )
  }
  isKeyPressed(key: string, ctrlKey = false, shiftKey = false, altKey = false) {
    return this.#currentKeys.has(
      this.#getKeyString({
        key,
        ctrlKey,
        altKey,
        shiftKey,
      }),
    )
  }
  isJustKeyUnpressed(
    key: string,
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
  ) {
    return this.#justKeysUnpressed.has(
      this.#getKeyString({
        key,
        ctrlKey,
        altKey,
        shiftKey,
      }),
    )
  }

  getKeyAxis(positiveKey: string, negativeKey: string) {
    let axis = 0
    if (this.isKeyPressed(positiveKey)) axis += 1
    if (this.isKeyPressed(negativeKey)) axis -= 1
    return axis
  }

  /**
   * The read-only **`pointerPosition`** property returns the current pointer position.
   */
  get pointerPosition(): Readonly<Vector2> {
    return this.#pointer.position
  }

  /**
   * The read-only **`isPointerPressed`** property returns whether the pointer is currently pressed.
   */
  get isPointerPressed() {
    return this.#pointer.isPressed
  }

  /**
   * The **`pointerMoved`** event fires when the pointer moves.
   */
  pointerMoved = new Event('pointerMove', (_position: Vector2) => {})

  /**
   * The **`pointerPressed`** event fires when the pointer is pressed.
   * The callback receives the pointer position.
   */
  pointerPressed = new Event('pointerPress', (_position: Vector2) => {})

  /**
   * The **`pointerUnpressed`** event fires when the pointer is released.
   * The callback receives the pointer position.
   */
  pointerUnpressed = new Event('pointerUnpress', (_position: Vector2) => {})

  update() {
    this.#justKeys.clear()
    this.#justKeysUnpressed.clear()
  }

  /**
   * The **`destroy`** method removes all event listeners.
   */
  destroy() {
    window.removeEventListener('resize', this.#handleResize)
    window.removeEventListener('keydown', this.#handleKeyDown)
    window.removeEventListener('keyup', this.#handleKeyUp)
    window.removeEventListener('pointermove', this.#handlePointerMove)
    window.removeEventListener('pointerdown', this.#handlePointerDown)
    window.removeEventListener('pointerup', this.#handlePointerUp)
  }
}

function clamp(min: number, val: number, max: number) {
  return Math.min(Math.max(min, val), max)
}

type LikeKeyboardEvent = {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}
