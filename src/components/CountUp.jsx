import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../utils/mediaQueries'

const COUNT_DURATION_MS = 1300 // roughly the length of the skill-bar fill in skills.css

// Number that counts up from 0 when it scrolls into view, e.g. "85%".
// The text is written straight into the element on each frame: going through
// React state would re-render dozens of times a second for no benefit.
export default function CountUp({ to, suffix = '' }) {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return

    let frameId = null
    element.textContent = '0' + suffix

    function animate(startTime) {
      function step(now) {
        const progress = Math.min((now - startTime) / COUNT_DURATION_MS, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // fast start, gentle landing
        element.textContent = Math.round(to * eased) + suffix
        if (progress < 1) frameId = requestAnimationFrame(step)
      }
      frameId = requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        animate(performance.now())
      },
      { threshold: 0.4 }
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      if (frameId !== null) cancelAnimationFrame(frameId)
    }
  }, [to, suffix])

  // The final value is the starting text, so it is correct if the animation never runs.
  return <span ref={elementRef}>{to + suffix}</span>
}
