# Fraxel Documentation

Fraxel is a TypeScript game engine built on JSX and the Canvas API. It provides a declarative, component-based approach to 2D game development.

## Quick Start

```bash
npm install fraxel
```

```tsx
import { createGame, Game, Scene } from 'fraxel/jsx'
import { loadTexture } from 'fraxel'

const BG = await loadTexture('/assets/background.png')
const PLAYER = await loadTexture('/assets/player.png')

const scene = () => (
  <transform>
    <sprite textureId={BG} />
    <sprite textureId={PLAYER} position={[80, 50]} />
  </transform>
)

const game = createGame(
  <Game width={192} height={112} defaultScene="main">
    <Scene name="main" component={scene} />
  </Game>,
  document.querySelector('#root')!,
)

game.play()
```

## Documentation

### Core Concepts

| Topic                                   | Description                                       |
| --------------------------------------- | ------------------------------------------------- |
| [Getting Started](./getting-started.md) | Installation, setup, and first game               |
| [JSX](./jsx.md)                         | `createGame`, `Game`, `Scene`, `List`, `Fragment` |
| [Core](./core.md)                       | `Game` singleton, `SceneManager`, theming         |
| [Reactivity](./reactivity.md)           | `Signal`, `SignalRegister`                        |

### Game Objects

| Topic                       | Description                                            |
| --------------------------- | ------------------------------------------------------ |
| [Nodes](./nodes.md)         | All JSX node types and their props                     |
| [Collision](./collision.md) | Shapes, colliders, raycasts, rigid bodies, and physics |
| [Animation](./animation.md) | Sprite sheets, `AnimationPlayer`, and tweening         |
| [Camera](./camera.md)       | Viewport control, smoothing, and screen shake          |

### Hooks

| Topic                   | Description                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| [Hooks API](./hooks.md) | All hooks: `useEffect`, `useSignal`, native hooks, derived hooks |

### Input & Audio

| Topic               | Description                         |
| ------------------- | ----------------------------------- |
| [Input](./input.md) | Keyboard and pointer input, actions |
| [Audio](./audio.md) | Sound loading and playback          |

### Assets & Rendering

| Topic                   | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| [Assets](./assets.md)   | Loading, batching, and unloading textures and sounds |
| [Filters](./filters.md) | Sprite filters and the `Color` class                 |

### Utilities

| Topic                   | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| [Math](./math.md)       | `Vector2`, `Bounds`, `Color`, `vector2`, `bounds`, `color` |
| [Scripts](./scripts.md) | `FraxelScript` for game logic                              |
| [Errors](./errors.md)   | Error classes                                              |
| [Warnings](./warn.md)   | Warning functions                                          |

## Import Paths

```tsx
// Main entry — nodes, math, collision, core, reactivity
import { PrimaryNode, Vector2, shapes } from 'fraxel'

// Hooks
import { useSprite, useCollider, useSignal, useEffect } from 'fraxel/hooks'

// JSX components
import { Game, Scene, List, Fragment } from 'fraxel/jsx'
```

## License

MIT
