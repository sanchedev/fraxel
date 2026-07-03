export interface SignalGetter<T> {
  (): T
}
export interface SignalSetter<T> {
  (value: T): void
}

export type Reactive<T> = T | SignalGetter<T>
