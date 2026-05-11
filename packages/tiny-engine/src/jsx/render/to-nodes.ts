import { getNode } from '../../nodes/registry.js'
import { Node } from '../../nodes/node.js'
import type { Tiny } from '../types'
import {
  applyIntrinsicAttributesToNode,
  isIntrinsicElement,
} from './types/instrinsic-elements.js'
import {
  InvalidJSXElementTypeError,
  UnknownIntrinsicElementError,
} from '../../errors/jsx.js'
import type { NodeInstances, NodeName } from '../../nodes/types.js'
import { finishHooks, startHooks } from '../../hooks/context.js'
import { isClassComponent } from './types/class-component.js'

/**
 * The **`renderToNodes`** function takes a JSX element and converts it into an array of nodes that can be rendered in the game. It handles intrinsic elements (like 'node') and functional components, recursively processing any children elements as well.
 * @param jsx The JSX element to be rendered into nodes. This can be a string, number, intrinsic element, functional component, or an array of JSX elements.
 * @returns An array of nodes that have been rendered from the provided JSX element. If the input is null or undefined, it returns an empty array. If the input is a string or number, it also returns an empty array, as these types are not directly renderable as nodes.
 */
export function renderToNodes(jsx: Tiny.Node): Node[] {
  if (jsx == null) return []

  if (typeof jsx === 'string') return []
  if (typeof jsx === 'number') return []
  if (jsx instanceof Node) return [jsx]

  if ('type' in jsx) {
    if (typeof jsx.type === 'string') {
      if (jsx.type === '') {
        return renderToNodes(jsx.props.children) // Fragment
      }
      if (!isIntrinsicElement(jsx.type))
        throw new UnknownIntrinsicElementError(jsx.type)
      return [renderIntrinsicElement(jsx.type, jsx.props)]
    }
    if (typeof jsx.type === 'function') {
      if (isClassComponent(jsx.type)) {
        return [new jsx.type(jsx.props)].filter(
          (node): node is Node => node instanceof Node,
        )
      }
      return renderFuncComponent(jsx.type, jsx.props)
    }
    throw new InvalidJSXElementTypeError(jsx.type)
  }

  const arr = Array.from(jsx)

  return arr.map((jsx) => renderToNodes(jsx)).flat()
}

function renderIntrinsicElement<T extends NodeName>(
  nodeName: T,
  options: Tiny.IntrinsicElements[T],
): NodeInstances[T] {
  const node = getNode<'node'>(nodeName as 'node', {
    ...options,
    children: renderToNodes(options.children),
  }) as NodeInstances[T]

  return applyIntrinsicAttributesToNode(node, options)
}

function renderFuncComponent<T extends (...args: any) => any>(
  func: T,
  props: Parameters<T>[0],
) {
  startHooks()
  const node = renderToNodes(func(props))
  finishHooks(node)
  return node
}
