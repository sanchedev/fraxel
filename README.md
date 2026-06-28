# tiny-engine

> A lightweight JSX runtime for building 2D games in the browser.

[![npm version](https://img.shields.io/badge/version-0.0.0-blue)](https://github.com/user/tiny-engine)
[![License: ISC](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Built with TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

![tiny-engine icon](packages/demo/assets/icon.png)

**tiny-engine** lets you build 2D games using JSX syntax with a custom runtime — no React required. It provides nodes, hooks, collision detection, animation, and reactive state out of the box.

## Features

- **JSX Runtime** — Write game scenes with `<transform>`, `<sprite>`, `<collider>`, and more
- **Collision System** — Rectangle and circle shapes with broadphase (spatial hash) and narrowphase detection
- **Raycast Detection** — Project rays to detect colliders along a direction
- **Reactive Signals** — `Signal<T>` for state management with automatic re-rendering
- **Sprite Animation** — Frame-based animations from sprite sheets
- **Scene Management** — Lazy-loaded scenes with transitions
- **TypeScript-first** — Full type safety with `verbatimModuleSyntax`

## Quick Start

```tsx
import { createGame, Game, Scene } from 'tiny-engine/jsx'

const game = createGame(
  <Game width={192} height={112} defaultScene="main">
    <Scene name="main" component={() => import('./scenes/main.js')} />
  </Game>,
  document.querySelector('#root')!,
)

game.play()
```

## Installation

```bash
pnpm add tiny-engine
```

Configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "tiny-engine"
  }
}
```

## Core Concepts

### Nodes

Every game object is built from **nodes** — JSX elements that map to engine classes:

```tsx
import { PrimaryNode, Vector2 } from 'tiny-engine'

// Transform — positioning container
<transform position={new Vector2(100, 50)}>
  {/* Sprite — displays a texture */}
  <sprite textureId={playerTexture} sourceSize={new Vector2(16, 16)}>
    {/* AnimationPlayer — frame animations */}
    <animation-player />
  </sprite>
</transform>
```

### Scenes

Scenes are lazy-loaded modules that contain your game logic:

```tsx
// scenes/main.tsx
export default function MainScene() {
  return (
    <transform>
      <Player />
      <Enemy />
    </transform>
  )
}
```

### Game Setup

```tsx
import { Game, Scene, createGame } from 'tiny-engine/jsx'

const game = createGame(
  <Game width={320} height={240} defaultScene="menu">
    <Scene name="menu" component={() => import('./scenes/menu.js')} />
    <Scene name="game" component={() => import('./scenes/game.js')} />
  </Game>,
  document.getElementById('root')!,
)

// Control the game
game.play()
game.pause()
game.changeScene('game')
```

## Built-in Nodes

| Node | JSX Tag | Description |
|------|---------|-------------|
| `Transform` | `<transform>` | Positioning container for child nodes |
| `Sprite` | `<sprite>` | Displays a texture or sprite |
| `AnimationPlayer` | `<animation-player>` | Plays frame-based animations |
| `Collider` | `<collider>` | Detects overlaps with other colliders |
| `RayCast` | `<ray-cast>` | Projects a ray to detect colliders |

## Hooks

| Hook | Description |
|------|-------------|
| `useRefNode(type)` | Creates a typed reference to pass as `ref` |
| `useEvent(node, event, callback)` | Type-safe event subscription with auto-cleanup |
| `useEffect(fn, signals)` | Runs effect on mount and when signals change |
| `useSignal(initial)` | Creates reactive state that triggers re-renders |
| `useMount(fn)` | Runs once on mount, cleanup on destroy |
| `useSpawn(node)` | Returns a function to dynamically spawn children |
| `useGame()` | Access game controls (play, pause, changeScene) |
| `createContext(default)` | Creates a context with `Provider` component |
| `useContext(context)` | Retrieves the current context value |
| `useRef(value)` | Mutable reference that persists across renders |

### useRefNode

```tsx
import { useRefNode } from 'tiny-engine/hooks'
import { PrimaryNode } from 'tiny-engine'

function Player() {
  const sprite = useRefNode(PrimaryNode.Sprite)

  return (
    <transform>
      <sprite ref={sprite} textureId={playerTexture} />
    </transform>
  )
}
```

### useEvent

```tsx
import { useEvent, useRefNode } from 'tiny-engine/hooks'
import { PrimaryNode, shapes } from 'tiny-engine'

function Enemy() {
  const collider = useRefNode(PrimaryNode.Collider)

  useEvent(collider, 'colliderEnter', (other) => {
    console.log('Hit:', other)
  })

  return (
    <collider
      ref={collider}
      shape={shapes.circle(8)}
      group={['enemy']}
      collidesWith={['projectile']}
    />
  )
}
```

### useSignal + useEffect

```tsx
import { useSignal, useEffect } from 'tiny-engine/hooks'

function HealthBar() {
  const health = useSignal(100)

  useEffect(() => {
    console.log('Health changed:', health.value)
  }, [health])

  return (
    <transform>
      {/* health.value triggers re-render when set */}
    </transform>
  )
}
```

### createContext / useContext

```tsx
import { createContext, useContext } from 'tiny-engine/hooks'

const GameCtx = createContext({ score: 0 })

function Provider() {
  return (
    <GameCtx.Provider value={{ score: 0 }}>
      <Child />
    </GameCtx.Provider>
  )
}

function Child() {
  const { score } = useContext(GameCtx)
  return <transform />
}
```

### useSpawn

```tsx
import { useRefNode, useSpawn } from 'tiny-engine/hooks'
import { PrimaryNode } from 'tiny-engine'

function Spawner() {
  const container = useRefNode(PrimaryNode.Transform)
  const spawn = useSpawn(container)

  return (
    <transform ref={container}>
      <button onClick={() => spawn(<Enemy />)}>Spawn Enemy</button>
    </transform>
  )
}
```

## Collision System

### Shapes

Define collision shapes with the `shapes` factory:

```tsx
import { shapes } from 'tiny-engine'

// Rectangle
<collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />

// Circle
<collider shape={shapes.circle(16)} group={['projectile']} collidesWith={['zombie']} />
```

### Groups & Events

Colliders use groups for filtering. Events fire on both colliders:

```tsx
import { useEvent, useRefNode } from 'tiny-engine/hooks'
import { PrimaryNode, shapes } from 'tiny-engine'

function Projectile() {
  const collider = useRefNode(PrimaryNode.Collider)

  useEvent(collider, 'colliderEnter', (enemyCollider) => {
    enemyCollider.parent.script.applyDamage(20)
  })

  return (
    <collider
      ref={collider}
      shape={shapes.circle(4)}
      group={['projectile']}
      collidesWith={['enemy']}
    />
  )
}
```

### RayCast

Project rays to detect colliders along a direction:

```tsx
import { useRefNode, useEvent } from 'tiny-engine/hooks'
import { PrimaryNode, Vector2 } from 'tiny-engine'

function Detector() {
  const ray = useRefNode(PrimaryNode.RayCast)

  useEvent(ray, 'colliderEnter', (collider) => {
    console.log('Detected:', collider)
  })

  return (
    <ray-cast
      ref={ray}
      direction={new Vector2(100, 0)}
      collidesWith={['enemy']}
    />
  )
}
```

## Animation

### Sprite Sheets

Generate keyframes from a sprite sheet:

```tsx
import { kfFromSpriteSheet, kfFromProp, multiKF } from 'tiny-engine'

const walkFrames = kfFromSpriteSheet(
  spriteNode,
  walkTexture,
  4, // columns
  1, // rows
)

// Set a property for a frame
const frame1 = kfFromProp(spriteNode, 'textureId', frame1Texture)

// Combine multiple keyframes
const combined = multiKF([frame1, frame2, frame3])
```

### AnimationPlayer

```tsx
<animation-player
  ref={anim}
  animations={{
    idle: idleFrames,
    walk: walkFrames,
  }}
  currentAnim="idle"
/>
```

## Scripts

Separate game logic from rendering with `TinyScript`:

```tsx
import { TinyScript } from 'tiny-engine/scripts'
import { PrimaryNode } from 'tiny-engine'

class PlayerScript extends TinyScript<PrimaryNode.Transform> {
  health = 100

  setup() {
    this.connect(this.me.started, () => {
      console.log('Player spawned!')
    })
  }

  applyDamage(amount: number) {
    this.health -= amount
    if (this.health <= 0) {
      this.me.destroy()
    }
  }
}

// Use in JSX
<transform script={new PlayerScript()} />
```

## Demo

The `packages/demo` directory contains a **Plants vs Zombies**-style game built with tiny-engine. It demonstrates:

- Row-based board with context providers
- Dynamic zombie and projectile spawning
- Collision detection and damage system
- Sprite animations (walk, eat, shoot)

Run the demo:

```bash
pnpm dev
```

> The demo is currently in active development.

## Development

This is a pnpm monorepo with two packages:

| Package | Description | Build |
|---------|-------------|-------|
| `packages/tiny-engine` | The engine library | `pnpm engine:build` |
| `packages/demo` | Example game | `pnpm demo:build` |

### Commands

```bash
# Run everything
pnpm dev

# Engine only
pnpm engine:build    # tsc compile
pnpm engine:dev      # tsc --watch

# Demo only
pnpm demo:dev        # esbuild watch + serve
pnpm demo:build      # esbuild production build

# Lint
pnpm lint            # check for errors
pnpm lint:fix        # autocorrect fixable errors
```

### TypeScript

- Strict mode enabled
- `verbatimModuleSyntax: true`
- `noUncheckedIndexedAccess: true`
- Custom JSX runtime (`jsxImportSource: "tiny-engine"`)

### Linting

ESLint with `typescript-eslint`:

- `@typescript-eslint/no-unused-vars` — error (ignores `_` prefixed)
- `prefer-const` — warn

## License

ISC
