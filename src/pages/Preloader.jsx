import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prefersReducedMotion } from '../utils/mediaQueries'
import { assetUrl } from '../utils/assetUrl'
import preloaderCss from '../styles/preloader.css?inline'

const MIN_SHOW_MS = 1300 // the animation always gets to play a little
const WAITING_PERCENT = 88 // the bar stops here until everything is really ready
const EXIT_MS = 750 // must match the clip-path transition in preloader.css
const LOGO_URL = assetUrl('title_logo.png')

function loadImage(url) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = resolve
    image.onerror = resolve // a missing logo must never keep the loader on screen
    image.src = url
  })
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Loading screen shown at "/". Opening the site and clicking the logo in the
// navbar (which links to "/") both pass through it before Home.
// It shows the main logo inside a glowing ring, with a progress bar. The bar is
// tied to real work: it waits for the fonts, the logo and the Home page's code
// to finish loading (and for at least MIN_SHOW_MS), then fills up, and the
// screen closes like an iris to reveal the Home page.
export default function Preloader() {
  const navigate = useNavigate()
  const [isLeaving, setIsLeaving] = useState(false)
  const barRef = useRef(null)
  const percentRef = useRef(null)

  useEffect(() => {
    document.title = 'Loading...'
    document.body.style.overflow = 'hidden' // no scrolling behind the loader
    // Clicking the logo in the navbar fades the old page out with this class
    // (see SiteLink.jsx); pages normally remove it themselves, but the loader
    // is not a page, so it would stay invisible without this.
    document.body.classList.remove('is-leaving')
    window.scrollTo(0, 0)

    let isReady = false
    let shownPercent = 0
    let frameId = null
    let exitTimer = null

    Promise.all([
      wait(prefersReducedMotion() ? 0 : MIN_SHOW_MS),
      document.fonts?.ready,
      import('./Home'), // starts downloading the Home page now, so it opens instantly
      loadImage(LOGO_URL),
    ]).then(() => {
      isReady = true
    })

    function showPercent(value) {
      barRef.current.style.transform = `scaleX(${value / 100})`
      percentRef.current.textContent = Math.round(value) + '%'
    }

    // Moves the shown number a fraction of the way to its target on every frame:
    // fast at first, then slower (like a real download), and it only passes
    // WAITING_PERCENT once everything is ready.
    function tick() {
      const target = isReady ? 100 : WAITING_PERCENT
      shownPercent += (target - shownPercent) * 0.06
      showPercent(shownPercent)

      if (isReady && shownPercent > 99.3) {
        showPercent(100)
        setIsLeaving(true)
        // `replace` keeps this screen out of the browser history, so Back does not return to it.
        exitTimer = setTimeout(() => navigate('/home', { replace: true }), prefersReducedMotion() ? 0 : EXIT_MS)
        return
      }
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
      clearTimeout(exitTimer)
      document.body.style.overflow = ''
    }
  }, [navigate])

  return (
    <>
      <style>{preloaderCss}</style>
      <div className={isLeaving ? 'preloader is-leaving' : 'preloader'} role="status" aria-label="Loading">
        <div className="loader-stage">
          <div className="loader-mark">
            <span className="loader-pulse"></span>
            <span className="loader-pulse loader-pulse-late"></span>
            <span className="loader-ring"></span>
            <span className="loader-orbit">
              <i></i>
            </span>
            <img className="loader-logo" src={LOGO_URL} alt="" />
          </div>

          <p className="loader-name">Abhimanyu Surendran</p>

          <div className="loader-progress">
            <span className="loader-bar" ref={barRef}></span>
          </div>
          <span className="loader-percent" ref={percentRef}>
            0%
          </span>
        </div>
      </div>
    </>
  )
}
