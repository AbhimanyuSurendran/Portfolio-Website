import { prefersReducedMotion } from './mediaQueries'

const REVEAL_DURATION_MS = 900
// Ease-in only: slow start, and no slow-down at the end (the circle leaves the screen at full speed).
const REVEAL_EASING = 'cubic-bezier(0.5, 0, 0.75, 0)'
const CLICK_MAX_AGE_MS = 1000 // an older click is not the reason for this change (e.g. keyboard use)

// Where the visitor last pressed. Remembered for the whole site, because the
// theme controls only receive a value, not the click that triggered it.
let lastPress = { x: 0, y: 0, time: -Infinity }

document.addEventListener(
  'pointerdown',
  (event) => {
    lastPress = { x: event.clientX, y: event.clientY, time: performance.now() }
  },
  { capture: true, passive: true }
)

function getRevealOrigin() {
  const isRecentPress = performance.now() - lastPress.time < CLICK_MAX_AGE_MS
  return isRecentPress ? lastPress : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

let waitTimerId = null

// Runs `applyChange` (which must change the page's look synchronously) and shows
// the new look growing out of the click point as a circle, over the old look.
//
// waitMs: how long to wait before the circle starts, so the control that was
// clicked (for example the light/dark switch) can finish its own animation first.
// A newer call replaces one that is still waiting, so quick clicks end with a
// single circle for the last choice.
// Without View Transitions support, or with reduced motion, the change is instant.
export function runWithCircleReveal(applyChange, waitMs = 0) {
  clearTimeout(waitTimerId)

  if (!document.startViewTransition || prefersReducedMotion()) {
    applyChange()
    return
  }

  // Taken now, not after the wait: the click would be too old by then.
  const { x, y } = getRevealOrigin()
  // Distance to the farthest corner: the circle then always ends up covering the whole screen.
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  waitTimerId = setTimeout(() => {
    const transition = document.startViewTransition(applyChange)
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: REVEAL_DURATION_MS, easing: REVEAL_EASING, pseudoElement: '::view-transition-new(root)' }
        )
      })
      // A transition is skipped when the tab is hidden or a newer one starts; the change itself still happens.
      .catch(() => {})
  }, waitMs)
}
