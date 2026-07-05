/**
 * An easing function that maps progress `t` (0 to 1) to an eased value.
 */
export type EasingFn = (t: number) => number

/** Linear interpolation — no easing. */
export const linear: EasingFn = (t) => t

/** Accelerating from zero velocity. */
export const easeInQuad: EasingFn = (t) => t * t

/** Decelerating to zero velocity. */
export const easeOutQuad: EasingFn = (t) => t * (2 - t)

/** Accelerating then decelerating. */
export const easeInOutQuad: EasingFn = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

/** Cubic acceleration. */
export const easeInCubic: EasingFn = (t) => t * t * t

/** Cubic deceleration. */
export const easeOutCubic: EasingFn = (t) => --t * t * t + 1

/** Cubic acceleration then deceleration. */
export const easeInOutCubic: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1

/** Overshoot then settle — dramatic entrance. */
export const easeBackOut: EasingFn = (t) => {
  const c = 1.70158
  return 1 + --t * t * ((c + 1) * t + c)
}

/** Overshoot in both directions — bouncy. */
export const easeBackInOut: EasingFn = (t) => {
  const c = 1.70158 * 1.525
  if ((t *= 2) < 1) return 0.5 * (t * t * ((c + 1) * t - c))
  return 0.5 * ((t -= 2) * t * ((c + 1) * t + c) + 2)
}

/** Bounce effect at the end. */
export const easeOutBounce: EasingFn = (t) => {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
  } else {
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
  }
}

/** Bounce effect at the start. */
export const easeInBounce: EasingFn = (t) => 1 - easeOutBounce(1 - t)

/** Elastic effect — spring-like overshoot. */
export const easeOutElastic: EasingFn = (t) => {
  if (t === 0 || t === 1) return t
  return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1
}
