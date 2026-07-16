import { type Region, region, type Vector2, vector2 } from '../math'

export class Viewport {
  static #mounted = false
  static get mounted() {
    return this.#mounted
  }

  static #canvasRegion: Region = region(0, 0)
  static #viewportSize: Vector2 = vector2(0)
  static get canvasRegion(): Readonly<Region> {
    return this.#canvasRegion
  }
  static get viewportSize(): Readonly<Vector2> {
    return this.#viewportSize
  }

  static #handleResize: () => void = () => {}
  static #canvas: HTMLCanvasElement | null = null

  static mount(canvas: HTMLCanvasElement, size: Vector2) {
    if (this.#mounted) return

    this.#canvas = canvas
    this.refresh()
    this.#viewportSize.x = size.x
    this.#viewportSize.y = size.y

    this.#handleResize = () => this.refresh()

    window.addEventListener('resize', this.#handleResize)
    this.#mounted = true
  }

  static unmount() {
    if (!this.#mounted) return

    window.removeEventListener('resize', this.#handleResize)
    this.#canvas = null
    this.#mounted = false
  }

  static refresh() {
    if (this.#canvas == null) return

    const canvasBounding = this.#canvas.getBoundingClientRect()
    this.#canvasRegion.offset.x = canvasBounding.x
    this.#canvasRegion.offset.y = canvasBounding.y
    this.#canvasRegion.size.x = canvasBounding.width
    this.#canvasRegion.size.y = canvasBounding.height
  }
}
