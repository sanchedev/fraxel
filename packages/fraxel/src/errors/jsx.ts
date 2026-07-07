import { Node } from '../nodes/_node.js'
import { FraxelError } from './base.js'

/**
 * The **`JSXError`** class is the base error for all JSX-related errors.
 */
export class JSXError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'JSXError'
  }
}

/**
 * The **`InvalidJSXElementTypeError`** class is thrown when a JSX element has an invalid type.
 */
export class InvalidJSXElementTypeError extends JSXError {
  constructor(type: unknown) {
    super(
      `Invalid JSX element type: ${String(type)}. Expected a Node type, intrinsic element, or component.`,
    )
  }
}

/**
 * The **`UnknownIntrinsicElementError`** class is thrown when a JSX intrinsic element is not recognized.
 */
export class UnknownIntrinsicElementError extends JSXError {
  constructor(name: string) {
    super(`Unknown intrinsic element "${name}"`)
  }
}

/**
 * The **`InvalidRefAttributeError`** class is thrown when a `ref` attribute receives an invalid value.
 */
export class InvalidRefAttributeError extends JSXError {
  constructor(received: unknown) {
    const type =
      received instanceof Node ? 'Node instance' : received === null ? 'null' : typeof received

    super(
      `Invalid value for "ref" attribute. Expected a proxy returned by useNode(), but received ${type}.`,
    )
  }
}

/**
 * The **`MissingGameRootError`** class is thrown when `createGame` is called without a valid root element.
 */
export class MissingGameRootError extends JSXError {
  constructor() {
    super('createGame requires a valid "root" HTMLElement.')
  }
}

/**
 * The **`InvalidGameElementError`** class is thrown when the JSX passed to `createGame` is not a Game component.
 */
export class InvalidGameElementError extends JSXError {
  constructor() {
    super('The jsx passed to createGame must be a Game component.')
  }
}

/**
 * The **`MissingSceneError`** class is thrown when a Game component has no Scene children.
 */
export class MissingSceneError extends JSXError {
  constructor() {
    super('The Game component requires Scene components as children.')
  }
}

/**
 * The **`InvalidSceneComponentError`** class is thrown when a Scene's `component` prop is not a valid function.
 */
export class InvalidSceneComponentError extends JSXError {
  constructor() {
    super('Scene `component` must be a sync or async function returning a Node.')
  }
}
