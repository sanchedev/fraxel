import { ActionNotFoundError, DuplicateKeyError } from '../errors/input.js'
import { Event } from '../events/event.js'
import { vector2, Vector2 } from '../math/vector2.js'

/**
 * Defines a key binding for an input action.
 */
export interface InputKey {
  /** The key name (e.g. 'a', 'arrowleft', ' '). */
  key: string
  /** Require Ctrl modifier. */
  ctrl?: boolean
  /** Require Shift modifier. */
  shift?: boolean
  /** Require Alt modifier. */
  alt?: boolean
}

/**
 * The **`Input`** class is a singleton that manages all keyboard and pointer input.
 * All methods are static — access via `Input.methodName()`.
 */
export class Input {
  static #instance: Input

  static #currentKeys = new Set<string>()
  static #justKeys = new Set<string>()
  static #justKeysUnpressed = new Set<string>()

  static #actions = new Map<symbol, InputKey>()
  static #keyToAction = new Map<string, symbol>()

  static #pointer = {
    position: Vector2.ZERO,
    isPressed: false,
  }

  static #canvasPos: Vector2 = Vector2.ZERO
  static #canvasSize: Vector2 = Vector2.ZERO
  static #canvasResSize: Vector2 = Vector2.ZERO

  static #handleKeyDown: (ev: KeyboardEvent) => void = () => {}
  static #handleKeyUp: (ev: KeyboardEvent) => void = () => {}
  static #handlePointerMove: (ev: PointerEvent) => void = () => {}
  static #handlePointerDown: (ev: PointerEvent) => void = () => {}
  static #handlePointerUp: (ev: PointerEvent) => void = () => {}
  static #handleResize: () => void = () => {}

  /**
   * The **`getInstance`** method returns the singleton instance of the `Input` class.
   * @returns The `Input` instance.
   */
  static getInstance(): Input {
    if (!Input.#instance) {
      Input.#instance = new Input()
    }
    return Input.#instance
  }

  /**
   * The **`setup`** method initializes the input system with the game canvas.
   * Called automatically by `Game.setup()`.
   * @param canvas The game canvas element.
   * @param size The logical game dimensions (width, height).
   */
  static setup(canvas: HTMLCanvasElement, size: Vector2) {
    const canvasBounding = canvas.getBoundingClientRect()
    Input.#canvasPos = vector2(canvasBounding.x, canvasBounding.y)
    Input.#canvasSize = vector2(canvasBounding.width, canvasBounding.height)
    Input.#canvasResSize = size.clone()

    Input.#handleResize = () => {
      const newCanvasBounding = canvas.getBoundingClientRect()
      Input.#canvasSize.x = newCanvasBounding.width
      Input.#canvasSize.y = newCanvasBounding.height
      Input.#canvasPos.x = newCanvasBounding.x
      Input.#canvasPos.y = newCanvasBounding.y
    }

    Input.#handleKeyDown = (ev: KeyboardEvent) => {
      const keyString = Input.#getKeyString(ev)
      if (Input.#keyToAction.has(keyString)) ev.preventDefault()
      if (!Input.#currentKeys.has(keyString)) {
        Input.#justKeys.add(keyString)
      }
      Input.#currentKeys.add(keyString)
    }

    Input.#handleKeyUp = (ev: KeyboardEvent) => {
      const keyString = Input.#getKeyString(ev)
      if (Input.#keyToAction.has(keyString)) ev.preventDefault()
      Input.#justKeysUnpressed.add(keyString)
      Input.#currentKeys.delete(keyString)
    }

    Input.#handlePointerMove = (ev: PointerEvent) => {
      const position = Input.#getPointerPosition(ev)
      Input.#pointer.position.x = position.x
      Input.#pointer.position.y = position.y
      Input.pointerMoved.emit(position)
    }

    Input.#handlePointerDown = (ev: PointerEvent) => {
      const position = Input.#getPointerPosition(ev)
      Input.#pointer.position.x = position.x
      Input.#pointer.position.y = position.y
      Input.#pointer.isPressed = true
      Input.pointerPressed.emit(position)
    }

    Input.#handlePointerUp = (ev: PointerEvent) => {
      const position = Input.#getPointerPosition(ev)
      Input.#pointer.position.x = position.x
      Input.#pointer.position.y = position.y
      Input.#pointer.isPressed = false
      Input.pointerUnpressed.emit(position)
    }

    window.addEventListener('resize', Input.#handleResize)
    window.addEventListener('keydown', Input.#handleKeyDown)
    window.addEventListener('keyup', Input.#handleKeyUp)
    window.addEventListener('pointermove', Input.#handlePointerMove)
    window.addEventListener('pointerdown', Input.#handlePointerDown)
    window.addEventListener('pointerup', Input.#handlePointerUp)
  }

  // --- Actions ---

  /**
   * The **`createAction`** method creates an input action from a key binding and returns a symbol identifier.
   * @param options The key binding configuration.
   * @returns A unique symbol identifying the action.
   * @throws {DuplicateKeyError} if the key combo is already bound to another action.
   *
   * @example
   * ```ts
   * const Jump = Input.createAction({ key: ' ' })
   * const Dash = Input.createAction({ key: 'ShiftLeft', shift: true })
   * ```
   */
  static createAction(options: InputKey): symbol {
    const keyString = Input.#keyComboString(options)
    const existingAction = Input.#keyToAction.get(keyString)
    if (existingAction != null) {
      const newAction = Symbol(options.key)
      throw new DuplicateKeyError(keyString, existingAction, newAction)
    }
    const action = Symbol(options.key)
    Input.#actions.set(action, options)
    Input.#keyToAction.set(keyString, action)
    return action
  }

  /**
   * The **`getAction`** method returns the key binding for a registered action.
   * @param action The action symbol to look up.
   * @returns The `InputKey` configuration for the action.
   * @throws {ActionNotFoundError} if the action hasn't been registered.
   */
  static getAction(action: symbol): InputKey {
    const key = Input.#actions.get(action)
    if (key == null) throw new ActionNotFoundError(action)
    return key
  }

  /**
   * The **`isActionPressed`** method returns `true` while the action's key is held down.
   * @param action The action symbol to check.
   * @returns `true` if the action is currently pressed.
   */
  static isActionPressed(action: symbol): boolean {
    const key = Input.#actions.get(action)
    if (key == null) return false
    return Input.isKeyPressed(key.key, key.ctrl, key.shift, key.alt)
  }

  /**
   * The **`justActionPressed`** method returns `true` on the first frame the action's key is pressed.
   * @param action The action symbol to check.
   * @returns `true` if the action was just pressed.
   */
  static justActionPressed(action: symbol): boolean {
    const key = Input.#actions.get(action)
    if (key == null) return false
    return Input.isJustKeyPressed(key.key, key.ctrl, key.shift, key.alt)
  }

  /**
   * The **`justActionUnpressed`** method returns `true` on the first frame the action's key is released.
   * @param action The action symbol to check.
   * @returns `true` if the action was just released.
   */
  static justActionUnpressed(action: symbol): boolean {
    const key = Input.#actions.get(action)
    if (key == null) return false
    return Input.isJustKeyUnpressed(key.key, key.ctrl, key.shift, key.alt)
  }

  // --- Raw key queries ---

  static #getPointerPosition(ev: PointerEvent): Vector2 {
    return vector2(
      (clamp(0, ev.x - Input.#canvasPos.x, Input.#canvasSize.x) * Input.#canvasResSize.x) /
        Input.#canvasSize.x,
      (clamp(0, ev.y - Input.#canvasPos.y, Input.#canvasSize.y) * Input.#canvasResSize.y) /
        Input.#canvasSize.y,
    )
  }

  static #getKeyString(ev: LikeKeyboardEvent) {
    return `${ev.key.toLowerCase()}|${ev.ctrlKey}|${ev.altKey}|${ev.shiftKey}`
  }

  static #keyComboString(options: InputKey): string {
    return `${options.key.toLowerCase()}|${options.ctrl ?? false}|${options.alt ?? false}|${options.shift ?? false}`
  }

  /**
   * The **`isJustKeyPressed`** method returns `true` on the first frame a key is pressed.
   * @param key The key name (e.g., `'a'`, `' '`, `'ArrowLeft'`).
   * @param ctrlKey Whether Ctrl is required (default `false`).
   * @param shiftKey Whether Shift is required (default `false`).
   * @param altKey Whether Alt is required (default `false`).
   * @returns `true` if the key was just pressed.
   */
  static isJustKeyPressed(key: string, ctrlKey = false, shiftKey = false, altKey = false) {
    return Input.#justKeys.has(
      Input.#getKeyString({
        key,
        ctrlKey,
        altKey,
        shiftKey,
      }),
    )
  }
  /**
   * The **`isKeyPressed`** method returns `true` while a key is held down.
   * @param key The key name (e.g., `'a'`, `' '`, `'ArrowLeft'`).
   * @param ctrlKey Whether Ctrl is required (default `false`).
   * @param shiftKey Whether Shift is required (default `false`).
   * @param altKey Whether Alt is required (default `false`).
   * @returns `true` if the key is currently held.
   */
  static isKeyPressed(key: string, ctrlKey = false, shiftKey = false, altKey = false) {
    return Input.#currentKeys.has(
      Input.#getKeyString({
        key,
        ctrlKey,
        altKey,
        shiftKey,
      }),
    )
  }
  /**
   * The **`isJustKeyUnpressed`** method returns `true` on the first frame a key is released.
   * @param key The key name (e.g., `'a'`, `' '`, `'ArrowLeft'`).
   * @param ctrlKey Whether Ctrl is required (default `false`).
   * @param shiftKey Whether Shift is required (default `false`).
   * @param altKey Whether Alt is required (default `false`).
   * @returns `true` if the key was just released.
   */
  static isJustKeyUnpressed(key: string, ctrlKey = false, shiftKey = false, altKey = false) {
    return Input.#justKeysUnpressed.has(
      Input.#getKeyString({
        key,
        ctrlKey,
        altKey,
        shiftKey,
      }),
    )
  }

  /**
   * The **`getKeyAxis`** method returns an axis value based on two opposing keys.
   * @param positiveKey The key that produces +1 (e.g., `'ArrowRight'`).
   * @param negativeKey The key that produces -1 (e.g., `'ArrowLeft'`).
   * @returns `-1`, `0`, or `1` based on which key is held.
   *
   * @example
   * ```ts
   * const horizontal = Input.getKeyAxis('ArrowRight', 'ArrowLeft')
   * // Returns: -1 (left), 0 (none), or 1 (right)
   * ```
   */
  static getKeyAxis(positiveKey: string, negativeKey: string) {
    let axis = 0
    if (Input.isKeyPressed(positiveKey)) axis += 1
    if (Input.isKeyPressed(negativeKey)) axis -= 1
    return axis
  }

  // --- Pointer ---

  /**
   * The read-only **`pointerPosition`** property returns the current pointer position.
   */
  static get pointerPosition(): Readonly<Vector2> {
    return Input.#pointer.position
  }

  /**
   * The read-only **`isPointerPressed`** property returns whether the pointer is currently pressed.
   */
  static get isPointerPressed() {
    return Input.#pointer.isPressed
  }

  /**
   * The **`pointerMoved`** event fires when the pointer moves.
   */
  static pointerMoved = new Event('pointerMove', (_position: Vector2) => {})

  /**
   * The **`pointerPressed`** event fires when the pointer is pressed.
   * The callback receives the pointer position.
   */
  static pointerPressed = new Event('pointerPress', (_position: Vector2) => {})

  /**
   * The **`pointerUnpressed`** event fires when the pointer is released.
   * The callback receives the pointer position.
   */
  static pointerUnpressed = new Event('pointerUnpress', (_position: Vector2) => {})

  // --- Lifecycle ---

  /** Clears per-frame state. Called by `Game.loop()`. */
  static update() {
    Input.#justKeys.clear()
    Input.#justKeysUnpressed.clear()
  }

  /**
   * The **`destroy`** method removes all event listeners, clears actions, and revokes subscriptions.
   */
  static destroy() {
    window.removeEventListener('resize', Input.#handleResize)
    window.removeEventListener('keydown', Input.#handleKeyDown)
    window.removeEventListener('keyup', Input.#handleKeyUp)
    window.removeEventListener('pointermove', Input.#handlePointerMove)
    window.removeEventListener('pointerdown', Input.#handlePointerDown)
    window.removeEventListener('pointerup', Input.#handlePointerUp)

    Input.#actions.clear()
    Input.#keyToAction.clear()
    Input.#currentKeys.clear()
    Input.#justKeys.clear()
    Input.#justKeysUnpressed.clear()
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
