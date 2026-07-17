import { pointInShape } from '../../../collision/narrowphase/point-in-shape.js'
import { SceneManager } from '../../../core/scene-manager.js'
import { Pointer } from '../../../input/pointer.js'
import { Vector2 } from '../../../math/vector2.js'
import type { Node } from '../../_node.js'
import { Node2D } from '../_node2d.js'
import type { Draggable } from '../draggable.js'
import type { DropArea, DropAreaEvent } from '../drop-area.js'

/** Identifies compatible draggable and drop area pairs. */
export type DropKey = string | symbol

export class DropAreaSystem {
  static #areas = new Map<Node2D, DropArea>()
  static #hoveredAreas = new Map<Draggable, DropArea>()

  static register(area: DropArea) {
    this.#areas.set(area, area)
  }

  static unregister(area: DropArea) {
    this.#areas.delete(area)
    for (const [draggable, hoveredArea] of this.#hoveredAreas) {
      if (hoveredArea !== area) continue
      this.#hoveredAreas.delete(draggable)
    }
  }

  static update(draggable: Draggable) {
    const nextArea = this.#getTopArea(draggable)
    const previousArea = this.#hoveredAreas.get(draggable) ?? null

    if (nextArea === previousArea) return

    if (previousArea != null) {
      previousArea.onDragLeave.emit(this.#createEvent(draggable, previousArea))
      previousArea.dragHovered = false
    }

    if (nextArea == null) {
      this.#hoveredAreas.delete(draggable)
      return
    }

    this.#hoveredAreas.set(draggable, nextArea)
    nextArea.dragHovered = true
    nextArea.onDragOver.emit(this.#createEvent(draggable, nextArea))
  }

  static drop(draggable: Draggable) {
    const area = this.#hoveredAreas.get(draggable) ?? null
    if (area == null) return

    area.onDrop.emit(this.#createEvent(draggable, area))
    area.onDragLeave.emit(this.#createEvent(draggable, area))
    area.dragHovered = false
    this.#hoveredAreas.delete(draggable)
  }

  static cancel(draggable: Draggable) {
    const area = this.#hoveredAreas.get(draggable) ?? null
    if (area == null) return

    area.onDragLeave.emit(this.#createEvent(draggable, area))
    area.dragHovered = false
    this.#hoveredAreas.delete(draggable)
  }

  static clear() {
    this.#areas.clear()
    this.#hoveredAreas.clear()
  }

  static #getTopArea(draggable: Draggable): DropArea | null {
    const dropKey = draggable.dropKey
    if (dropKey == null) return null

    const root = SceneManager.currentNode
    if (root == null) return null

    let area: DropArea | null = null
    this.#visitInDrawOrder(root, (node) => {
      if (!(node instanceof Node2D)) return

      const candidate = this.#areas.get(node)
      if (candidate == null || candidate.disabled || candidate.dropKey !== dropKey) return
      if (
        !pointInShape(
          Pointer.pointerPosition,
          candidate.globalPosition,
          candidate.globalRotation,
          candidate.shape,
        )
      )
        return

      area = candidate
    })

    return area
  }

  static #createEvent(draggable: Draggable, dropArea: DropArea): DropAreaEvent {
    const globalPointerPosition = new Vector2(Pointer.pointerPosition)

    return {
      draggable,
      dropArea,
      dropKey: dropArea.dropKey,
      data: draggable.dropData,
      position: dropArea.position.clone(),
      globalPosition: dropArea.globalPosition,
      pointerPosition: globalPointerPosition.toSubtracted(dropArea.globalPosition),
      globalPointerPosition,
    }
  }

  static #visitInDrawOrder(node: Node, cb: (node: Node) => void) {
    if (!node.active) return

    cb(node)
    for (const child of node._children) {
      this.#visitInDrawOrder(child, cb)
    }
  }
}
