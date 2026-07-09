# Math

The `math` module provides vector, color, and bounds primitives used throughout the engine. All types support multiple input formats via union types.

```ts
import { Vector2, Color, Bounds, vector2, color, bounds } from 'fraxel'
```

## Vector2

2D vector with mutable/immutable operations. Supports construction from multiple formats.

```ts
const a = new Vector2(10, 20) // from x, y
const b = new Vector2([5, 15]) // from tuple
const c = new Vector2({ x: 3, y: 7 }) // from object
const d = new Vector2(5) // uniform (5, 5)
```

### Static Properties

| Property       | Description |
| -------------- | ----------- |
| `Vector2.ZERO` | `(0, 0)`    |
| `Vector2.ONE`  | `(1, 1)`    |

### Static Methods

| Method                | Returns   | Description                           |
| --------------------- | --------- | ------------------------------------- |
| `Vector2.from(value)` | `Vector2` | Creates from any `VectorLike` format. |

### Properties

| Property | Type     | Description       |
| -------- | -------- | ----------------- |
| `x`      | `number` | The x-coordinate. |
| `y`      | `number` | The y-coordinate. |

### Methods

| Method                 | Returns    | Description                                      |
| ---------------------- | ---------- | ------------------------------------------------ |
| `clone()`              | `Vector2`  | Returns a new vector with the same values.       |
| `add(v)`               | `Vector2`  | Adds a vector (mutating).                        |
| `toAdded(v)`           | `Vector2`  | Returns sum of this and another vector.          |
| `subtract(v)`          | `Vector2`  | Subtracts a vector (mutating).                   |
| `toSubtracted(v)`      | `Vector2`  | Returns difference of this and another vector.   |
| `multiply(v)`          | `Vector2`  | Multiplies by a vector (mutating).               |
| `toMultiplied(v)`      | `Vector2`  | Returns product of this and another vector.      |
| `divide(v)`            | `Vector2`  | Divides by a vector (mutating).                  |
| `toDivided(v)`         | `Vector2`  | Returns quotient of this and another vector.     |
| `apply(fn)`            | `Vector2`  | Transforms each component (mutating).            |
| `toApplied(fn)`        | `Vector2`  | Returns new vector with transformed components.  |
| `lerp(to, weight)`     | `Vector2`  | Linearly interpolates towards target (mutating). |
| `toLerped(to, weight)` | `Vector2`  | Returns interpolated vector.                     |
| `equals(v)`            | `boolean`  | Checks equality with another vector.             |
| `normalize()`          | `Vector2`  | Scales to unit length (mutating).                |
| `toJSON()`             | `Position` | Converts to `{ x, y }` object.                   |

## VectorLike

All accepted formats for vector input:

```ts
type VectorLike = Vector2 | Position | [x: number, y: number] | number
```

```ts
import { vector2 } from 'fraxel'

const a = vector2(new Vector2(1, 2)) // Vector2
const b = vector2({ x: 3, y: 4 }) // Position
const c = vector2([5, 6]) // tuple
const d = vector2(7) // uniform (7, 7)
```

## Position

Lightweight `{ x, y }` object alternative to `Vector2`:

```ts
interface Position {
  x: number
  y: number
}
```

## Color

RGBA color with channels in `0`–`1` range. All values are clamped on construction.

```ts
const red = new Color(1, 0, 0)
const transparent = new Color(1, 1, 1, 0)
const fromTuple = new Color([0.5, 0.5, 0.5])
const fromObject = new Color({ r: 1, g: 0.5, b: 0 })
```

### Static Presets

| Preset              | Value          |
| ------------------- | -------------- |
| `Color.WHITE`       | `(1, 1, 1, 1)` |
| `Color.BLACK`       | `(0, 0, 0, 1)` |
| `Color.RED`         | `(1, 0, 0, 1)` |
| `Color.GREEN`       | `(0, 1, 0, 1)` |
| `Color.BLUE`        | `(0, 0, 1, 1)` |
| `Color.TRANSPARENT` | `(1, 1, 1, 0)` |

### Properties

| Property | Type     | Range   | Description    |
| -------- | -------- | ------- | -------------- |
| `r`      | `number` | `0`–`1` | Red channel.   |
| `g`      | `number` | `0`–`1` | Green channel. |
| `b`      | `number` | `0`–`1` | Blue channel.  |
| `a`      | `number` | `0`–`1` | Alpha channel. |

### Methods

| Method      | Returns   | Description                               |
| ----------- | --------- | ----------------------------------------- |
| `clone()`   | `Color`   | Returns a new Color with the same values. |
| `equals(c)` | `boolean` | Checks equality with another color.       |
| `toCSS()`   | `string`  | Converts to CSS `rgba()` string.          |
| `toJSON()`  | `object`  | Returns `{ r, g, b, a }` object.          |

## ColorLike

All accepted formats for color input:

```ts
type ColorLike =
  | Color
  | [r: number, g: number, b: number]
  | [r: number, g: number, b: number, a: number]
  | { r: number; g: number; b: number }
  | { r: number; g: number; b: number; a: number }
```

```ts
import { color } from 'fraxel'

const red = color(1, 0, 0)
const transparent = color(1, 1, 1, 0)
const fromArray = color([0.5, 0.5, 0.5])
const fromObject = color({ r: 1, g: 0.5, b: 0 })
```

## Bounds

Rectangular region with `left`, `top`, `right`, and `bottom` edges. Used for camera limits, collision boundaries, and spatial queries.

```ts
const a = new Bounds(10) // all edges = 10
const b = new Bounds(100, 200) // horizontal=100, vertical=200
const c = new Bounds(0, 0, 800) // left=0, top=0, right=800
const d = new Bounds(0, 0, 800, 600) // left=0, top=0, right=800, bottom=600
```

### Properties

| Property | Type     | Description      |
| -------- | -------- | ---------------- |
| `left`   | `number` | The left edge.   |
| `top`    | `number` | The top edge.    |
| `right`  | `number` | The right edge.  |
| `bottom` | `number` | The bottom edge. |

## BoundsLike

All accepted formats for bounds input:

```ts
type BoundsLike =
  | number
  | [horizontal: number, vertical: number]
  | [left: number, vertical: number, right: number]
  | [left: number, top: number, right: number, bottom: number]
  | { horizontal: number; vertical: number }
  | { left: number; vertical: number; right: number }
  | { left: number; top: number; right: number; bottom: number }
  | Bounds
```

```ts
import { bounds } from 'fraxel'

const a = bounds(10) // all edges = 10
const b = bounds(100, 200) // horizontal, vertical
const c = bounds(0, 0, 800, 600) // left, top, right, bottom
const d = bounds({ left: 0, right: 800 }) // from object
```

## Utility Functions

### clamp

Restricts a value to a given range:

```ts
import { clamp } from 'fraxel'

clamp(0, 5, 10) // 5
clamp(0, -3, 10) // 0
clamp(0, 15, 10) // 10
```

### isVectorLike

Type guard for `VectorLike` values:

```ts
import { isVectorLike } from 'fraxel'

isVectorLike(new Vector2(1, 2)) // true
isVectorLike([3, 4]) // true
isVectorLike('hello') // false
```

### isBoundsLike

Type guard for `BoundsLike` values:

```ts
import { isBoundsLike } from 'fraxel'

isBoundsLike(new Bounds(0, 0, 800, 600)) // true
isBoundsLike(10) // true
isBoundsLike('hello') // false
```

## See Also

- [Filters](./filters.md) — `Color` usage with sprite filters
- [Reactivity](./reactivity.md) — Reactive values with math types
