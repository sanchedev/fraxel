import { InvalidBoundsLikeError } from '../errors/math.js'

export class Bounds {
  left: number = 0
  top: number = 0
  right: number = 0
  bottom: number = 0

  constructor()
  constructor(all: number)
  constructor(boundsLike: BoundsLike)
  constructor(horizontal: number, vertical: number)
  constructor(left: number, vertical: number, right: number)
  constructor(left: number, top: number, right: number, bottom: number)
  constructor(...args: unknown[]) {
    if (args.length === 0) return
    if (args.slice(0, 4).every((l) => typeof l === 'number')) {
      const [s1, s2, s3, s4] = args as number[]
      if (s1 == null) return
      if (s2 == null) {
        this.left = s1
        this.top = s1
        this.right = s1
        this.bottom = s1
      } else if (s3 == null) {
        this.left = s1
        this.top = s2
        this.right = s1
        this.bottom = s2
      } else if (s4 == null) {
        this.left = s1
        this.top = s2
        this.right = s3
        this.bottom = s2
      } else {
        this.left = s1
        this.top = s2
        this.right = s3
        this.bottom = s4
      }
    } else if (
      Array.isArray(args[0]) &&
      args[0].length > 1 &&
      args[0].length <= 4 &&
      args[0].every((s) => typeof s === 'number')
    ) {
      const [s1, s2, s3, s4] = args[0]
      if (s1 == null) return
      if (s2 == null) {
        this.left = s1
        this.top = s1
        this.right = s1
        this.bottom = s1
      } else if (s3 == null) {
        this.left = s1
        this.top = s2
        this.right = s1
        this.bottom = s2
      } else if (s4 == null) {
        this.left = s1
        this.top = s2
        this.right = s3
        this.bottom = s2
      } else {
        this.left = s1
        this.top = s2
        this.right = s3
        this.bottom = s4
      }
    } else if (args[0] instanceof Bounds) {
      this.left = args[0].left
      this.top = args[0].top
      this.right = args[0].right
      this.bottom = args[0].bottom
    } else if (args[0] != null && typeof args[0] === 'object') {
      const obj = args[0]
      if (
        'horizontal' in obj &&
        typeof obj.horizontal === 'number' &&
        'vertical' in obj &&
        typeof obj.vertical === 'number'
      ) {
        this.left = obj.horizontal
        this.top = obj.vertical
        this.right = obj.horizontal
        this.bottom = obj.vertical
      } else if (
        'left' in obj &&
        typeof obj.left === 'number' &&
        'right' in obj &&
        typeof obj.right === 'number'
      ) {
        this.left = obj.left
        this.right = obj.right
        if ('vertical' in obj && typeof obj.vertical === 'number') {
          this.top = obj.vertical
          this.bottom = obj.vertical
        } else if (
          'top' in obj &&
          typeof obj.top === 'number' &&
          'bottom' in obj &&
          typeof obj.bottom === 'number'
        ) {
          this.top = obj.top
          this.bottom = obj.bottom
        }
      }
    }
    if (!isBoundsLike(args[0])) throw new InvalidBoundsLikeError(args[0])
  }
}

export type BoundsLike =
  | number
  | [horizontal: number, vertical: number]
  | [left: number, vertical: number, right: number]
  | [left: number, top: number, right: number, bottom: number]
  | { horizontal: number; vertical: number }
  | { left: number; vertical: number; right: number }
  | { left: number; top: number; right: number; bottom: number }
  | Bounds

export function isBoundsLike(object: unknown): object is BoundsLike {
  if (typeof object === 'number') return true
  if (
    Array.isArray(object) &&
    object.length > 1 &&
    object.length <= 4 &&
    object.every((s) => typeof s === 'number')
  ) {
    return true
  } else if (object instanceof Bounds) {
    return true
  } else if (object != null && typeof object === 'object') {
    const obj = object
    if (
      'horizontal' in obj &&
      typeof obj.horizontal === 'number' &&
      'vertical' in obj &&
      typeof obj.vertical === 'number'
    ) {
      return true
    } else if (
      'left' in obj &&
      typeof obj.left === 'number' &&
      'right' in obj &&
      typeof obj.right === 'number'
    ) {
      if ('vertical' in obj && typeof obj.vertical === 'number') {
        return true
      } else if (
        'top' in obj &&
        typeof obj.top === 'number' &&
        'bottom' in obj &&
        typeof obj.bottom === 'number'
      ) {
        return true
      }
    }
  }
  return false
}

export function bounds(): Bounds
export function bounds(all: number): Bounds
export function bounds(boundsLike: BoundsLike): Bounds
export function bounds(horizontal: number, vertical: number): Bounds
export function bounds(left: number, vertical: number, right: number): Bounds
export function bounds(left: number, top: number, right: number, bottom: number): Bounds
export function bounds(...args: unknown[]): Bounds {
  return new Bounds(...(args as [number]))
}
