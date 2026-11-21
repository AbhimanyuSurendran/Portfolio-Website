import { useEffect } from 'react'
import { hasFinePointer, prefersReducedMotion } from '../utils/mediaQueries'

const MAX_TILT_DEG = 6

// Elements that lean slightly toward the pointer.
const TILT_SELECTOR = '[data-tilt], .skill-item, .image-grid img.show, .footer-top-items, .education'

// Two mouse-only effects for the whole site (ignored on touch screens):
//  1. .glass-card gets a light spotlight that follows the pointer
//     (glass.css reads the --mx / --my variables written here).
//  2. Elements matching TILT_SELECTOR tilt toward the pointer.
// Tilt writes element.style.transform directly: it changes on every mouse move,
// so going through React state would re-render constantly for no benefit.
export function usePointerEffects() {
  useEffect(() => {
    if (!hasFinePointer()) return

    const tiltDisabled = prefersReducedMotion()
    let tiltedElement = null
    let latestEvent = null
    let frameId = null

    function resetTilt() {
      if (tiltedElement) {
        // Removing .is-tilting gives back the slow liquid transition, so the
        // element springs back to rest instead of snapping.
        tiltedElement.classList.remove('is-tilting')
        tiltedElement.style.transform = ''
      }
      tiltedElement = null
    }

    // Pointer events can fire several times per frame. The work below reads
    // element sizes (forces layout), so it runs once per animation frame.
    function onPointerMove(event) {
      latestEvent = event
      if (frameId === null) frameId = requestAnimationFrame(applyPointer)
    }

    function applyPointer() {
      frameId = null
      const event = latestEvent
      if (!event) return
      const target = event.target
      if (!target.closest) return

      const card = target.closest('.glass-card')
      if (card) {
        const cardRect = card.getBoundingClientRect()
        card.style.setProperty('--mx', event.clientX - cardRect.left + 'px')
        card.style.setProperty('--my', event.clientY - cardRect.top + 'px')
      }

      const tiltElement = tiltDisabled ? null : target.closest(TILT_SELECTOR)
      if (tiltElement !== tiltedElement) resetTilt()
      if (!tiltElement) return

      const rect = tiltElement.getBoundingClientRect()
      const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 2 * MAX_TILT_DEG
      const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -2 * MAX_TILT_DEG
      tiltElement.style.transform =
        'perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)'
      tiltElement.classList.add('is-tilting') // liquid.css: follow the pointer quickly while tilting
      tiltedElement = tiltElement
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', resetTilt)
    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', resetTilt)
      if (frameId !== null) cancelAnimationFrame(frameId)
      resetTilt()
    }
  }, [])
}
