import { color, type Color, type ColorLike } from '../math/color.js'

/**
 * The **`Theme`** class holds the default text style for the game.
 * Pass a `Theme` instance to `Game.setup()` to configure default text rendering.
 *
 * @example
 * ```ts
 * import { Theme, TextStyle, FontWeight, TextAlign } from 'fraxel'
 *
 * const theme = new Theme(
 *   new TextStyle('#fff', 24, 'monospace', FontWeight.Bold, TextAlign.Center)
 * )
 * ```
 */
export class Theme {
  constructor(
    /** The default `TextStyle` for text nodes. */
    public textStyle: TextStyle = TextStyle.DEFAULT,
  ) {}
}

/**
 * The **`TextStyle`** class configures text rendering properties.
 * Used by `Theme` and the `Text` node to control font appearance.
 */
export class TextStyle {
  /** The **`DEFAULT`** static getter returns a `TextStyle` with default values. */
  static get DEFAULT() {
    return new TextStyle()
  }

  /** The **`fillColor`** property sets the text fill color. @default '#000000' */
  fillColor: Color
  /** The **`fontSize`** property sets the font size in pixels. @default 16 */
  fontSize: number
  /** The **`fontFamily`** property sets the font family. @default 'sans-serif' */
  fontFamily: string
  /** The **`fontWeight`** property sets the font weight. @default FontWeight.Normal */
  fontWeight: FontWeight
  /** The **`textAlign`** property sets the text alignment. @default TextAlign.Start */
  textAlign: TextAlign

  constructor(
    fillColor: ColorLike = '#000',
    fontSize: number = 16,
    fontFamily: string = 'sans-serif',
    fontWeight: FontWeight = FontWeight.Normal,
    textAlign: TextAlign = TextAlign.Start,
  ) {
    this.fillColor = color(fillColor)
    this.fontSize = fontSize
    this.fontFamily = fontFamily
    this.fontWeight = fontWeight
    this.textAlign = textAlign
  }
}

/**
 * The **`TextAlign`** enum specifies text alignment options.
 * - **`Start`** — aligns to the start (left for LTR)
 * - **`Center`** — centers the text
 * - **`End`** — aligns to the end (right for LTR)
 */
export enum TextAlign {
  Start = 'start',
  Center = 'center',
  End = 'end',
}

/**
 * The **`FontWeight`** enum specifies font weight options.
 * - **`Normal`** — regular weight
 * - **`Bold`** — bold weight
 */
export enum FontWeight {
  Normal = 'normal',
  Bold = 'bold',
}
