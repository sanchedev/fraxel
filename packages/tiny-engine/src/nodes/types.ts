import type { Node } from './node.js'
import type { Transform, TransformOptions } from './transform.js'
import type { Sprite, SpriteOptions } from './sprite.js'
import type {
  AnimationPlayer,
  AnimationPlayerOptions,
} from './animation-player.js'
import type { Collider, ColliderOptions } from './collider.js'
import type { RayCast, RayCastOptions } from './ray-cast.js'
import type { Event } from '../events/event.js'
import type { EventName } from '../events/types.js'
import type { PrimaryNode } from './enum.js'

export interface NodeClasses {
  [PrimaryNode.Transform]: typeof Transform
  [PrimaryNode.Sprite]: typeof Sprite
  [PrimaryNode.AnimationPlayer]: typeof AnimationPlayer
  [PrimaryNode.Collider]: typeof Collider
  [PrimaryNode.RayCast]: typeof RayCast
}

export interface NodesOptions {
  [PrimaryNode.Transform]: TransformOptions
  [PrimaryNode.Sprite]: SpriteOptions
  [PrimaryNode.AnimationPlayer]: AnimationPlayerOptions
  [PrimaryNode.Collider]: ColliderOptions
  [PrimaryNode.RayCast]: RayCastOptions
}

type NodeName = keyof NodeClasses

export type NodeInstances = {
  [P in NodeName]: InstanceType<NodeClasses[P]>
}

export type NodeToOptions<T extends typeof Node> = ConstructorParameters<T>[0]

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
