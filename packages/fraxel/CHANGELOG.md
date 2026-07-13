# Changelog

## 0.1.0-alpha.6

### Highlights

- **Rotation fix for rectangles** — collision shapes now rotate around the node's position (matching canvas rendering) instead of the rectangle's geometric center. This eliminates position offsets between visual and collision shapes at non-zero rotation angles. Affects all rectangle collision pairs (rect-rect, rect-circle, rect-capsule).
- **Component renames** — `Game` → `GameRoot`, `Scene` → `SceneRoot` for clarity.
- **Import path cleanup** — removed `fraxel/hooks` and `fraxel/jsx` subpath exports. All hooks and JSX utilities are now exported from the main `'fraxel'` entry point.
- **Build system** — switched from `tsc` to `tsdown` for building. Added `tsdown.config.ts`.
- **Node2D rotation support** — added `rotation` property, `globalRotation` getter/setter, and `getLocalPosition`/`getGlobalPosition` improvements.
- **Vector2 methods** — added `min`, `max`, `rotate`, and `toRotated` methods.

### Bug Fixes

- **Rectangular collision offset** — `getRotatedRectCorners`, `closestPointOnRotatedRect`, `obbRectOverlap`, `getBoundsByRectangle`, `computeRectCircleOverlap`, `computeRectCapsuleOverlap`, and `#rectangleCapsuleOverlap` all corrected to rotate around `pos` instead of `pos + size/2`.
- **Error handling** — updated to reflect new component names (`GameRoot`, `SceneRoot`).

### Breaking Changes

- **`fraxel/hooks` removed** — import hooks directly from `'fraxel'`:
  ```ts
  // Before
  import { useSprite } from 'fraxel/hooks'

  // Now
  import { useSprite } from 'fraxel'
  ```
- **`fraxel/jsx` removed** — import JSX utilities directly from `'fraxel'`:
  ```ts
  // Before
  import { List, Fragment } from 'fraxel/jsx'

  // Now
  import { List, Fragment } from 'fraxel'
  ```
