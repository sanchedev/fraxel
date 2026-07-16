# Changelog

## 0.1.0-alpha.7

### Highlights

- **Trigger API cleanup** — replaced the old `Event` API with `Trigger` and `createTrigger()` for pub/sub and node lifecycle/event hooks.
- **Lifecycle trigger renames** — node lifecycle triggers now use `onStart`, `onUpdate`, `onDraw`, and `onDestroy`.
- **Intrinsic event props cleanup** — JSX event props now map to trigger names such as `onClick`, `onColliderEnter`, `onTimeout`, and `onAnimEnd`.
- **Action axis input** — added `Input.getActionAxis(negativeAction, positiveAction)` and `useActionAxis()` support for action-based directional input.
- **Shape-based pointer targets** — `Clickable` now uses collision `Shape` definitions for pointer hit-testing, enabling rectangle, circle, and capsule clickable areas.
- **Sprite tint rename** — renamed the sprite color multiplier from `modulate` to `tint` for clearer public API naming.
- **Consistent node hook setters** — node hooks now expose setters for mirrored public writable properties such as camera zoom, geometry shape, clickable disabled state, timer duration, and audio controls.
- **Hex colors** — `ColorLike` now accepts CSS-style hex strings (`#RGB`, `#RGBA`, `#RRGGBB`, and `#RRGGBBAA`) anywhere colors are accepted.
- **Text styling props** — `Text` now uses direct reactive props such as `fillColor`, `fontSize`, `fontFamily`, `fontWeight`, and `textAlign`.
- **Effect phases** — `useEffect()` now flushes after node updates and before physics, and `usePostPhysicsEffect()` runs after physics before draw.
- **Sound loading cache** — `loadSound()` now deduplicates repeated and concurrent calls by URL.
- **Signal API rename** — `createSignal()` was renamed to `defineSignal()` for signals created outside hook/component scope.

### Breaking Changes

- **`Event` removed** — use `Trigger`, `createTrigger()`, and `useTrigger()` instead.
- **Lifecycle event names changed** — replace `started`, `updated`, `drawed`, and `destroyed` with `onStart`, `onUpdate`, `onDraw`, and `onDestroy`.
- **Node trigger names changed** — replace old names like `clicked`, `colliderEntered`, `colliderExited`, `timeout`, `timeChanged`, and `animationEnded` with `onClick`, `onColliderEnter`, `onColliderExit`, `onTimeout`, `onTimeChange`, and `onAnimEnd`.
- **Raw key helpers removed** — `Input.isKeyPressed`, `Input.isJustKeyUnpressed`, and `Input.getKeyAxis` were removed. Define actions with `Input.createAction()` and query them with action APIs.
- **Clickable `size` removed** — use `shape={shapes.rectangle(width, height)}` instead of `size={[width, height]}`. Clickables now support all collision shapes.
- **Sprite `modulate` renamed** — use the `tint` prop, `Sprite.tint`, and `sprite.setTint()` instead of `modulate`, `Sprite.modulate`, and `sprite.setModulate()`.
- **Text `style` removed** — use direct props like `fillColor`, `fontSize`, `fontFamily`, `fontWeight`, and `textAlign`. `TextStyle.foregroundColor` was renamed to `fillColor`.
- **`useRef()` removed** — use typed native node hooks such as `useSprite()`, `useCollider()`, `useTimer()`, or a plain local variable when no native reference is needed.
- **Deprecated sprite crop props removed** — replace `margin` and `sourceSize` with `source={region(x, y, width, height)}`.
- **Effect timing changed** — `useEffect()` callbacks no longer flush through microtasks; they flush inside the game loop before physics.
- **`createSignal()` renamed** — use `defineSignal()` for signals created outside hook/component scope.

### Bug Fixes

- **Documentation consistency** — updated JSDoc, templates, and operational docs to reference current trigger, input, and hook APIs.

## 0.1.0-alpha.6d

### Highlights

- **Rotation fix for rectangles** — collision shapes now rotate around the node's position (matching canvas rendering) instead of the rectangle's geometric center. This eliminates position offsets between visual and collision shapes at non-zero rotation angles. Affects all rectangle collision pairs (rect-rect, rect-circle, rect-capsule).
- **Component renames** — `Game` → `GameRoot`, `Scene` → `SceneRoot` for clarity.
- **Import path cleanup** — removed hook and JSX subpath exports. All hooks and JSX utilities are now exported from the main `'fraxel'` entry point.
- **Build system** — switched from `tsc` to `tsdown` for building. Added `tsdown.config.ts`.
- **Node2D rotation support** — added `rotation` property, `globalRotation` getter/setter, and `getLocalPosition`/`getGlobalPosition` improvements.
- **Vector2 methods** — added `min`, `max`, `rotate`, and `toRotated` methods.
- **`pixelated` option** — `Game.setup()` and `<GameRoot>` accept a `pixelated` flag that disables canvas image smoothing for pixel-art rendering.
- **`source` property** - added `source` for texture atlas cropping.

### Bug Fixes

- **Rectangular collision offset** — `getRotatedRectCorners`, `closestPointOnRotatedRect`, `obbRectOverlap`, `getBoundsByRectangle`, `computeRectCircleOverlap`, `computeRectCapsuleOverlap`, and `#rectangleCapsuleOverlap` all corrected to rotate around `pos` instead of `pos + size/2`.
- **Error handling** — updated to reflect new component names (`GameRoot`, `SceneRoot`).
- **Sprite display and source** - moved to render the right positions.
- **Hooks in Scene** - updated to create a hook context in Scenes.

### Breaking Changes

- **Hook subpath removed** — import hooks directly from `'fraxel'`:
  ```ts
  import { useSprite } from 'fraxel'
  ```
- **JSX subpath removed** — import JSX utilities directly from `'fraxel'`:
  ```ts
  import { List, Fragment } from 'fraxel'
  ```
