import { Color, color, type ColorLike } from '../../../math/color.js'
import { PrimaryNode } from '../../../nodes/index.js'
import { Signal } from '../../../reactivity/signal.js'
import type { SignalGetter, SignalSetter } from '../../../reactivity/types.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useSprite`** hook creates a reference to a `Sprite` node with reactive access
 * to all visual properties (flip, filters, modulate, opacity).
 *
 * @returns A `SpriteReference` with reactive properties and setters
 *
 * @example
 * ```tsx
 * import { useSprite, useEffect } from 'fraxel'
 *
 * function Player() {
 *   const sprite = useSprite()
 *
 *   useEffect(() => {
 *     sprite.setModulate([1, 0.5, 0.5, 1]) // tint red
 *     sprite.setOpacity(0.8)
 *   })
 *
 *   return <sprite ref={sprite} textureId={PLAYER} />
 * }
 * ```
 */
export function useSprite() {
  pushEffect('useSprite', () => {})
  return new SpriteReference()
}

export class SpriteReference extends Node2DReference<PrimaryNode.Sprite> {
  /** Reactive horizontal flip state. */
  flipX = new Signal(false).getter
  /** Sets the horizontal flip state. */
  setFlipX: SignalSetter<boolean> = (value) => (this.node.flipX = value)
  /** Reactive vertical flip state. */
  flipY = new Signal(false).getter
  /** Sets the vertical flip state. */
  setFlipY: SignalSetter<boolean> = (value) => (this.node.flipY = value)

  /** Reactive brightness (0=black, 1=base, 2=white). */
  brightness = new Signal(1).getter
  /** Sets the brightness filter value. */
  setBrightness: SignalSetter<number> = (value) => (this.node.brightness = value)
  /** Reactive grayscale (0=color, 1=grayscale). */
  grayscale = new Signal(0).getter
  /** Sets the grayscale filter value. */
  setGrayscale: SignalSetter<number> = (value) => (this.node.grayscale = value)
  /** Reactive RGBA tint color. */
  modulate = new Signal<Color>(Color.WHITE).getter
  /** Sets the modulate tint color. */
  setModulate: SignalSetter<ColorLike> = (value) => (this.node.modulate = color(value))
  /** Reactive contrast (0=no contrast, 1=base). */
  contrast = new Signal(1).getter
  /** Sets the contrast filter value. */
  setContrast: SignalSetter<number> = (value) => (this.node.contrast = value)
  /** Reactive saturation (0=desaturated, 1=base). */
  saturate = new Signal(1).getter
  /** Sets the saturation filter value. */
  setSaturate: SignalSetter<number> = (value) => (this.node.saturate = value)
  /** Reactive hue rotation in degrees. */
  hueRotate = new Signal(0).getter
  /** Sets the hue rotation in degrees. */
  setHueRotate: SignalSetter<number> = (value) => (this.node.hueRotate = value)
  /** Reactive invert (0=normal, 1=inverted). */
  invert = new Signal(0).getter
  /** Sets the invert filter value. */
  setInvert: SignalSetter<number> = (value) => (this.node.invert = value)
  /** Reactive opacity (0=transparent, 1=opaque). */
  opacity = new Signal(1).getter
  /** Sets the opacity value. */
  setOpacity: SignalSetter<number> = (value) => (this.node.opacity = value)

  constructor() {
    const set =
      <T>(g: SignalGetter<T>, v: T) =>
      () =>
        g.signal.setter(v)
    super(
      PrimaryNode.Sprite,
      (node) => {
        const sets = [
          set(this.flipX, node.flipX),
          set(this.flipY, node.flipY),
          set(this.brightness, node.brightness),
          set(this.grayscale, node.grayscale),
          set(this.modulate, node.modulate),
          set(this.contrast, node.contrast),
          set(this.saturate, node.saturate),
          set(this.hueRotate, node.hueRotate),
          set(this.invert, node.invert),
          set(this.opacity, node.opacity),
        ]
        sets.forEach((set) => set())
        node.updated.on(() => {
          sets.forEach((set) => set())
        })
      },
      () => {
        this.flipX.signal.clearSubs()
        this.flipY.signal.clearSubs()
        this.brightness.signal.clearSubs()
        this.grayscale.signal.clearSubs()
        this.modulate.signal.clearSubs()
        this.contrast.signal.clearSubs()
        this.saturate.signal.clearSubs()
        this.hueRotate.signal.clearSubs()
        this.invert.signal.clearSubs()
        this.opacity.signal.clearSubs()
      },
    )
  }
}
