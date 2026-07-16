import { ActionNotFoundError, InvalidActionTypeError } from '../errors/input.js'
import type { Vector2 } from '../math/vector2.js'
import { Key, type KeyInfo, type KeyString } from './key.js'
import { Pointer } from './pointer.js'
import { Viewport } from './viewport.js'

export type Action = KeyAction

export type ActionOptions = KeyActionOptions | KeyAction

export type KeyActionOptions = KeyInfo

export type KeyAction = {
  type: 'key'
  data: KeyInfo
}

export type ActionString = KeyActionString

type KeyActionString = `key:${KeyString}`

/**
 * The **`Input`** class is a static singleton that manages all keyboard and pointer input.
 * All methods are static — access via `Input.methodName()`. Must be initialized with
 * `Input.mount()` before use (called automatically by the game runtime).
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
  static #mounted = false
  static get mounted() {
    return this.#mounted
  }

  static #actionsRecord = new Map<ActionString, Action>()

  /**
   * The **`mount`** method initializes the input system with the game canvas.
   * Called automatically by the game runtime. Registers all DOM event listeners.
   *
   * @param canvas The game canvas element.
   * @param size The logical game dimensions (width, height).
   */
  static mount(canvas: HTMLCanvasElement, size: Vector2) {
    if (this.#mounted) return
    if (!Viewport.mounted) Viewport.mount(canvas, size)
    if (!Pointer.mounted) Pointer.mount()
    if (!Key.mounted) Key.mount()
    this.#mounted = true
  }

  // --- Actions ---

  /**
   * The **`createAction`** method creates an input action from a key binding and
   * returns an action identifier.
   *
   * @param options The key binding configuration.
   * @returns A unique action identifier.
   *
   * @example
   * ```ts
   * import { Input } from 'fraxel'
   *
   * const Jump = Input.createAction({ key: ' ' })
   * const Dash = Input.createAction({ key: 'Shift', shiftKey: true })
   * const Fire = Input.createAction({ key: 'f', ctrlKey: true })
   * ```
   */
  static createAction(options: ActionOptions): ActionString {
    const action = this.#normalizeAction(options)

    if (action.type === 'key') {
      const str: ActionString = `key:${Key.registerKey(action.data)}`
      this.#actionsRecord.set(str, action)
      return str
    }

    throw new InvalidActionTypeError(action)
  }

  /**
   * The **`getAction`** method returns the key binding for a registered action.
   * Throws `ActionNotFoundError` if the action hasn't been registered.
   *
   * @param action The action identifier to look up.
   * @returns The action configuration.
   *
   * @example
   * ```ts
   * const config = Input.getAction(Jump)
   * console.log(config.data.key) // ' '
   * ```
   */
  static getAction(action: ActionString): Action {
    const key = this.#actionsRecord.get(action)
    if (key == null) throw new ActionNotFoundError(action)
    return key
  }

  /**
   * The **`isActionPressed`** method returns `true` while the action's key is held down.
   *
   * @param action The action identifier to check.
   * @returns `true` if the action is currently pressed.
   */
  static isActionPressed(action: ActionString): boolean {
    const act = this.getAction(action)
    if (act.type === 'key') {
      return Key.isKeyPressed(Key.getKeyString(act.data))
    }
    throw new InvalidActionTypeError(act)
  }

  /**
   * The **`justActionPressed`** method returns `true` on the first frame the action's key is pressed.
   *
   * @param action The action identifier to check.
   * @returns `true` if the action was just pressed.
   */
  static justActionPressed(action: ActionString): boolean {
    const act = this.getAction(action)
    if (act.type === 'key') {
      return Key.justKeyPressed(Key.getKeyString(act.data))
    }
    throw new InvalidActionTypeError(act)
  }

  /**
   * The **`justActionUnpressed`** method returns `true` on the first frame the action's key is released.
   *
   * @param action The action identifier to check.
   * @returns `true` if the action was just released.
   */
  static justActionUnpressed(action: ActionString): boolean {
    const act = this.getAction(action)
    if (act.type === 'key') {
      return Key.justKeyUnpressed(Key.getKeyString(act.data))
    }
    throw new InvalidActionTypeError(act)
  }

  static getActionAxis(negativeAction: ActionString, positiveAction: ActionString): number {
    let axis = 0
    if (this.isActionPressed(positiveAction)) axis += 1
    if (this.isActionPressed(negativeAction)) axis -= 1
    return axis
  }

  // --- Lifecycle ---

  /** Clears per-frame state. Called by `Game.loop()`. */
  static update() {
    Key.update()
  }

  /**
   * The **`unmount`** method removes all event listeners, clears actions, and
   * revokes subscriptions. Must be called when the game is destroyed to prevent
   * memory leaks.
   */
  static unmount() {
    if (!this.#mounted) return
    if (Viewport.mounted) Viewport.unmount()
    if (Pointer.mounted) Pointer.unmount()
    if (Key.mounted) Key.unmount()

    Input.#actionsRecord.clear()
    this.#mounted = false
  }

  static #normalizeAction(options: ActionOptions): Action {
    if ('type' in options) return options
    return {
      type: 'key',
      data: {
        key: options.key,
        ctrlKey: options.ctrlKey ?? false,
        altKey: options.altKey ?? false,
        shiftKey: options.shiftKey ?? false,
      },
    }
  }
}
