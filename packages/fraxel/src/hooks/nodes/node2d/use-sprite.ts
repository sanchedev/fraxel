import { Color } from '../../../math/color.js'
import { Region } from '../../../math/region.js'
import { Vector2 } from '../../../math/vector2.js'
import { PrimaryNode } from '../../../nodes/index.js'
import { createSignalSetter, Signal } from '../../../reactivity/signal.js'
import { pushEffect } from '../../context.js'
import { Node2DReference } from './reference.js'

/**
 * The **`useSprite`** hook creates a reference to a `Sprite` node with reactive access
 * to all visual properties (flip, filters, tint, opacity).
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
 *     sprite.setTint('#ff8080')
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
  /** Reactive source region of the texture. */
  source = new Signal<Region>(new Region(Vector2.ZERO, Vector2.ZERO)).getter
  /** Sets the source region of the texture. */
  setSource = createSignalSetter(this.source.signal, {
    value: () => this.node.source,
    onChange: (v) => (this.node.source = v),
  })

  /** Reactive horizontal flip state. */
  flipX = new Signal(false).getter
  /** Sets the horizontal flip state. */
  setFlipX = createSignalSetter(this.flipX.signal, {
    value: () => this.node.flipX,
    onChange: (v) => (this.node.flipX = v),
  })
  /** Reactive vertical flip state. */
  flipY = new Signal(false).getter
  /** Sets the vertical flip state. */
  setFlipY = createSignalSetter(this.flipY.signal, {
    value: () => this.node.flipY,
    onChange: (v) => (this.node.flipY = v),
  })

  /** Reactive brightness (0=black, 1=base, 2=white). */
  brightness = new Signal(1).getter
  /** Sets the brightness filter value. */
  setBrightness = createSignalSetter(this.brightness.signal, {
    value: () => this.node.brightness,
    onChange: (v) => (this.node.brightness = v),
  })
  /** Reactive grayscale (0=color, 1=grayscale). */
  grayscale = new Signal(0).getter
  /** Sets the grayscale filter value. */
  setGrayscale = createSignalSetter(this.grayscale.signal, {
    value: () => this.node.grayscale,
    onChange: (v) => (this.node.grayscale = v),
  })
  /** Reactive RGBA tint color. */
  tint = new Signal(Color.WHITE).getter
  /** Sets the tint color. */
  setTint = createSignalSetter(this.tint.signal, {
    value: () => this.node.tint,
    onChange: (v) => (this.node.tint = v),
  })
  /** Reactive contrast (0=no contrast, 1=base). */
  contrast = new Signal(1).getter
  /** Sets the contrast filter value. */
  setContrast = createSignalSetter(this.contrast.signal, {
    value: () => this.node.contrast,
    onChange: (v) => (this.node.contrast = v),
  })
  /** Reactive saturation (0=desaturated, 1=base). */
  saturate = new Signal(1).getter
  /** Sets the saturation filter value. */
  setSaturate = createSignalSetter(this.saturate.signal, {
    value: () => this.node.saturate,
    onChange: (v) => (this.node.saturate = v),
  })
  /** Reactive hue rotation in degrees. */
  hueRotate = new Signal(0).getter
  /** Sets the hue rotation in degrees. */
  setHueRotate = createSignalSetter(this.hueRotate.signal, {
    value: () => this.node.hueRotate,
    onChange: (v) => (this.node.hueRotate = v),
  })
  /** Reactive invert (0=normal, 1=inverted). */
  invert = new Signal(0).getter
  /** Sets the invert filter value. */
  setInvert = createSignalSetter(this.invert.signal, {
    value: () => this.node.invert,
    onChange: (v) => (this.node.invert = v),
  })
  /** Reactive opacity (0=transparent, 1=opaque). */
  opacity = new Signal(1).getter
  /** Sets the opacity value. */
  setOpacity = createSignalSetter(this.opacity.signal, {
    value: () => this.node.opacity,
    onChange: (v) => (this.node.opacity = v),
  })

  constructor() {
    super({
      type: PrimaryNode.Sprite,
      regSignal: ({ reg }) => {
        reg<SpriteReference>(
          this,
          'source',
          'flipX',
          'flipY',
          'brightness',
          'grayscale',
          'tint',
          'contrast',
          'saturate',
          'hueRotate',
          'invert',
          'opacity',
        )
      },
      onFrame: (node) => {
        this.source.signal.setter(node.source.clone())
        this.flipX.signal.setter(node.flipX)
        this.flipY.signal.setter(node.flipY)
        this.brightness.signal.setter(node.brightness)
        this.grayscale.signal.setter(node.grayscale)
        this.tint.signal.setter(node.tint.clone())
        this.contrast.signal.setter(node.contrast)
        this.saturate.signal.setter(node.saturate)
        this.hueRotate.signal.setter(node.hueRotate)
        this.invert.signal.setter(node.invert)
        this.opacity.signal.setter(node.opacity)
      },
    })
  }
}
