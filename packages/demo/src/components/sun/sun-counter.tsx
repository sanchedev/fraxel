import { loadTexture, loadSound, tween, easeOutQuad, PrimaryNode, type VectorLike } from 'diny'
import { useContext, useNode, useEffect } from 'diny/hooks'
import { SunCountCtx } from '../../contexts/sun-count'

const SUN_COUNTER = await loadTexture('/assets/sprites/ui/sun-counter.png')
const POINTS_SOUND = await loadSound('/assets/audios/points.ogg')

export function SunCounter({ position }: { position: VectorLike }) {
  const [sunCount, setSunCount] = useContext(SunCountCtx)
  const audio = useNode(PrimaryNode.AudioPlayer)
  const sprite = useNode(PrimaryNode.Sprite)

  useEffect(() => {
    sunCount()
    tween({
      target: sprite.node,
      prop: 'brightness',
      from: 1.5,
      to: 1,
      duration: 0.2,
      easing: easeOutQuad,
    })
  })

  return (
    <sprite ref={sprite} position={position} textureId={SUN_COUNTER}>
      <text
        position={[8, 2]}
        text={() => (sunCount() * 25).toString()}
        style={{ fontSize: 5, foregroundColor: '#000000', fontFamily: 'monospace' }}
      />
      <clickable
        size={[4, 4]}
        onClick={() => {
          setSunCount(sunCount() + 1)
          audio.node.play()
        }}
      />
      <audio-player ref={audio} soundId={POINTS_SOUND} />
    </sprite>
  )
}
