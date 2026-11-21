import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import preloaderCss from '../styles/preloader.css?inline'

const SHOW_LOADER_MS = 500
const FADE_OUT_MS = 500

// Loading screen shown at "/" for one second, then fades out and opens the Home page.
export default function Preloader() {
  const navigate = useNavigate()
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    document.title = 'Loading...'
    document.body.style.overflow = 'hidden' // no scrolling behind the loader

    let redirectTimer
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
      // Wait for the fade-out before leaving. `replace` keeps this screen out
      // of the browser history, so the Back button does not bounce off it.
      redirectTimer = setTimeout(() => navigate('/home', { replace: true }), FADE_OUT_MS)
    }, SHOW_LOADER_MS)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(redirectTimer)
      document.body.style.overflow = ''
    }
  }, [navigate])

  return (
    <>
      <style>{preloaderCss}</style>
      <div className={isFadingOut ? 'preloader fade-out' : 'preloader'} id="preloader">
        <main>
          <svg className="ip" viewBox="0 0 256 128" width="256px" height="128px" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="33%" stopColor="#7aa7ff" />
                <stop offset="67%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#c4b5fd" />
              </linearGradient>
              <linearGradient id="grad2" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="33%" stopColor="#8b5cf6" />
                <stop offset="67%" stopColor="#4f7cff" />
                <stop offset="100%" stopColor="#5eead4" />
              </linearGradient>
            </defs>
            <g fill="none" strokeLinecap="round" strokeWidth="16">
              <g className="ip__track" stroke="rgba(255,255,255,0.08)">
                <path d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56" />
                <path d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64" />
              </g>
              <g strokeDasharray="180 656">
                <path className="ip__worm1" stroke="url(#grad1)" strokeDashoffset="0" d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56" />
                <path className="ip__worm2" stroke="url(#grad2)" strokeDashoffset="358" d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64" />
              </g>
            </g>
          </svg>
        </main>
      </div>
    </>
  )
}
