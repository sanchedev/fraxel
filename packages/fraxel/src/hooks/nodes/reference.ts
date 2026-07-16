import { NodeNotInitializedError, NodeTypeMismatchError } from '../../errors/index.js'
import { Trigger } from '../../events/trigger.js'
import { renderToNodes } from '../../jsx/index.js'
import type { Fraxel } from '../../jsx/types.js'
import { GameMode, type NodeInstances, type PrimaryNode } from '../../nodes/index.js'
import { Signal, type SignalGetter, type SignalSetter } from '../../reactivity/index.js'
import type { FraxelScript } from '../../scripts/script.js'
import { currentContext, type HookContext } from '../context.js'

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
 * import { useSprite } from 'fraxel'
 * import { useEffect } from 'fraxel'
 *
 * function Player() {
 *   const sprite = useSprite()
 *
 *   useEffect(() => {
 *     sprite.onStart.connect(() => console.log('started'))
 *     sprite.onDestroy.connect(() => console.log('destroyed'))
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
  onStart = new Trigger<[]>()
  /** Fires every frame during draw with the delta time. */
  onDraw = new Trigger<[delta: number]>()
  /** Fires every frame during update with the delta time. */
  onUpdate = new Trigger<[delta: number]>()
  /** Fires when the node is destroyed. */
  onDestroy = new Trigger<[]>()

  /** Reactive game mode getter. Updates every frame. */
  gameMode = new Signal(GameMode.INHERIT).getter
  /** Sets how this node updates relative to the game's pause state. */
  setGameMode: SignalSetter<GameMode> = (mode) => (this.node.gameMode = mode)

  constructor(type: T, onStart?: (node: NodeInstances[T]) => void, onEnd?: () => void) {
    this.#type = type
    this.signal = this.#node.getter

    this.signal.signal.sub((node) => {
      if (node == null) {
        onEnd?.()
        this.gameMode.signal.clearSubs()
      } else {
        this.onStart.link(node.onStart)
        this.onDraw.link(node.onDraw)
        this.onUpdate.link(node.onUpdate)
        this.onDestroy.link(node.onDestroy)
        this.gameMode.signal.setter(node.gameMode)
        node.onUpdate.connect(() => {
          this.gameMode.signal.setter(node.gameMode)
        })
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
   * import { useGroup, useTrigger } from 'fraxel'
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
