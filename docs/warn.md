# Warn

The `warn` module provides runtime warnings for common mistakes in fraxel projects.

## Functions

### warnNestedColliders

Logs a console warning if a `RigidBody` node has `Collider` descendants that are not direct children. Colliders must be direct children of a `RigidBody` to participate in physics simulation.

```ts
import { warnNestedColliders } from 'fraxel'
```

| Param  | Type   | Description                                    |
| ------ | ------ | ---------------------------------------------- |
| `node` | `Node` | The root node to inspect for nested colliders. |

#### Example

```tsx
import { warnNestedColliders } from 'fraxel'

// This triggers a warning:
<rigid-body>
  <transform>
    <collider shape={shapes.rectangle(32, 32)} /> // nested — won't work
  </transform>
</rigid-body>

// This does NOT trigger a warning:
<rigid-body>
  <collider shape={shapes.rectangle(32, 32)} /> // direct child — works
</rigid-body>
```

#### Why colliders must be direct children

The physics system only checks direct children of a `RigidBody` for collision detection. Nested colliders (inside a `<transform>` or `<group>`) will not be detected by the physics engine. If you need multiple colliders, add them all as direct children:

```tsx
// Correct — multiple colliders as direct children
<rigid-body>
  <collider shape={shapes.rectangle(32, 16)} group={['player']} collidesWith={['ground']} />
  <collider shape={shapes.circle(8)} group={['player']} collidesWith={['enemy']} />
</rigid-body>
```

### warnUseRef

Logs a console warning when `useRef` is used. `useRef` is deprecated — component functions in fraxel execute only once, so a plain `let` variable at the top of the function body has the same behavior.

```ts
import { warnUseRef } from 'fraxel'
```

#### Example

```tsx
// Before (deprecated)
const count = useRef(0)
count.current++

// After — use a plain let
let count = 0
count++
```

#### Why useRef is deprecated

In fraxel, component functions execute only once during the node tree setup. There is no re-render cycle like in React. This means a `let` variable declared at the top of the component function persists for the lifetime of the node, just like `useRef`.

Using plain variables is simpler and avoids the unnecessary `.current` property access:

```tsx
// Before (deprecated)
const map = useRef(new Map())
map.current.set('key', value)

// After — cleaner syntax
const map = new Map()
map.set('key', value)
```
