import { NodeNotInitializedError } from '../errors'
import type { Event } from '../events'
import type { NodeInstances } from '../nodes'
import type { PrimaryNode } from '../nodes/enum'

export abstract class TinyScript<T extends PrimaryNode> {
  #me: NodeInstances[T] | undefined

  get me() {
    if (this.#me == null)
      throw new NodeNotInitializedError('tiny-script-unknown')
    return this.#me
  }

  init(node: NodeInstances[T]) {
    this.#me = node
    node.destroyed.on(() => this.#disconnecteds.forEach((cb) => cb()))
  }

  #disconnecteds: Set<() => void> = new Set()
  connect<T extends Event<any[], string>>(event: T, func: T['exampleFun']) {
    event.on(func)
    this.#disconnecteds.add(() => event.off(func))
  }

  abstract setup(): void
}
