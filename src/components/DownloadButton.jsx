import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../utils/mediaQueries'
import { playSparks } from '../utils/sparks'

const FILL_DURATION_MS = 2000 // how long the progress fill takes
const RESET_AFTER_MS = 3000 // how long "Downloaded" stays before the button resets
const ERROR_RESET_AFTER_MS = 6000

// Saves a blob to the visitor's computer under the given name.
// The file is saved from the browser's own memory, not from a URL, so no
// request for a ".pdf" address is involved.
function saveBlob(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10000)
}

// Download button with a short animation:
//   idle        arrow icon + label
//   downloading the arrow drops into the tray while the button fills with
//               colour from left to right and counts 0% -> 100%
//   done        the tray turns into a check mark, sparks fly, and THEN the
//               file is saved; after a few seconds the button resets
//   error       the file could not be loaded: the button says so, and the
//               next click simply opens the link in a new tab
// loadFile() is called when the button is clicked and runs while the animation
// plays, so the download starts the moment the animation ends. Without
// JavaScript (or with ctrl/shift/middle click) it is still a normal link to
// `href`.
//
// Props:
//   loadFile   async function that returns the file as a Blob
//   href       plain link to the same file (used when the button is not intercepted)
//   fileName   name the file is saved under
export default function DownloadButton({ loadFile, href, fileName, label = 'Download Resume', className = '' }) {
  const [status, setStatus] = useState('idle') // 'idle' | 'downloading' | 'done' | 'error'
  const buttonRef = useRef(null)
  const fillRef = useRef(null)
  const percentRef = useRef(null)
  const frameRef = useRef(null)
  const resetTimerRef = useRef(null)
  const fileRequestRef = useRef(null) // the pending loadFile() call while the animation plays

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current)
      clearTimeout(resetTimerRef.current)
    },
    []
  )

  async function finish() {
    let blob
    try {
      blob = await fileRequestRef.current
    } catch {
      setStatus('error')
      resetTimerRef.current = setTimeout(() => setStatus('idle'), ERROR_RESET_AFTER_MS)
      return
    }
    setStatus('done')
    playSparks(buttonRef.current, null)
    saveBlob(blob, fileName)
    resetTimerRef.current = setTimeout(() => setStatus('idle'), RESET_AFTER_MS)
  }

  // The fill and the percentage are written straight to the DOM on every frame:
  // going through React state would re-render about 120 times for no benefit.
  function runFillAnimation() {
    fillRef.current.style.transform = 'scaleX(0)'
    const startTime = performance.now()

    function step(now) {
      const progress = Math.min((now - startTime) / FILL_DURATION_MS, 1)
      // Eases in and out, like a real download that speeds up and slows down.
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
      fillRef.current.style.transform = `scaleX(${eased})`
      if (percentRef.current) percentRef.current.textContent = Math.round(eased * 100) + '%'
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      } else {
        finish()
      }
    }
    frameRef.current = requestAnimationFrame(step)
  }

  function handleClick(event) {
    const isPlainLeftClick = event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    if (!isPlainLeftClick) return // let the browser handle it as a normal link

    // After a failure the next click is NOT intercepted: the link opens in a new tab.
    if (status === 'error') return

    event.preventDefault()
    if (status !== 'idle') return // already running

    fileRequestRef.current = loadFile()
    fileRequestRef.current.catch(() => {}) // handled in finish(); avoids an "unhandled rejection" log

    if (prefersReducedMotion()) {
      finish()
      return
    }
    setStatus('downloading')
    runFillAnimation()
  }

  return (
    <a
      ref={buttonRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download={status === 'error' ? undefined : fileName}
      className={`glass-btn download-btn ${className}`}
      data-status={status}
      onClick={handleClick}
      aria-live="polite"
    >
      <span className="download-fill" ref={fillRef} aria-hidden="true"></span>
      <span className="download-content">
        <svg className="download-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path className="download-tray" d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          <g className="download-arrow">
            <path d="M12 4v10" />
            <path d="m8 10.5 4 4 4-4" />
          </g>
          <path className="download-check" d="m6.5 12.5 3.8 3.8 7.2-8" />
        </svg>
        <span className="download-label">
          {status === 'idle' && label}
          {status === 'downloading' && (
            <>
              Downloading <span ref={percentRef}>0%</span>
            </>
          )}
          {status === 'done' && 'Downloaded'}
          {status === 'error' && "Couldn't download. Tap to open"}
        </span>
      </span>
    </a>
  )
}
