import { NodeNotInitializedError, NodeTypeMismatchError } from '../../errors/index.js'
import { renderToNodes } from '../../jsx/index.js'
import type { Fraxel } from '../../jsx/types.js'
import type { NodeInstances, PrimaryNode } from '../../nodes/index.js'
import { Signal, type SignalGetter } from '../../reactivity/index.js'
import type { FraxelScript } from '../../scripts/script.js'
import { currentContext, type HookContext } from '../context.js'
import { Trigger } from '../use-trigger.js'

/**
 * The **`NodeReference`** class is the base reference for all node hooks.
 * It provides reactive access to the underlying node instance, lifecycle triggers,
 * and a type-safe script accessor.
 *
 * Created by native hooks like `useSprite()`, `useCollider()`, etc. — not instantiated directly.
 *
 * @typeParam T The `PrimaryNode` type this reference targets
 *
 * @example
 * ```tsx
 * import { useSprite } from 'fraxel/hooks'
 * import { useEffect } from 'fraxel/hooks'
 *
 * function Player() {
 *   const sprite = useSprite()
 *
 *   useEffect(() => {
 *     sprite.started.connect(() => console.log('started'))
 *     sprite.destroyed.connect(() => console.log('destroyed'))
 *   })
 *
 *   return <sprite ref={sprite} textureId={PLAYER} />
 * }
 * ```
 */
export class NodeReference<T extends PrimaryNode = PrimaryNode> {
  #type: T
  #node = new Signal<NodeInstances[T] | null>(null)
  #oldCtx: HookContext[]

  set node(node: NodeInstances[T]) {
    if (node.type !== this.#type) {
      throw new NodeTypeMismatchError(this.#type, node.type)
    }
    this.#node.value = node
  }
  /**
   * The underlying node instance. Throws `NodeNotInitializedError` if accessed before mount.
   */
  get node() {
    if (this.#node.value == null) {
      throw new NodeNotInitializedError(this.#type)
    }
    return this.#node.value
  }
  /**
   * Reactive getter for the node instance. Returns `null` before mount and after destroy.
   * Use inside `useComputed` or `useEffect` to track the node reactively.
   */
  signal: SignalGetter<NodeInstances[T] | null>

  /** Fires when the node starts (first frame). */
  started = new Trigger<[]>()
  /** Fires every frame during draw with the delta time. */
  drawed = new Trigger<[delta: number]>()
  /** Fires every frame during update with the delta time. */
  updated = new Trigger<[delta: number]>()
  /** Fires when the node is destroyed. */
  destroyed = new Trigger<[]>()

  constructor(type: T, onStart?: (node: NodeInstances[T]) => void, onEnd?: () => void) {
    this.#type = type
    this.signal = this.#node.getter

    this.signal.signal.sub((node) => {
      if (node == null) {
        this.started.clear()
        this.drawed.clear()
        this.updated.clear()
        this.destroyed.clear()
        onEnd?.()
      } else {
        node.started.on(this.started.emit)
        node.drawed.on(this.drawed.emit)
        node.updated.on(this.updated.emit)
        node.destroyed.on(this.destroyed.emit)
        onStart?.(node)
      }
    })

    this.#oldCtx = currentContext.slice()
  }

  /**
   * Returns the node's script if it matches the given class. Use to access script-specific methods.
   *
   * @param scriptClass The script class to check against
   * @param noTrack If `true`, accesses the node directly without reactive tracking
   * @returns The script instance if matched, otherwise `undefined`
   *
   * @example
   * ```tsx
   * const sprite = useSprite()
   *
   * useEffect(() => {
   *   const script = sprite.script(PlantScript)
   *   script?.applyDamage(50)
   * })
   * ```
   */
  script<K extends new (...args: any[]) => FraxelScript<T>>(
    scriptClass: K,
    noTrack = false,
  ): InstanceType<K> | undefined {
    const node = !noTrack ? this.signal() : this.node
    if (node?.script == null) return
    if (node.script instanceof scriptClass) return node.script as InstanceType<K>
  }

  /**
   * Spawns a JSX element as a child of the referenced node.
   *
   * @param jsx The JSX element to spawn as a child
   *
   * @example
   * ```tsx
   * import { useGroup, useTrigger } from 'fraxel/hooks'
   *
   * function Container() {
   *   const group = useGroup()
   *
   *   useTrigger(spawnEnemy, () => {
   *     group.spawn(<sprite textureId={ENEMY} position={[0, 0]} />)
   *   })
   *
   *   return <group ref={group} />
   * }
   * ```
   */
  spawn(jsx: Fraxel.Node) {
    const currentCtx = currentContext.slice()

    currentContext.length = 0
    currentContext.push(...this.#oldCtx)

    const nodes = renderToNodes(jsx)
    this.node.addChild(...nodes)

    currentContext.length = 0
    currentContext.push(...currentCtx)
  }
}
