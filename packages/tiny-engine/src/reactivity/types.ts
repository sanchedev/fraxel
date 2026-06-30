export interface SignalGetter<T> {
  (): T
}
export interface SignalSetter<T> {
  (value: T): void
}
