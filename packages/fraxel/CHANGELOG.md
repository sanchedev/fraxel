# Changelog

## 0.1.0-alpha.5

### Highlights

- **Game refactored** — separated loop lifecycle (`play`/`stop`) from pause state (`pause`/`resume`). `Game.isRunning` and `Game.isPaused` are now reactive signals. `Game.paused` removed.
- **SceneManager standalone** — `SceneManager` is now a standalone singleton, no longer accessed via `Game.sceneManager`. Import directly from `'fraxel'`.
- **Trigger joins events** — `Trigger` class moved from hooks to `events/trigger.ts` alongside `Event`. Now exported from `'fraxel'` (not just `fraxel/hooks`). `createTrigger` and `useTrigger` remain in `fraxel/hooks`.
- **DPR canvas fix** — canvas resize no longer resets pixels when dimensions haven't changed, preventing transparent backgrounds on window resize.
- **Hooks cleanup simplified** — removed redundant `trigger.clear()` calls from hook references; `Event.clean()` already clears connected triggers automatically.
- **`useGame` hook** — new derived hook for imperative game loop control (`play`/`stop`/`destroy`) and browser focus triggers (`blurred`/`focused`).
- **`useScene` change** — `current` property replaced with `getCurrent()` function (no longer nullable).
- **`TileMap` node** — tile-based map rendering with chunked collision support. Validates uniform rows and valid tile keys. Supports `static` colliders via chunked `RigidBody` physics.
- **`View` node** — screen-space UI rendering. Resets canvas transform to DPR scale without position or size, ideal for HUD overlays.
- **`createSignal` / `clearSignal`** — `createSignal` creates reactive signals outside components; `clearSignal` manually unsubscribes all listeners.
- **Node destruction fix** — `destroy()` now works for parentless nodes (scene root). Nodes no longer continue in `CollisionSystem`/`PhysicsSystem` after being destroyed. Added `cleanEvents()` overrides to `Collider`, `RayCast`, `Timer`, and `AudioPlayer`.
- **JSX tag renames** — `PrimaryNode` enum values shortened for cleaner JSX:
  - `AnimationPlayer` — `'animation-player'` → `'animator'`
  - `RayCast` — `'ray-cast'` → `'raycast'`
  - `AudioPlayer` — `'audio-player'` → `'audio'`
  - `RigidBody` — `'rigid-body'` → `'body'`

### Breaking Changes

- `Game.paused` removed — use `Game.isPaused()` (reactive) or `Game.pause()`/`Game.resume()` instead.
- `Game.sceneManager` removed — use the standalone `SceneManager` import.
- `Trigger` no longer exported from `fraxel/hooks` only — it's now in `fraxel` directly. Update imports:
  ```ts
  // Before (still works, re-exported)
  import { Trigger } from 'fraxel/hooks'

  // Now preferred
  import { Trigger } from 'fraxel'
  ```
- `useScene().current` removed — use `useScene().getCurrent()` instead (returns `string` instead of `string | null`).
- JSX tag renames — update your JSX:
  - `<animation-player>` → `<animator>`
  - `<raycast>` → `<raycast>` (unchanged, value was `'ray-cast'` now `'raycast'`)
  - `<audio-player>` → `<audio>`
  - `<body>` (unchanged, value was `'rigid-body'` now `'body'`)
