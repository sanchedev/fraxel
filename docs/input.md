# Input System

Unified pointer and keyboard event system. Input is a static singleton — no instantiation needed.

## Setup

Input is initialized automatically by `Game.setup()`. Clean up with `Input.destroy()` when the game ends:

```ts
import { Input } from 'fraxel'

Input.destroy() // removes all event listeners
```

## Pointer

| Property                 | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `Input.pointerPosition`  | Current pointer position in game coords (read-only `Vector2`) |
| `Input.isPointerPressed` | Whether the pointer is currently pressed                      |

**Pointer Events:** `pointerPress`, `pointerUnpress`, `pointerMove`

All pointer events emit `position` (game coords `Vector2`).

```ts
Input.pointerPress.on((position) => {
  console.log('Clicked at:', position)
})
```

## Actions

Actions map key combos to semantic names. Define them once at the top of your file:

```ts
import { Input } from 'fraxel'

const Jump = Input.createAction({ key: ' ' })
const Shoot = Input.createAction({ key: 'f' })
const Dash = Input.createAction({ key: 'ShiftLeft', shift: true })
```

`createAction` returns a `symbol` used by hooks and query methods. Throws `DuplicateKeyError` if the key combo is already bound.

### Query Methods

| Method                              | Description                                |
| ----------------------------------- | ------------------------------------------ |
| `Input.isActionPressed(action)`     | Whether the action is currently held       |
| `Input.justActionPressed(action)`   | Whether the action was pressed this frame  |
| `Input.justActionUnpressed(action)` | Whether the action was released this frame |

```ts
if (Input.justActionPressed(Jump)) {
  player.applyImpulse([0, -400])
}
```

## Keyboard (Low-Level)

For direct key access without actions:

| Method                                               | Description                            |
| ---------------------------------------------------- | -------------------------------------- |
| `Input.isKeyPressed(key, ctrl?, shift?, alt?)`       | Whether key is currently held          |
| `Input.isJustKeyPressed(key, ctrl?, shift?, alt?)`   | Whether key was pressed this frame     |
| `Input.isJustKeyUnpressed(key, ctrl?, shift?, alt?)` | Whether key was released this frame    |
| `Input.getKeyAxis(positiveKey, negativeKey)`         | Returns -1, 0, or 1 based on key state |

```ts
const horizontal = Input.getKeyAxis('ArrowLeft', 'ArrowRight')
// Returns: -1 (left), 0 (none), or 1 (right)
```

## Options

By default, `preventDefault()` is called on keyboard events to block browser shortcuts. Only keys bound to actions trigger `preventDefault()`.

```ts
// preventKeyDefaults is true by default
Game.setup({ width: 480, height: 480, root })
```
