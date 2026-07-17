import { CollisionSystem } from '../../collision/collision-system.js'
import {
  CollisionLayer,
  type CollisionLayerValue,
  type CollisionMaskValue,
} from '../../collision/layers.js'
import { Trigger } from '../../events/trigger.js'
import { PrimaryNode } from '../lib/enum.js'
import { registerNode } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import type { Collider } from './collider.js'
import type { RigidBody } from './rigid-body.js'

export interface DetectorOptions extends Node2DOptions<PrimaryNode.Detector> {
  /** Collision layer this detector belongs to. @default CollisionLayer.Default */
  layer?: CollisionLayerValue
  /** Collision mask this detector detects. @default CollisionLayer.Default */
  mask?: CollisionMaskValue
}

/** A non-physical area that detects overlapping RigidBody and Detector owners. */
export class Detector extends Node2D<PrimaryNode.Detector> {
  #layer: CollisionLayerValue
  #mask: CollisionMaskValue

  colliders: Set<Collider> = new Set()
  _activeBodies: Set<RigidBody> = new Set()
  _activeDetectors: Set<Detector> = new Set()

  get layer() {
    return this.#layer
  }

  get mask() {
    return this.#mask
  }

  constructor(options: DetectorOptions) {
    super(PrimaryNode.Detector, options)
    this.#layer = options.layer ?? CollisionLayer.Default
    this.#mask = options.mask ?? CollisionLayer.Default
  }

  onBodyEnter = new Trigger<[body: RigidBody]>()
  onBodyInside = new Trigger<[body: RigidBody]>()
  onBodyExit = new Trigger<[body: RigidBody]>()
  onDetectorEnter = new Trigger<[detector: Detector]>()
  onDetectorInside = new Trigger<[detector: Detector]>()
  onDetectorExit = new Trigger<[detector: Detector]>()

  setLayer(layer: CollisionLayerValue): void {
    this.#layer = layer
    CollisionSystem.setDirty()
  }

  setMask(mask: CollisionMaskValue): void {
    this.#mask = mask
    CollisionSystem.setDirty()
  }

  start(): void {
    this.colliders = new Set(
      this._children.filter((child): child is Collider => child.type === PrimaryNode.Collider),
    )
    CollisionSystem.registerOwner(this)
    super.start()
  }

  destroy(): void {
    CollisionSystem.unregisterOwner(this)
    super.destroy()
  }

  cleanEvents(): void {
    this.onBodyEnter.clear()
    this.onBodyInside.clear()
    this.onBodyExit.clear()
    this.onDetectorEnter.clear()
    this.onDetectorInside.clear()
    this.onDetectorExit.clear()
    super.cleanEvents()
  }
}

registerNode(PrimaryNode.Detector, Detector)
