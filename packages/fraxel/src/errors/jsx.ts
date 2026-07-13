import { Node } from '../nodes/_node.js'
import { FraxelError } from './base.js'

/**
 * The **`JSXError`** class is the base error for all JSX-related errors.
 * Thrown when an error occurs during JSX element creation, rendering, or resolution.
 *
 * @example
 * ```ts
 * import { JSXError } from 'fraxel'
 *
 * try {
 *   renderToNodes(myJsx)
 * } catch (e) {
 *   if (e instanceof JSXError) console.error('JSX issue:', e.message)
 * }
 * ```
 */
export class JSXError extends FraxelError {
  constructor(message: string) {
    super(message)
    this.name = 'JSXError'
  }
}

/**
 * The **`InvalidJSXElementTypeError`** class is thrown when a JSX element has a type
 * that is not a valid Node constructor, intrinsic element, or component function.
 * This occurs when `renderToNodes` encounters an unrecognized element type.
 *
 * @example
 * ```ts
 * // Thrown when JSX type is not a node, intrinsic element, or component:
 * renderToNodes(42) // InvalidJSXElementTypeError
 * ```
 */
export class InvalidJSXElementTypeError extends JSXError {
  constructor(type: unknown) {
    super(
      `Invalid JSX element type: ${String(type)}. Expected a Node type, intrinsic element, or component.`,
    )
  }
}

/**
 * The **`UnknownIntrinsicElementError`** class is thrown when a JSX intrinsic element
 * (lowercase tag like `<foo />`) is not recognized by the engine. Only registered node
 * types (sprite, transform, collider, etc.) are valid intrinsic elements.
 *
 * @example
 * ```tsx
 * // Thrown when using an unregistered JSX tag:
 * renderToNodes(<foo />) // UnknownIntrinsicElementError: Unknown intrinsic element "foo"
 * ```
 */
export class UnknownIntrinsicElementError extends JSXError {
  constructor(name: string) {
    super(`Unknown intrinsic element "${name}"`)
  }
}

/**
 * The **`InvalidRefAttributeError`** class is thrown when a `ref` attribute receives
 * a value that is not a valid node reference. Refs must be created by native hooks
 * like `useSprite()`, `useCollider()`, `useRigidBody()`, etc.
 *
 * @example
 * ```tsx
 * // Thrown when ref receives an invalid value:
 * <sprite ref={null} />           // InvalidRefAttributeError
 * <sprite ref={42} />             // InvalidRefAttributeError
 * <sprite ref={useRef()} />       // useRef is deprecated — use native hooks for refs
 * ```
 */
export class InvalidRefAttributeError extends JSXError {
  constructor(received: unknown) {
    const type =
      received instanceof Node ? 'Node instance' : received === null ? 'null' : typeof received

    super(
      `Invalid value for "ref" attribute. Expected a NodeReference returned by a native hook (useSprite, useCollider, etc.), but received ${type}.`,
    )
  }
}

/**
 * The **`MissingGameRootError`** class is thrown when `createGame` is called without
 * a valid root HTMLElement. The root element must exist in the DOM.
 *
 * @example
 * ```ts
 * // Thrown when root is null or not an HTMLElement:
 * createGame(<GameRoot />, document.querySelector('#nonexistent'))
 * ```
 */
export class MissingGameRootError extends JSXError {
  constructor() {
    super('createGame requires a valid "root" HTMLElement.')
  }
}

/**
 * The **`InvalidGameElementError`** class is thrown when the JSX passed to `createGame`
 * is not a `<GameRoot>` component. The first argument must be a `<GameRoot>` element.
 *
 * @example
 * ```tsx
 * // Thrown when JSX is not a GameRoot component:
 * createGame(<sprite />, document.querySelector('#root')!) // InvalidGameElementError
 * ```
 */
export class InvalidGameElementError extends JSXError {
  constructor() {
    super('The jsx passed to createGame must be a GameRoot component.')
  }
}

/**
 * The **`MissingSceneError`** class is thrown when a `<GameRoot>` component has no
 * `<Scene>` children. At least one Scene must be declared inside Game.
 *
 * @example
 * ```tsx
 * // Thrown when Game has no Scene children:
 * createGame(
 *   <GameRoot width={800} height={600} />,
 *   document.querySelector('#root')!,
 * ) // MissingSceneError
 * ```
 */
export class MissingSceneError extends JSXError {
  constructor() {
    super('The GameRoot component requires SceneRoot components as children.')
  }
}

/**
 * The **`InvalidSceneComponentError`** class is thrown when a Scene's `component` prop
 * is not a valid function. The component must be a sync or async function that returns
 * a Node or a module with a default export.
 *
 * @example
 * ```tsx
 * // Thrown when component is not a function:
 * <SceneRoot name="main" component="not-a-function" /> // InvalidSceneComponentError
 * ```
 */
export class InvalidSceneComponentError extends JSXError {
  constructor() {
    super('Scene `component` must be a sync or async function returning a Node.')
  }
}
