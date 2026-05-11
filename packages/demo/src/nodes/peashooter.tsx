import {
  AnimationPlayer,
  kfFromSpriteSheet,
  loadTexture,
  Node,
  Sprite,
  Vector2,
} from 'tiny-engine'
import { Plant, type PlantOptions } from './plant'
import { renderToNodes } from 'tiny-engine/jsx'

export interface PeashooterOptions extends PlantOptions {
  cell: Vector2
}

export class Peashooter extends Plant {
  isZombieDetected = false

  constructor(options: PeashooterOptions) {
    super(options)
    this.cell = options.cell
  }

  health: number = 100
  cell: Vector2

  sprite?: Sprite
  animPlayer?: AnimationPlayer

  onStart() {
    this.sprite = this.getChild({ nodeType: 'sprite' })!
    this.animPlayer = this.sprite.getChild({
      nodeType: 'animation-player',
    })!

    this.animPlayer.add('idle', {
      keyframes: kfFromSpriteSheet(this.sprite, 'peashooter.idle', 4),
      fps: 8 / 3,
    })
    this.animPlayer.add('shoot', {
      keyframes: kfFromSpriteSheet(this.sprite, 'peashooter.shoot', 4),
      fps: 8 / 3,
    })

    this.animPlayer.play('idle')
  }

  build(): Node | Node[] {
    return renderToNodes(
      <sprite textureId='peashooter.idle' sourceSize={new Vector2(16, 16)}>
        <animation-player
          onAnimationEnd={() => {
            if (this.isZombieDetected) {
              this.animPlayer?.play('shoot')
            } else {
              this.animPlayer?.play('idle')
            }
          }}
        />
      </sprite>,
    )
  }
}

await loadTexture(
  'peashooter.idle',
  '/assets/sprites/plants/peashooter/idle.png',
)
await loadTexture(
  'peashooter.shoot',
  '/assets/sprites/plants/peashooter/shoot.png',
)
