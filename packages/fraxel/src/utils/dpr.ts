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
