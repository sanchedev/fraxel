export function ns<T, K>(
  value: T | null | undefined,
  operation: (value: T) => K,
  defaultValue: K,
) {
  return value == null ? defaultValue : operation(value)
}
