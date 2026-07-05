import {
  loadTexture,
  loadSound,
  tween,
  easeInQuad,
  PrimaryNode,
  type VectorLike,
} from 'tiny-engine'
import { useContext, useEvent, useNode } from 'tiny-engine/hooks'
import { SunCountCtx } from '../../contexts/sun-count'

const SUN_SPRITE = await loadTexture('/assets/sprites/ui/sun.png')
const POINTS_SOUND = await loadSound('/assets/audios/points.ogg')

export function Sun({ position }: { position: VectorLike }) {
  const [sunCount, setSunCount] = useContext(SunCountCtx)
  const transform = useNode(PrimaryNode.Transform)
  const clickable = useNode(PrimaryNode.Clickable)
  const audio = useNode(PrimaryNode.AudioPlayer)

  useEvent(transform, 'started', () => {
    tween({
      target: transform.node.position,
      prop: 'y',
      from: transform.node.position.y,
      to: transform.node.position.y + 30,
      duration: 2,
      easing: easeInQuad,
    })
  })

  useEvent(clickable, 'clicked', () => {
    setSunCount(sunCount() + 1)
    audio.node.play()
    transform.node.destroy()
  })

  return (
    <transform ref={transform} position={position}>
      <sprite textureId={SUN_SPRITE}>
        <clickable ref={clickable} size={[12, 12]} position={[-2, -2]} />
      </sprite>
      <audio-player ref={audio} soundId={POINTS_SOUND} persistUntilEnd />
    </transform>
  )
}
