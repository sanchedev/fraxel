import { FontWeight, TextAlign } from '../../../core/theme.js'
import { Color } from '../../../math/color.js'
import { PrimaryNode } from '../../../nodes/index.js'
import { createSignalSetter, Signal } from '../../../reactivity/signal.js'
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
  setText = createSignalSetter(this.text.signal, {
    value: () => this.node.text,
    onChange: (v) => (this.node.text = v),
  })
  /** Reactive text fill color. */
  fillColor = new Signal<Color>(Color.BLACK).getter
  /** Sets the text fill color. */
  setFillColor = createSignalSetter<Color>(this.fillColor.signal, {
    value: () => this.node.fillColor,
    onChange: (v) => (this.node.fillColor = v),
  })
  /** Reactive font size in pixels. */
  fontSize = new Signal(16).getter
  /** Sets the font size in pixels. */
  setFontSize = createSignalSetter(this.fontSize.signal, {
    value: () => this.node.fontSize,
    onChange: (v) => (this.node.fontSize = v),
  })
  /** Reactive font family. */
  fontFamily = new Signal('sans-serif').getter
  /** Sets the font family. */
  setFontFamily = createSignalSetter(this.fontFamily.signal, {
    value: () => this.node.fontFamily,
    onChange: (v) => (this.node.fontFamily = v),
  })
  /** Reactive font weight. */
  fontWeight = new Signal(FontWeight.Normal).getter
  /** Sets the font weight. */
  setFontWeight = createSignalSetter(this.fontWeight.signal, {
    value: () => this.node.fontWeight,
    onChange: (v) => (this.node.fontWeight = v),
  })
  /** Reactive text alignment. */
  textAlign = new Signal(TextAlign.Start).getter
  /** Sets the text alignment. */
  setTextAlign = createSignalSetter(this.textAlign.signal, {
    value: () => this.node.textAlign,
    onChange: (v) => (this.node.textAlign = v),
  })

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
