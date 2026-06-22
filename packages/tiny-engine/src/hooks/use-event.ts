import { InvalidEventHookResultError } from '../errors/hook.js'
import { Event } from '../events/event.js'
import type { Fun } from '../events/types.js'
import type { PrimaryNode } from '../nodes/enum.js'
import type { NodeInstances } from '../nodes/types.js'
import { pushEffect } from './context.js'
import type { NodeReference } from './use-ref-node.js'

/**
 * The **`useEvent`** hook subscribes to an event on a node reference.
 *
 * @param node A `NodeReference` to the node that emits the event
 * @param eventName The name of the event to subscribe to
 * @param listener The callback function to call when the event is emitted
 *
 * @example
 * ```tsx
 * const sprite = useRefNode(PrimaryNode.Sprite)
 *
 * useEvent(sprite, 'started', () => {
 *   console.log('Sprite started!')
 * })
 *
 * return <sprite ref={sprite} />
 * ```
 */
export function useEvent<N extends PrimaryNode, K extends keyof Events<N>>(
  node: NodeReference<N>,
  eventName: K,
  listener: Events<N>[K],
) {
  pushEffect('useEvent', () => {
    const ev = node.node[eventName]
    if (!(ev instanceof Event)) throw new InvalidEventHookResultError()
    ev.on(listener)
  })
}

type GetEvent<T> = T extends Event<infer P, string> ? Fun<P> : Fun<[]>

type Events<T extends PrimaryNode> = {
  [P in keyof NodeInstances[T] as NodeInstances[T][P] extends Event<
    any[],
    string
  >
    ? P
    : never]: GetEvent<NodeInstances[T][P]>
}
