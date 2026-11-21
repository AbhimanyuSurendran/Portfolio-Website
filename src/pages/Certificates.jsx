import { useEffect, useRef, useState } from 'react'
import PageLayout from '../components/PageLayout'
import SplitHeading from '../components/SplitHeading'
import { certificateImages } from '../data/certificates'
import { assetUrl } from '../utils/assetUrl'
import certificatesCss from '../styles/certificates.css?inline'

const FIRST_IMAGE_DELAY_MS = 400 // lets the page fade-in finish before images cascade in
const STAGGERED_IMAGE_COUNT = 12 // the first dozen appear one by one, the rest together
const STAGGER_STEP_MS = 70
const MODAL_FADE_MS = 500 // must match the opacity transition of .modal in certificates.css

// One certificate thumbnail. It fades in (the .show class) shortly after the page opens.
function CertificateImage({ src, index, onOpen }) {
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    const delayMs = FIRST_IMAGE_DELAY_MS + Math.min(index, STAGGERED_IMAGE_COUNT) * STAGGER_STEP_MS
    const timerId = setTimeout(() => setIsShown(true), delayMs)
    return () => clearTimeout(timerId)
  }, [index])

  // Thumbnails are clickable images, so make them work with Enter / Space too.
  function openOnEnterOrSpace(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen(event.currentTarget.src)
  }

  return (
    <img
      className={isShown ? 'show' : undefined}
      loading="lazy"
      decoding="async"
      src={assetUrl(src)}
      alt=""
      tabIndex={0}
      role="button"
      onClick={(event) => onOpen(event.currentTarget.src)}
      onKeyDown={openOnEnterOrSpace}
    />
  )
}

// Full-screen viewer for one certificate. Click anywhere or press Escape to close.
function ImageViewer({ src, isDisplayed, isShown, onClose }) {
  useEffect(() => {
    if (!isShown) return
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isShown, onClose])

  return (
    <div id="myModal" className={isShown ? 'modal show' : 'modal'} style={isDisplayed ? { display: 'block' } : undefined} onClick={onClose}>
      <span className="close">&times;</span>
      <img className="modal-content" id="img01" src={src || undefined} alt="" />
    </div>
  )
}

export default function Certificates() {
  const [scrollPercent, setScrollPercent] = useState(0)

  // The viewer needs two flags: it is first displayed, and then the .show class
  // fades it in. When closing, it fades out first and is hidden afterwards.
  const [viewerSrc, setViewerSrc] = useState('')
  const [isViewerDisplayed, setIsViewerDisplayed] = useState(false)
  const [isViewerShown, setIsViewerShown] = useState(false)
  const hideTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(hideTimerRef.current), [])

  function openViewer(src) {
    clearTimeout(hideTimerRef.current)
    setViewerSrc(src)
    setIsViewerDisplayed(true)
    setIsViewerShown(true)
  }

  function closeViewer() {
    setIsViewerShown(false)
    hideTimerRef.current = setTimeout(() => setIsViewerDisplayed(false), MODAL_FADE_MS)
  }

  // Progress bar at the top of the scrollable gallery.
  function updateScrollProgress(event) {
    const panel = event.currentTarget
    const scrollableHeight = panel.scrollHeight - panel.clientHeight
    setScrollPercent(scrollableHeight > 0 ? (panel.scrollTop / scrollableHeight) * 100 : 0)
  }

  return (
    <PageLayout title="Certificates" pageCss={certificatesCss}>
      <div className="main-content">
        <div className="title glass-panel">
          <h2>Check Out</h2>
          <SplitHeading text="My Certificates" />
          <h4>
            I've completed various courses to sharpen my programming expertise and boost personal growth. Here are some
            of the key certifications I've earned along the way.
          </h4>
        </div>
        <div className="certificates glass-panel" onScroll={updateScrollProgress}>
          <div className="progress-container">
            <div className="progress-bar" id="progress-bar" style={{ width: `${scrollPercent}%` }}></div>
          </div>
          <SplitHeading text="Certificates" />
          <div className="image-grid">
            {certificateImages.map((src, index) => (
              <CertificateImage key={src} src={src} index={index} onOpen={openViewer} />
            ))}
          </div>
        </div>
        <ImageViewer src={viewerSrc} isDisplayed={isViewerDisplayed} isShown={isViewerShown} onClose={closeViewer} />
      </div>
    </PageLayout>
  )
}
