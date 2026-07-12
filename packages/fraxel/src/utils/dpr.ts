/**
 * The **`getDPRFromCtx`** function adjusts the canvas for device pixel ratio scaling.
 * It scales the context, resizes the canvas to match the DPR, and applies the appropriate scaling ratio.
 * @param ctx The canvas rendering context
 * @param originalWidth The original canvas width (logical pixels)
 * @param originalHeight The original canvas height (logical pixels)
 * @param currentRatio The current DPR scaling ratio
 * @returns The computed DPR ratio used for scaling
 */
export function getDPRFromCtx(
  ctx: CanvasRenderingContext2D,
  originalWidth: number,
  originalHeight: number,
  currentRatio: number,
) {
  const reverseRatio = 1 / currentRatio

  ctx.scale(reverseRatio, reverseRatio)

  const dpr = window.devicePixelRatio ?? 1

  const { width: displayWidth, height: displayHeight } = ctx.canvas.getBoundingClientRect()

  const width = displayWidth * dpr
  const height = displayHeight * dpr

  if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
    ctx.canvas.width = width
    ctx.canvas.height = height
  }

  const ratio = (displayWidth / originalWidth + displayHeight / originalHeight) / 2

  ctx.scale(ratio * dpr, ratio * dpr)

  return ratio
}
