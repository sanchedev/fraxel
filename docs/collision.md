# Collision System

## Shapes

Define collision shapes with the `shapes` factory:

```tsx
import { shapes } from 'tiny-engine'

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
import { useEvent, useRefNode } from 'tiny-engine/hooks'
import { PrimaryNode, shapes } from 'tiny-engine'

function Projectile() {
  const collider = useRefNode(PrimaryNode.Collider)

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
import { useRefNode, useEvent } from 'tiny-engine/hooks'
import { PrimaryNode, Vector2 } from 'tiny-engine'

function Detector() {
  const ray = useRefNode(PrimaryNode.RayCast)

  useEvent(ray, 'colliderEntered', (collider) => {
    console.log('Detected:', collider)
  })

  return (
    <ray-cast
      ref={ray}
      direction={new Vector2(100, 0)}
      collidesWith={['enemy']}
    />
  )
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
