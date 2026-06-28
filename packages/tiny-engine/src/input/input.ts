import { Event } from '../events/event.js'
import { Vector2 } from '../math/vector2.js'

export class Input {
  #currentKeys = new Set<string>()
  #justKeys = new Set<string>()
  #justKeysUnpressed = new Set<string>()

  #mouse = {
    position: new Vector2(0, 0),
    isPressed: false,
  }

  constructor(canvas: HTMLCanvasElement, size: Vector2) {
    const canvasBounding = canvas.getBoundingClientRect()
    const canvasPos = new Vector2(canvasBounding.x, canvasBounding.y)
    const canvasSize = new Vector2(canvasBounding.width, canvasBounding.height)

    window.addEventListener('resize', () => {
      const newCanvasBounding = canvas.getBoundingClientRect()
      canvasSize.x = newCanvasBounding.width
      canvasSize.y = newCanvasBounding.height
      canvasPos.x = newCanvasBounding.x
      canvasPos.y = newCanvasBounding.y
    })

    window.addEventListener('keydown', (ev) => {
      ev.preventDefault()
      const keyString = this.#getKeyString(ev)
      this.#currentKeys.add(keyString)
      this.#justKeys.add(keyString)
    })
    window.addEventListener('keyup', (ev) => {
      ev.preventDefault()
      const keyString = this.#getKeyString(ev)
      this.#justKeysUnpressed.add(keyString)
      this.#currentKeys.delete(keyString)
    })

    window.addEventListener('pointermove', (ev) => {
      const position = new Vector2(
        clamp(0, canvasPos.x - ev.x, size.x),
        clamp(0, canvasPos.y - ev.y, size.y),
      )

      this.#mouse.position.x = position.x
      this.#mouse.position.y = position.y
      this.mouseMoved.emit(position)
    })

    window.addEventListener('pointerdown', () => {
      this.#mouse.isPressed = true
      this.mousePressed.emit()
    })
    window.addEventListener('pointerup', () => {
      this.#mouse.isPressed = false
      this.mouseUnpressed.emit()
    })
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

  get mousePosition() {
    return this.#mouse.position
  }
  get isMousePressed() {
    return this.#mouse.isPressed
  }

  mouseMoved = new Event('mouseMove', (_position: Vector2) => {})
  mousePressed = new Event('mousePress', () => {})
  mouseUnpressed = new Event('mouseUnpress', () => {})

  update() {
    this.#justKeys.clear()
    this.#justKeysUnpressed.clear()
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
