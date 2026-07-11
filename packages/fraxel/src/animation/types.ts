export interface Animation {
  /** The **`fps`** property defines the playback speed in frames per second. */
  fps: number
  /** The **`keyframes`** property defines the frames in the animation. */
  keyframes: AnimationKeyframe[]
  /** The **`loop`** property determines whether the animation restarts when it reaches the end. */
  loop?: boolean | undefined
}

/**
 * The **`AnimationKeyframe`** type is a function that receives the local time (0–1)
 * within the frame and applies the frame's visual state to the sprite.
 */
export type AnimationKeyframe = (time: number) => void
