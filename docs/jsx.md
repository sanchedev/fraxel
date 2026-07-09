# JSX Components

The `fraxel/jsx` module provides JSX components for declaratively building game scenes.

```ts
import { createGame, Game, Scene, List, Fragment } from 'fraxel/jsx'
```

## createGame

Creates the game from JSX and mounts it to a root element. Returns a `GameControls` object.

```ts
import { createGame, Game, Scene } from 'fraxel/jsx'

const game = createGame(
  <Game width={800} height={600} defaultScene="main">
    <Scene name="main" component={scene} />
  </Game>,
  document.querySelector('#root')!,
)

game.play()
```

### Return Value

| Property             | Type                                    | Description                    |
| -------------------- | --------------------------------------- | ------------------------------ |
| `play()`             | `() => void`                            | Starts the game loop.          |
| `pause()`            | `() => void`                            | Pauses the game.               |
| `paused`             | `SignalGetter<boolean>`                 | Reactive pause state.          |
| `destroy()`          | `() => void`                            | Stops the game and cleans up.  |
| `changeScene(name)`  | `(name: string) => Promise<void>`       | Switches to a different scene. |
| `preloadScene(name)` | `(name: string) => Promise<() => void>` | Preloads a scene.              |
| `getSize()`          | `() => Vector2`                         | Returns the canvas dimensions. |

## Game Component

Root component that configures the game canvas and engine.

```tsx
<Game width={800} height={600} defaultScene="main" pauseOnBlur>
  <Scene name="main" component={mainScene} />
  <Scene name="menu" component={menuScene} />
</Game>
```

### Props

| Prop           | Type                   | Default | Description                             |
| -------------- | ---------------------- | ------- | --------------------------------------- |
| `width`        | `number`               | —       | Logical width of the canvas.            |
| `height`       | `number`               | —       | Logical height of the canvas.           |
| `defaultScene` | `string`               | —       | Name of the initial scene to load.      |
| `pauseOnBlur`  | `boolean`              | `false` | Pause when the browser tab loses focus. |
| `testOptions`  | `Partial<TestOptions>` | —       | Debug visualization options.            |
| `theme`        | `Theme`                | —       | Default text style theme.               |

### Children

Must contain `<Scene>` components.

## Scene Component

Declares a scene with a name and component function.

```tsx
<Scene
  name="main"
  component={() => (
    <transform>
      <sprite />
    </transform>
  )}
/>
```

### Props

| Prop        | Type             | Description                                    |
| ----------- | ---------------- | ---------------------------------------------- |
| `name`      | `string`         | Unique scene name.                             |
| `component` | `SceneComponent` | Function that returns a Node or Promise<Node>. |

### SceneComponent

```ts
type SceneComponent = () => Node | Promise<Node | { default: Node }>
```

Supports lazy loading via dynamic imports:

```tsx
<Scene name="game" component={async () => (await import('./scenes/game.js')).default} />
```

## List Component

Renders dynamic nodes from a reactive array with keyed reconciliation.

```tsx
import { List } from 'fraxel/jsx'
import { useSignal } from 'fraxel/hooks'

function EnemyList() {
  const [enemies] = useSignal([
    { id: 1, x: 0 },
    { id: 2, x: 50 },
  ])

  return (
    <List array={enemies} itemKey={(e) => e.id}>
      {(enemy) => (
        <transform position={[enemy.x, 0]}>
          <sprite textureId={ENEMY} />
        </transform>
      )}
    </List>
  )
}
```

### Props

| Prop       | Type                                                      | Description                                |
| ---------- | --------------------------------------------------------- | ------------------------------------------ |
| `array`    | `Reactive<T[]>`                                           | Reactive array signal or static array.     |
| `itemKey`  | `(value: T, index: number, arr: T[]) => string \| symbol` | Unique key extractor.                      |
| `empty`    | `() => fraxel.Node`                                       | Fallback rendered when the array is empty. |
| `children` | `(value: T, index: number, arr: T[]) => fraxel.Node`      | Render function for each item.             |

## Fragment

Wraps children without introducing a parent entity. Useful for grouping elements:

```tsx
import { Fragment } from 'fraxel/jsx'

function Player() {
  return (
    <>
      <sprite textureId={PLAYER} />
      <collider shape={shapes.rectangle(32, 32)} group={['player']} />
    </>
  )
}
```

## Complete Example

```tsx
import { createGame, Game, Scene } from 'fraxel/jsx'
import { loadTexture } from 'fraxel'
import { useSprite, useUpdate } from 'fraxel/hooks'

const PLAYER = await loadTexture('/assets/player.png')

function MainScene() {
  return (
    <transform>
      <sprite textureId={PLAYER} position={[100, 100]} />
    </transform>
  )
}

const game = createGame(
  <Game width={800} height={600} defaultScene="main">
    <Scene name="main" component={MainScene} />
  </Game>,
  document.querySelector('#root')!,
)

game.play()
```

## See Also

- [Core](./core.md) — `Game`, `SceneManager` API
- [Getting Started](./getting-started.md) — First game setup
