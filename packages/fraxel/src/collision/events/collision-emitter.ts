import type { Detector } from '../../nodes/node2d/detector.js'
import type { RigidBody } from '../../nodes/node2d/rigid-body.js'

type CollisionOwner = RigidBody | Detector

/**
 * The **`CollisionEmitter`** class is a static utility that emits collision events on owners.
 */
export class CollisionEmitter {
  static emitBodyEnter(owner: CollisionOwner, body: RigidBody) {
    owner.onBodyEnter.emit(body)
  }

  static emitBodyExit(owner: CollisionOwner, body: RigidBody) {
    owner.onBodyExit.emit(body)
  }

  static emitDetectorEnter(owner: CollisionOwner, detector: Detector) {
    owner.onDetectorEnter.emit(detector)
  }

  static emitDetectorExit(owner: CollisionOwner, detector: Detector) {
    owner.onDetectorExit.emit(detector)
  }
}
