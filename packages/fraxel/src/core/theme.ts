/** The **`Theme`** class add a Theme to the Game. */
export class Theme {
  constructor(
    /** Default text style */
    public textStyle: TextStyle = TextStyle.DEFAULT,
  ) {}
}

export class TextStyle {
  /** Get default value of `TextStyle` */
  static get DEFAULT() {
    return new TextStyle()
  }

  constructor(
    /** The **`foregroundColor`** property sets the text color.
     * @default '#000000'
     */
    public foregroundColor: string = '#000000',
    /** The **`fontSize`** property sets the font size.
     * @default 16
     */
    public fontSize: number = 16,
    /** The **`fontFamily`** property sets the font family.
     * @default 'sans-serif'
     */
    public fontFamily: string = 'sans-serif',
    /** The **`fontWeight`** property sets the font weight.
     * @default FontWeight.Normal
     */
    public fontWeight: FontWeight = FontWeight.Normal,
    /** The **`text align`** property sets the text align.
     * @default TextAlign.Start
     */
    public textAlign: TextAlign = TextAlign.Start,
  ) {}
}

export enum TextAlign {
  Start = 'start',
  Center = 'center',
  End = 'end',
}

export enum FontWeight {
  Normal = 'normal',
  Bold = 'bold',
}
