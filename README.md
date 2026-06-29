# tiny-engine

> A lightweight JSX runtime for building 2D games in the browser.

[![npm version](https://img.shields.io/badge/version-0.0.0-blue)](https://github.com/user/tiny-engine)
[![License: ISC](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Built with TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

![tiny-engine icon](packages/demo/assets/icon.png)

**tiny-engine** lets you build 2D games using JSX syntax with a custom runtime — no React required. It provides nodes, hooks, collision detection, animation, and reactive state out of the box.

## Features

- **JSX Runtime** — Write game scenes with `<transform>`, `<sprite>`, `<collider>`, and more
- **Collision System** — Rectangle and circle shapes with spatial hash broadphase
- **Raycast Detection** — Project rays to detect colliders along a direction
- **Reactive Signals** — `Signal<T>` for state management with automatic re-rendering
- **Sprite Animation** — Frame-based animations from sprite sheets
- **Clickable Node** — Pointer interactions (click, hover) on child elements
- **Sprite Filters** — brightness, grayscale, modulate, contrast, saturate, hueRotate, invert, opacity
- **Timer Node** — Countdown timer with events
- **Scene Management** — Lazy-loaded scenes with transitions
- **TypeScript-first** — Full type safety with `verbatimModuleSyntax`

## Quick Start

```tsx
import { Game, Scene, createGame } from 'tiny-engine/jsx'

const game = createGame(
  <Game width={320} height={240} defaultScene="main">
    <Scene name="main" component={() => import('./scenes/main.js')} />
  </Game>,
  document.getElementById('root')!,
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

## Nodes

Every game object is built from **nodes** — JSX elements that map to engine classes.

| Node | JSX Tag | Description |
|------|---------|-------------|
| `Transform` | `<transform>` | Positioning container for child nodes |
| `Sprite` | `<sprite>` | Displays a texture with optional filters |
| `AnimationPlayer` | `<animation-player>` | Plays frame-based animations |
| `Collider` | `<collider>` | Detects overlaps with other colliders |
| `RayCast` | `<ray-cast>` | Projects a ray to detect colliders |
| `Clickable` | `<clickable>` | Detects click/hover pointer events |
| `Timer` | `<timer>` | Counts down and fires events |

### Transform

```tsx
<transform position={[100, 50]}>
  <sprite textureId={playerTexture} />
</transform>
```

### Sprite

```tsx
<sprite
  textureId={playerTexture}
  sourceSize={[16, 16]}
  displaySize={[32, 32]}
  brightness={1.2}
  modulate={[1, 0.5, 0]}
/>
```

### Clickable

```tsx
<sprite ref={sprite} textureId={btnTexture}>
  <clickable
    size={[64, 32]}
    onClick={() => console.log('clicked')}
    onMouseEnter={() => console.log('hover in')}
    onMouseExit={() => console.log('hover out')}
  />
</sprite>
```

- `size` is required (no default hit area)
- Events: `clicked`, `mouseEntered`, `mouseExited`
- Set `gameConfig.testOptions.showClickables = true` to visualize areas

### Timer

```tsx
const timer = useRefNode(PrimaryNode.Timer)

<timer
  ref={timer}
  duration={3}
  onTimeChange={(t) => console.log(t)}
  onTimerEnd={() => console.log('done')}
  autoPlay
/>
```

- `duration` is in seconds
- `autoPlay` starts the timer immediately
- Methods: `play()`, `pause()`, `stop()`

## Hooks

| Hook | Description |
|------|-------------|
| `useRefNode(type)` | Creates a typed reference to pass as `ref` |
| `useEvent(node, event, callback)` | Type-safe event subscription with auto-cleanup |
| `useEffect(fn, signals)` | Runs effect on mount and when signals change |
| `useSignal(initial)` | Creates reactive state that triggers re-renders |
| `useComputed(fn, deps)` | Creates a derived signal that recomputes when deps change |
| `useMount(fn)` | Runs once on mount, cleanup on destroy |
| `useSpawn(node)` | Returns a function to dynamically spawn children |
| `useGame()` | Access game controls (play, pause, changeScene) |
| `useChild(path, type)` | Gets a reference to a child node by path |
| `useScript(ref)` | Retrieves the TinyScript attached to a node |
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
  const [health, setHealth] = useSignal(100)

  useEffect(() => {
    console.log('Health changed:', health())
  })

  return (
    <transform>
      {/* health.value triggers re-render when set */}
    </transform>
  )
}
```

### useComputed

```tsx
import { useSignal, useComputed } from 'tiny-engine/hooks'

function CooldownSprite() {
  const [time, setTime] = useSignal(0)
  const progress = useComputed(
    () => time() / 3 // 3 second cooldown
  )

  return (
    <transform>
      {/* progress.value updates when time changes */}
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
      <clickable onClick={() => spawn(<Enemy />)}>
        <sprite textureId={BUTTON} />
      </button>
    </transform>
  )
}
```

## Sprite Filters

Sprites support CSS-like visual filters via props:

```tsx
<sprite
  textureId={TEX}
  brightness={1.2}       // 0=black, 1=base, 2=white
  grayscale={0.5}        // 0=color, 1=grayscale
  modulate={[1, 0.5, 0]} // RGB tint [r, g, b] 0-1
  contrast={1.5}         // 0=no contrast, 1=base
  saturate={0.8}         // 0=desaturated, 1=base
  hueRotate={90}         // degrees
  invert={0.5}           // 0=normal, 1=inverted
  opacity={0.8}          // 0=transparent, 1=opaque
/>
```

Filters are applied via `ctx.filter` in the canvas rendering pipeline. `modulate` uses `globalCompositeOperation: 'multiply'` with a fill color.

## Input System

Unified pointer event system. All events use "pointer" naming:

| Property | Description |
|----------|-------------|
| `pointer.position` | Current pointer position in game coords |
| `pointer.isDown` | Whether the pointer is currently pressed |
| `pointer.wasClicked` | Whether the pointer was clicked this frame |

**Events:** `pointerDown`, `pointerUp`, `pointerMoved`, `clicked`

All pointer events include `position` (game coords). Use `preventDefault` option to suppress default browser behavior (e.g., context menu).

```ts
const input = new Input(canvas, { preventDefault: ['contextMenu'] })
input.on('pointerDown', (e) => {
  console.log(e.position) // { x, y } in game coords
})
input.destroy() // removes all event listeners
```

**Important:** Always call `input.destroy()` when the game/scene is destroyed to prevent memory leaks.

## Game.destroy

Call `game.destroy()` to clean up the game loop, input listeners, and child node listeners:

```ts
const game = new Game(canvas, config)
// ... later
game.destroy() // stops loop, removes all listeners
```

## Collision System

### Shapes

Define collision shapes with the `shapes` factory:

```tsx
import { shapes } from 'tiny-engine'

<collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
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
- Clickable seed selection with cooldown timers

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

**Order matters**: build `tiny-engine` before `demo` if running separately, since demo depends on `workspace:*` link to the built output.

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
