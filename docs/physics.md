# Physics

The physics system adds gravity, velocity, forces, and collision response to your game.

## RigidBody Node

Add `<rigid-body>` as a sibling of a `<collider>` to enable physics:

```tsx
import { shapes } from 'tiny-engine'

function FallingRock() {
  return (
    <transform position={[100, 0]}>
      <sprite textureId={ROCK} />
      <collider shape={shapes.circle(16)} group={['rock']} collidesWith={['ground']} />
      <rigid-body mass={2} bounce={0.6} />
    </transform>
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

## Gravity

The default gravity is `980 px/s²` downward (like Earth gravity in pixel units).

```tsx
import { PhysicsSystem } from 'tiny-engine'

// Change gravity at runtime
PhysicsSystem.gravity = { x: 0, y: -200 } // float upward

// Moon gravity
PhysicsSystem.gravity = { x: 0, y: 160 }
```

## Forces & Impulses

Access the physics body through the `RigidBody` node:

```tsx
import { useNode, useEvent } from 'tiny-engine/hooks'
import { PrimaryNode, Vector2 } from 'tiny-engine'

function Player() {
  const body = useNode(PrimaryNode.RigidBody)

  useEvent(body, 'updated', (delta) => {
    // Apply a continuous force (like thrust)
    body.node.physicsBody.applyForce(new Vector2(100 * delta, 0))
  })

  // Apply an instant impulse (like a jump)
  const jump = () => {
    body.node.physicsBody.applyImpulse(new Vector2(0, -400))
  }

  return (
    <transform>
      <sprite textureId={PLAYER} />
      <collider shape={shapes.rectangle(16, 16)} group={['player']} collidesWith={['ground']} />
      <rigid-body ref={body} />
    </transform>
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
    <transform position={[0, 100]}>
      <sprite textureId={PLATFORM} />
      <collider
        shape={shapes.rectangle(128, 16)}
        group={['ground']}
        collidesWith={['player', 'rock']}
      />
      <rigid-body isStatic />
    </transform>
  )
}
```

## Complete Example

```tsx
import { useNode, useMount } from 'tiny-engine/hooks'
import { PrimaryNode, PhysicsSystem, Vector2, shapes } from 'tiny-engine'

function GameScene() {
  useMount(() => {
    PhysicsSystem.gravity = new Vector2(0, 980)
  })

  return (
    <transform>
      {/* Background */}
      <sprite textureId={BG} />

      {/* Player */}
      <transform position={[50, 50]}>
        <sprite textureId={PLAYER} />
        <collider shape={shapes.rectangle(16, 16)} group={['player']} collidesWith={['ground']} />
        <rigid-body />
      </transform>

      {/* Ground */}
      <transform position={[0, 100]}>
        <sprite textureId={GROUND} />
        <collider shape={shapes.rectangle(192, 16)} group={['ground']} collidesWith={['player']} />
        <rigid-body isStatic />
      </transform>
    </transform>
  )
}
```
