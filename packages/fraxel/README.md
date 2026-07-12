# fraxel

> Build 2D games with JSX — no React, no virtual DOM, no re-renders.

[![CI](https://github.com/sanchedev/fraxel/actions/workflows/ci.yml/badge.svg)](https://github.com/sanchedev/fraxel/actions)
[![npm version](https://img.shields.io/badge/version-0.1.0--alpha.4b-blue)](https://github.com/sanchedev/fraxel)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**fraxel** is a custom JSX runtime for building 2D games in the browser. JSX compiles directly to a declarative scene graph rendered to `<canvas>` — no reconciliation, no diffing, just signals driving properties.

<p align="center">
  <img src="https://github.com/sanchedev/fraxel/blob/main/docs/demo.gif" alt="Fraxel demo" width="700" />
</p>

## Install

```bash
npm install fraxel
# or
pnpm add fraxel
# or
yarn add fraxel
```

## Example

A player that moves and jumps with physics, input, and collisions — all in ~35 lines:

```tsx
import { createGame, Game, Scene } from 'fraxel'
import { loadTexture, Input, shapes } from 'fraxel'
import { useRigidBody, useAction, useActionAxis, useEffect } from 'fraxel'

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
    <body ref={rb} position={[80, 50]} mass={1}>
      <sprite textureId={PLAYER} />
      <collider shape={shapes.rectangle(16, 16)} group={['player']} collidesWith={['ground']} />
    </body>
  )
}

const scene = () => (
  <transform>
    <Player />
    <body position={[0, 200]} isStatic>
      <collider shape={shapes.rectangle(300, 16)} group={['ground']} collidesWith={['player']} />
    </body>
  </transform>
)

const game = createGame(
  <GameCreator width={300} height={220} defaultScene="main">
    <SceneDef name="main" component={scene} />
  </GameCreator>,
  document.querySelector('#root')!,
)

game.play()
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

  return <body ref={rb} mass={1} /> // declarative — connects to node
}
```

### Everything is a Node

Sprites, cameras, rigid bodies, timers, animations, audio, text — everything is a node in the same scene graph. Same lifecycle, same hooks, same patterns.

## Core Concepts

Fraxel is built around three ideas:

- **Nodes** describe your game. Sprites, cameras, rigid bodies, timers — everything is a node in the same scene graph with the same lifecycle (`start → update → destroy`).
- **Hooks** interact with nodes. Native hooks (`useSprite`, `useCollider`, etc.) return typed references with reactive state and events.
- **Signals** keep everything reactive. Properties accept `SignalGetter` functions that update automatically when dependencies change — no virtual DOM, no re-renders.

```
<sprite>  ─┐
<collider> ─┤
<camera>   ─┼→ Scene Graph → Node Lifecycle → canvas
<timer>    ─┤
<audio>    ─┘
```

JSX is the declarative language for building these scene graphs. Instead of manually synchronizing objects every frame, game state drives node properties directly through signals. The result is an API that feels familiar to frontend developers while remaining purpose-built for real-time rendering.

## Features

- **Custom JSX Runtime** — own runtime, not React
- **Declarative Scene Graph** — JSX maps to nodes
- **Typed Node References** — reactive state + events + methods
- **Fine-grained Reactivity** — signals, not re-renders
- **Physics & Collision Detection** — rigid bodies, spatial hash, raycasts
- **GameMode** — per-node pause behavior (ALWAYS, PAUSED, INHERIT, etc.)
- **Camera System** — zoom, offset, smoothing, shake
- **Audio Playback** — sound loading and playback
- **Animation & Tweening** — sprite sheets, easing, sequences
- **Asset Loading** — batch loading with progress
- **Input System** — actions, keyboard, pointer
- **TypeScript-first** — strict, fully typed

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

## Package Exports

```tsx
// Main entry — nodes, math, collision, input, assets, animation
import { Input, shapes, loadTexture, Vector2 } from 'fraxel'

// Hooks
import { useSprite, useRigidBody, useEffect } from 'fraxel'

// JSX components
import { Game, Scene, List, Fragment } from 'fraxel'
```

## License

MIT
