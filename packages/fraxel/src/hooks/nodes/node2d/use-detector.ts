import {
  CollisionLayer,
  type CollisionLayerValue,
  type CollisionMaskValue,
} from '../../../collision/index.js'
import { Trigger } from '../../../events/trigger.js'
import { PrimaryNode, type Detector, type RigidBody } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalSetter } from '../../../reactivity/types.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useDetector`** hook creates a reference to a `Detector` node with reactive
 * collision detection state and event triggers.
 *
 * @returns A `DetectorReference` with reactive detection state and collision triggers
 *
 * @example
 * ```tsx
 * import { useDetector, useTrigger, useEffect } from 'fraxel'
 *
 * function AreaSensor() {
 *   const detector = useDetector()
 *
 *   useTrigger(detector.onBodyEnter, (body) => {
 *     console.log('Body entered:', body)
 *   })
 *
 *   return <detector ref={detector} layer="player" mask="enemy" />
 * }
 * ```
 */
export function useDetector() {
  pushEffect('useDetector', () => {})
  return new DetectorReference()
}

/**
 * The **`DetectorReference`** class provides reactive access to a `Detector` node's
 * collision layer/mask, active bodies/detectors, and collision event triggers.
 */
export class DetectorReference extends Node2DReference<PrimaryNode.Detector> {
  /** Reactive collision layer. */
  layer = new Signal<CollisionLayerValue>(CollisionLayer.Default).getter
  /** Sets the collision layer. */
  setLayer: SignalSetter<CollisionLayerValue> = (value) => this.node.setLayer(value)
  /** Reactive collision mask. */
  mask = new Signal<CollisionMaskValue>(CollisionLayer.Default).getter
  /** Sets the collision mask. */
  setMask: SignalSetter<CollisionMaskValue> = (value) => this.node.setMask(value)
  /** Reactive `true` when any body or detector is currently overlapping. */
  detecting = new Signal(false).getter
  /** Reactive set of currently overlapping rigid bodies. */
  bodies = new Signal<Set<RigidBody>>(new Set()).getter
  /** Reactive set of currently overlapping detectors. */
  detectors = new Signal<Set<Detector>>(new Set()).getter

  /** Fires when a body enters the detector area. */
  onBodyEnter = new Trigger<[body: RigidBody]>()
  /** Fires every frame while a body is inside the detector area. */
  onBodyInside = new Trigger<[body: RigidBody]>()
  /** Fires when a body exits the detector area. */
  onBodyExit = new Trigger<[body: RigidBody]>()
  /** Fires when a detector enters the detector area. */
  onDetectorEnter = new Trigger<[detector: Detector]>()
  /** Fires every frame while a detector is inside the detector area. */
  onDetectorInside = new Trigger<[detector: Detector]>()
  /** Fires when a detector exits the detector area. */
  onDetectorExit = new Trigger<[detector: Detector]>()

  constructor() {
    super({
      type: PrimaryNode.Detector,
      linkEvents: ({ link }) => {
        link(
          this,
          'onBodyEnter',
          'onBodyInside',
          'onBodyExit',
          'onDetectorEnter',
          'onDetectorInside',
          'onDetectorExit',
        )
      },
      regSignal: ({ reg }) => {
        reg<DetectorReference>(this, 'layer', 'mask', 'detecting', 'bodies', 'detectors')
      },
      onFrame: (node) => {
        this.layer.signal.setter(node.layer)
        this.mask.signal.setter(node.mask)
        this.bodies.signal.setter(new Set(node._activeBodies))
        this.detectors.signal.setter(new Set(node._activeDetectors))
        this.detecting.signal.setter(
          node._activeBodies.size !== 0 || node._activeDetectors.size !== 0,
        )
      },
    })
  }
}
