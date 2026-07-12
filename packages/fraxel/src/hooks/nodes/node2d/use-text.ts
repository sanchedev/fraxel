import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useText`** hook creates a reference to a `Text` node with reactive
 * access to the text content.
 *
 * @returns A `TextReference` with reactive text property
 *
 * @example
 * ```tsx
 * import { useText, useEffect } from 'fraxel'
 *
 * function ScoreDisplay() {
 *   const text = useText()
 *   const [score] = useSignal(0)
 *
 *   useEffect(() => {
 *     text.setText(`Score: ${score()}`)
 *   })
 *
 *   return <text ref={text} text="Score: 0" />
 * }
 * ```
 */
export function useText() {
  pushEffect('useText', () => {})
  return new TextReference()
}

export class TextReference extends Node2DReference<PrimaryNode.Text> {
  /** Reactive text content. */
  text = new Signal('').getter
  setText = (text: string) => (this.node.text = text)

  constructor() {
    let unsub = () => {}
    super(
      PrimaryNode.Text,
      (node) => {
        const sets = [
          () => {
            this.text.signal.setter(node.text)
          },
        ]
        sets.forEach((set) => set())
        unsub = node.updated.on(() => {
          sets.forEach((set) => set())
        })
      },
      () => {
        this.text.signal.clearSubs()
        unsub()
      },
    )
  }
}
