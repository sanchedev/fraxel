import { Vector2 } from '../math/vector2.js'
import { GameConfig } from '../core/game-config.js'
import { Event, getEventName } from '../events/event.js'
import { type NodeEvents, type NodeInstances } from './types.js'
import { Game } from '../core/game.js'
import { Signal } from '../reactivity/signal.js'
import {
  InvalidNodeIdError,
  NodeChildNotFoundError,
  NodeTypeMismatchError,
  UnknownNodeTypeError,
} from '../errors/node.js'
import { getNodeName } from './utils.js'
import { Nodes } from './registry.js'
import type { Fun } from '../events/types.js'

export interface NodeOptions {
  /**
   * The read-only **`id`** property of `Node` represents the node's identifier.
   * It can be used to get this node.
   * It can be not unique.
   * Should match with ([a-zA-Z][a-zA-Z0-9-_]*)
   *
   * @example
   * ```jsx
   * useStart((node) => {
   *   const container = node.getChild('container')
   *   // ...
   * })
   *
   * return (
   *   <node>
   *     <node id='container' />
   *   </node>
   * )
   * ```
   *
   * **`id`** can be used as path.
   *
   * @example
   * ```jsx
   * useStart((node) => {
   *   const child2 = node.getChild('child/child2')
   *   // ...
   * })
   *
   * return (
   *   <node>
   *     <node id='child1'>
   *       <node id='child2' />
   *     </node>
   *   </node>
   * )
   * ```
   */
  id?: string
  /**
   * The **`position`** property of a `Node`.
   * It represents the position in the plane.
   *
   * @example
   * ```jsx
   * useUpdate((node, delta) => {
   *   node.position.x += delta * 20
   *   // ...
   * })
   *
   * return (
   *   <node>
   *     <sprite textureId='ball'>
   *       {
   *        // ...
   *       }
   *     </sprite>
   *   </node>
   * )
   * ```
   */
  position?: Vector2 | Signal<Vector2>
  /**
   * The **`zIndex`** property of a `Node`.
   * It represents the position in Z in the plane.
   *
   * @example
   * ```jsx
   * <node>
   *   <sprite textureId='ball' zIndex={0} />
   *   <sprite textureId='ball-2' zIndex={1} />
   * </node>
   * ```
   */
  zIndex?: number | Signal<number>
  /**
   * The **`deltaIncrease`** property of a `Node` change the speed of self.
   *
   * @example
   * ```jsx
   * useUpdate((node, delta) => {
   *   node.position.x += delta * 20
   * })
   *
   * // Speed x0.5
   * return (
   *   <node deltaIncrease={0.5}>
   *     <Ball />
   *   </node>
   * )
   * ```
   */
  deltaIncrease?: number | Signal<number>
  children?: Node[]
}

/** Default **`id`** for `Node` and it is used for jsx tags */
export const nodeName = 'node'

const idRegEx = /([a-zA-Z][a-zA-Z0-9-_]*)/g

export class Node {
  #id: string
  /**
   * The **`position`** property of a `Node`.
   * It represents the position in the plane.
   *
   * @example
   * ```jsx
   * useUpdate((node, delta) => {
   *   node.position.x += delta * 20
   *   // ...
   * })
   *
   * return (
   *   <node>
   *     <sprite textureId='ball'>
   *       {
   *        // ...
   *       }
   *     </sprite>
   *   </node>
   * )
   * ```
   */
  position: Vector2 = Vector2.ZERO
  #zIndex: number = 0
  _parent?: Node
  _children: Node[] = []
  /**
   * The **`deltaIncrease`** property of a `Node` change the speed of self.
   *
   * @example
   * ```jsx
   * useUpdate((node, delta) => {
   *   node.position.x += delta * 20
   * })
   *
   * // Speed x0.5
   * return (
   *   <node deltaIncrease={0.5}>
   *     <Ball />
   *   </node>
   * )
   * ```
   */
  deltaIncrease: number = 1

  // States
  /**
   * The **`isStarted`** property of the `Node` indicates whether the node is started.
   */
  isStarted: boolean = false
  /**
   * The **`isDestroyed`** property of the `Node` indicates whether the node is destroyed.
   */
  isDestroyed: boolean = false

  constructor({ id, position, zIndex, deltaIncrease, children }: NodeOptions) {
    if (id) {
      const matches = id.match(idRegEx)
      if (matches == null || matches.length !== 1 || matches[0] !== id) {
        throw new InvalidNodeIdError(
          'The id ' + id + ' does not matches with `([a-zA-Z][a-zA-Z0-9-_]*)`',
        )
      }
    }

    this.#id = id ?? nodeName
    if (position != null) {
      if (position instanceof Signal) {
        this.position = position.value
        position.subscribe((val) => (this.position = val))
      } else {
        this.position = position
      }
    }
    if (zIndex != null) {
      if (zIndex instanceof Signal) {
        this.#zIndex = zIndex.value
        zIndex.subscribe((val) => (this.zIndex = val))
      } else {
        this.#zIndex = zIndex
      }
    }
    if (deltaIncrease != null) {
      if (deltaIncrease instanceof Signal) {
        this.deltaIncrease = deltaIncrease.value
        deltaIncrease.subscribe((val) => (this.deltaIncrease = val))
      } else {
        this.deltaIncrease = deltaIncrease
      }
    }
    this._children.push(...(children ?? []))
  }

  /**
   * The read-only **`id`** property of `Node` represents the node's identifier.
   * It can be used to get this node.
   * It can be not unique.
   * Should match with ([a-zA-Z][a-zA-Z0-9-_]*)
   *
   * @example
   * ```jsx
   * useStart((node) => {
   *   const container = node.getChild('container')
   *   // ...
   * })
   *
   * return (
   *   <node>
   *     <node id='container' />
   *   </node>
   * )
   * ```
   *
   * **`id`** can be used as path.
   *
   * @example
   * ```jsx
   * useStart((node) => {
   *   const child2 = node.getChild('child/child2')
   *   // ...
   * })
   *
   * return (
   *   <node>
   *     <node id='child1'>
   *       <node id='child2' />
   *     </node>
   *   </node>
   * )
   * ```
   */
  get id() {
    return this.#id
  }

  /**
   * The read-only **`parent`** property returns the parent of a specified `Node`.
   *
   * @example
   * ```jsx
   * useStart((node) => {
   *   const parent = node.parent
   *   parent?.destroy()
   *   // ...
   * })
   *
   * return (
   *   <node>
   *     <node id='container' />
   *   </node>
   * )
   * ```
   */
  get parent() {
    return this._parent
  }

  /**
   * The read-only **`children`** property returns the child `Node`s.
   *
   * @example
   * ```jsx
   * useStart((node) => {
   *   const children = node.children
   *   console.log(children) // [Node]
   *   // ...
   * })
   *
   * return (
   *   <node>
   *     <node id='container' />
   *   </node>
   * )
   * ```
   */
  get children() {
    return this._children
  }

  /**
   * Gets or sets the **`globalPosition`** of the `Node`.
   */
  set globalPosition(value) {
    this.position = value.toSubtracted(
      this._parent?.globalPosition ?? Vector2.ZERO,
    )
  }
  get globalPosition(): Vector2 {
    if (this._parent) {
      return this.position.toAdded(this._parent.globalPosition)
    }
    return this.position
  }
  /**
   * Gets or sets the **`zIndex`** of the `Node`.
   */
  set zIndex(value: number) {
    if (value === this.#zIndex) return
    this.zIndexChanged.emit(value)
    this.#zIndex = value
  }
  get zIndex(): number {
    return this.#zIndex
  }
  /**
   * Gets or sets the **`globalZIndex`** of the `Node`.
   */
  set globalZIndex(value) {
    if (this._parent == null) this.zIndex = value
    else this.zIndex = value - this._parent.globalZIndex
  }
  get globalZIndex(): number {
    if (this._parent == null) return this.zIndex
    return this.zIndex + this._parent.globalZIndex
  }
  /**
   * Gets or sets the **`globalDeltaIncrease`** of the `Node`.
   */
  set globalDeltaIncrease(value) {
    if (this._parent == null) this.deltaIncrease = value
    else this.deltaIncrease = value / this._parent.globalDeltaIncrease
  }
  get globalDeltaIncrease(): number {
    if (this._parent == null) return this.deltaIncrease
    return this.deltaIncrease * this._parent.globalDeltaIncrease
  }

  // Methods
  /**
   * Returns the first element that is a descendant of this `Node` that matches path.
   *
   * If `path` is undefined then the method will return the first node with type `nodeType`.
   *
   * @param options Options to filter nodes
   * @returns Returns the node or throw an error.
   *
   * @example
   * **Without path**
   * ```ts
   * const sprite = node.getChild({ nodeType: 'sprite' })
   * ```
   *
   * @example
   * **With relative path**
   * ```ts
   * const gun = node.getChild({ nodeType: 'sprite', path: 'gun' })
   * ```
   * ```ts
   * const ball = node.getChild({ nodeType: 'sprite', path: '../ball' })
   * ```
   *
   * @example
   * **With absolute path**
   * ```ts
   * const mainNode = node.getChild({ nodeType: 'sprite', path: '/' })
   * ```
   * ```ts
   * const box = node.getChild({ nodeType: 'node', path: '/box' })
   * ```
   */
  getChild<T extends keyof NodeInstances>(options: {
    nodeType: T
    path?: string
  }): NodeInstances[T] {
    const { nodeType, path } = options

    if (!(nodeType in Nodes)) {
      throw new UnknownNodeTypeError(nodeType)
    }

    let node: Node | undefined

    if (path != null) {
      const pathSplitted = path.split('/')
      if (path.startsWith('/')) {
        node = Game.sceneManager.currentNode ?? undefined
        pathSplitted.shift()
      } else {
        node = this
      }

      for (let i = 0; i < pathSplitted.length; i++) {
        if (node == null) break
        const n = pathSplitted[i]
        if (n === '' && i === pathSplitted.length - 1) break
        if (n === '.') {
          continue
        }
        if (n === '..') {
          node = node.parent
          continue
        }
        node = node._children.find((node) => node.id === n)
      }
    } else {
      node = this.children.find((node) => node instanceof Nodes[nodeType])
    }

    if (node == null) {
      if (path) {
        throw new NodeChildNotFoundError(path)
      } else {
        throw new NodeTypeMismatchError(nodeType, 'undefined')
      }
    }

    if (!(node instanceof Nodes[nodeType])) {
      throw new NodeTypeMismatchError(nodeType, getNodeName(node))
    }
    return node as NodeInstances[T]
  }

  /**
   * Add child to this `Node`
   * @param child Child to add
   */
  addChild(...childs: Node[]) {
    for (const child of childs) {
      this.#attachChild(child)
      this._children.push(child)
      if (this.isStarted) {
        child.start()
      }
    }
    this.#sortChildren()
  }

  #attachChild(child: Node) {
    child._parent = this
    child.zIndexChanged.on(() => {
      this.#sortChildren()
    })
  }
  #sortChildren() {
    this._children.sort((a, b) => a.globalZIndex - b.globalZIndex)
  }

  // Tools to develop custom nodes
  /**
   * The **`build`** method can be used to place nodes in the children when you create a custom node by extending the `Node` class. It is called before the start of the node.
   *
   * @example
   * ```ts
   * class CustomNode extends Node {
   *   build() {
   *     return [
   *       new Node({ id: 'child1' }),
   *       new Node({ id: 'child2' }),
   *     ]
   *   }
   * }
   * ```
   *
   * If you are using jsx, you can use it like this:
   * ```jsx
   * import { renderToNodes } from 'tiny-engine/jsx'
   *
   * class CustomNode extends Node {
   *   build() {
   *     return renderToNodes(
   *       <>
   *         <node id='child1' />
   *         <node id='child2' />
   *       </>
   *     )
   *   }
   * }
   * ```
   *
   * The `build` method can return a `Node` or an array of `Node`s. If it returns a `Node`, it will be added as a child of the current node. If it returns an array of `Node`s, all of them will be added as children of the current node.
   *
   * @returns A `Node` or an array of `Node`s to be added as children of the current node.
   */
  build?(): Node | Node[]

  // Events
  zIndexChanged = new Event('zIndexChange', (zIndex: number) => {})
  started = new Event('start', () => {})
  drawed = new Event('draw', (delta: number) => {})
  updated = new Event('update', (delta: number) => {})
  destroyed = new Event('destroy', () => {})

  // Event functions
  onZIndexChange?(zIndex: number) {}
  onStart?() {}
  onDraw?(delta: number) {}
  onUpdate?(delta: number) {}
  onDestroy?() {}

  // Lifecycle methods
  start(): void {
    if (this.isStarted) return

    // If build method is defined, build the node and add the built nodes as children
    const built = this.build?.()
    if (built instanceof Node) {
      this.addChild(built)
    } else if (Array.isArray(built)) {
      this.addChild(...built)
    }

    // Attach events
    const events = Object.keys(this)
      .filter((key) => this[key as keyof this] instanceof Event)
      .map((key) => this[key as keyof this]) as Event<any, string>[]

    for (const event of events) {
      const key = getEventName(event.baseName)
      if (this[key as keyof this] == null) continue
      const cb = this[key as keyof this] as Fun<any[]>
      event.on(cb.bind(this))
    }

    for (const child of this._children) {
      this.#attachChild(child)
    }
    this.isStarted = true
    this.#sortChildren()

    for (const node of this._children) {
      node.start()
    }
    this.started.emit()
  }
  update(delta: number): void {
    this.updated.emit(delta)
    for (const node of this._children) {
      node.update(delta * node.deltaIncrease)
    }
  }
  draw(delta: number): void {
    this.drawed.emit(delta)
    for (const node of this._children) {
      GameConfig.ctx.translate(this.position.x, this.position.y)
      GameConfig.translate.add(this.position)
      node.draw(delta * node.deltaIncrease)
      GameConfig.translate.subtract(this.position)
      GameConfig.ctx.translate(-this.position.x, -this.position.y)
    }
  }

  /**
   * The **`destroy`** method destroys and cleans this node.
   */
  destroy() {
    if (this.isDestroyed) return

    const q = this._parent != null ? this._parent._children : []

    const index = q.indexOf(this)
    if (index < 0) return
    q.splice(index, 1)

    this.isDestroyed = true
    this.destroyed.emit()

    this.cleanEvents()

    for (const node of [...this._children]) {
      node.destroy()
    }
  }

  /**
   * The **`cleanEvents`** method cleans all event listeners of this node.
   * It is called when the node is destroyed, but you can call it manually if you want to clean the events without destroying the node.
   * @example
   * ```ts
   * const node = new Node()
   * node.started.on(() => {
   *   console.log('Node started')
   * })
   *
   * node.cleanEvents() // Now the listener is removed, so it won't log 'Node started' when the node starts.
   *
   * node.start() // No log
   * ```
   */
  cleanEvents() {
    this.started.clean()
    this.drawed.clean()
    this.updated.clean()
    this.destroyed.clean()
  }
}

Nodes.node = Node
