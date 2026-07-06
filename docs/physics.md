# Physics

The physics system adds gravity, velocity, forces, and collision response to your game.

## RigidBody Node

`<rigid-body>` must be parent of a `<collider>` to enable physics:

```tsx
import { shapes } from 'fraxel'

function FallingRock() {
  return (
    <rigid-body position={[100, 0]} mass={2} bounce={0.6}>
      <sprite textureId={ROCK} />
      <collider shape={shapes.circle(16)} group={['rock']} collidesWith={['ground']} />
    </rigid-body>
  )
}
```

### Props

| Prop         | Type      | Default | Description                              |
| ------------ | --------- | ------- | ---------------------------------------- |
| `mass`       | `number`  | `1`     | Body mass (0 = infinite mass / static)   |
| `friction`   | `number`  | `0.1`   | Friction coefficient (0–1)               |
| `bounce`     | `number`  | `0`     | Restitution (0 = no bounce, 1 = perfect) |
| `isStatic`   | `boolean` | `false` | If true, the body doesn't move           |
| `useGravity` | `boolean` | `true`  | If false, gravity is ignored             |

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

## useRigidBody Hook

The `useRigidBody` hook provides a declarative API for physics bodies:

```tsx
import { useRigidBody } from 'fraxel/hooks'

function Player() {
  const { ref, velocity, isGrounded, applyImpulse } = useRigidBody()

  const jump = () => {
    if (isGrounded()) {
      applyImpulse([0, -400])
    }
  }

  return (
    <rigid-body ref={ref}>
      <sprite textureId={PLAYER} />
      <collider shape={shapes.rectangle(16, 16)} group={['player']} collidesWith={['ground']} />
    </rigid-body>
  )
}
```

### Return Value

| Property       | Type                                     | Description                          |
| -------------- | ---------------------------------------- | ------------------------------------ |
| `ref`          | `NodeReference<PrimaryNode.RigidBody>`   | Pass to `<rigid-body ref={ref}>`     |
| `velocity`     | `SignalGetter<{ x: number, y: number }>` | Reactive velocity in px/s            |
| `isGrounded`   | `SignalGetter<boolean>`                  | Reactive grounded state              |
| `applyForce`   | `(force: VectorLike) => void`            | Apply continuous force (px/s²)       |
| `applyImpulse` | `(impulse: VectorLike) => void`          | Apply instant velocity change (px/s) |
| `setVelocity`  | `(v: VectorLike) => void`                | Set velocity directly                |

## Gravity

The default gravity is `980 px/s²` downward (like Earth gravity in pixel units).

```tsx
import { PhysicsSystem, Vector2 } from 'fraxel'

// Change gravity at runtime
PhysicsSystem.gravity = new Vector2(0, -200) // float upward

// Moon gravity
PhysicsSystem.gravity = new Vector2(0, 160)
```

## Forces & Impulses

Access the physics body through the `useRigidBody` hook or directly via `useNode`:

```tsx
import { useNode, useEvent } from 'fraxel/hooks'
import { PrimaryNode, Vector2 } from 'fraxel'

function Player() {
  const body = useNode(PrimaryNode.RigidBody)

  useEvent(body, 'updated', (delta) => {
    // Apply a continuous force (like thrust)
    body.node.applyForce(new Vector2(100 * delta, 0))
  })

  // Apply an instant impulse (like a jump)
  const jump = () => {
    body.node.applyImpulse(new Vector2(0, -400))
  }

  return (
    <rigid-body ref={body}>
      <sprite textureId={PLAYER} />
      <collider shape={shapes.rectangle(16, 16)} group={['player']} collidesWith={['ground']} />
    </rigid-body>
  )
}
```

### `applyForce(force: Vector2)`

Applies a continuous force (pixels/second²). Forces are accumulated and applied during physics integration. Use for thrust, wind, or persistent effects.

### `applyImpulse(impulse: Vector2)`

Applies an instant velocity change (pixels/second). Use for jumps, explosions, or knockback.

### `setVelocity(v: Vector2)`

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
import { PhysicsSystem, Vector2, shapes } from 'fraxel'

function GameScene() {
  const player = useRigidBody()

  return (
    <transform>
      {/* Background */}
      <sprite textureId={BG} />

      {/* Player */}
      <rigid-body ref={player.ref} position={[50, 50]}>
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
