# Input System

The input module manages keyboard and pointer input through a static singleton. It supports actions (key bindings), raw key queries, and pointer events.

```ts
import { Input } from 'fraxel'
```

## Setup

The input system is initialized automatically by `Game.setup()`. You don't need to call `Input.setup()` directly.

```ts
// Called internally by Game.setup()
Input.setup(canvas, size)
```

## Actions

Actions map key combinations to symbolic identifiers. Create actions once at the module level:

```ts
import { Input } from 'fraxel'

const Jump = Input.createAction({ key: ' ' })
const Fire = Input.createAction({ key: 'f', ctrl: true })
const Dash = Input.createAction({ key: 'ShiftLeft', shift: true })
```

### createAction

Creates a new action from a key binding. Returns a `symbol` identifier.

| Param     | Type       | Description                |
| --------- | ---------- | -------------------------- |
| `options` | `InputKey` | Key binding configuration. |

**InputKey properties:**

| Property | Type      | Description                                   |
| -------- | --------- | --------------------------------------------- |
| `key`    | `string`  | Key name (e.g., `'a'`, `' '`, `'ArrowLeft'`). |
| `ctrl`   | `boolean` | Require Ctrl modifier.                        |
| `shift`  | `boolean` | Require Shift modifier.                       |
| `alt`    | `boolean` | Require Alt modifier.                         |

**Throws:** `DuplicateKeyError` if the key combo is already bound.

```ts
const Jump = Input.createAction({ key: ' ' })
const Fire = Input.createAction({ key: 'f', ctrl: true })
```

### Query Methods

| Method                              | Returns   | Description                                       |
| ----------------------------------- | --------- | ------------------------------------------------- |
| `Input.isActionPressed(action)`     | `boolean` | `true` while the action's key is held.            |
| `Input.justActionPressed(action)`   | `boolean` | `true` on the first frame the action is pressed.  |
| `Input.justActionUnpressed(action)` | `boolean` | `true` on the first frame the action is released. |

```tsx
import { useAction, useEffect } from 'fraxel/hooks'

const Jump = Input.createAction({ key: ' ' })

function Player() {
  const { justPressed, pressed } = useAction(Jump)

  useEffect(() => {
    if (justPressed()) applyJump()
  })

  return <transform />
}
```

## Raw Keyboard Queries

For cases where actions aren't sufficient:

| Method                                               | Returns   | Description                            |
| ---------------------------------------------------- | --------- | -------------------------------------- |
| `Input.isKeyPressed(key, ctrl?, shift?, alt?)`       | `boolean` | `true` while key is held.              |
| `Input.isJustKeyPressed(key, ctrl?, shift?, alt?)`   | `boolean` | `true` on first frame key is pressed.  |
| `Input.isJustKeyUnpressed(key, ctrl?, shift?, alt?)` | `boolean` | `true` on first frame key is released. |
| `Input.getKeyAxis(positiveKey, negativeKey)`         | `number`  | Returns `-1`, `0`, or `1`.             |

```ts
// Horizontal movement
const horizontal = Input.getKeyAxis('ArrowRight', 'ArrowLeft')
// Returns: -1 (left), 0 (none), or 1 (right)
```

## Pointer

### Properties

| Property                 | Type                | Description                                   |
| ------------------------ | ------------------- | --------------------------------------------- |
| `Input.pointerPosition`  | `Readonly<Vector2>` | Current pointer position in game coordinates. |
| `Input.isPointerPressed` | `boolean`           | Whether the pointer is currently pressed.     |

### Events

| Event                    | Callback                      | Description                         |
| ------------------------ | ----------------------------- | ----------------------------------- |
| `Input.pointerPressed`   | `(position: Vector2) => void` | Fires when the pointer is pressed.  |
| `Input.pointerUnpressed` | `(position: Vector2) => void` | Fires when the pointer is released. |
| `Input.pointerMoved`     | `(position: Vector2) => void` | Fires when the pointer moves.       |

```ts
Input.pointerPressed.on((position) => {
  console.log('Clicked at:', position.x, position.y)
})
```

## Lifecycle

### Input.update()

Clears per-frame state (`justPressed`, `justUnpressed`). Called automatically by the game loop.

### Input.destroy()

Removes all event listeners, clears actions, and revokes subscriptions. Must be called when the game is destroyed.

```ts
Game.destroy() // calls Input.destroy() internally
```

## preventDefault

When an action is registered for a key combo, `preventDefault()` is called on keyboard events for that combo. This prevents the browser from handling the key (e.g., scrolling on spacebar).

## Complete Example

```tsx
import { Input } from 'fraxel'
import { useAction, useActionAxis, useEffect } from 'fraxel/hooks'

const Jump = Input.createAction({ key: ' ' })
const Left = Input.createAction({ key: 'a' })
const Right = Input.createAction({ key: 'd' })

function Player() {
  const jump = useAction(Jump)
  const dir = useActionAxis(Left, Right)

  useEffect(() => {
    if (jump.justPressed() && rb.isGrounded()) {
      rb.applyImpulse([0, -400])
    }
    rb.setVelocity([dir() * 120, rb.velocity().y])
  })

  return <transform />
}
```

## See Also

- [Hooks API](./hooks.md) — `useAction`, `useActionAxis`
- [Getting Started](./getting-started.md) — Input setup
