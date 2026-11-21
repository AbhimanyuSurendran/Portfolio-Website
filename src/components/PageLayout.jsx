import { useEffect, useLayoutEffect } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

// How long body.is-entering stays on. Must cover the pageContentIn
// animation in animation.css (0.5s).
const ENTER_ANIMATION_MS = 600

// Frame of one page's own content: its stylesheet, title and
// scroll-reveal animations. The header and decorative layers are NOT here;
// they live in SiteLayout so they stay mounted between pages.
//
// pageCss: this page's own stylesheet (imported with `?inline`). It is only
// added to the document while the page is on screen, because several pages
// reuse the same class names (.main-content, .card-container ...) with
// different styles, so they cannot all be loaded at once.
export default function PageLayout({ title, pageCss, children }) {
  // Layout effect = runs before the browser paints, so the new page is never
  // shown un-animated for a frame.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.body.classList.remove('is-leaving') // set by SiteLink while leaving the previous page
    // animation.css fades the page content in while this class is on.
    document.body.classList.add('is-entering')
    const timerId = setTimeout(() => document.body.classList.remove('is-entering'), ENTER_ANIMATION_MS)
    return () => {
      clearTimeout(timerId)
      document.body.classList.remove('is-entering')
    }
  }, [])

  useEffect(() => {
    document.title = title
  }, [title])

  useScrollReveal()

  return (
    <>
      <style>{pageCss}</style>
      {/* Empty spacer from the old pages; glass.css hides it. */}
      <div className="container"></div>
      {children}
    </>
  )
}
