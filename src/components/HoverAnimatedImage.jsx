import { useEffect, useRef, useState } from 'react'

// Shows a still picture and plays its animation only while the pointer or
// keyboard focus is on the parent element (e.g. the project card).
//
// Why: a page with ~20 animated images keeps the browser decoding and
// repainting all of them every frame, which made scrolling lag.
//
// Convention: for "photo.webp" (the still frame) the animated version is
// "photo.anim.webp" in the same folder. Other file types (e.g. a .gif that
// has no still) are shown as they are.
export default function HoverAnimatedImage({ src, ...imgProps }) {
  const imageRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const hasStill = src.endsWith('.webp')

  useEffect(() => {
    const parent = imageRef.current?.parentElement
    if (!parent || !hasStill) return

    const play = () => setIsPlaying(true)
    const stop = () => setIsPlaying(false)
    parent.addEventListener('mouseenter', play)
    parent.addEventListener('mouseleave', stop)
    parent.addEventListener('focusin', play)
    parent.addEventListener('focusout', stop)
    return () => {
      parent.removeEventListener('mouseenter', play)
      parent.removeEventListener('mouseleave', stop)
      parent.removeEventListener('focusin', play)
      parent.removeEventListener('focusout', stop)
    }
  }, [hasStill])

  const shownSrc = hasStill && isPlaying ? src.replace(/\.webp$/, '.anim.webp') : src
  return <img ref={imageRef} src={shownSrc} {...imgProps} />
}
