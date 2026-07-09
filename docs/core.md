# Core

The core module provides the game engine, scene management, configuration, and theming system.

```ts
import { Game } from 'fraxel'
```

## Game

`Game` is a static singleton that manages the game loop, canvas setup, pause state, and scene lifecycle.

### Setup

```ts
import { Game } from 'fraxel'

Game.setup({
  width: 800,
  height: 600,
  root: document.querySelector('#root')!,
})
```

### SetupOptions

| Option        | Type                   | Default       | Description                                |
| ------------- | ---------------------- | ------------- | ------------------------------------------ |
| `width`       | `number`               | —             | Logical width of the canvas.               |
| `height`      | `number`               | —             | Logical height of the canvas.              |
| `root`        | `HTMLElement`          | —             | Root element that will contain the canvas. |
| `pauseOnBlur` | `boolean`              | `false`       | Pause when the browser tab loses focus.    |
| `testOptions` | `Partial<TestOptions>` | —             | Debug visualization options.               |
| `theme`       | `Theme`                | `new Theme()` | Default text style theme.                  |

### TestOptions

| Option           | Type      | Default | Description                               |
| ---------------- | --------- | ------- | ----------------------------------------- |
| `showColliders`  | `boolean` | `false` | Show collider shapes overlaid on sprites. |
| `showRayCasts`   | `boolean` | `false` | Show raycast lines.                       |
| `showClickables` | `boolean` | `false` | Show clickable hit areas.                 |

### Play / Pause

```ts
Game.play() // start the game loop
Game.pause() // pause the game
Game.destroy() // stop loop, remove listeners, cleanup
```

### Pause State

The `paused` property is a reactive signal:

```ts
const isPaused = Game.paused() // reactive boolean
Game.paused = true // pause
Game.paused = false // resume
```

### Events

| Event          | Description                             |
| -------------- | --------------------------------------- |
| `Game.blurred` | Fires when the browser tab loses focus. |

### Scene Manager

Access via `Game.sceneManager`:

```ts
await Game.sceneManager.addScene('main', scene, true)
await Game.sceneManager.setScene('menu')
await Game.sceneManager.preloadScene('boss')
```

## SceneManager

Manages scene registration, loading, and switching. Access via `Game.sceneManager`.

### addScene

Registers a scene with the given name:

```ts
await Game.sceneManager.addScene('main', new Scene(() => ...), true)
```

| Param   | Type      | Description                          |
| ------- | --------- | ------------------------------------ |
| `name`  | `string`  | Scene name.                          |
| `scene` | `Scene`   | Scene instance.                      |
| `setit` | `boolean` | Set as current scene after creation. |

### setScene

Loads and sets a scene, destroying the previous one. Pass `null` to unload:

```ts
await Game.sceneManager.setScene('menu')
await Game.sceneManager.setScene(null) // unload
```

### preloadScene

Preloads a scene while the game is running. Returns a function to switch instantly:

```ts
const setToGame = await Game.sceneManager.preloadScene('game')
// Later:
setToGame()
```

### Properties

| Property       | Returns          | Description                |
| -------------- | ---------------- | -------------------------- |
| `currentScene` | `string \| null` | Current scene name.        |
| `currentNode`  | `Node \| null`   | Current scene's root Node. |

## Theme

Holds the default text style for the game:

```ts
import { Theme, TextStyle, FontWeight, TextAlign } from 'fraxel'

const theme = new Theme(
  new TextStyle('#ffffff', 24, 'monospace', FontWeight.Bold, TextAlign.Center),
)

Game.setup({ width: 800, height: 600, root, theme })
```

### TextStyle

| Property          | Type         | Default             | Description                    |
| ----------------- | ------------ | ------------------- | ------------------------------ |
| `foregroundColor` | `string`     | `'#000000'`         | Text color (CSS color string). |
| `fontSize`        | `number`     | `16`                | Font size in pixels.           |
| `fontFamily`      | `string`     | `'sans-serif'`      | Font family.                   |
| `fontWeight`      | `FontWeight` | `FontWeight.Normal` | Font weight.                   |
| `textAlign`       | `TextAlign`  | `TextAlign.Start`   | Text alignment.                |

### FontWeight

| Value               | Description     |
| ------------------- | --------------- |
| `FontWeight.Normal` | Regular weight. |
| `FontWeight.Bold`   | Bold weight.    |

### TextAlign

| Value              | Description                     |
| ------------------ | ------------------------------- |
| `TextAlign.Start`  | Aligns to start (left for LTR). |
| `TextAlign.Center` | Centers the text.               |
| `TextAlign.End`    | Aligns to end (right for LTR).  |

## See Also

- [JSX](./jsx.md) — `createGame`, `Game`, `Scene` components
- [Getting Started](./getting-started.md) — First game setup
