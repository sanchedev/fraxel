# fraxel

> A lightning-fast JSX runtime for building 2D games in the browser — declarative, reactive, zero React.

[![CI](https://github.com/sanchedev/fraxel/actions/workflows/ci.yml/badge.svg)](https://github.com/sanchedev/fraxel/actions)
[![npm version](https://img.shields.io/badge/version-0.1.0--alpha.2-blue)](https://github.com/sanchedev/fraxel)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**fraxel** lets you build 2D games using JSX syntax with a custom runtime — **no React, no DOM overhead, no bundle bloat.** Write your game logic using hooks, signals, and component architecture that frontend developers already know and love, rendered directly to `<canvas>` at 60FPS.

## Install

```bash
pnpm add fraxel
# or
npm install fraxel
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

## Quick Start

```tsx
import { createGame, Game, Scene } from 'fraxel'
import { loadTexture } from 'fraxel/assets'

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

## Reactivity

Fine-grained signals with automatic dependency tracking — no virtual DOM diffing.

```tsx
import { useSignal, useComputed, useEffect } from 'fraxel/hooks'

function Player() {
  const [health, setHealth] = useSignal(100)
  const isDead = useComputed(() => health() <= 0)

  useEffect(() => {
    console.log('Health:', health())
    return () => console.log('Cleanup')
  })

  return (
    <sprite
      textureId={PLAYER}
      grayscale={() => (isDead() ? 1 : 0)}
      brightness={() => 0.5 + health() / 200}
    >
      <clickable size={[32, 32]} onClick={() => setHealth(health() - 10)} />
    </sprite>
  )
}
```

## Nodes

JSX elements that map to engine classes:

| Node              | Tag                  | Description                                |
| ----------------- | -------------------- | ------------------------------------------ |
| `Transform`       | `<transform>`        | Positioning container for child nodes      |
| `Group`           | `<group>`            | Logical container (no spatial positioning) |
| `Sprite`          | `<sprite>`           | Displays a texture with optional filters   |
| `AnimationPlayer` | `<animation-player>` | Plays frame-based animations               |
| `Collider`        | `<collider>`         | Detects overlaps with other colliders      |
| `RayCast`         | `<ray-cast>`         | Projects a ray to detect colliders         |
| `Clickable`       | `<clickable>`        | Detects click/hover pointer events         |
| `Rectangle`       | `<rectangle>`        | Renders a filled/stroked rectangle         |
| `Timer`           | `<timer>`            | Counts up and fires events                 |
| `Text`            | `<text>`             | Renders text on the canvas                 |
| `AudioPlayer`     | `<audio-player>`     | Plays audio buffers                        |
| `Camera`          | `<camera>`           | Controls the viewport                      |
| `RigidBody`       | `<rigid-body>`       | Adds physics simulation                    |

## Hooks

### Core Hooks

| Hook                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `useNode(type)`                   | Creates a typed reference to pass as `ref`                |
| `useEvent(node, event, callback)` | Type-safe event subscription with auto-cleanup            |
| `useEffect(fn)`                   | Runs effect on mount and when signals change (batched)    |
| `useSignal(initial)`              | Creates reactive state that triggers re-renders           |
| `useComputed(fn)`                 | Creates a derived signal that recomputes when deps change |
| `useMount(fn)`                    | Runs once on mount, cleanup on destroy                    |
| `useSpawn(node)`                  | Returns a function to dynamically spawn children          |
| `useGame()`                       | Access game controls (play, pause, changeScene)           |
| `useChild(path, type)`            | Gets a reference to a child node by path                  |
| `useScript(ref)`                  | Retrieves the FraxelScript attached to a node             |
| `useTrigger(trigger, callback)`   | Pub/sub for cross-component communication                 |
| `createContext(default)`          | Creates a context with `Provider` component               |
| `useContext(context)`             | Retrieves the current context value                       |
| `useRef(value)`                   | Mutable reference that persists across renders            |

### Derived Hooks

| Hook                           | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| `useCondition(node, on, off)`  | Reactive boolean toggled by two opposing events  |
| `useMatch(signal, record)`     | Maps signal value to record (like switch)        |
| `useWhen(signal, true, false)` | Ternary expression for signals                   |
| `useClickable(ref?)`           | Clickable node with reactive `hovered` state     |
| `useTimer(ref?)`               | Timer node with `time`, `progress`, and controls |
| `useRayCast(ref?)`             | RayCast node with reactive `detected` state      |
| `useCollider(ref?)`            | Collider node with reactive `colliding` state    |
| `useAnimation(ref?)`           | AnimationPlayer with reactive frame state        |
| `useAudio(ref?)`               | AudioPlayer with reactive `playing` state        |

## Collision System

Built-in rectangle/circle shapes with spatial hash broadphase and raycast support:

```tsx
import { shapes } from 'fraxel'

<collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
<collider shape={shapes.circle(16)} group={['projectile']} collidesWith={['zombie']} />
```

## Physics

Gravity, rigid bodies, forces, impulses, and collision response:

```tsx
<rigid-body mass={2} bounce={0.6} useGravity />
```

## Sprite Filters

CSS-like visual filters applied via canvas:

```tsx
<sprite
  textureId={TEX}
  brightness={1.2}
  grayscale={0.5}
  modulate={[1, 0.5, 0, 1]}
  contrast={1.5}
  opacity={0.8}
/>
```

## Import Paths

```tsx
// Main entry — nodes, math, collision, core, reactivity
import { PrimaryNode, Vector2, shapes } from 'fraxel'

// Hooks
import { useNode, useEvent, useSignal, useEffect } from 'fraxel/hooks'

// JSX components
import { Game, Scene, List, Fragment } from 'fraxel/jsx'

// Assets
import { loadTexture, loadBatch, loadSound } from 'fraxel/assets'

// Animation & tweening
import { tween, easeOutQuad, animationFromSheet } from 'fraxel/animation'
```

## Documentation

- [Getting Started](https://github.com/sanchedev/fraxel/blob/main/docs/getting-started.md)
- [Nodes Reference](https://github.com/sanchedev/fraxel/blob/main/docs/nodes.md)
- [Hooks API](https://github.com/sanchedev/fraxel/blob/main/docs/hooks.md)
- [Collisions](https://github.com/sanchedev/fraxel/blob/main/docs/collision.md)
- [Physics](https://github.com/sanchedev/fraxel/blob/main/docs/physics.md)
- [Camera](https://github.com/sanchedev/fraxel/blob/main/docs/camera.md)
- [Audio](https://github.com/sanchedev/fraxel/blob/main/docs/audio.md)
- [Animation](https://github.com/sanchedev/fraxel/blob/main/docs/animation.md)
- [Tweening](https://github.com/sanchedev/fraxel/blob/main/docs/tweening.md)
- [Assets](https://github.com/sanchedev/fraxel/blob/main/docs/assets.md)
- [Input System](https://github.com/sanchedev/fraxel/blob/main/docs/input.md)
- [Scripts](https://github.com/sanchedev/fraxel/blob/main/docs/scripts.md)
- [Filters](https://github.com/sanchedev/fraxel/blob/main/docs/filters.md)

## License

MIT
