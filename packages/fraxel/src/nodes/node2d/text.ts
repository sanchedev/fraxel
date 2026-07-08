import { GameConfig } from '../../core/game-config.js'
import { TextStyle } from '../../core/theme.js'
import { propSignal } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { Nodes } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import type { Reactive } from '../../reactivity/types.js'

/**
 * Options for the `Text` node.
 */
export interface TextOptions extends Node2DOptions<PrimaryNode.Text> {
  /**
   * The **`text`** property defines the string to render.
   *
   * @example
   * ```tsx
   * <text text="Hello World" />
   * <text text={() => `Score: ${score()}`} />
   * ```
   */
  text: Reactive<string>
  /**
   * The **`style`** property defines the text rendering style.
   * Accepts a partial `TextStyle` — omitted properties use defaults.
   *
   * @default TextStyle.DEFAULT
   *
   * @example
   * ```tsx
   * <text text="Bold" style={{ fontSize: 24, fontWeight: FontWeight.Bold }} />
   * ```
   */
  style?: Partial<TextStyle>
}

/**
 * The **`Text`** node renders text on the canvas using `ctx.fillText()`.
 * It supports reactive text values and configurable styling via `TextStyle`.
 *
 * @example
 * ```tsx
 * import { useText } from 'fraxel/hooks'
 *
 * function ScoreLabel() {
 *   const label = useText()
 *
 *   return (
 *     <text
 *       ref={label}
 *       position={[10, 20]}
 *       text={() => `Score: ${score()}`}
 *       style={{ fontSize: 16, foregroundColor: '#ffffff' }}
 *     />
 *   )
 * }
 * ```
 */
export class Text extends Node2D<PrimaryNode.Text> {
  text: string
  #style: TextStyle

  constructor(options: TextOptions) {
    super(PrimaryNode.Text, options)
    this.text = propSignal(this, 'text', options.text) ?? ''
    this.#style = Object.assign(TextStyle.DEFAULT, options.style)
  }

  /** @internal Draws the text. */
  draw(delta: number): void {
    const ctx = GameConfig.ctx

    ctx.save()

    ctx.font = `${this.#style.fontWeight} ${this.#style.fontSize}px ${this.#style.fontFamily}`
    ctx.fillStyle = this.#style.foregroundColor
    ctx.textAlign = this.#style.textAlign
    ctx.textBaseline = 'top'

    ctx.fillText(this.text, this.position.x, this.position.y)

    ctx.restore()

    super.draw(delta)
  }
}

Nodes.text = Text
