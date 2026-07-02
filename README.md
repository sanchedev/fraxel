# tiny-engine

> A lightning-fast JSX runtime for building 2D games in the browser — declarative, reactive, zero React.

[![npm version](https://img.shields.io/badge/version-0.0.0-blue)](https://github.com/user/tiny-engine)
[![License: ISC](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Built with TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

![tiny-engine icon](packages/demo/assets/icon.png)

**tiny-engine** lets you build 2D games using JSX syntax with a custom runtime — **no React, no DOM overhead, no bundle bloat.** Write your game logic using the hooks, signals, and component architecture that frontend developers already know and love.

## Features

- **JSX without React** — Build scene graphs natively with `<transform>`, `<sprite>`, `<collider>` and more.
- **Fine-Grained Reactivity** — `useSignal` provides isolated state management that updates the canvas at 60FPS without Virtual DOM diffing.
- **Auto-Computed Props** — Pass signals or inline functions directly to JSX attributes for automatic dependency tracking.
- **Collision System** — Built-in rectangle/circle shapes with a spatial hash broadphase and Raycast support.
- **Sprite Filters** — Hardware-accelerated brightness, grayscale, modulate, contrast, and opacity.
- **TypeScript-First** — Built from the ground up for strict type safety (`verbatimModuleSyntax`).

## The DX

tiny-engine removes the boilerplate. Look how easy it is to create a reactive, interactable game entity:

```tsx
import { useSignal } from 'tiny-engine/hooks'
import { PLAYER_TEX } from './assets'

export function Player() {
  const [health, setHealth] = useSignal(100)

  return (
    <sprite
      textureId={PLAYER_TEX}
      grayscale={() => (health() <= 0 ? 1 : 0)} // Auto-computed prop!
      brightness={() => 0.5 + health() / 200}>
      <clickable size={[32, 32]} onClick={() => setHealth(health() - 10)} />
    </sprite>
  )
}
```

That's it. Reactive state, computed properties, pointer events, and sprite filters — all in 15 lines. No rigid update loops, no configuration.

## Installation

```bash
pnpm add tiny-engine
```

Add the custom JSX runtime to your tsconfig.json:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "tiny-engine"
  }
}
```

## Documentation

Dive into the official documentation to master the engine:

- [Nodes Reference](docs/nodes.md) — `<transform>`, `<sprite>`, `<clickable>`, `<timer>`, `<collider>`, `<ray-cast>`
- [Hooks API](docs/hooks.md) — useSignal, useComputed, useEffect, useNode, useEvent, useSpawn
- [Collisions](docs/collision.md) — Shapes, filtering groups, events, and raycasting
- [Animation](docs/animation.md) — Sprite sheets and `<animation-player>`
- [Input System](docs/input.md) — Pointer tracking and keyboard events
- [Scripts](docs/scripts.md) — TinyScript and Game lifecycle management
- [Filters](docs/filters.md) — Sprite filter props and Color types

## Development

This is a pnpm monorepo consisting of the engine and a fully featured Plants vs Zombies-style demo game.

| Package       | Description              | Build Command       |
| ------------- | ------------------------ | ------------------- |
| `tiny-engine` | The core engine library  | `pnpm engine:build` |
| `demo`        | Interactive example game | `pnpm demo:build`   |

### Quick Commands

```bash
pnpm dev              # Run engine + demo in watch mode
pnpm engine:build     # Compile the engine (tsc)
pnpm demo:dev         # Serve the demo (esbuild)
pnpm lint             # Run ESLint checks
```

## License

ISC
