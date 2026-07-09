# Collision & Physics

The collision module handles shape definitions, overlap detection, and physics simulation.

```ts
import { shapes, PhysicsSystem, vector2 } from 'fraxel'
```

## Shapes

Define collision shapes with the `shapes` factory:

```tsx
import { shapes } from 'fraxel'

<collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
<collider shape={shapes.circle(16)} group={['projectile']} collidesWith={['zombie']} />
<collider shape={shapes.capsule(60, 20)} group={['player']} collidesWith={['ground']} />
```

| Factory                                      | Type             | Description                 |
| -------------------------------------------- | ---------------- | --------------------------- |
| `shapes.rectangle(width, height)`            | `RectangleShape` | Axis-aligned rectangle.     |
| `shapes.circle(radius)`                      | `CircleShape`    | Circle with given radius.   |
| `shapes.capsule(length, radius, direction?)` | `CapsuleShape`   | Capsule (default vertical). |

Capsule shapes have a `length` (total tip-to-tip including caps), `radius`, and optional `direction` (`'vertical'` default or `'horizontal'`).

## Narrowphase Detection

- `Narrowphase.detect(a, b)` dispatches all 9 combinations: rectangle↔rectangle, circle↔circle, capsule↔capsule, rectangle↔circle, circle↔rectangle, rectangle↔capsule, capsule↔rectangle, circle↔capsule, capsule↔circle.
- Each shape has its own overlap algorithm.

## Groups & Events

Colliders use groups for filtering. Events fire on both colliders:

```tsx
import { useCollider, useTrigger } from 'fraxel/hooks'

function Projectile() {
  const collider = useCollider()

  useTrigger(collider.colliderEntered, (enemyCollider) => {
    enemyCollider.parent.script.applyDamage(20)
  })

  return (
    <collider
      ref={collider}
      shape={shapes.circle(4)}
      group={['projectile']}
      collidesWith={['enemy']}
    />
  )
}
```

- `Collider` node requires `shape` prop.
- `group` and `collidesWith` are private with getters (immutable after construction).
- Triggers: `colliderEntered`, `colliderExited`.

## RayCast

Project rays to detect colliders along a direction:

```tsx
import { useRayCast, useTrigger } from 'fraxel/hooks'

function Detector() {
  const raycast = useRayCast()

  useTrigger(raycast.colliderEntered, (collider) => {
    console.log('Detected:', collider)
  })

  return <ray-cast ref={raycast} direction={[100, 0]} collidesWith={['enemy']} />
}
```

- `RayCast` node has `direction` (Vector2) and `collidesWith` (string[]).
- `getCollider()` returns the currently detected collider or null.
- Triggers: `colliderEntered`, `colliderExited`.
- Events emit on both the detected collider AND the raycast itself.

## Spatial Hash

- `#getBounds()` handles all shapes: rectangle uses `position` to `position + size`, circle uses `center ± radius`, capsule uses bounding box based on direction.
- Raycasts query candidates directly from `#colliderGroups` (not the spatial hash).
- The spatial hash is only used for collider-vs-collider broadphase.

## Physics

Add physics simulation with `<rigid-body>`:

```tsx
import { shapes } from 'fraxel'

function Ball() {
  return (
    <rigid-body position={[100, 0]} mass={1} bounce={0.8}>
      <sprite textureId={BALL} />
      <collider shape={shapes.circle(8)} group={['ball']} collidesWith={['ground']} />
    </rigid-body>
  )
}
```

### Props

| Prop         | Type      | Default | Description                               |
| ------------ | --------- | ------- | ----------------------------------------- |
| `mass`       | `number`  | `1`     | Body mass (0 = infinite mass / static).   |
| `friction`   | `number`  | `0.1`   | Friction coefficient (0–1).               |
| `bounce`     | `number`  | `0`     | Restitution (0 = no bounce, 1 = perfect). |
| `isStatic`   | `boolean` | `false` | If true, the body doesn't move.           |
| `useGravity` | `boolean` | `true`  | If false, gravity is ignored.             |

### Multiple Colliders

A `RigidBody` supports multiple child `<collider>` nodes for compound shapes:

```tsx
function CompositeBody() {
  return (
    <rigid-body mass={2}>
      <collider shape={shapes.rectangle(32, 16)} group={['body']} collidesWith={['ground']} />
      <collider shape={shapes.circle(8)} group={['head']} collidesWith={['ground']} />
    </rigid-body>
  )
}
```

## Gravity

The default gravity is `980 px/s²` downward (like Earth gravity in pixel units).

```tsx
import { PhysicsSystem, vector2 } from 'fraxel'

// Change gravity at runtime
PhysicsSystem.gravity = vector2(0, -200) // float upward

// Moon gravity
PhysicsSystem.gravity = vector2(0, 160)
```

## Forces & Impulses

Access the physics body through the `useRigidBody` hook:

```tsx
import { useRigidBody, useEffect } from 'fraxel/hooks'

function Player() {
  const rb = useRigidBody()

  useEffect(() => {
    // Apply a continuous force (like thrust)
    rb.applyForce([100, 0])
  })

  // Apply an instant impulse (like a jump)
  const jump = () => {
    rb.applyImpulse([0, -400])
  }

  return (
    <rigid-body ref={rb}>
      <sprite textureId={PLAYER} />
      <collider shape={shapes.rectangle(16, 16)} group={['player']} collidesWith={['ground']} />
    </rigid-body>
  )
}
```

### applyForce(force: VectorLike)

Applies a continuous force (pixels/second²). Forces are accumulated and applied during physics integration. Use for thrust, wind, or persistent effects.

### applyImpulse(impulse: VectorLike)

Applies an instant velocity change (pixels/second). Use for jumps, explosions, or knockback.

### setVelocity(v: VectorLike)

Sets the velocity directly, replacing the current value.

## Collision Response

When two rigid bodies collide, the system:

1. **Separates** both bodies proportional to their inverse mass
2. **Applies impulse** based on relative velocity and restitution (bounce)
3. **Applies friction** to reduce sliding

The collision detection supports all shape combinations: rectangle-rectangle, circle-circle, and rectangle-circle, with accurate separation vectors for each.

```tsx
// Bouncy ball
<rigid-body mass={1} bounce={0.9} friction={0.01} />

// Heavy static platform
<rigid-body mass={0} isStatic />

// Lightweight object
<rigid-body mass={0.5} bounce={0.3} />
```

## Static Bodies

Set `isStatic` or `mass={0}` for immovable objects like platforms or walls:

```tsx
function Platform() {
  return (
    <rigid-body position={[0, 100]} isStatic>
      <sprite textureId={PLATFORM} />
      <collider
        shape={shapes.rectangle(128, 16)}
        group={['ground']}
        collidesWith={['player', 'rock']}
      />
    </rigid-body>
  )
}
```

## Complete Example

```tsx
import { useRigidBody } from 'fraxel/hooks'
import { shapes } from 'fraxel'

function GameScene() {
  const player = useRigidBody()

  return (
    <transform>
      {/* Background */}
      <sprite textureId={BG} />

      {/* Player */}
      <rigid-body ref={player} position={[50, 50]}>
        <sprite textureId={PLAYER} />
        <collider shape={shapes.rectangle(16, 16)} group={['player']} collidesWith={['ground']} />
      </rigid-body>

      {/* Ground */}
      <rigid-body position={[0, 100]} isStatic>
        <sprite textureId={GROUND} />
        <collider shape={shapes.rectangle(192, 16)} group={['ground']} collidesWith={['player']} />
      </rigid-body>
    </transform>
  )
}
```

## See Also

- [Nodes](./nodes.md) — Collider, RayCast, RigidBody node reference
- [Hooks API](./hooks.md) — `useCollider`, `useRayCast`, `useRigidBody`
