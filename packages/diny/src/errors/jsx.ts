import { Node } from '../nodes/_node.js'
import { DinyError } from './base.js'

export class JSXError extends DinyError {
  constructor(message: string) {
    super(message)
    this.name = 'JSXError'
  }
}

export class InvalidJSXElementTypeError extends JSXError {
  constructor(type: unknown) {
    super(
      `Invalid JSX element type: ${String(type)}. Expected a Node type, intrinsic element, or component.`,
    )
  }
}

export class UnknownIntrinsicElementError extends JSXError {
  constructor(name: string) {
    super(`Unknown intrinsic element "${name}"`)
  }
}

export class InvalidRefAttributeError extends JSXError {
  constructor(received: unknown) {
    const type =
      received instanceof Node ? 'Node instance' : received === null ? 'null' : typeof received

    super(
      `Invalid value for "ref" attribute. Expected a proxy returned by useNode(), but received ${type}.`,
    )
  }
}

export class MissingGameRootError extends JSXError {
  constructor() {
    super('createGame requires a valid "root" HTMLElement.')
  }
}

export class InvalidGameElementError extends JSXError {
  constructor() {
    super('The jsx passed to createGame must be a Game component.')
  }
}

export class MissingSceneError extends JSXError {
  constructor() {
    super('The Game component requires Scene components as children.')
  }
}

export class InvalidSceneComponentError extends JSXError {
  constructor() {
    super('Scene `component` must be a sync or async function returning a Node.')
  }
}
