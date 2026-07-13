# fraxel

> **Declarative 2D game engine powered by JSX and fine-grained reactivity.**

[![CI](https://github.com/sanchedev/fraxel/actions/workflows/ci.yml/badge.svg)](https://github.com/sanchedev/fraxel/actions)
[![npm version](https://img.shields.io/npm/v/fraxel)](https://www.npmjs.com/package/fraxel)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Fraxel** is a declarative 2D game engine for the browser built around a custom JSX runtime.

Instead of rendering HTML, JSX compiles directly into a scene graph rendered on a `<canvas>`. Signals update node properties automatically, eliminating reconciliation, virtual DOM diffing and component re-renders.

Designed for developers who enjoy declarative APIs while keeping the performance and architecture expected from a real-time game engine.

<p align="center">
  <img src="https://github.com/sanchedev/fraxel/blob/main/docs/demo.gif" alt="Fraxel demo" width="700" />
</p>

## Why Fraxel?

- 🎮 Declarative scene graph powered by JSX
- ⚡ Fine-grained reactivity with signals
- 🧩 Typed node references through native hooks
- 💥 Built-in physics and collision detection
- 🎥 Camera, audio, animation and asset loading
- 📦 TypeScript-first API
- 🚫 No React
- 🚫 No virtual DOM
- 🚫 No component re-renders

---

# Install

```bash
npm install fraxel
```

or

```bash
pnpm add fraxel
```

or

```bash
yarn add fraxel
```

---

# Quick Example

A complete player with movement, jumping, collisions and physics.

Create a new project using `npx create-fraxel my-game` with template `Example`.

Paste it in src/main.tsx

```tsx
import {
  Input,
  loadTexture,
  shapes,
  createGame,
  GameRoot,
  SceneRoot,
  useRigidBody,
  useRayCast,
  useAction,
  useActionAxis,
  useEffect,
} from 'fraxel'

const PLAYER = await loadTexture('/player.png')

const Left = Input.createAction({ key: 'a' })
const Right = Input.createAction({ key: 'd' })
const Jump = Input.createAction({ key: ' ' })

function Player() {
  const body = useRigidBody()
  const detector = useRayCast()

  const jump = useAction(Jump)
  const axis = useActionAxis(Left, Right)

  useEffect(() => {
    body.setVelocity([axis() * 120, body.velocity().y])

    if (jump.justPressed() && detector.detected()) {
      body.applyImpulse([0, -400])
    }
  })

  return (
    <body ref={body} position={[80, 40]} mass={1}>
      <sprite textureId={PLAYER} />
      <collider shape={shapes.rectangle(16, 16)} group="player" collidesWith="ground" />
      <raycast ref={detector} position={[8, 16]} direction={[0, 2]} collidesWith={['ground']} />
    </body>
  )
}

function MainScene() {
  return (
    <>
      <Player />

      <body position={[0, 200]} isStatic>
        <collider shape={shapes.rectangle(400, 16)} group={['ground']} collidesWith={['player']} />
      </body>
    </>
  )
}

const game = createGame(
  <GameRoot width={320} height={240} defaultScene="main">
    <SceneRoot name="main" component={MainScene} />
  </GameRoot>,
  document.querySelector('#root')!,
)

game.play()
```

Do `npm run dev` and play.

---

# Setup

Enable Fraxel's JSX runtime.

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "fraxel"
  }
}
```

---

# What makes Fraxel different?

Fraxel combines ideas from modern frontend frameworks with the architecture of a traditional game engine.

Instead of rendering HTML, JSX creates nodes inside a scene graph.

Instead of component state, signals update node properties directly.

Instead of DOM refs, hooks expose strongly typed node references with methods, reactive state and events.

The result feels familiar to frontend developers while remaining purpose-built for real-time rendering.

---

# Core Concepts

## Declarative Scene Graph

Every JSX element becomes a node.

```tsx
<Player>
  <sprite />
  <collider />
</Player>
```

becomes

```text
Transform
└── RigidBody
    ├── Sprite
    └── Collider
```

The scene graph drives rendering, physics, audio, animation and every engine subsystem.

---

## Fine-grained Reactivity

Properties accept signals directly.

```tsx
const player = useRigidBody()

const rotation = useComputed(() => player.velocity().x * 0.01)

return (
  <body ref={player} rotation={rotation}>
    <sprite textureId={PLAYER} />
  </body>
)
```

Only the affected property updates.

No render loop.

No reconciliation.

No virtual DOM.

---

## Typed Node References

Native hooks expose references to engine nodes.

```tsx
const sprite = useSprite()

sprite.position()
sprite.rotation()
sprite.setBrightness(1.2)
sprite.setModulate([1, 0.5, 0.5, 1])
sprite.setOpacity(0.8)

return <sprite ref={sprite} textureId={PLAYER} />
```

Each reference combines:

- reactive state
- imperative methods
- strongly typed events

---

## Trigger System

Triggers allow nodes to communicate without tight coupling.

```tsx
const died = createTrigger<[]>()

useTrigger(died, () => {
  console.log('Player died')
})

died.emit()
```

---

# Features

- ✅ Custom JSX runtime
- ✅ Declarative scene graph
- ✅ Fine-grained reactivity
- ✅ Signals & computed values
- ✅ Native hooks
- ✅ Typed node references
- ✅ Trigger system
- ✅ Physics engine
- ✅ Collision detection
- ✅ Raycasts
- ✅ Camera system
- ✅ Audio playback
- ✅ Sprite animations
- ✅ Tweening
- ✅ Asset loading
- ✅ Input actions
- ✅ Pixel-art rendering
- ✅ TypeScript-first

---

# Package Structure

```tsx
import {
  // Engine
  loadTexture,
  Input,
  shapes
  createGame,

  // JSX runtime
  GameRoot,
  SceneRoot,
  Fragment,

  // Hooks
  useRigidBody,
  useSprite,
  useEffect,
} from 'fraxel'
```

---

# Documentation

[https://fraxel.dev](https://fraxel.mintlify.app/)

---

# Philosophy

Fraxel is designed around one simple idea:

> **Games should be described, not synchronized.**

JSX describes the scene.

Signals describe the state.

Hooks interact with nodes.

Fraxel keeps everything in sync.

---

# License

MIT
