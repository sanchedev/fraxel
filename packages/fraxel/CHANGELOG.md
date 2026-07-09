# Changelog

## 0.1.0-alpha.4b

### Highlights

- **Docs & animation polish** — added `docs/README.md` and expanded `docs/animation.md` with clearer parameter tables and examples for `keyframesFromSheet`, `animationFromSheet`, `multiKF`, and `kfFromProp`.
- **`useRef` deprecated** — `useRef` marked as `@deprecated`; component functions should use `let` and a runtime warning is emitted when called.
- **`Reference` deprecated** — `Reference` marked as `@deprecated` too.
- **`warnUseRef` Warning** — logs a console warning when `useRef` is used.
