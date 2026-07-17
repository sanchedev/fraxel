import { InvalidCollisionLayerIndexError } from '../errors/collision.js'

/**
 * The **`CollisionLayerValue`** type represents one collision layer bit.
 *
 * Use it to declare which category a `RigidBody`, `Detector`, or `RayCast` target
 * belongs to. Create custom values with `CollisionLayer.create(index)` and combine
 * them in masks with bitwise OR or `CollisionMask.only()`.
 *
 * @example
 * ```ts
 * import { CollisionLayer } from 'fraxel'
 *
 * const Layers = {
 *   Player: CollisionLayer.create(1),
 *   Ground: CollisionLayer.create(2),
 * }
 * ```
 */
export type CollisionLayerValue = number

/**
 * The **`CollisionMaskValue`** type represents a set of collision layers.
 *
 * Use it to declare which layers a `RigidBody`, `Detector`, or `RayCast` can
 * interact with. Build masks with bitwise OR, `CollisionMask.only()`, or
 * `CollisionMask.except()`.
 *
 * @example
 * ```ts
 * import { CollisionMask } from 'fraxel'
 *
 * const playerMask = CollisionMask.only(Layers.Ground, Layers.Enemy)
 * ```
 */
export type CollisionMaskValue = number

/**
 * The **`CollisionLayer`** object provides helpers for collision layer values.
 *
 * Use layers to categorize collision owners. A collision only matches when each
 * owner's mask includes the other owner's layer.
 *
 * @example
 * ```tsx
 * import { CollisionLayer } from 'fraxel'
 *
 * const Layers = {
 *   Player: CollisionLayer.create(1),
 *   Ground: CollisionLayer.create(2),
 * }
 *
 * function Player() {
 *   return <body layer={Layers.Player} mask={Layers.Ground} />
 * }
 * ```
 */
export const CollisionLayer = {
  /**
   * The **`Default`** layer is the built-in collision layer.
   *
   * Use it when a game does not need custom layer categories. It occupies bit `0`
   * and is also the default layer for collision owners that do not receive `layer`.
   *
   * @example
   * ```tsx
   * <body layer={CollisionLayer.Default} mask={CollisionLayer.Default} />
   * ```
   */
  Default: 1 << 0,

  /**
   * The **`create`** method creates a collision layer from a bit index.
   *
   * Use it to define named game layers once and reuse them in `layer`, `mask`, and
   * raycast props. JavaScript bitwise operations use 32-bit integers, so valid
   * indexes are `0` through `31`.
   *
   * @param index - Integer bit index from `0` to `31`.
   * @returns A collision layer value with only that bit enabled.
   * @throws {InvalidCollisionLayerIndexError} When `index` is not an integer from `0` to `31`.
   *
   * @example
   * ```ts
   * const Layers = {
   *   Player: CollisionLayer.create(1),
   *   Platform: CollisionLayer.create(2),
   *   WinArea: CollisionLayer.create(3),
   * }
   * ```
   */
  create(index: number): CollisionLayerValue {
    if (!Number.isInteger(index) || index < 0 || index > 31) {
      throw new InvalidCollisionLayerIndexError(index)
    }
    return 1 << index
  },
} as const

/**
 * The **`CollisionMask`** object provides helpers for collision masks.
 *
 * Use masks to describe which layers an owner can interact with. Masks are sets
 * of `CollisionLayerValue`s, so they can include one layer, many layers, none, or all.
 *
 * @example
 * ```tsx
 * import { CollisionMask } from 'fraxel'
 *
 * const playerMask = CollisionMask.only(Layers.Platform, Layers.WinArea)
 *
 * function Player() {
 *   return <body layer={Layers.Player} mask={playerMask} />
 * }
 * ```
 */
export const CollisionMask = {
  /**
   * The **`None`** mask matches no collision layers.
   *
   * Use it to temporarily disable interactions without changing the owner's layer.
   *
   * @example
   * ```tsx
   * <body layer={Layers.Player} mask={CollisionMask.None} />
   * ```
   */
  None: 0,
  /**
   * The **`All`** mask matches every collision layer representable by the 32-bit mask.
   *
   * Use it for debug objects, broad detectors, or bodies that should interact with
   * any layer that also includes their layer in its own mask.
   *
   * @example
   * ```tsx
   * <detector layer={Layers.Sensor} mask={CollisionMask.All} />
   * ```
   */
  All: 0xffffffff,

  /**
   * The **`only`** method creates a mask containing exactly the provided layers.
   *
   * Use it to avoid manual bitwise OR expressions when a body or detector should
   * interact with a known set of layers.
   *
   * @param layers - Collision layers to include in the mask.
   * @returns A collision mask containing all provided layers.
   *
   * @example
   * ```ts
   * const playerMask = CollisionMask.only(Layers.Platform, Layers.WinArea)
   * ```
   */
  only(...layers: CollisionLayerValue[]): CollisionMaskValue {
    return layers.reduce((mask, layer) => mask | layer, 0)
  },

  /**
   * The **`except`** method creates a mask containing every layer except the provided layers.
   *
   * Use it when an owner should broadly interact with the world but ignore a few
   * known categories.
   *
   * @param layers - Collision layers to exclude from the mask.
   * @returns A collision mask with all bits enabled except the provided layers.
   *
   * @example
   * ```ts
   * const enemyMask = CollisionMask.except(Layers.Enemy)
   * ```
   */
  except(...layers: CollisionLayerValue[]): CollisionMaskValue {
    return ~CollisionMask.only(...layers)
  },
} as const
