# Reactivity

The `reactivity` module provides the core primitives for fraxel's reactive system. Signals hold values and notify subscribers when they change, enabling fine-grained reactivity without virtual DOM diffing.

```ts
import { Signal, SignalRegister } from 'fraxel'
```

## Signal

`Signal` is the reactive primitive. It holds a value, notifies subscribers on change, and provides bound getter/setter functions for the reactivity system.

```ts
const health = new Signal(100)

// Direct access
health.value = 50

// Bound getter (tracks dependencies when called as function)
const val = health.getter() // 50

// Bound setter (equivalent to health.value = val)
health.setter(50)

// Subscribe to changes
health.sub((val) => console.log(val))

// Remove all subscribers
health.clearSubs()
```

### Constructor

```ts
new Signal<T>(initialValue: T)
```

### Properties

| Property | Type              | Description                                                     |
| -------- | ----------------- | --------------------------------------------------------------- |
| `value`  | `T`               | Gets or sets the current value. Notifies subscribers on change. |
| `getter` | `SignalGetter<T>` | Bound getter function. Calling `getter()` tracks dependencies.  |
| `setter` | `SignalSetter<T>` | Bound setter function. Equivalent to `signal.value = val`.      |

### Methods

| Method        | Returns | Description                                             |
| ------------- | ------- | ------------------------------------------------------- |
| `sub(fn)`     | `void`  | Subscribes a listener called on value change.           |
| `unsub(fn)`   | `void`  | Removes a previously subscribed listener.               |
| `clearSubs()` | `void`  | Removes all subscribers. Useful for cleanup on destroy. |

## SignalGetter

A getter function that returns the current value. Calling it as a function (`getter()`) registers the signal as a dependency of the current watch context. Calling `.value()` bypasses dependency tracking.

```ts
const health = new Signal(100)

// Call as function — tracks dependency
const val = health.getter() // 100

// Use .value() — no dependency tracking
const val2 = health.getter.value() // 100

// Access the underlying Signal
health.getter.signal // Signal<number>
```

## SignalSetter

A setter function that updates the signal value and notifies subscribers.

```ts
const health = new Signal(100)
health.setter(50) // equivalent to health.value = 50
```

## SignalGetterLike

A plain getter function without `.value()`. Used for lazy/deferred values. Unlike `SignalGetter`, does not register dependencies.

## Reactive

A type that accepts either a static value or a getter function:

```ts
type Reactive<T> = T | SignalGetterLike<T>
```

Used by props that accept both static and reactive values:

```tsx
// Static value
<sprite opacity={0.5} />

// Reactive getter
<sprite opacity={() => health.getter() / 100} />
```

## SignalRegister

Static class for automatic dependency tracking in the reactivity system.

```ts
import { SignalRegister } from 'fraxel'
```

### watch

Executes a function, captures which signals were read, and calls `deps` with the captured array.

```ts
const x = new Signal(1)
const y = new Signal(2)

const result = SignalRegister.watch(
  () => x.getter() + y.getter(), // reads x and y
  (signals) => console.log('Dependencies:', signals.length), // 2
)
```

### register

Registers a signal as a dependency of the current watch context. Called automatically by `Signal.getter()`.

## isSignalGetter

Type guard that checks if a value is a `SignalGetter` created by a `Signal`.

```ts
import { Signal, isSignalGetter } from 'fraxel'

const signal = new Signal(0)
const getter = signal.getter

isSignalGetter(getter) // true
isSignalGetter(() => 0) // false
isSignalGetter(42) // false
```

## See Also

- [Hooks API](./hooks.md) — `useSignal`, `useComputed`, `useEffect`
- [Math](./math.md) — Vector2, Color, Bounds (all support reactive values)
