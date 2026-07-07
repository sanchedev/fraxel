export function clamp(min: number, value: number, max: number): number {
  if (min >= max) return min
  return Math.max(min, Math.min(value, max))
}
