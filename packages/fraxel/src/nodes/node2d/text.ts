import { GameConfig } from '../../core/game-config.js'
import { FontWeight, TextAlign } from '../../core/theme.js'
import { ns, propSignal, signalColor } from '../../utils/ternaries.js'
import { PrimaryNode } from '../lib/enum.js'
import { registerNode } from '../lib/registry.js'
import { Node2D, type Node2DOptions } from './_node2d.js'
import type { Reactive } from '../../reactivity/types.js'
import { Color, type ColorLike } from '../../math/color.js'

/**
 * The **`TextOptions`** interface defines the configuration for a `Text` node.
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
   * The **`fillColor`** property defines the text color.
   *
   * @default Theme.textStyle.fillColor
   *
   * @example
   * ```tsx
   * <text text="Score" fillColor="#fff" />
   * ```
   */
  fillColor?: Reactive<ColorLike>
  /** The **`fontSize`** property sets the font size in pixels. */
  fontSize?: Reactive<number>
  /** The **`fontFamily`** property sets the font family. */
  fontFamily?: Reactive<string>
  /** The **`fontWeight`** property sets the font weight. */
  fontWeight?: Reactive<FontWeight>
  /** The **`textAlign`** property sets the text alignment. */
  textAlign?: Reactive<TextAlign>
}

/**
 * The **`Text`** node renders text on the canvas using `ctx.fillText()`.
 * Supports reactive text values and direct style props.
 *
 * @example
 * ```tsx
 * import { useText, useEffect } from 'fraxel'
 *
 * function ScoreLabel() {
 *   const label = useText()
 *
 *   useEffect(() => {
 *     label.setText(`Score: ${score()}`)
 *   })
 *
 *   return (
 *     <text
 *       ref={label}
 *       position={[10, 20]}
 *       text="Score: 0"
 *       fontSize={16}
 *       fillColor="#fff"
 *     />
 *   )
 * }
 * ```
 */
export class Text extends Node2D<PrimaryNode.Text> {
  text: string
  fillColor: Color
  fontSize: number
  fontFamily: string
  fontWeight: FontWeight
  textAlign: TextAlign

  constructor(options: TextOptions) {
    super(PrimaryNode.Text, options)
    this.text = propSignal(this, 'text', options.text) ?? ''
    const defaults = GameConfig.theme.textStyle
    this.fillColor = ns(
      options.fillColor,
      (c) => propSignal(this, 'fillColor', signalColor(c)),
      defaults.fillColor,
    )
    this.fontSize = propSignal(this, 'fontSize', options.fontSize) ?? defaults.fontSize
    this.fontFamily = propSignal(this, 'fontFamily', options.fontFamily) ?? defaults.fontFamily
    this.fontWeight = propSignal(this, 'fontWeight', options.fontWeight) ?? defaults.fontWeight
    this.textAlign = propSignal(this, 'textAlign', options.textAlign) ?? defaults.textAlign
  }

  /** @internal Draws the text. */
  draw(delta: number): void {
    const ctx = GameConfig.ctx

    ctx.save()

    ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`
    ctx.fillStyle = this.fillColor.toCSS()
    ctx.textAlign = this.textAlign
    ctx.textBaseline = 'top'

    ctx.fillText(this.text, this.position.x, this.position.y)

    ctx.restore()

    super.draw(delta)
  }
}

registerNode(PrimaryNode.Text, Text)
