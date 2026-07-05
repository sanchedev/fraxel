import { SceneManager } from './scene-manager.js'
import { Theme } from './theme.js'
import { _set_gc, GameConfig, type TestOptions } from './game-config.js'
import { getDPRFromCtx } from '../utils/dpr.js'
import { Event } from '../events/event.js'
import { Context2DNotSupportedError } from '../errors/env.js'
import { EngineNotSetupError } from '../errors/lifecycle.js'
import { Input, type InputOptions } from '../input/input.js'
import { Vector2 } from '../math/vector2.js'
import { CollisionSystem } from '../collision/collision-system.js'
import { PhysicsSystem } from '../collision/physics/physics-system.js'

interface SetupOptions {
  /** The **`width`** of the canvas. */
  width: number
  /** The **`height`** of the canvas. */
  height: number
  /** The **`root element`**. It will be the parent of the canvas. */
  root: HTMLElement
  /** The **`testOptions`** of the game. */
  testOptions?: Partial<TestOptions>
  /** The defualt **`Theme`**. */
  theme?: Theme
  /** The **`inputOptions`** of the game. */
  inputOptions?: InputOptions
}

let isPaused = false
let lastTime = 0
let wakeLock: WakeLockSentinel
let handle = 0
let setuped = false

const onBlur = () => {
  if (isPaused) return

  Game.pause()
  Game.blured.emit()
  window.cancelAnimationFrame(handle)
}

export class Game {
  /** The read-only **`sceneManager`** property represents the manager of all the scenes. */
  static readonly sceneManager = new SceneManager()

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

    Game.input = new Input(canvas, new Vector2(width, height), options.inputOptions)
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
    isPaused = true
    wakeLock?.release()
  }

  /**
   * The **`destroy`** method stops the game loop and cleans up all resources.
   */
  static destroy() {
    if (!setuped) return

    window.cancelAnimationFrame(handle)
    window.removeEventListener('blur', onBlur)

    Game.input.destroy()
    this.sceneManager.setScene(null)

    wakeLock?.release()
    setuped = false
    isPaused = false
  }

  static #transition = (time: number) => {
    isPaused = false
    lastTime = time
    window.navigator.wakeLock.request('screen').then((w) => (wakeLock = w))

    window.addEventListener('blur', onBlur)

    handle = window.requestAnimationFrame(this.#update)
  }

  static #update = (time: number) => {
    const delta = (time - lastTime) / 1000
    lastTime = time

    Game.loop(delta)

    if (isPaused) return
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

      node.update(delta)
      CollisionSystem.update(delta)
      PhysicsSystem.update(delta)
      node.draw(delta)
    }

    Game.input.update()
  }

  static input: Input

  /**
   * Detects whether the `Game` is **blured**
   */
  static blured = new Event('blur', () => {})
}
