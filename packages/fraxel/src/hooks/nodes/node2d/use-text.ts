import { FontWeight, TextAlign } from '../../../core/theme.js'
import { color, Color, type ColorLike } from '../../../math/color.js'
import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalSetter } from '../../../reactivity/types.js'
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
 *     text.setFillColor('#fff')
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
  /** Sets the text content. */
  setText: SignalSetter<string> = (text) => (this.node.text = text)
  /** Reactive text fill color. */
  fillColor = new Signal<Color>(Color.BLACK).getter
  /** Sets the text fill color. */
  setFillColor: SignalSetter<ColorLike> = (value) => (this.node.fillColor = color(value))
  /** Reactive font size in pixels. */
  fontSize = new Signal(16).getter
  /** Sets the font size in pixels. */
  setFontSize: SignalSetter<number> = (value) => (this.node.fontSize = value)
  /** Reactive font family. */
  fontFamily = new Signal('sans-serif').getter
  /** Sets the font family. */
  setFontFamily: SignalSetter<string> = (value) => (this.node.fontFamily = value)
  /** Reactive font weight. */
  fontWeight = new Signal(FontWeight.Normal).getter
  /** Sets the font weight. */
  setFontWeight: SignalSetter<FontWeight> = (value) => (this.node.fontWeight = value)
  /** Reactive text alignment. */
  textAlign = new Signal(TextAlign.Start).getter
  /** Sets the text alignment. */
  setTextAlign: SignalSetter<TextAlign> = (value) => (this.node.textAlign = value)

  constructor() {
    super({
      type: PrimaryNode.Text,
      regSignal: ({ reg }) => {
        reg<TextReference>(
          this,
          'text',
          'fillColor',
          'fontSize',
          'fontFamily',
          'fontWeight',
          'textAlign',
        )
      },
      onFrame: (node) => {
        this.text.signal.setter(node.text)
        this.fillColor.signal.setter(node.fillColor.clone())
        this.fontSize.signal.setter(node.fontSize)
        this.fontFamily.signal.setter(node.fontFamily)
        this.fontWeight.signal.setter(node.fontWeight)
        this.textAlign.signal.setter(node.textAlign)
      },
    })
  }
}
