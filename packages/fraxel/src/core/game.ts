import { SceneManager } from './scene-manager.js'
import { Theme } from './theme.js'
import { _set_gc, GameConfig, type TestOptions } from './game-config.js'
import { getDPRFromCtx } from '../utils/dpr.js'
import { Event } from '../events/event.js'
import { Context2DNotSupportedError } from '../errors/env.js'
import { EngineNotSetupError } from '../errors/lifecycle.js'
import { Input } from '../input/input.js'
import { vector2 } from '../math/vector2.js'
import { CollisionSystem } from '../collision/collision-system.js'
import { PhysicsSystem } from '../collision/physics/physics-system.js'
import { Camera } from '../nodes/node2d/camera.js'
import { paused, running } from './game-state.js'

/**
 * The **`SetupOptions`** interface configures the game canvas and engine initialization.
 */
export interface SetupOptions {
  /** The logical width of the canvas. */
  width: number
  /** The logical height of the canvas. */
  height: number
  /** The root `HTMLElement` that will contain the canvas. */
  root: HTMLElement
  /** When `true`, the game pauses when the browser tab loses focus. @default false */
  pauseOnBlur?: boolean
  /** Debug rendering options. */
  testOptions?: Partial<TestOptions>
  /** The default `Theme` for text rendering. */
  theme?: Theme
}

let lastTime = 0
let wakeLock: WakeLockSentinel
let handle = 0
let pauseOnBlur = false

const onFocus = () => {
  if (Game.isRunning.value()) return
  Game.play()
}

const onBlur = () => {
  if (!Game.isRunning.value()) return
  Game.stop()
  if (pauseOnBlur) {
    Game.isPaused.signal.setter(true)
  }
  Game.blurred.emit()
}

let ratio = 1
const onResize = () => {
  ratio = getDPRFromCtx(GameConfig.ctx, GameConfig.width, GameConfig.height, ratio)
  GameConfig.dprRatio = ratio * (window.devicePixelRatio ?? 1)
  GameConfig.ctx.imageSmoothingEnabled = false
}

/**
 * The **`Game`** class is a static singleton that manages the canvas setup, game loop,
 * pause state, and browser lifecycle events (focus/blur/resize).
 *
 * Game loop lifecycle (`play`/`stop`) is separate from pause state (`pause`/`resume`).
 * The loop runs via `requestAnimationFrame`; pausing skips `update` and physics but
 * still renders.
 *
 * @example
 * ```ts
 * import { Game, SceneManager } from 'fraxel'
 *
 * Game.setup({ width: 800, height: 600, root: document.querySelector('#app')! })
 *
 * await SceneManager.addScene('main', scene, true)
 * Game.play()
 *
 * Game.pause()
 * Game.resume()
 *
 * Game.destroy()
 * ```
 */
export class Game {
  static #mounted = false

  /** Whether `Game.setup()` has been called successfully. */
  static get mounted() {
    return this.#mounted
  }

  /**
   * Whether the game loop is running (via `Game.play()`).
   * Read reactively: `Game.isRunning()` returns `true` when the loop is active.
   */
  static isRunning = running

  /**
   * Whether the game is paused. When paused, `update` and physics are skipped
   * but rendering continues.
   * Read reactively: `Game.isPaused()` returns `true` when paused.
   */
  static isPaused = paused

  /**
   * Initializes the canvas, attaches it to `root`, configures DPR scaling,
   * and sets up input and scene management.
   *
   * Does nothing if already mounted.
   *
   * @param options - Canvas and engine configuration.
   */
  static setup(options: SetupOptions) {
    if (this.mounted) return

    pauseOnBlur = options.pauseOnBlur ?? false

    const canvas = document.createElement('canvas')

    options.root.append(canvas)

    const ctx = canvas.getContext('2d')

    if (ctx == null) throw new Context2DNotSupportedError()

    _set_gc({
      canvas: canvas,
      ctx: ctx,
      width: options.width,
      height: options.height,
      testOptions: options.testOptions,
      theme: options.theme ?? new Theme(),
    })

    const width = options.width
    const height = options.height

    canvas.width = width
    canvas.height = height

    options.root.style.setProperty('--width', width.toString())
    options.root.style.setProperty('--height', height.toString())

    window.addEventListener('resize', onResize)
    onResize()

    ctx.imageSmoothingEnabled = false

    SceneManager.setScene(null)

    Input.setup(canvas, vector2(width, height))
    this.#mounted = true
  }

  /**
   * Starts the game loop. Registers blur/focus listeners and begins
   * `requestAnimationFrame` cycle. Throws if not mounted.
   */
  static play() {
    if (!this.mounted) throw new EngineNotSetupError()
    this.isRunning.signal.setter(true)
    window.requestAnimationFrame(this.#transition)
  }

  /**
   * Unpauses the game. `update` and physics resume on the next frame.
   * Throws if not mounted.
   */
  static resume() {
    if (!this.mounted) throw new EngineNotSetupError()
    this.isPaused.signal.setter(false)
  }

  /**
   * Pauses the game. The loop continues rendering but skips `update`
   * and physics. Throws if not mounted.
   */
  static pause() {
    if (!this.mounted) throw new EngineNotSetupError()
    this.isPaused.signal.setter(true)
  }

  /**
   * Stops the game loop entirely (without resetting pause state).
   * The `requestAnimationFrame` cycle is cancelled. Throws if not mounted.
   */
  static stop() {
    if (!this.mounted) throw new EngineNotSetupError()
    window.cancelAnimationFrame(handle)
    Game.isRunning.signal.setter(false)
    wakeLock?.release()
  }

  /**
   * Stops the loop, removes all event listeners (blur/focus/resize),
   * destroys the input system, unloads the current scene, and resets mount state.
   * Throws if not mounted.
   */
  static destroy() {
    if (!this.mounted) throw new EngineNotSetupError()

    this.stop()

    window.removeEventListener('blur', onBlur)
    window.removeEventListener('focus', onFocus)
    window.removeEventListener('resize', onResize)

    Input.destroy()
    SceneManager.setScene(null)

    this.#mounted = false
    this.isPaused.signal.setter(false)
  }

  static #transition = (time: number) => {
    lastTime = time
    window.navigator.wakeLock?.request('screen').then((w) => (wakeLock = w))

    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)

    handle = window.requestAnimationFrame(this.#update)
  }

  static #update = (time: number) => {
    const delta = (time - lastTime) / 1000
    lastTime = time

    Game.#loop(delta)

    if (!this.isRunning.value()) return
    handle = window.requestAnimationFrame(this.#update)
  }

  static #loop(delta: number) {
    const node = SceneManager.currentNode

    if (node) {
      GameConfig.ctx.clearRect(0, 0, GameConfig.width, GameConfig.height)

      if (!node.isStarted) {
        node.start()
      }

      if (!this.isPaused.value()) {
        node.update(delta)
        CollisionSystem.update(delta)
        PhysicsSystem.update(delta)
      }

      const camera = Camera.getCurrent()
      GameConfig.ctx.save()
      camera?.apply(GameConfig.ctx)
      node.draw(delta)
      GameConfig.ctx.restore()
    }

    Input.update()
  }

  /** Fires when the browser tab loses focus. */
  static blurred = new Event('blur', () => {})
  /** Fires when the browser tab gains focus. */
  static focused = new Event('focus', () => {})
}
