import { NodeNotInitializedError } from '../errors'
import type { Event } from '../events'
import type { Node, NodeInstances } from '../nodes'
import type { PrimaryNode } from '../nodes/lib/enum'

/**
 * The **`TinyScript`** abstract class separates game logic from rendering.
 * Attach a script to a node via the `script` prop to run logic independently
 * of the JSX component tree.
 *
 * @typeParam T The `PrimaryNode` type this script is attached to.
 *
 * @example
 * ```ts
 * class PlayerScript extends TinyScript<PrimaryNode.Transform> {
 *   health = 100
 *
 *   setup() {
 *     this.connect('started', () => {
 *       console.log('Player spawned!')
 *     })
 *   }
 *
 *   applyDamage(amount: number) {
 *     this.health -= amount
 *     if (this.health <= 0) this.me.destroy()
 *   }
 * }
 * ```
 */
export abstract class TinyScript<T extends PrimaryNode> {
  #me: NodeInstances[T] | undefined

  /**
   * The read-only **`me`** property returns the node this script is attached to.
   * Throws `NodeNotInitializedError` if accessed before `init()` is called.
   */
  get me() {
    if (this.#me == null) throw new NodeNotInitializedError('tiny-script-unknown')
    return this.#me
  }

  /**
   * Initializes the script by binding it to a node.
   * Called automatically by the `Node` constructor when a `script` option is provided.
   * @param node The node instance to attach this script to.
   */
  init(node: NodeInstances[T]) {
    this.#me = node
  }

  /**
   * The **`connect`** method subscribes to a node event by name.
   * Provides type-safe event subscription based on the node's event map.
   *
   * @param ev The event name to subscribe to (e.g. `'started'`, `'destroyed'`, `'updated'`).
   * @param func The callback to invoke when the event fires.
   *
   * @example
   * ```ts
   * setup() {
   *   this.connect('started', () => {
   *     console.log('Node started!')
   *   })
   *
   *   this.connect('destroyed', () => {
   *     console.log('Node destroyed!')
   *   })
   *
   *   this.connect('updated', (delta) => {
   *     console.log('Delta:', delta)
   *   })
   * }
   * ```
   */
  connect<K extends keyof NodeEvent<NodeInstances[T]>>(ev: K, func: EventFrom<T, K>['exampleFun']) {
    const event = this.me[ev] as EventFrom<T, K>
    event.on(func)
  }

  /**
   * The **`setup`** method is called once when the script is initialized.
   * Override this to register event listeners, initialize state, or set up
   * subscriptions that should persist for the node's lifetime.
   */
  abstract setup(): void
}

type NodeEvent<T extends Node> = {
  [Q in keyof T as GetEvent<T, Q> extends undefined ? never : Q]: T[Q]
}

type GetEvent<T extends Node, K extends keyof T> =
  T[K] extends Event<any[], string> ? T[K] : undefined

type EventFrom<T extends PrimaryNode, K extends keyof NodeInstances[T]> = NonNullable<
  GetEvent<NodeInstances[T], K>
>
