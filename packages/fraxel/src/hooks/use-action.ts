import { Input } from '../input/input.js'
import { useSignal } from './use-signal.js'
import { pushEffect } from './context.js'

/**
 * The **`useAction`** hook provides reactive state for a single input action.
 * Returns signals that update every frame based on the action's key state.
 *
 * @param action A symbol created via `Input.createAction()`
 * @returns An object with `pressed`, `justPressed`, and `justUnpressed` signals
 *
 * @example
 * ```tsx
 * import { useAction, useEffect } from 'fraxel'
 * import { Input } from 'fraxel'
 *
 * const Jump = Input.createAction({ key: ' ' })
 *
 * function Player() {
 *   const { justPressed } = useAction(Jump)
 *
 *   useEffect(() => {
 *     if (justPressed()) {
 *       player.node.applyImpulse([0, -400])
 *     }
 *   })
 *
 *   return <sprite textureId={PLAYER} />
 * }
 * ```
 */
export function useAction(action: symbol) {
  pushEffect('useAction', ([node]) => {
    if (node == null) return

    node.updated.on(() => {
      setPressed(Input.isActionPressed(action))
      setJustPressed(Input.justActionPressed(action))
      setJustUnpressed(Input.justActionUnpressed(action))
    })
  })

  const [pressed, setPressed] = useSignal(false)
  const [justPressed, setJustPressed] = useSignal(false)
  const [justUnpressed, setJustUnpressed] = useSignal(false)

  return { pressed, justPressed, justUnpressed }
}

/**
 * The **`useActionAxis`** hook provides a reactive axis value (-1, 0, or 1)
 * based on two opposing input actions.
 *
 * @param negative Action that maps to `-1`
 * @param positive Action that maps to `1`
 * @returns A `SignalGetter<number>` that returns `-1`, `0`, or `1`
 *
 * @example
 * ```tsx
 * import { useActionAxis, useEffect } from 'fraxel'
 * import { Input } from 'fraxel'
 *
 * const MoveRight = Input.createAction({ key: 'd' })
 * const MoveLeft = Input.createAction({ key: 'a' })
 *
 * function Player() {
 *   const axis = useActionAxis(MoveLeft, MoveRight)
 *
 *   useEffect(() => {
 *     player.node.applyForce([axis() * 100, 0])
 *   })
 *
 *   return <sprite textureId={PLAYER} />
 * }
 * ```
 */
export function useActionAxis(negative: symbol, positive: symbol) {
  pushEffect('useActionAxis', ([node]) => {
    if (node == null) return

    node.updated.on(() => {
      let value = 0
      if (Input.isActionPressed(negative)) value -= 1
      if (Input.isActionPressed(positive)) value += 1
      setAxis(value)
    })
  })

  const [axis, setAxis] = useSignal(0)

  return axis
}
