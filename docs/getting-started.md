# Getting Started

## Installation

```bash
# pnpm
pnpm add fraxel

# npm
npm install fraxel

# yarn
yarn add fraxel
```

## Setup

Add the custom JSX runtime to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "verbatimModuleSyntax": true,
    "jsx": "react-jsx",
    "jsxImportSource": "fraxel"
  }
}
```

> **Note:** `verbatimModuleSyntax` requires explicit `type` imports/exports. Use `import type { ... }` for type-only imports.

## Your First Game

Create a `main.tsx` file:

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

### How it works

1. **`loadTexture(url)`** — loads an image and returns a `symbol` ID
2. **`createGame(jsx, root)`** — processes the JSX tree, sets up the canvas, and starts the game loop
3. **`<Game>`** — declarative game configuration (width, height, default scene)
4. **`<Scene>`** — defines a scene with a name and component function
5. **`game.play()`** — starts the `requestAnimationFrame` loop

## Adding Interactivity

Use hooks to add state, events, and reactivity:

```tsx
import { useTransform, useUpdate, useSignal } from 'fraxel/hooks'

function Player() {
  const transform = useTransform()
  const [health, setHealth] = useSignal(100)

  useUpdate((delta) => {
    transform.setPosition([transform.position().x + delta * 50, transform.position().y])
  })

  return (
    <transform ref={transform}>
      <sprite textureId={PLAYER} grayscale={() => (health() <= 0 ? 1 : 0)} />
    </transform>
  )
}
```

## Project Structure

```
fraxel/
├── packages/
│   ├── fraxel/    # The engine library
│   └── demo/           # Example game (Plants vs Zombies style)
```

### Import paths

```tsx
// Main entry — nodes, math, collision, core, reactivity
import { PrimaryNode, Vector2, shapes } from 'fraxel'

// Hooks
import { useSprite, useCollider, useSignal, useEffect } from 'fraxel/hooks'

// JSX components
import { Game, Scene, List, Fragment } from 'fraxel/jsx'

// Assets
import { loadTexture, loadBatch } from 'fraxel'

// Audio
import { loadSound } from 'fraxel'

// Animation & tweening
import { tween, easeOutQuad, animationFromSheet } from 'fraxel'
```

## Next Steps

- [Nodes Reference](nodes.md) — all available JSX elements
- [Hooks API](hooks.md) — state, effects, and lifecycle
- [Collision System](collision.md) — shapes, groups, and events
- [Physics](physics.md) — gravity, rigid bodies, and forces
- [Camera](camera.md) — viewport control and scrolling
- [Audio](audio.md) — sound loading and playback
- [Tweening](tweening.md) — interpolation and easing
- [Asset Pipeline](assets.md) — batch loading and management
