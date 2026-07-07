# Collision System

## Shapes

Define collision shapes with the `shapes` factory:

```tsx
import { shapes } from 'fraxel'

<collider shape={shapes.rectangle(32, 32)} group={['player']} collidesWith={['enemy']} />
<collider shape={shapes.circle(16)} group={['projectile']} collidesWith={['zombie']} />
<collider shape={shapes.capsule(60, 20)} group={['player']} collidesWith={['ground']} />
```

Types: `Shape = RectangleShape | CircleShape | CapsuleShape`

Capsule shapes have a `length` (total tip-to-tip including caps), `radius`, and optional `direction` (`'vertical'` default or `'horizontal'`).

## Narrowphase Detection

- `Narrowphase.detect(a, b)` dispatches all 9 combinations: rectangle↔rectangle, circle↔circle, capsule↔capsule, rectangle↔circle, circle↔rectangle, rectangle↔capsule, capsule↔rectangle, circle↔capsule, capsule↔circle.
- Each shape has its own overlap algorithm.

## Groups & Events

Colliders use groups for filtering. Events fire on both colliders:

```tsx
import { useEvent, useNode } from 'fraxel/hooks'
import { PrimaryNode, shapes } from 'fraxel'

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
import { useNode, useEvent } from 'fraxel/hooks'
import { PrimaryNode } from 'fraxel'

function Detector() {
  const ray = useNode(PrimaryNode.RayCast)

  useEvent(ray, 'colliderEntered', (collider) => {
    console.log('Detected:', collider)
  })

  return <ray-cast ref={ray} direction={[100, 0]} collidesWith={['enemy']} />
}
```

- `RayCast` node has `direction` (Vector2) and `collidesWith` (string[]).
- `getCollider()` returns the currently detected collider or null.
- Events (baseNames): `colliderEntered`, `colliderExited`.
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

- `mass` — body mass (0 = infinite mass / static)
- `friction` — friction coefficient (0–1)
- `bounce` — restitution (0 = no bounce, 1 = perfect)
- `isStatic` — immovable body
- `useGravity` — whether gravity affects this body

### Gravity

```tsx
import { PhysicsSystem, vector2 } from 'fraxel'

PhysicsSystem.gravity = vector2(0, 980) // default
```

### Forces & Impulses

```tsx
const body = useNode(PrimaryNode.RigidBody)

// Continuous force (thrust, wind)
body.node.physicsBody.applyForce(vector2(100, 0))

// Instant impulse (jump, explosion)
body.node.physicsBody.applyImpulse(vector2(0, -400))
```

See [Physics](physics.md) for full documentation.
