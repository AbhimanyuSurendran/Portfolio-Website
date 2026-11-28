import { useEffect, useRef } from 'react'
import { assetUrl } from '../utils/assetUrl'
import { hasFinePointer, prefersReducedMotion } from '../utils/mediaQueries'

const MAX_SCALE = 1.55 // size of the icon right under the cursor
const REACH_PX = 70 // how far from the cursor the neighbours still grow (smaller = tighter)
const LIFT_PX = 40 // how far an icon rises for every 1.0 of extra size
const EASE = 0.22 // share of the remaining distance covered per frame: higher = snappier
const REST_SCALE = 1.002 // below this an icon counts as "not enlarged"

// A row of round social icons that behaves like a dock: the icon under the
// cursor grows and rises, its neighbours grow a little less, and the row opens
// up to make room. A name floats above the icon and a faded reflection sits
// under it (social-dock.css).
//
// Built to stay smooth: while the cursor moves, only `transform` and `scale`
// are written (the browser's compositor handles those without redoing layout),
// and nothing is measured. Sizes and positions are measured once, when the
// cursor enters the row. Touch screens and "reduce motion" skip the growing;
// the icons still work as links.
//
// Props:
//   links  [{ name, url, logo }]  logo is a path relative to public/
export default function SocialDock({ links }) {
  const dockRef = useRef(null)
  const barRef = useRef(null)
  const itemRefs = useRef([])
  const labelRefs = useRef([])

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return

    const dock = dockRef.current
    const bar = barRef.current
    const items = itemRefs.current
    const labels = labelRefs.current

    // Measured by measure(); see there.
    let restCenters = []
    let baseWidth = 0
    let gap = 0
    let firstLeft = 0
    let dockWidth = 1
    let dockLeft = 0
    let isMeasured = false

    // What is shown right now. The targets are worked out from pointerX every frame.
    const shown = items.map(() => ({ scale: 1, x: 0 }))
    const labelNeedsReset = items.map(() => false)
    let pointerX = null // cursor position inside the row, or null when it is outside
    let frameId = null

    // Reading sizes forces the browser to lay the page out, so this is done once
    // per visit (cursor enters the row), never while the icons are moving.
    function measure() {
      baseWidth = items[0].offsetWidth
      restCenters = items.map((item) => item.offsetLeft + item.offsetWidth / 2)
      gap = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft - baseWidth : 0
      firstLeft = items[0].offsetLeft
      dockWidth = dock.offsetWidth
      dockLeft = dock.getBoundingClientRect().left + dock.clientLeft
      isMeasured = true
    }

    function computeTargets() {
      const scales = restCenters.map((center) =>
        pointerX === null ? 1 : 1 + (MAX_SCALE - 1) * Math.exp(-(((center - pointerX) / REACH_PX) ** 2))
      )
      // Icons really get wider, so they are pushed apart instead of overlapping,
      // and the whole row stays centred while it opens up.
      const extraWidth = scales.reduce((sum, scale) => sum + baseWidth * (scale - 1), 0)
      let cursor = firstLeft - extraWidth / 2
      return scales.map((scale, index) => {
        const width = baseWidth * scale
        const center = cursor + width / 2
        cursor += width + gap
        return { scale, x: center - restCenters[index] }
      })
    }

    function step() {
      const targets = computeTargets()
      let isSettled = true
      let grow = 0
      items.forEach((item, index) => {
        const current = shown[index]
        const target = targets[index]
        current.scale += (target.scale - current.scale) * EASE
        current.x += (target.x - current.x) * EASE
        if (Math.abs(target.scale - current.scale) > 0.002 || Math.abs(target.x - current.x) > 0.05) isSettled = false
        grow += baseWidth * (current.scale - 1)

        const lift = (current.scale - 1) * LIFT_PX
        item.style.transform = `translate3d(${current.x.toFixed(2)}px, ${-lift.toFixed(2)}px, 0) scale(${current.scale.toFixed(3)})`
        // The name keeps its own size while the icon grows around it. Icons at rest
        // are skipped, but their name is set back to normal once, so a name that
        // is shown later (keyboard focus) is never left shrunk.
        if (current.scale > REST_SCALE) {
          labels[index].style.scale = (1 / current.scale).toFixed(3)
          labelNeedsReset[index] = true
        } else if (labelNeedsReset[index]) {
          labels[index].style.scale = ''
          labelNeedsReset[index] = false
        }
      })
      // The glass bar widens with the icons. A stretched copy is used (instead of
      // changing its width) because a transform needs no layout.
      bar.style.transform = `scaleX(${(1 + grow / dockWidth).toFixed(4)})`

      // Stops once everything has arrived, even with the cursor still on the row;
      // the next pointer move starts it again.
      frameId = isSettled ? null : requestAnimationFrame(step)
    }

    function startAnimating() {
      if (frameId === null) frameId = requestAnimationFrame(step)
    }

    function handlePointerEnter() {
      measure()
    }
    function handlePointerMove(event) {
      if (event.pointerType === 'touch') return
      if (!isMeasured) measure() // the page was loaded with the cursor already on the row
      pointerX = event.clientX - dockLeft
      startAnimating()
    }
    function handlePointerLeave() {
      pointerX = null
      isMeasured = false // the page may have moved before the next visit
      startAnimating()
    }

    dock.addEventListener('pointerenter', handlePointerEnter)
    dock.addEventListener('pointermove', handlePointerMove, { passive: true })
    dock.addEventListener('pointerleave', handlePointerLeave)
    return () => {
      dock.removeEventListener('pointerenter', handlePointerEnter)
      dock.removeEventListener('pointermove', handlePointerMove)
      dock.removeEventListener('pointerleave', handlePointerLeave)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div className="social-dock" ref={dockRef}>
      <span className="dock-bar" ref={barRef} aria-hidden="true"></span>
      {links.map((link, index) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="dock-item"
          aria-label={link.name}
          ref={(element) => {
            itemRefs.current[index] = element
          }}
        >
          <span
            className="dock-label"
            ref={(element) => {
              labelRefs.current[index] = element
            }}
          >
            {link.name}
          </span>
          <img src={assetUrl(link.logo)} alt="" className="dock-logo" />
          <span className="dock-reflection" aria-hidden="true">
            <img src={assetUrl(link.logo)} alt="" />
          </span>
        </a>
      ))}
    </div>
  )
}
