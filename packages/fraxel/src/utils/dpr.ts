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

  const { width: w, height: h } = ctx.canvas.getBoundingClientRect()

  const width = w * dpr
  const height = h * dpr

  const ratio = (width / originalWidth + height / originalHeight) / 2

  ctx.canvas.width = width
  ctx.canvas.height = height

  ctx.scale(ratio, ratio)

  return ratio
}
