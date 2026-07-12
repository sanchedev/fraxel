import { PrimaryNode } from '../../nodes/lib/enum.js'
import { pushEffect } from '../context.js'
import { NodeReference } from './reference.js'

/**
 * The **`useView`** hook creates a reference to a `View` node that renders
 * children in screen space.
 *
 * @returns A `ViewReference` with lifecycle triggers
 *
 * @example
 * ```tsx
 * import { useView, useText, useEffect } from 'fraxel'
 *
 * function HUD() {
 *   const view = useView()
 *   const scoreText = useText()
 *
 *   useEffect(() => {
 *     scoreText.text.signal.setter('Score: 100')
 *   })
 *
 *   return (
 *     <view ref={view}>
 *       <text ref={scoreText} position={[10, 10]} text="Score: 0" />
 *     </view>
 *   )
 * }
 * ```
 */
export function useView() {
  pushEffect('useView', () => {})
  return new ViewReference()
}

/**
 * The **`ViewReference`** class provides access to a `View` node's lifecycle
 * events and node instance.
 */
export class ViewReference extends NodeReference<PrimaryNode.View> {
  constructor() {
    super(
      PrimaryNode.View,
      () => {},
      () => {},
    )
  }
}
