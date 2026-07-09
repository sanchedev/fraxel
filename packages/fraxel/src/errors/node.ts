import { Nodes } from '../nodes/lib/registry.js'
import { FraxelError } from './base.js'

/**
 * The **`NodeError`** class is the base error for all node-related errors.
 * Thrown when an error occurs during node creation, manipulation, or traversal.
 *
 * @example
 * ```ts
 * import { NodeError } from 'fraxel'
 *
 * try {
 *   getNode('InvalidType', {})
 * } catch (e) {
 *   if (e instanceof NodeError) console.error('Node issue:', e.message)
 * }
 * ```
 */
export class NodeError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'NodeError'
  }
}

/**
 * The **`InvalidNodeIdError`** class is thrown when a node ID does not match the required
 * pattern `([a-zA-Z][a-zA-Z0-9-_]*)`. Node IDs must start with a letter and contain
 * only letters, digits, hyphens, and underscores.
 *
 * @example
 * ```ts
 * // Thrown when a node ID starts with a number or contains invalid characters:
 * <transform id="123-invalid" /> // InvalidNodeIdError
 * <transform id="my node" />    // InvalidNodeIdError
 * <transform id="player-1" />   // works
 * ```
 */
export class InvalidNodeIdError extends NodeError {
  constructor(id: string) {
    super(`Invalid node id "${id}". Expected pattern ([a-zA-Z][a-zA-Z0-9-_]*)`)
  }
}

/**
 * The **`NodeChildNotFoundError`** class is thrown when attempting to access a child
 * node at a path that does not exist within a parent node. This occurs when using
 * `getChild()` with a path that doesn't match any descendant.
 *
 * @example
 * ```ts
 * // If a transform has no child at path "player/sprite":
 * transform.getChild('player/sprite') // NodeChildNotFoundError
 * ```
 */
export class NodeChildNotFoundError extends NodeError {
  constructor(path: string) {
    super(`Node child with path "${path}" does not exist`)
  }
}

/**
 * The **`NodeTypeMismatchError`** class is thrown when a node has an unexpected type
 * that does not match the expected type. This commonly happens when a `ref` from a
 * native hook is attached to a different node type than expected.
 *
 * @example
 * ```tsx
 * // Thrown when useSprite() ref is attached to a collider:
 * const sprite = useSprite()
 * <collider ref={sprite} /> // NodeTypeMismatchError: Expected "Sprite" but received "Collider"
 * ```
 */
export class NodeTypeMismatchError extends NodeError {
  constructor(expected: string, received: string) {
    super(`Expected node type "${expected}" but received "${received}"`)
  }
}

/**
 * The **`UnknownNodeTypeError`** class is thrown when attempting to create or reference
 * a node type that is not registered in the node registry. Only types registered via
 * `Nodes` (transform, sprite, collider, etc.) are valid.
 *
 * @example
 * ```ts
 * // Thrown when creating a node with an unregistered type:
 * getNode('CustomWidget', {}) // UnknownNodeTypeError: Unknown node type "CustomWidget"
 * ```
 */
export class UnknownNodeTypeError extends NodeError {
  constructor(type: string) {
    super(`Unknown node type "${type}". Available types: ${Object.keys(Nodes).join(', ')}`)
  }
}

/**
 * The **`InvalidNodeInstanceError`** class is thrown when a value is not a valid Node
 * instance (e.g., `null`, `undefined`, or a non-Node object). This commonly occurs
 * when `renderToNodes` receives invalid JSX or when a parent node is expected but
 * not provided.
 *
 * @example
 * ```ts
 * // Thrown when a non-Node value is used where a Node is expected:
 * renderToNodes(null) // InvalidNodeInstanceError
 * ```
 */
export class InvalidNodeInstanceError extends NodeError {
  constructor(received: unknown) {
    const type =
      received === null
        ? 'null'
        : received === undefined
          ? 'undefined'
          : (received?.constructor?.name ?? typeof received)

    super(`Expected a Node instance but received ${type}`)
  }
}
