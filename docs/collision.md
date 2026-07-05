# Collision System

## Shapes

Define collision shapes with the `shapes` factory:

```tsx
import { shapes } from 'diny'

<collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
<collider shape={shapes.circle(16)} group={['projectile']} collidesWith={['zombie']} />
```

Types: `Shape = RectangleShape | CircleShape`, discriminant: `shape.type === 'rectangle' | 'circle'`

## Narrowphase Detection

- `Narrowphase.detect(a, b)` dispatches all 4 combinations: rectangle↔rectangle, circle↔circle, rectangle↔circle, circle↔rectangle.
- Each shape has its own overlap algorithm.

## Groups & Events

Colliders use groups for filtering. Events fire on both colliders:

```tsx
import { useEvent, useNode } from 'diny/hooks'
import { PrimaryNode, shapes } from 'diny'

function Projectile() {
  const collider = useNode(PrimaryNode.Collider)

  useEvent(collider, 'colliderEntered', (enemyCollider) => {
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
- Events (baseNames): `colliderEntered`, `collided`, `colliderExited`.

## RayCast

Project rays to detect colliders along a direction:

```tsx
import { useNode, useEvent } from 'diny/hooks'
import { PrimaryNode, Vector2 } from 'diny'

function Detector() {
  const ray = useNode(PrimaryNode.RayCast)

  useEvent(ray, 'colliderEntered', (collider) => {
    console.log('Detected:', collider)
  })

  return <ray-cast ref={ray} direction={new Vector2(100, 0)} collidesWith={['enemy']} />
}
```

- `RayCast` node has `direction` (Vector2) and `collidesWith` (string[]).
- `getCollider()` returns the currently detected collider or null.
- Events (baseNames): `colliderEntered`, `colliderExited`.
- Events emit on both the detected collider AND the raycast itself.

## Spatial Hash

- `#getBounds()` handles both shapes: rectangle uses `position` to `position + size`, circle uses `center ± radius`.
- Raycasts query candidates directly from `#colliderGroups` (not the spatial hash).
- The spatial hash is only used for collider-vs-collider broadphase.

## Physics

Add physics simulation with `<rigid-body>`:

```tsx
import { shapes } from 'diny'

function Ball() {
  return (
    <transform position={[100, 0]}>
      <sprite textureId={BALL} />
      <collider shape={shapes.circle(8)} group={['ball']} collidesWith={['ground']} />
      <rigid-body mass={1} bounce={0.8} />
    </transform>
  )
}
```

- `mass` — body mass (0 = infinite mass / static)
- `friction` — friction coefficient (0–1)
- `bounce` — restitution (0 = no bounce, 1 = perfect)
- `isStatic` — immovable body
- `useGravity` — whether gravity affects this body

### Gravity

```tsx
import { PhysicsSystem } from 'diny'

PhysicsSystem.gravity = { x: 0, y: 980 } // default
```

### Forces & Impulses

```tsx
const body = useNode(PrimaryNode.RigidBody)

// Continuous force (thrust, wind)
body.node.physicsBody.applyForce(new Vector2(100, 0))

// Instant impulse (jump, explosion)
body.node.physicsBody.applyImpulse(new Vector2(0, -400))
```

See [Physics](physics.md) for full documentation.
