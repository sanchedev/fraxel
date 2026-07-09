/**
 * The **`Theme`** class holds the default text style for the game.
 * Pass a `Theme` instance to `Game.setup()` to configure default text rendering.
 *
 * @example
 * ```ts
 * import { Theme, TextStyle, FontWeight, TextAlign } from 'fraxel'
 *
 * const theme = new Theme(
 *   new TextStyle('#ffffff', 24, 'monospace', FontWeight.Bold, TextAlign.Center)
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

  constructor(
    /** The **`foregroundColor`** property sets the text color. @default '#000000' */
    public foregroundColor: string = '#000000',
    /** The **`fontSize`** property sets the font size in pixels. @default 16 */
    public fontSize: number = 16,
    /** The **`fontFamily`** property sets the font family. @default 'sans-serif' */
    public fontFamily: string = 'sans-serif',
    /** The **`fontWeight`** property sets the font weight. @default FontWeight.Normal */
    public fontWeight: FontWeight = FontWeight.Normal,
    /** The **`textAlign`** property sets the text alignment. @default TextAlign.Start */
    public textAlign: TextAlign = TextAlign.Start,
  ) {}
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
