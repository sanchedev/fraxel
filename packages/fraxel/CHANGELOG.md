# Changelog

## 0.1.0-alpha.4

### Highlights

- **GameMode system** — per-node pause behavior with `INHERIT`, `PLAYING`, `PAUSED`, `ALWAYS`, `NEVER`
- **Pause infrastructure** — `Game.paused` reactive signal, `pauseOnBlur` option, `usePaused()` hook
- **Native hooks pattern** — typed `NodeReference` classes with reactive state, triggers, and imperative methods
- **Warning system** — detects nested colliders that won't participate in physics

### Breaking Changes

- **Removed `useGame()` hook** — replaced by `usePaused()`, `useSize()`, `useScene()` and direct `Game` static methods
- **`Game.blured` renamed to `Game.blurred`** (typo fix)
- **Removed `useEvent`, `useNode`, `useSpawn`, `usePartialNode`** — replaced by native hooks and `NodeReference.spawn()`

### Features

#### Hooks

- **Native NodeReference pattern** — new typed hooks (`useSprite`, `useCollider`, `useRigidBody`, etc.) that return class instances with reactive properties, triggers, and imperative methods
- **Trigger system** — `createTrigger<T>()` and `useTrigger(trigger, callback)` for cross-component pub/sub communication
- **`usePaused()`** — reactive pause state + `play()`/`pause()` controls
- **`useSize()`** — returns game canvas dimensions as `Vector2`
- **`useScene()`** — scene manager access (`current`, `change()`, `preload()`)
- **`useCondition(trigger1, trigger2)`** — reactive boolean toggled by two Triggers
- **`useMatch(signal, record)`** — maps signal value to record (like switch)
- **`useWhen(signal, true, false)`** — ternary expression for signals
- **`createSignal(initial)`** — creates reactive signal outside of hooks (for scripts)
- **`signalSetterFrom(getter)`** — extracts setter from signal getter

#### Game System

- **`GameMode` enum** — controls per-node behavior relative to game pause state (`INHERIT`, `PLAYING`, `PAUSED`, `ALWAYS`, `NEVER`)
- **`Game.paused`** — reactive `SignalGetter<boolean>` for reading pause state
- **`Game.pause()` / `Game.play()`** — static methods to control pause state
- **`pauseOnBlur` option** — `<Game>` prop to auto-pause when browser tab loses focus
- **Node `gameMode` prop** — accepts `Reactive<GameMode>` for dynamic switching

#### Nodes

- **Warning system** — `warn/rigid-body.ts` detects nested colliders that won't participate in physics

#### Math

- **`Color` class** — RGBA color with reactive support, static presets, and factory function

### Documentation

- **README redesigned** — developer landing page with value proposition, example, and architecture overview
- **All node JSDoc updated** — examples now use native hooks pattern
- **Full documentation audit** — 20 fixes across docs/
- **New hook documentation** — `usePaused`, `useSize`, `useScene` documented in hooks.md
- **GameMode documented** — added to nodes.md and AGENTS.md
- **pauseOnBlur documented** — added to getting-started.md
- **createSignal/signalSetterFrom** — documented for script usage

### Fixes

- **Event `on()` method** — now returns unsubscribe function
- **Signal updates** — prevents unnecessary updates for equivalent object values
- **Import paths** — updated to include file extensions

### Internal

- **`core/paused.ts` extracted** — breaks circular dependency between `_node.ts` and `game.ts`
- **Collision/physics systems** — check node's own `gameMode` via `shouldUpdate()`, not parent's
- **`propSignal` for gameMode** — follows existing reactive prop pattern
- **Demo migrated to native hooks** — all components now use `useSprite`, `useCollider`, `useRigidBody`, `useTrigger` pattern
- **`useCondition` rewritten** — now works with `Trigger` pairs instead of `useEvent`
