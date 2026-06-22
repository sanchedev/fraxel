import { PrimaryNode } from './enum.js'
import { Node, type NodeOptions } from './node.js'
import { Nodes } from './registry.js'

export interface TransformOptions extends NodeOptions<PrimaryNode.Transform> {}

export class Transform extends Node<PrimaryNode.Transform> {
  constructor(options: TransformOptions) {
    super(PrimaryNode.Transform, options)
  }
}

Nodes.transform = Transform
