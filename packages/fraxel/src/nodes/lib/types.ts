import type { Node } from '../_node.js'
import type { Transform, TransformOptions } from '../node2d/transform.js'
import type { Sprite, SpriteOptions } from '../node2d/sprite.js'
import type { AnimationPlayer, AnimationPlayerOptions } from '../animation-player.js'
import type { Collider, ColliderOptions } from '../node2d/collider.js'
import type { RayCast, RayCastOptions } from '../node2d/ray-cast.js'
import type { Event } from '../../events/event.js'
import type { EventName } from '../../events/types.js'
import type { PrimaryNode } from './enum.js'
import type { Clickable, ClickableOptions } from '../node2d/clickable.js'
import type { Timer, TimerOptions } from '../timer.js'
import type { Geometry, GeometryOptions } from '../node2d/geometry.js'
import type { Text, TextOptions } from '../node2d/text.js'
import type { AudioPlayer, AudioPlayerOptions } from '../audio-player.js'
import type { Camera, CameraOptions } from '../node2d/camera.js'
import type { RigidBody, RigidBodyOptions } from '../node2d/rigid-body.js'
import type { Group, GroupOptions } from '../group.js'

/**
 * The **`NodeClasses`** interface maps each `PrimaryNode` to its class constructor.
 * Used internally by the node registry to instantiate nodes.
 *
 * @example
 * ```ts
 * import type { NodeClasses } from 'fraxel'
 *
 * // Access a node class from the registry
 * const SpriteClass = Nodes[PrimaryNode.Sprite]
 * ```
 */
export interface NodeClasses {
  [PrimaryNode.Group]: typeof Group
  [PrimaryNode.Transform]: typeof Transform
  [PrimaryNode.Sprite]: typeof Sprite
  [PrimaryNode.AnimationPlayer]: typeof AnimationPlayer
  [PrimaryNode.Collider]: typeof Collider
  [PrimaryNode.RayCast]: typeof RayCast
  [PrimaryNode.Clickable]: typeof Clickable
  [PrimaryNode.Timer]: typeof Timer
  [PrimaryNode.Geometry]: typeof Geometry
  [PrimaryNode.Text]: typeof Text
  [PrimaryNode.AudioPlayer]: typeof AudioPlayer
  [PrimaryNode.Camera]: typeof Camera
  [PrimaryNode.RigidBody]: typeof RigidBody
}

/**
 * The **`NodesOptions`** interface maps each `PrimaryNode` to its options type.
 * Used to type-check constructor options when creating nodes.
 *
 * @example
 * ```ts
 * import type { NodesOptions } from 'fraxel'
 *
 * // Options are inferred from the node type
 * type SpriteOpts = NodesOptions[PrimaryNode.Sprite]
 * ```
 */
export interface NodesOptions {
  [PrimaryNode.Group]: GroupOptions
  [PrimaryNode.Transform]: TransformOptions
  [PrimaryNode.Sprite]: SpriteOptions
  [PrimaryNode.AnimationPlayer]: AnimationPlayerOptions
  [PrimaryNode.Collider]: ColliderOptions
  [PrimaryNode.RayCast]: RayCastOptions
  [PrimaryNode.Clickable]: ClickableOptions
  [PrimaryNode.Timer]: TimerOptions
  [PrimaryNode.Geometry]: GeometryOptions
  [PrimaryNode.Text]: TextOptions
  [PrimaryNode.AudioPlayer]: AudioPlayerOptions
  [PrimaryNode.Camera]: CameraOptions
  [PrimaryNode.RigidBody]: RigidBodyOptions
}

type NodeName = keyof NodeClasses

/**
 * The **`NodeInstances`** type maps each `PrimaryNode` to its class instance type.
 * Used to type node references and event subscriptions.
 *
 * @example
 * ```ts
 * import type { NodeInstances } from 'fraxel'
 *
 * // Instance type is inferred from the node type
 * type SpriteInstance = NodeInstances[PrimaryNode.Sprite]
 * ```
 */
export type NodeInstances = {
  [P in NodeName]: InstanceType<NodeClasses[P]>
}

/**
 * The **`NodeToOptions`** type extracts the options type from a node class constructor.
 *
 * @example
 * ```ts
 * import type { NodeToOptions } from 'fraxel'
 *
 * // Extract options from a node class
 * type SpriteOpts = NodeToOptions<typeof Sprite>
 * ```
 */
export type NodeToOptions<T extends typeof Node> = ConstructorParameters<T>[0]

/**
 * The **`NodeEvents`** type maps each node type to its available events.
 * Used internally for type-safe event subscriptions.
 *
 * @example
 * ```ts
 * import type { NodeEvents } from 'fraxel'
 *
 * // Event map for a specific node type
 * type SpriteEvents = NodeEvents[PrimaryNode.Sprite]
 * ```
 */
export type NodeEvents = {
  [P in NodeName]: {
    [
      Q in keyof NodeInstances[P] as NodeEvent<NodeInstances[P], Q> extends undefined
        ? never
        : EventName<NonNullable<NodeEvent<NodeInstances[P], Q>>['baseName']>
    ]: NonNullable<NodeEvent<NodeInstances[P], Q>>
  }
}

type NodeEvent<T extends Node, K extends keyof T> =
  T[K] extends Event<any[], string> ? T[K] : undefined

/**
 * The **`NodeEventListeners`** type maps each node event to its listener function type.
 * Used internally to type event callback parameters.
 *
 * @example
 * ```ts
 * import type { NodeEventListeners } from 'fraxel'
 *
 * // Listener type for a specific event
 * type SpriteUpdated = NodeEventListeners[PrimaryNode.Sprite]['updated']
 * ```
 */
export type NodeEventListeners = {
  [P in keyof NodeEvents]: {
    [Q in keyof NodeEvents[P]]: NonNullable<NodeEventListener<P, Q>>
  }
}

type NodeEventListener<T extends keyof NodeEvents, K extends keyof NodeEvents[T]> =
  NodeEvents[T][K] extends Event<any[], string> ? NodeEvents[T][K]['exampleFun'] : undefined
