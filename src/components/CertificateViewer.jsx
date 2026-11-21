import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../utils/mediaQueries'
import { assetUrl } from '../utils/assetUrl'

const OPEN_MS = 600
const CLOSE_MS = 460
const OPEN_EASING = 'cubic-bezier(0.2, 0.85, 0.25, 1)'
const CLOSE_EASING = 'cubic-bezier(0.5, 0, 0.2, 1)'
const MAX_WIDTH_PX = 1100
const MAX_WIDTH_RATIO = 0.92
const MAX_HEIGHT_RATIO = 0.84

// Where the full-size certificate sits: as big as it can be inside the
// allowed area, never larger than its real size, centred on the screen.
function fittedRect(image) {
  const maxWidth = Math.min(MAX_WIDTH_PX, window.innerWidth * MAX_WIDTH_RATIO)
  const maxHeight = window.innerHeight * MAX_HEIGHT_RATIO
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  return { left: (window.innerWidth - width) / 2, top: (window.innerHeight - height) / 2, width, height }
}

function toPx(rect) {
  return { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' }
}

// Full-screen viewer for one certificate.
//
// Opening: the picture grows out of the thumbnail you clicked (its position
// and size animate to the centre) while the background blurs in. Closing runs
// the same movement backwards, back into the thumbnail.
// Left / Right arrows (or the side buttons) show the previous / next certificate.
// Escape, the close button or a click outside the picture closes it.
//
// Props:
//   images        list of image paths (relative to public/)
//   startIndex    which certificate to open
//   originRect    the clicked thumbnail's rectangle on screen (for the grow animation)
//   getThumbRect  (index) => rectangle of that thumbnail if it is on screen, else null
//   onClosed      called after the closing animation, so the page can remove the viewer
export default function CertificateViewer({ images, startIndex, originRect, getThumbRect, onClosed }) {
  const [index, setIndex] = useState(startIndex)
  const [isOpen, setIsOpen] = useState(false) // drives the CSS fades (backdrop, buttons)
  const [swapDirection, setSwapDirection] = useState(0) // -1 / 1 after next / previous, 0 for the first picture
  const imageRef = useRef(null)
  const isEnteringRef = useRef(true)
  const isClosingRef = useRef(false)

  // Fits the picture once its size is known. The first time, it also plays the
  // grow-from-thumbnail animation.
  function placePicture() {
    const image = imageRef.current
    if (!image || !image.naturalWidth) return
    const finalRect = fittedRect(image)
    Object.assign(image.style, toPx(finalRect))
    image.style.visibility = 'visible' // it starts hidden, so it never flashes at the wrong spot
    image.classList.add('is-placed')

    if (!isEnteringRef.current) return
    isEnteringRef.current = false
    setIsOpen(true)
    if (prefersReducedMotion()) return

    // Without a thumbnail to grow from, start from a smaller copy of the final spot.
    const startRect = originRect || {
      left: finalRect.left + finalRect.width * 0.1,
      top: finalRect.top + finalRect.height * 0.1,
      width: finalRect.width * 0.8,
      height: finalRect.height * 0.8,
    }
    // object-fit: cover crops the picture to the thumbnail's shape at the start;
    // it ends at the picture's own shape, so the crop opens up smoothly.
    image.animate(
      [
        { ...toPx(startRect), borderRadius: '12px' },
        { ...toPx(finalRect), borderRadius: '20px' },
      ],
      { duration: OPEN_MS, easing: OPEN_EASING }
    )
  }

  // A cached picture can finish loading before React attaches onLoad, so check once.
  useLayoutEffect(() => {
    if (imageRef.current?.complete) placePicture()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function close() {
    if (isClosingRef.current) return
    isClosingRef.current = true
    setIsOpen(false) // fades the backdrop and buttons out

    const image = imageRef.current
    const thumbRect = getThumbRect(index)
    if (!image || !thumbRect || prefersReducedMotion()) {
      // No thumbnail on screen to shrink into: fade away instead.
      const fade = image?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS * 0.7, fill: 'forwards' })
      setTimeout(onClosed, fade ? CLOSE_MS * 0.7 : 0)
      return
    }

    const current = image.getBoundingClientRect()
    const animation = image.animate(
      [
        { ...toPx(current), borderRadius: '20px' },
        { ...toPx(thumbRect), borderRadius: '12px' },
      ],
      { duration: CLOSE_MS, easing: CLOSE_EASING, fill: 'forwards' }
    )
    animation.onfinish = onClosed
  }

  function showAnother(step) {
    const nextIndex = index + step
    if (nextIndex < 0 || nextIndex >= images.length) return
    setSwapDirection(step)
    setIndex(nextIndex)
  }

  // Keyboard: Escape closes, arrows move between certificates.
  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') showAnother(1)
      if (event.key === 'ArrowLeft') showAnother(-1)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  })

  // Stops a click on a button from also counting as "click outside".
  function stopClick(event) {
    event.stopPropagation()
  }

  return (
    <div className={isOpen ? 'viewer is-open' : 'viewer'} onClick={close} role="dialog" aria-modal="true" aria-label="Certificate">
      <div className="viewer-backdrop"></div>

      <img
        // key: a new picture element per certificate, so the swap animation replays.
        key={index}
        ref={imageRef}
        className={swapDirection === 0 ? 'viewer-image' : 'viewer-image is-swapped'}
        style={{ '--swap-direction': swapDirection, visibility: 'hidden' }}
        src={assetUrl(images[index])}
        alt=""
        onLoad={placePicture}
      />

      <button type="button" className="viewer-close" aria-label="Close" onClick={(event) => { stopClick(event); close() }}>
        &times;
      </button>
      <button
        type="button"
        className="viewer-nav viewer-prev"
        aria-label="Previous certificate"
        disabled={index === 0}
        onClick={(event) => { stopClick(event); showAnother(-1) }}
      >
        &#8249;
      </button>
      <button
        type="button"
        className="viewer-nav viewer-next"
        aria-label="Next certificate"
        disabled={index === images.length - 1}
        onClick={(event) => { stopClick(event); showAnother(1) }}
      >
        &#8250;
      </button>
      <div className="viewer-counter" aria-live="polite">
        {index + 1} / {images.length}
      </div>
    </div>
  )
}
