import { TinyEngineError } from './base.js'

export class HookError extends TinyEngineError {
  constructor(message: string) {
    super(message)
    this.name = 'HookError'
  }
}

export class HookOutsideComponentError extends HookError {
  constructor(hookName: string) {
    super(`${hookName}() must be used inside a component`)
  }
}

export class HookRequiresNodeRootError extends HookError {
  constructor(hookName: string) {
    super(
      `${hookName}() requires the component root element to be a Node. Fragments or arrays are not allowed.`,
    )
  }
}

export class InvalidEventHookResultError extends HookError {
  constructor() {
    super(`useEvent expected getEvent() to return an Event`)
  }
}
