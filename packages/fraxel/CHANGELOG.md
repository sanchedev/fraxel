# Changelog

## 0.1.0-alpha.7

### Highlights

- **Trigger API cleanup** — replaced the old `Event` API with `Trigger` and `createTrigger()` for pub/sub and node lifecycle/event hooks.
- **Lifecycle trigger renames** — node lifecycle triggers now use `onStart`, `onUpdate`, `onDraw`, and `onDestroy`.
- **Intrinsic event props cleanup** — JSX event props now map to trigger names such as `onClick`, `onColliderEnter`, `onTimeout`, and `onAnimEnd`.
- **Action axis input** — added `Input.getActionAxis(negativeAction, positiveAction)` and `useActionAxis()` support for action-based directional input.

### Breaking Changes

- **`Event` removed** — use `Trigger`, `createTrigger()`, and `useTrigger()` instead.
- **Lifecycle event names changed** — replace `started`, `updated`, `drawed`, and `destroyed` with `onStart`, `onUpdate`, `onDraw`, and `onDestroy`.
- **Node trigger names changed** — replace old names like `clicked`, `colliderEntered`, `colliderExited`, `timeout`, `timeChanged`, and `animationEnded` with `onClick`, `onColliderEnter`, `onColliderExit`, `onTimeout`, `onTimeChange`, and `onAnimEnd`.
- **Raw key helpers removed** — `Input.isKeyPressed`, `Input.isJustKeyUnpressed`, and `Input.getKeyAxis` were removed. Define actions with `Input.createAction()` and query them with action APIs.
- **`useRef()` removed** — use typed native node hooks such as `useSprite()`, `useCollider()`, `useTimer()`, or a plain local variable when no native reference is needed.
- **Deprecated sprite crop props removed** — replace `margin` and `sourceSize` with `source={region(x, y, width, height)}`.

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
