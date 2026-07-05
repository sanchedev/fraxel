import { type NodeInstances } from '../../../nodes/lib/types.js'
import { Nodes } from '../../../nodes/lib/registry.js'
import { Event, getEventName } from '../../../events/event.js'
import type { IntrinsicElement } from '../../types.js'
import type { PrimaryNode } from '../../../nodes/lib/enum.js'

export function isIntrinsicElement(obj: any): obj is PrimaryNode {
  if (typeof obj !== 'string') return false
  if (!(obj in Nodes)) return false
  return true
}

export function applyIntrinsicAttributesToNode<T extends PrimaryNode>(
  node: NodeInstances[T],
  opts: IntrinsicElement<T>,
): NodeInstances[T] {
  if (opts.ref) {
    opts.ref.node = node
  }

  applyEvents(node, opts)

  return node
}

function applyEvents<T extends PrimaryNode>(node: NodeInstances[T], opts: IntrinsicElement<T>) {
  const events: Map<string, Event<any[], string>> = new Map()

  for (const key in node) {
    if (!Object.hasOwn(node, key)) continue

    const el = node[key]

    if (el instanceof Event) {
      const k = getEventName(el.baseName)
      events.set(k, el)
    }
  }

  for (const key in opts) {
    if (!Object.hasOwn(opts, key)) continue

    const fn = opts[key as keyof typeof opts]

    if (typeof fn !== 'function') continue

    const ev = events.get(key)

    if (ev == null) continue

    ev.on(fn as (typeof ev)['exampleFun'])
  }
}
