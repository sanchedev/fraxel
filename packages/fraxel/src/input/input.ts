import { ActionNotFoundError, DuplicateKeyError } from '../errors/input.js'
import { Trigger } from '../events/trigger.js'
import { clamp } from '../math/utils.js'
import { vector2, Vector2 } from '../math/vector2.js'

/**
 * The **`InputAction`** interface defines a key binding for an input action.
 * Used with `Input.createAction()` to register keyboard shortcuts.
 */
export interface InputAction {
  /** The key name (e.g., `'a'`, `' '`, `'ArrowLeft'`). */
  key: string
  /** Require Ctrl modifier. */
  ctrl?: boolean
  /** Require Shift modifier. */
  shift?: boolean
  /** Require Alt modifier. */
  alt?: boolean
}

/**
 * The **`Input`** class is a static singleton that manages all keyboard and pointer input.
 * All methods are static — access via `Input.methodName()`. Must be initialized with
 * `Input.setup()` before use (called automatically by `Game.setup()`).
 *
 * @example
 * ```ts
 * import { Input } from 'fraxel'
 *
 * const Jump = Input.createAction({ key: ' ' })
 *
 * // In game loop:
 * if (Input.justActionPressed(Jump)) {
 *   console.log('Jump!')
 * }
 * ```
 */
export class Input {
  static #instance: Input

  static #currentKeys = new Set<string>()
  static #justKeys = new Set<string>()
  static #justKeysUnpressed = new Set<string>()

  static #actions = new Map<symbol, InputAction>()
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
   *
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
   * Called automatically by `Game.setup()`. Registers all DOM event listeners.
   *
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
      const keyString = Input.#getKeyEvString(ev)
      if (Input.#keyToAction.has(keyString)) ev.preventDefault()
      if (!Input.#currentKeys.has(keyString)) {
        Input.#justKeys.add(keyString)
      }
      Input.#currentKeys.add(keyString)
    }

    Input.#handleKeyUp = (ev: KeyboardEvent) => {
      const keyString = Input.#getKeyEvString(ev)
      if (Input.#keyToAction.has(keyString)) ev.preventDefault()
      Input.#justKeysUnpressed.add(keyString)
      Input.#currentKeys.delete(keyString)
    }

    Input.#handlePointerMove = (ev: PointerEvent) => {
      const position = Input.#getPointerPosition(ev)
      Input.#pointer.position.x = position.x
      Input.#pointer.position.y = position.y
      Input.onPointerMove.emit(position)
    }

    Input.#handlePointerDown = (ev: PointerEvent) => {
      const position = Input.#getPointerPosition(ev)
      Input.#pointer.position.x = position.x
      Input.#pointer.position.y = position.y
      Input.#pointer.isPressed = true
      Input.onPointerPress.emit(position)
    }

    Input.#handlePointerUp = (ev: PointerEvent) => {
      const position = Input.#getPointerPosition(ev)
      Input.#pointer.position.x = position.x
      Input.#pointer.position.y = position.y
      Input.#pointer.isPressed = false
      Input.onPointerUnpress.emit(position)
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
   * The **`createAction`** method creates an input action from a key binding and
   * returns a symbol identifier. Throws `DuplicateKeyError` if the key combo is
   * already bound to another action.
   *
   * @param options The key binding configuration.
   * @returns A unique symbol identifying the action.
   *
   * @example
   * ```ts
   * import { Input } from 'fraxel'
   *
   * const Jump = Input.createAction({ key: ' ' })
   * const Dash = Input.createAction({ key: 'ShiftLeft', shift: true })
   * const Fire = Input.createAction({ key: 'f', ctrl: true })
   * ```
   */
  static createAction(options: InputAction): symbol {
    const keyString = Input.#getActionString(options)
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
   * Throws `ActionNotFoundError` if the action hasn't been registered.
   *
   * @param action The action symbol to look up.
   * @returns The `InputAction` configuration for the action.
   *
   * @example
   * ```ts
   * const config = Input.getAction(Jump)
   * console.log(config.key) // ' '
   * ```
   */
  static getAction(action: symbol): InputAction {
    const key = Input.#actions.get(action)
    if (key == null) throw new ActionNotFoundError(action)
    return key
  }

  /**
   * The **`isActionPressed`** method returns `true` while the action's key is held down.
   *
   * @param action The action symbol to check.
   * @returns `true` if the action is currently pressed.
   */
  static isActionPressed(action: symbol): boolean {
    const key = Input.#actions.get(action)
    if (key == null) return false
    return Input.#currentKeys.has(Input.#getActionString(key))
  }

  /**
   * The **`justActionPressed`** method returns `true` on the first frame the action's key is pressed.
   *
   * @param action The action symbol to check.
   * @returns `true` if the action was just pressed.
   */
  static justActionPressed(action: symbol): boolean {
    const key = Input.#actions.get(action)
    if (key == null) return false
    return Input.#justKeys.has(Input.#getActionString(key))
  }

  /**
   * The **`justActionUnpressed`** method returns `true` on the first frame the action's key is released.
   *
   * @param action The action symbol to check.
   * @returns `true` if the action was just released.
   */
  static justActionUnpressed(action: symbol): boolean {
    const key = Input.#actions.get(action)
    if (key == null) return false
    return Input.#justKeysUnpressed.has(Input.#getActionString(key))
  }

  static getActionAxis(negativeAction: symbol, positiveAction: symbol): number {
    let axis = 0
    if (this.isActionPressed(positiveAction)) axis += 1
    if (this.isActionPressed(negativeAction)) axis -= 1
    return axis
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

  static #getKeyEvString(ev: LikeKeyboardEvent) {
    return this.#getActionString({
      key: ev.key,
      ctrl: ev.ctrlKey,
      shift: ev.shiftKey,
      alt: ev.altKey,
    })
  }

  static #getActionString(options: InputAction): string {
    return `${options.key.toLowerCase()}|${options.ctrl ?? false}|${options.alt ?? false}|${options.shift ?? false}`
  }

  // --- Pointer ---

  /**
   * The read-only **`pointerPosition`** property returns the current pointer position
   * in game coordinates (logical pixels).
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

  // --- Lifecycle ---

  /** Clears per-frame state. Called by `Game.loop()`. */
  static update() {
    Input.#justKeys.clear()
    Input.#justKeysUnpressed.clear()
  }

  /**
   * The **`destroy`** method removes all event listeners, clears actions, and
   * revokes subscriptions. Must be called when the game is destroyed to prevent
   * memory leaks.
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

type LikeKeyboardEvent = {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}
