// Small helpers so effects can skip motion for users who asked for less of it,
// and skip pointer effects on touch screens.

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
