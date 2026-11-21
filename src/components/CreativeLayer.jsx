import { useEffect, useRef, useState } from 'react'
import { hasFinePointer, prefersReducedMotion } from '../utils/mediaQueries'

// Purely decorative layers (styled in creative.css):
//  - liquid blobs, glass orbs and a grid floor that drift with the pointer
//  - a soft light that follows the cursor behind the frosted panels
//  - a thin line at the top showing how far the page is scrolled
// They are aria-hidden and contain no content.
export default function CreativeLayer() {
  const decorRef = useRef(null)
  const lightRef = useRef(null)
  const progressRef = useRef(null)
  const [isLightOn, setIsLightOn] = useState(false)

  // Touch screens and "reduce motion" users get no cursor light / parallax.
  const [showCursorEffects] = useState(() => !prefersReducedMotion() && hasFinePointer())

  useEffect(() => {
    if (!showCursorEffects) return

    let pointerX = 0
    let pointerY = 0
    let frameId = null

    // Positions are written straight to the DOM once per animation frame.
    // Going through React state would re-render on every mouse move.
    function applyPointer() {
      frameId = null
      lightRef.current.style.transform = `translate3d(${pointerX}px,${pointerY}px,0)`
      // --px / --py are -1..1 values that creative.css uses for the parallax drift.
      decorRef.current.style.setProperty('--px', ((pointerX / window.innerWidth) * 2 - 1).toFixed(3))
      decorRef.current.style.setProperty('--py', ((pointerY / window.innerHeight) * 2 - 1).toFixed(3))
    }

    function onPointerMove(event) {
      pointerX = event.clientX
      pointerY = event.clientY
      setIsLightOn(true)
      if (frameId === null) frameId = requestAnimationFrame(applyPointer)
    }

    function onPointerLeave() {
      setIsLightOn(false)
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      if (frameId !== null) cancelAnimationFrame(frameId)
    }
  }, [showCursorEffects])

  useEffect(() => {
    function updateProgress() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
      progressRef.current.style.transform = `scaleX(${progress.toFixed(4)})`
    }

    // At most one update per frame, however many scroll events fire.
    let progressFrameId = null
    function scheduleProgressUpdate() {
      if (progressFrameId !== null) return
      progressFrameId = requestAnimationFrame(() => {
        progressFrameId = null
        updateProgress()
      })
    }

    updateProgress()
    window.addEventListener('scroll', scheduleProgressUpdate, { passive: true })
    window.addEventListener('resize', scheduleProgressUpdate)
    return () => {
      window.removeEventListener('scroll', scheduleProgressUpdate)
      window.removeEventListener('resize', scheduleProgressUpdate)
      if (progressFrameId !== null) cancelAnimationFrame(progressFrameId)
    }
  }, [])

  return (
    <>
      <div className="glass-decor" aria-hidden="true" ref={decorRef}>
        <span className="decor-grid"></span>
        <span className="decor-blob b1"></span>
        <span className="decor-blob b2"></span>
        <span className="decor-blob b3"></span>
        <span className="decor-orb o1"></span>
        <span className="decor-orb o2"></span>
        <span className="decor-orb o3"></span>
      </div>
      {showCursorEffects && (
        <div className={isLightOn ? 'cursor-light is-on' : 'cursor-light'} aria-hidden="true" ref={lightRef}></div>
      )}
      <div className="page-progress" aria-hidden="true" ref={progressRef}></div>
    </>
  )
}
