# Errors

The `errors` module provides a hierarchy of error classes for the fraxel engine. All errors extend `FraxelError`, allowing uniform catch blocks.

```ts
import { FraxelError } from 'fraxel'
```

## Error Hierarchy

```
FraxelError
├── AnimationError
│   └── KeyframeNotFoundError
├── AssetError
│   ├── TextureNotFoundError
│   └── SoundNotFoundError
├── EnvironmentError
│   └── Context2DNotSupportedError
├── HookError
│   ├── HookOutsideComponentError
│   └── HookRequiresNodeRootError
├── JSXError
│   ├── InvalidJSXElementTypeError
│   ├── UnknownIntrinsicElementError
│   ├── InvalidRefAttributeError
│   ├── MissingGameRootError
│   ├── InvalidGameElementError
│   ├── MissingSceneError
│   └── InvalidSceneComponentError
├── EngineStateError
│   ├── EngineNotSetupError
│   └── NodeNotInitializedError
├── MathError
│   ├── InvalidBoundsLikeError
│   ├── InvalidColorLikeError
│   └── InvalidVectorLikeError
├── NodeError
│   ├── InvalidNodeIdError
│   ├── NodeChildNotFoundError
│   ├── NodeTypeMismatchError
│   ├── UnknownNodeTypeError
│   └── InvalidNodeInstanceError
├── SceneError
│   ├── SceneNotFoundError
│   └── InvalidSceneRootError
├── InputError
│   ├── ActionNotFoundError
│   └── DuplicateKeyError
└── EngineStateError
```

## Catching Errors

```ts
import { FraxelError, AnimationError, InputError } from 'fraxel'

try {
  // fraxel operations
} catch (e) {
  if (e instanceof AnimationError) {
    console.error('Animation issue:', e.message)
  } else if (e instanceof InputError) {
    console.error('Input issue:', e.message)
  } else if (e instanceof FraxelError) {
    console.error('Engine error:', e.message)
  }
}
```

## Error Classes

### FraxelError

Base class for all fraxel engine errors.

### AnimationError

Thrown when an error occurs during animation processing or playback.

### KeyframeNotFoundError

Thrown when accessing a keyframe at an index that doesn't exist.

### AssetError

Thrown when an error occurs during asset loading or retrieval.

### TextureNotFoundError

Thrown when `getTexture(id)` is called with an ID that doesn't exist.

### SoundNotFoundError

Thrown when `getSound(id)` is called with an ID that doesn't exist.

### EnvironmentError

Thrown when the runtime environment doesn't support a required feature.

### Context2DNotSupportedError

Thrown when the browser doesn't support `CanvasRenderingContext2D`.

### HookError

Thrown when an error occurs during hook execution.

### HookOutsideComponentError

Thrown when a hook is called outside a component's render context.

### HookRequiresNodeRootError

Thrown when a hook requires a single Node root but receives a fragment or array.

### JSXError

Base class for JSX-related errors.

### InvalidJSXElementTypeError

Thrown when a JSX element has an invalid type.

### UnknownIntrinsicElementError

Thrown when a JSX intrinsic element is not registered.

### InvalidRefAttributeError

Thrown when a `ref` receives an invalid value.

### MissingGameRootError

Thrown when `createGame` is called without a valid root element.

### InvalidGameElementError

Thrown when the JSX passed to `createGame` is not a `<Game>` component.

### MissingSceneError

Thrown when a `<Game>` has no `<Scene>` children.

### InvalidSceneComponentError

Thrown when a Scene's `component` prop is not a valid function.

### EngineStateError

Thrown when an operation is invalid given the engine's current state.

### EngineNotSetupError

Thrown when `Game.play()` is called before `Game.setup()`.

### NodeNotInitializedError

Thrown when a node is accessed before initialization.

### MathError

Base class for math-related errors.

### InvalidBoundsLikeError

Thrown when a value is not a valid `BoundsLike`.

### InvalidColorLikeError

Thrown when a value is not a valid `ColorLike`.

### InvalidVectorLikeError

Thrown when a value is not a valid `VectorLike`.

### NodeError

Base class for node-related errors.

### InvalidNodeIdError

Thrown when a node ID doesn't match the required pattern.

### NodeChildNotFoundError

Thrown when accessing a child node at a non-existent path.

### NodeTypeMismatchError

Thrown when a node has an unexpected type.

### UnknownNodeTypeError

Thrown when creating or referencing an unregistered node type.

### InvalidNodeInstanceError

Thrown when a value is not a valid Node instance.

### SceneError

Base class for scene-related errors.

### SceneNotFoundError

Thrown when accessing a scene that doesn't exist in the registry.

### InvalidSceneRootError

Thrown when a scene's root element is not a valid Node.

### InputError

Base class for input-related errors.

### ActionNotFoundError

Thrown when accessing an unregistered action.

### DuplicateKeyError

Thrown when binding a key combo that's already used.
