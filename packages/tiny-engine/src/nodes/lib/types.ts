import type { Node } from '../_node.js'
import type { Transform, TransformOptions } from '../node2d/transform.js'
import type { Sprite, SpriteOptions } from '../node2d/sprite.js'
import type {
  AnimationPlayer,
  AnimationPlayerOptions,
} from '../animation-player.js'
import type { Collider, ColliderOptions } from '../node2d/collider.js'
import type { RayCast, RayCastOptions } from '../node2d/ray-cast.js'
import type { Event } from '../../events/event.js'
import type { EventName } from '../../events/types.js'
import type { PrimaryNode } from './enum.js'
import type { Clickable, ClickableOptions } from '../node2d/clickable.js'
import type { Timer, TimerOptions } from '../timer.js'
import type { Rectangle, RectangleOptions } from '../node2d/rectangle.js'

/**
 * The **`NodeClasses`** interface maps each `PrimaryNode` to its class constructor.
 * Used internally by the node registry to instantiate nodes.
 */
export interface NodeClasses {
  [PrimaryNode.Transform]: typeof Transform
  [PrimaryNode.Sprite]: typeof Sprite
  [PrimaryNode.AnimationPlayer]: typeof AnimationPlayer
  [PrimaryNode.Collider]: typeof Collider
  [PrimaryNode.RayCast]: typeof RayCast
  [PrimaryNode.Clickable]: typeof Clickable
  [PrimaryNode.Timer]: typeof Timer
  [PrimaryNode.Rectangle]: typeof Rectangle
}

/**
 * The **`NodesOptions`** interface maps each `PrimaryNode` to its options type.
 * Used to type-check constructor options when creating nodes.
 */
export interface NodesOptions {
  [PrimaryNode.Transform]: TransformOptions
  [PrimaryNode.Sprite]: SpriteOptions
  [PrimaryNode.AnimationPlayer]: AnimationPlayerOptions
  [PrimaryNode.Collider]: ColliderOptions
  [PrimaryNode.RayCast]: RayCastOptions
  [PrimaryNode.Clickable]: ClickableOptions
  [PrimaryNode.Timer]: TimerOptions
  [PrimaryNode.Rectangle]: RectangleOptions
}

type NodeName = keyof NodeClasses

/**
 * The **`NodeInstances`** type maps each `PrimaryNode` to its class instance type.
 * Used to type node references and event subscriptions.
 */
export type NodeInstances = {
  [P in NodeName]: InstanceType<NodeClasses[P]>
}

/**
 * The **`NodeToOptions`** type extracts the options type from a node class constructor.
 */
export type NodeToOptions<T extends typeof Node> = ConstructorParameters<T>[0]

/**
 * The **`NodeEvents`** type maps each node type to its available events.
 * Used by `useEvent` to provide type-safe event subscriptions.
 */
export type NodeEvents = {
  [P in NodeName]: {
    [Q in keyof NodeInstances[P] as NodeEvent<
      NodeInstances[P],
      Q
    > extends undefined
      ? never
      : EventName<
          NonNullable<NodeEvent<NodeInstances[P], Q>>['baseName']
        >]: NonNullable<NodeEvent<NodeInstances[P], Q>>
  }
}

type NodeEvent<T extends Node, K extends keyof T> =
  T[K] extends Event<any[], string> ? T[K] : undefined

/**
 * The **`NodeEventListeners`** type maps each node event to its listener function type.
 * Used internally to type event callback parameters.
 */
export type NodeEventListeners = {
  [P in keyof NodeEvents]: {
    [Q in keyof NodeEvents[P]]: NonNullable<NodeEventListener<P, Q>>
  }
}

type NodeEventListener<
  T extends keyof NodeEvents,
  K extends keyof NodeEvents[T],
> =
  NodeEvents[T][K] extends Event<any[], string>
    ? NodeEvents[T][K]['exampleFun']
    : undefined
