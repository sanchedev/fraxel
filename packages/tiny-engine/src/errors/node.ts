import { Nodes } from '../nodes/registry.js'
import { TinyEngineError } from './base.js'

/**
 * The **`NodeError`** error is thrown when an error occurs during node creation, manipulation, or traversal.
 * @example
 * ```ts
 * // When this happens:
 * throw new NodeError('Node operation failed')
 * ```
 */
export class NodeError extends TinyEngineError {
  constructor(message: string) {
    super(message)
    this.name = 'NodeError'
  }
}

/**
 * The **`InvalidNodeIdError`** error is thrown when a node ID does not match the required pattern `([a-zA-Z][a-zA-Z0-9-_]*)`.
 * @example
 * ```ts
 * // When this happens:
 * throw new InvalidNodeIdError('123-invalid')
 * ```
 */
export class InvalidNodeIdError extends NodeError {
  constructor(id: string) {
    super(`Invalid node id "${id}". Expected pattern ([a-zA-Z][a-zA-Z0-9-_]*)`)
  }
}

/**
 * The **`NodeChildNotFoundError`** error is thrown when attempting to access a child node at a path that does not exist within a parent node.
 * @example
 * ```ts
 * // When this happens:
 * throw new NodeChildNotFoundError('player/sprite')
 * ```
 */
export class NodeChildNotFoundError extends NodeError {
  constructor(path: string) {
    super(`Node child with path "${path}" does not exist`)
  }
}

/**
 * The **`NodeTypeMismatchError`** error is thrown when a node has an unexpected type that does not match the expected type.
 * @example
 * ```ts
 * // When this happens:
 * throw new NodeTypeMismatchError('Sprite', 'Button')
 * ```
 */
export class NodeTypeMismatchError extends NodeError {
  constructor(expected: string, received: string) {
    super(`Expected node type "${expected}" but received "${received}"`)
  }
}

/**
 * The **`UnknownNodeTypeError`** error is thrown when attempting to create or reference a node type that is not registered in the node registry.
 * @example
 * ```ts
 * // When this happens:
 * throw new UnknownNodeTypeError('CustomWidget')
 * ```
 */
export class UnknownNodeTypeError extends NodeError {
  constructor(type: string) {
    super(
      `Unknown node type "${type}". Available types: ${Object.keys(Nodes).join(', ')}`,
    )
  }
}

/**
 * The **`InvalidNodeInstanceError`** error is thrown when a value is not a valid Node instance (e.g., null, undefined, or a non-Node object).
 * @example
 * ```ts
 * // When this happens:
 * throw new InvalidNodeInstanceError(null)
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
