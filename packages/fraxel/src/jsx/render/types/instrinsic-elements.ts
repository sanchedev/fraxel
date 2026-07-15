import { type NodeInstances } from '../../../nodes/lib/types.js'
import { Nodes } from '../../../nodes/lib/registry.js'
import type { IntrinsicElement } from '../../types.js'
import type { PrimaryNode } from '../../../nodes/lib/enum.js'
import { Trigger } from '../../../events/trigger.js'

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
  for (const key in node) {
    if (!Object.hasOwn(node, key)) continue

    const el = node[key]

    if (el instanceof Trigger) {
      const fn = opts[key as keyof typeof opts]
      if (typeof fn !== 'function') continue
      el.connect(fn)
    }
  }
}
