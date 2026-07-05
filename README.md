# diny

> A lightning-fast JSX runtime for building 2D games in the browser — declarative, reactive, zero React.

[![CI](https://github.com/sanchedev/diny/actions/workflows/ci.yml/badge.svg)](https://github.com/sanchedev/diny/actions)
[![npm version](https://img.shields.io/badge/version-0.1.0--alpha.1-blue)](https://github.com/sanchedev/diny)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Built with TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

![diny icon](packages/demo/assets/icon.png)

**diny** lets you build 2D games using JSX syntax with a custom runtime — **no React, no DOM overhead, no bundle bloat.** Write your game logic using the hooks, signals, and component architecture that frontend developers already know and love.

## Features

- **JSX without React** — Build scene graphs natively with `<transform>`, `<sprite>`, `<collider>` and more.
- **Fine-Grained Reactivity** — `useSignal` provides isolated state management that updates the canvas at 60FPS without Virtual DOM diffing.
- **Auto-Computed Props** — Pass signals or inline functions directly to JSX attributes for automatic dependency tracking.
- **Collision System** — Built-in rectangle/circle shapes with a spatial hash broadphase and Raycast support.
- **Physics Simulation** — Gravity, rigid bodies, forces, impulses, and collision response.
- **Camera System** — Viewport control with zoom, scrolling, and target following.
- **Audio Playback** — Load sounds and play them with `<audio-player>` node.
- **Text Rendering** — Render text on canvas with `<text>` node and configurable styles.
- **Tweening & Easing** — Interpolate properties with 12 easing functions and sequence/parallel composition.
- **Asset Pipeline** — Batch loading with progress tracking via `loadBatch`.
- **Sprite Filters** — Hardware-accelerated brightness, grayscale, modulate, contrast, and opacity.
- **TypeScript-First** — Built from the ground up for strict type safety (`verbatimModuleSyntax`).

## The DX

diny removes the boilerplate. Look how easy it is to create a reactive, interactable game entity:

```tsx
import { useSignal } from 'diny/hooks'
import { PLAYER_TEX } from './assets'

export function Player() {
  const [health, setHealth] = useSignal(100)

  return (
    <sprite
      textureId={PLAYER_TEX}
      grayscale={() => (health() <= 0 ? 1 : 0)} // Auto-computed prop!
      brightness={() => 0.5 + health() / 200}
    >
      <clickable size={[32, 32]} onClick={() => setHealth(health() - 10)} />
    </sprite>
  )
}
```

That's it. Reactive state, computed properties, pointer events, and sprite filters — all in 15 lines. No rigid update loops, no configuration.

## Installation

```bash
# pnpm
pnpm add diny

# npm
npm install diny

# yarn
yarn add diny
```

Add the custom JSX runtime to your tsconfig.json:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "diny"
  }
}
```

## Documentation

Dive into the official documentation to master the engine:

- [Getting Started](docs/getting-started.md) — Installation, setup, and first game
- [Nodes Reference](docs/nodes.md) — `<transform>`, `<sprite>`, `<text>`, `<camera>`, `<collider>`, `<rigid-body>`
- [Hooks API](docs/hooks.md) — useSignal, useComputed, useEffect, useNode, useEvent, useSpawn
- [Collisions](docs/collision.md) — Shapes, filtering groups, events, and raycasting
- [Physics](docs/physics.md) — Gravity, rigid bodies, forces, and collision response
- [Camera](docs/camera.md) — Viewport control, scrolling, and target following
- [Audio](docs/audio.md) — Sound loading, playback, and `<audio-player>` node
- [Animation](docs/animation.md) — Sprite sheets, `<animation-player>`, tweening, and easing
- [Tweening](docs/tweening.md) — Interpolation, easing functions, and sequences
- [Assets](docs/assets.md) — Batch loading and management
- [Input System](docs/input.md) — Pointer tracking and keyboard events
- [Scripts](docs/scripts.md) — DinyScript and Game lifecycle management
- [Filters](docs/filters.md) — Sprite filter props and Color types

## Development

This is a pnpm monorepo consisting of the engine and a fully featured Plants vs Zombies-style demo game.

| Package | Description              | Build Command       |
| ------- | ------------------------ | ------------------- |
| `diny`  | The core engine library  | `pnpm engine:build` |
| `demo`  | Interactive example game | `pnpm demo:build`   |

### Quick Commands

```bash
pnpm dev              # Run engine + demo in watch mode
pnpm engine:build     # Compile the engine (tsc)
pnpm demo:dev         # Serve the demo (esbuild)
pnpm lint             # Run ESLint checks
pnpm format           # Format code with Prettier
```

## License

MIT
