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
import { getPaused, setPaused } from './paused.js'
import type { SignalGetter } from '../reactivity/types.js'

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
let setuped = false
let pauseOnBlur = false

const onBlur = () => {
  window.cancelAnimationFrame(handle)
  if (pauseOnBlur) {
    Game.paused = true
  }
  Game.blurred.emit()
}

/**
 * The **`Game`** class is a static singleton that manages the game loop, canvas setup,
 * pause state, and scene lifecycle. All methods are static.
 *
 * @example
 * ```ts
 * import { Game } from 'fraxel'
 *
 * Game.setup({
 *   width: 800,
 *   height: 600,
 *   root: document.querySelector('#root')!,
 * })
 *
 * Game.play()
 * ```
 */
export class Game {
  /** The read-only **`sceneManager`** property returns the scene manager instance. */
  static readonly sceneManager = new SceneManager()

  /**
   * The **`paused`** property indicates whether the game is paused.
   * It is a reactive signal — use `Game.paused()` to read the value.
   *
   * @example
   * ```ts
   * const isPaused = Game.paused() // reactive boolean
   * Game.paused = true             // pause the game
   * Game.paused = false            // resume the game
   * ```
   */
  static get paused(): SignalGetter<boolean> {
    return getPaused()
  }
  static set paused(value: boolean) {
    setPaused(value)
  }

  static #onFocus = () => {
    if (!Game.paused()) {
      window.requestAnimationFrame(this.#transition)
    }
  }

  /**
   * The **`setup`** method initializes the game engine. Creates the canvas, sets up
   * the rendering context, configures input, and applies theme/options. Throws
   * `Context2DNotSupportedError` if the browser doesn't support Canvas 2D.
   *
   * @param options Setup options.
   *
   * @example
   * ```ts
   * import { Game } from 'fraxel'
   *
   * Game.setup({
   *   width: 160,
   *   height: 90,
   *   root: document.querySelector('#root')!,
   *   pauseOnBlur: true,
   * })
   * ```
   */
  static setup(options: SetupOptions) {
    if (setuped) return

    pauseOnBlur = options.pauseOnBlur ?? false

    const canvas = document.createElement('canvas')

    options.root.append(canvas)

    const ctx = canvas.getContext('2d')

    if (ctx == null) throw new Context2DNotSupportedError()

    setuped = true
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

    let ratio = 1
    const handleResize = () => {
      ratio = getDPRFromCtx(ctx, width, height, ratio)
      ctx.imageSmoothingEnabled = false
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    ctx.imageSmoothingEnabled = false

    this.sceneManager.setScene(null)

    Input.setup(canvas, vector2(width, height))
  }

  /**
   * The **`play`** method starts the game loop. Must be called after `setup()`.
   * Scenes can be added before or after calling this method.
   *
   * @example
   * ```ts
   * Game.setup({ width: 800, height: 600, root })
   *
   * await Game.sceneManager.addScene(
   *   'main',
   *   new Scene(async () => (await import('./scenes/main.js')).default),
   *   true,
   * )
   *
   * Game.play()
   * ```
   */
  static play() {
    if (!setuped) throw new EngineNotSetupError()
    window.requestAnimationFrame(this.#transition)
  }

  /**
   * The **`pause`** method pauses the game loop. To resume, call `play()`.
   */
  static pause() {
    this.paused = true
    wakeLock?.release()
  }

  /**
   * The **`destroy`** method stops the game loop, removes all event listeners,
   * and cleans up resources. Must be called when the game is no longer needed.
   */
  static destroy() {
    if (!setuped) return

    window.cancelAnimationFrame(handle)
    window.removeEventListener('blur', onBlur)
    window.removeEventListener('focus', this.#onFocus)

    Input.destroy()
    this.sceneManager.setScene(null)

    wakeLock?.release()
    setuped = false
    this.paused = false
  }

  static #transition = (time: number) => {
    lastTime = time
    window.navigator.wakeLock.request('screen').then((w) => (wakeLock = w))

    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', this.#onFocus)

    handle = window.requestAnimationFrame(this.#update)
  }

  static #update = (time: number) => {
    const delta = (time - lastTime) / 1000
    lastTime = time

    Game.loop(delta)

    if (this.paused()) return
    handle = window.requestAnimationFrame(this.#update)
  }

  /**
   * The **`loop`** method runs one frame of the game loop. Handles node lifecycle,
   * collision detection, physics simulation, and camera rendering.
   * **This method should not be called directly.**
   *
   * @param delta Time between this frame and the last frame in seconds.
   *
   * @internal
   */
  static loop(delta: number) {
    const node = this.sceneManager.currentNode

    if (node) {
      GameConfig.ctx.clearRect(0, 0, GameConfig.width, GameConfig.height)

      if (!node.isStarted) {
        node.start()
      }

      if (!this.paused()) {
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

  /**
   * The **`blurred`** event fires when the browser tab loses focus.
   * If `pauseOnBlur` is enabled, the game is automatically paused before this event fires.
   */
  static blurred = new Event('blur', () => {})
}
