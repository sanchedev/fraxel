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

/** Creates a reference to a Detector node. */
export function useDetector() {
  pushEffect('useDetector', () => {})
  return new DetectorReference()
}

export class DetectorReference extends Node2DReference<PrimaryNode.Detector> {
  layer = new Signal<CollisionLayerValue>(CollisionLayer.Default).getter
  setLayer: SignalSetter<CollisionLayerValue> = (value) => this.node.setLayer(value)
  mask = new Signal<CollisionMaskValue>(CollisionLayer.Default).getter
  setMask: SignalSetter<CollisionMaskValue> = (value) => this.node.setMask(value)
  detecting = new Signal(false).getter
  bodies = new Signal<Set<RigidBody>>(new Set()).getter
  detectors = new Signal<Set<Detector>>(new Set()).getter

  onBodyEnter = new Trigger<[body: RigidBody]>()
  onBodyInside = new Trigger<[body: RigidBody]>()
  onBodyExit = new Trigger<[body: RigidBody]>()
  onDetectorEnter = new Trigger<[detector: Detector]>()
  onDetectorInside = new Trigger<[detector: Detector]>()
  onDetectorExit = new Trigger<[detector: Detector]>()

  constructor() {
    super(
      PrimaryNode.Detector,
      (node) => {
        this.onBodyEnter.link(node.onBodyEnter)
        this.onBodyInside.link(node.onBodyInside)
        this.onBodyExit.link(node.onBodyExit)
        this.onDetectorEnter.link(node.onDetectorEnter)
        this.onDetectorInside.link(node.onDetectorInside)
        this.onDetectorExit.link(node.onDetectorExit)

        const set = () => {
          this.layer.signal.setter(node.layer)
          this.mask.signal.setter(node.mask)
          this.bodies.signal.setter(new Set(node._activeBodies))
          this.detectors.signal.setter(new Set(node._activeDetectors))
          this.detecting.signal.setter(
            node._activeBodies.size !== 0 || node._activeDetectors.size !== 0,
          )
        }
        set()
        node.onUpdate.connect(set)
      },
      () => {
        this.layer.signal.clearSubs()
        this.mask.signal.clearSubs()
        this.detecting.signal.clearSubs()
        this.bodies.signal.clearSubs()
        this.detectors.signal.clearSubs()
      },
    )
  }
}
