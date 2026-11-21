import { useEffect } from 'react'

// Soft glass-gradient tile shown instead of the browser's broken-image icon.
const PLACEHOLDER_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<defs><radialGradient id="a" cx="30%" cy="30%" r="70%"><stop offset="0" stop-color="#5b7cff" stop-opacity=".55"/><stop offset="1" stop-color="#5b7cff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="b" cx="75%" cy="75%" r="70%"><stop offset="0" stop-color="#9b6bff" stop-opacity=".5"/><stop offset="1" stop-color="#9b6bff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="400" height="300" fill="#141a33"/><rect width="400" height="300" fill="url(#a)"/><rect width="400" height="300" fill="url(#b)"/></svg>'
  )

function showPlaceholder(image) {
  // Guard against an endless loop if the placeholder itself fails.
  if (image.src === PLACEHOLDER_SRC) return
  image.src = PLACEHOLDER_SRC
}

// Image "error" events do not bubble, but they can be caught on the capture
// phase. One listener on the document therefore covers every <img> on every
// page, including images whose src changes later (the project detail panel).
export function useImageFallbacks() {
  useEffect(() => {
    function onImageError(event) {
      const image = event.target
      if (image.tagName !== 'IMG' || !image.getAttribute('src')) return
      showPlaceholder(image)
    }

    // Images that already failed before this listener was attached.
    document.querySelectorAll('img').forEach((image) => {
      const failedAlready =
        image.loading !== 'lazy' && image.complete && image.naturalWidth === 0 && image.getAttribute('src')
      if (failedAlready) showPlaceholder(image)
    })

    document.addEventListener('error', onImageError, true)
    return () => document.removeEventListener('error', onImageError, true)
  }, [])
}
