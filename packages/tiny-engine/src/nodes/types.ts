import type { Node, nodeName } from './node.js'
import type { Sprite, spriteNodeName } from './sprite.js'
import type {
  AnimationPlayer,
  animationPlayerNodeName,
} from './animation-player.js'
import type { Collider, colliderNodeName } from './collider.js'
import type { RayCast, rayCastNodeName } from './ray-cast.js'
import type { Event } from '../events/event.js'
import type { EventName } from '../events/types.js'

export interface NodeClasses {
  [nodeName]: typeof Node
  [spriteNodeName]: typeof Sprite
  [animationPlayerNodeName]: typeof AnimationPlayer
  [colliderNodeName]: typeof Collider
  [rayCastNodeName]: typeof RayCast
}

export type NodeName = keyof NodeClasses

type a<T extends Node> = new (options: NodeToOptions<typeof Node>) => T

export type NodesOptions = {
  [P in NodeName]: NodeToOptions<NodeClasses[P]>
}

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
