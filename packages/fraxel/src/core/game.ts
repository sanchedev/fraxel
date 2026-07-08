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

export interface SetupOptions {
  /** The **`width`** of the canvas. */
  width: number
  /** The **`height`** of the canvas. */
  height: number
  /** The **`root element`**. It will be the parent of the canvas. */
  root: HTMLElement
  /** When `true`, the game pauses on blur and requires manual play to resume. Defaults to `false`. */
  pauseOnBlur?: boolean
  /** The **`testOptions`** of the game. */
  testOptions?: Partial<TestOptions>
  /** The default **`Theme`**. */
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

export class Game {
  /** The read-only **`sceneManager`** property represents the manager of all the scenes. */
  static readonly sceneManager = new SceneManager()

  /**
   * The **`paused`** property indicates whether the game is paused.
   * It is a reactive signal — use `Game.paused()` to read the value.
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
   * The **`setup`** method setups the `Game`.
   * @param options Setup options
   *
   * @example
   * ```ts
   * const root = document.querySelector<HTMLElement>('#root')
   *
   * Game.setup({
   *   width: 160,
   *   height: 90,
   *   root,
   * })
   *
   * // ...
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
   * The **`play`** method plays the `Game`.
   * This method only can called after **`setup`** method.
   * The scenes can be created before or after this method called.
   *
   * @example
   * ```ts
   * Game.setup({
   *   // ...
   * })
   *
   * await Game.sceneManager.addScene(
   *   'main',
   *   new Scene(
   *     async () => (await import('../scenes/main.js')).default,
   *   ),
   *   true
   * )
   *
   * Game.play() // The Game start
   * ```
   */
  static play() {
    if (!setuped) throw new EngineNotSetupError()
    window.requestAnimationFrame(this.#transition)
  }

  /**
   * The **`pause`** method pauses the `Game`. To `resume` use **`play`** method.
   */
  static pause() {
    this.paused = true
    wakeLock?.release()
  }

  /**
   * The **`destroy`** method stops the game loop and cleans up all resources.
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
   * The **`loop`** method manage the game loop.
   * **This method can not be used outside the `Game`.**
   * @param delta Time between this frame and the last frame
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
   * Detects when the `Game` is **blurred**
   */
  static blurred = new Event('blur', () => {})
}
