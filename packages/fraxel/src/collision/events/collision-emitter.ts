import type { Collider } from '../../nodes/node2d/collider.js'

/**
 * The **`CollisionEmitter`** class is a static utility that emits collision events on colliders.
 * Used internally by the `CollisionSystem` to dispatch `colliderEnter`, `collide`, and `colliderExit` events.
 */
export class CollisionEmitter {
  /**
   * Emits the `colliderEnter` event on a collider.
   * @param collider The collider that detected a new collision.
   * @param other The other collider that was entered.
   */
  static emitEnter(collider: Collider, other: Collider) {
    collider.onColliderEnter.emit(other)
  }

  /**
   * Emits the `collide` event on a collider.
   * @param collider The collider that is currently colliding.
   * @param other The other collider being collided with.
   */
  static emitCollide(collider: Collider, other: Collider) {
    collider.onCollide.emit(other)
  }

  /**
   * Emits the `colliderExit` event on a collider.
   * @param collider The collider that stopped colliding.
   * @param other The other collider that was exited.
   */
  static emitExit(collider: Collider, other: Collider) {
    collider.onColliderExit.emit(other)
  }

  /**
   * Emits the `colliderEnter` event when a raycast hits a collider.
   * @param collider The collider that was hit by the raycast.
   * @param other The raycast collider that hit it.
   */
  static emitRaycastEnter(collider: Collider, other: Collider) {
    collider.onColliderEnter.emit(other)
  }

  /**
   * Emits the `colliderExit` event when a raycast stops hitting a collider.
   * @param collider The collider that is no longer hit by the raycast.
   * @param other The raycast collider that stopped hitting it.
   */
  static emitRaycastExit(collider: Collider, other: Collider) {
    collider.onColliderExit.emit(other)
  }
}
