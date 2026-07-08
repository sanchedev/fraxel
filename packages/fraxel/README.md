# fraxel

> Build 2D games with JSX — no React, no virtual DOM, no re-renders.

[![CI](https://github.com/sanchedev/fraxel/actions/workflows/ci.yml/badge.svg)](https://github.com/sanchedev/fraxel/actions)
[![npm version](https://img.shields.io/badge/version-0.1.0--alpha.3-blue)](https://github.com/sanchedev/fraxel)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**fraxel** is a custom JSX runtime for building 2D games in the browser. JSX compiles directly to a declarative scene graph rendered to `<canvas>` — no reconciliation, no diffing, just signals driving properties.

## Example

A player that moves and jumps with physics, input, and collisions — all in ~35 lines:

```tsx
import { createGame, Game, Scene } from 'fraxel/jsx'
import { loadTexture, Input, shapes } from 'fraxel'
import { useRigidBody, useAction, useActionAxis, useEffect } from 'fraxel/hooks'

const PLAYER = await loadTexture('/assets/player.png') // waits for image load

const Jump = Input.createAction({ key: ' ' })
const Left = Input.createAction({ key: 'a' })
const Right = Input.createAction({ key: 'd' })

function Player() {
  const rb = useRigidBody()
  const jump = useAction(Jump)
  const dir = useActionAxis(Left, Right)

  useEffect(() => {
    if (jump.justPressed() && rb.isGrounded()) rb.applyImpulse([0, -400])
    rb.setVelocity([dir() * 120, rb.velocity().y])
  })

  return (
    <rigid-body ref={rb} position={[80, 50]}>
      <sprite textureId={PLAYER} />
      <collider shape={shapes.rectangle(16, 16)} group={['player']} collidesWith={['ground']} />
    </rigid-body>
  )
}

const scene = () => (
  <transform>
    <Player />
    <rigid-body position={[0, 200]} isStatic>
      <collider shape={shapes.rectangle(300, 16)} group={['ground']} collidesWith={['player']} />
    </rigid-body>
  </transform>
)

const game = createGame(
  <Game width={300} height={220} defaultScene="main">
    <Scene name="main" component={scene} />
  </Game>,
  document.querySelector('#root')!,
)

game.play()
```

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

## Why fraxel?

### Custom JSX Runtime

fraxel ships its own JSX runtime. JSX is not React — it's a language feature. fraxel uses it to build a declarative scene graph that compiles directly to canvas draw calls.

```tsx
// This JSX...
<sprite textureId={PLAYER} position={[80, 50]} />

// ...becomes a Sprite node in the scene graph
```

### Fine-grained Reactivity

Properties accept signals directly. When a signal changes, only the affected property updates — no virtual DOM diffing, no re-renders.

```tsx
// Signals drive properties directly — no useEffect needed
const brightness = useComputed(() => (health() > 50 ? 1.2 : 0.5))
return <sprite textureId={PLAYER} brightness={brightness} />
```

### Typed Node References

Hooks like `useSprite()` or `useRigidBody()` return typed references with reactive state, event triggers, and imperative methods — all in one place.

```tsx
function Player() {
  const rb = useRigidBody()

  useEffect(() => {
    rb.applyImpulse([0, -400]) // imperative
  })

  return <rigid-body ref={rb} /> // declarative — connects to node
}
```

### Everything is a Node

Sprites, cameras, rigid bodies, timers, animations, audio, text — everything is a node in the same scene graph. Same lifecycle, same hooks, same patterns.

```
<sprite>  ─┐
<collider> ─┤
<camera>   ─┼→ Scene Graph → Node Lifecycle → canvas
<timer>    ─┤
<audio>    ─┘
```

## Core Concepts

**Nodes** represent game entities. Each has a lifecycle (`start → update → destroy`) and participates in the scene graph.

**Hooks** connect to nodes declaratively. Native hooks (`useSprite`, `useCollider`, etc.) return typed references with reactive state and events.

**Signals** power the reactivity system. Properties accept `SignalGetter` functions that update automatically when dependencies change.

## Features

- **Custom JSX Runtime** — own runtime, not React
- **Declarative Scene Graph** — JSX maps to nodes
- **Typed Node References** — reactive state + events + methods
- **Fine-grained Reactivity** — signals, not re-renders
- **Physics & Collision Detection** — rigid bodies, spatial hash, raycasts
- **Camera System** — zoom, offset, smoothing, shake
- **Audio Playback** — sound loading and playback
- **Animation & Tweening** — sprite sheets, easing, sequences
- **Asset Loading** — batch loading with progress
- **Input System** — actions, keyboard, pointer
- **TypeScript-first** — strict, fully typed

## Import Paths

```tsx
// Main entry — nodes, math, collision, input, assets, animation
import { Input, shapes, loadTexture, Vector2 } from 'fraxel'

// Hooks
import { useSprite, useRigidBody, useEffect } from 'fraxel/hooks'

// JSX components
import { Game, Scene, List, Fragment } from 'fraxel/jsx'
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
