import { useEffect, useRef, useState } from 'react'
import PageLayout from '../components/PageLayout'
import SplitHeading from '../components/SplitHeading'
import CertificateViewer from '../components/CertificateViewer'
import { certificateImages } from '../data/certificates'
import { assetUrl } from '../utils/assetUrl'
import certificatesCss from '../styles/certificates.css?inline'

const FIRST_IMAGE_DELAY_MS = 400 // lets the page fade-in finish before images cascade in
const STAGGERED_IMAGE_COUNT = 12 // the first dozen appear one by one, the rest together
const STAGGER_STEP_MS = 70

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
    onOpen(index, event.currentTarget)
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
      onClick={(event) => onOpen(index, event.currentTarget)}
      onKeyDown={openOnEnterOrSpace}
    />
  )
}

export default function Certificates() {
  const [scrollPercent, setScrollPercent] = useState(0)

  // null while closed; otherwise which certificate is open and where its thumbnail is.
  const [viewer, setViewer] = useState(null)
  const gridRef = useRef(null)

  function openViewer(index, thumbnail) {
    setViewer({ index, originRect: thumbnail.getBoundingClientRect() })
  }

  // Rectangle of a thumbnail, but only if it is actually visible on screen
  // (the viewer shrinks back into it when closing).
  function getThumbRect(index) {
    const thumbnail = gridRef.current?.children[index]
    if (!thumbnail) return null
    const rect = thumbnail.getBoundingClientRect()
    const isVisible = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
    return isVisible ? rect : null
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
          <div className="image-grid" ref={gridRef}>
            {certificateImages.map((src, index) => (
              <CertificateImage key={src} src={src} index={index} onOpen={openViewer} />
            ))}
          </div>
        </div>
        {viewer && (
          <CertificateViewer
            images={certificateImages}
            startIndex={viewer.index}
            originRect={viewer.originRect}
            getThumbRect={getThumbRect}
            onClosed={() => setViewer(null)}
          />
        )}
      </div>
    </PageLayout>
  )
}
