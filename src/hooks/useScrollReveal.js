import { useLayoutEffect } from 'react'
import { prefersReducedMotion } from '../utils/mediaQueries'

// Elements that fade/slide in when scrolled into view, across all pages.
// Selectors that do not exist on a page are simply ignored.
const REVEAL_SELECTORS = [
  '.top-projects-container',
  '.card-container > .card',
  '.description',
  '.top-skill-sets',
  '.skill-item',
  '.frontend',
  '.backend',
  '#techStackGame',
  '.research-paper',
  '.resume-profile',
  '.main-profile > div:not(.progress-container)',
  '.main-profile > h1.title',
  '.education',
  '.footer-top-items',
  '.footer-bottom > div',
]

const REVEAL_DURATION_MS = 1200 // a little longer than the 1.1s transform transition in liquid.css
const MAX_STAGGER_STEPS = 6

// Adds the .reveal class (see animation.css) to the elements above and
// switches on .is-visible when they enter the screen.
// Call once per page, after the page content has been rendered.
export function useScrollReveal() {
  // Layout effect: the elements are hidden before the first paint. With a
  // normal effect they were visible for one frame and then vanished (a flash).
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return

    const elements = document.querySelectorAll(REVEAL_SELECTORS.join(','))
    if (!elements.length) return

    const pending = new Set()
    const cleanupTimers = new Set()

    function reveal(element) {
      if (!pending.has(element)) return
      pending.delete(element)
      observer.unobserve(element)
      element.classList.add('is-visible')

      // Remove the helper classes once the animation is done so they
      // cannot fight with hover transforms afterwards.
      const delayMs = parseFloat(element.style.getPropertyValue('--reveal-delay')) * 1000 || 0
      const timerId = setTimeout(() => {
        element.classList.remove('reveal', 'is-visible')
        element.style.removeProperty('--reveal-delay')
        cleanupTimers.delete(timerId)
      }, delayMs + REVEAL_DURATION_MS)
      cleanupTimers.add(timerId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    // Catch-up pass: a fast scroll (scrollbar drag, End key, quick flick inside
    // a scroll panel) can jump past an element in one frame, so the observer
    // never sees it intersect. When scrolling settles, reveal everything that
    // is already above the bottom of the screen.
    let catchUpTimer = null
    function revealPassedElements() {
      pending.forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight) reveal(element)
      })
      if (pending.size === 0) {
        document.removeEventListener('scroll', scheduleCatchUp, true)
      }
    }
    function scheduleCatchUp() {
      clearTimeout(catchUpTimer)
      catchUpTimer = setTimeout(revealPassedElements, 120)
    }
    // capture:true also catches scrolling inside panels (about, certificates).
    document.addEventListener('scroll', scheduleCatchUp, { capture: true, passive: true })

    elements.forEach((element) => {
      // Stagger siblings of the same kind (e.g. cards in a grid).
      // Compared by tag + first class, which .reveal never changes.
      const siblings = Array.from(element.parentElement.children).filter(
        (child) => child.tagName === element.tagName && child.classList[0] === element.classList[0]
      )
      const index = siblings.indexOf(element) % MAX_STAGGER_STEPS
      element.style.setProperty('--reveal-delay', index * 0.07 + 's')

      element.classList.add('reveal')
      pending.add(element)
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
      clearTimeout(catchUpTimer)
      cleanupTimers.forEach(clearTimeout)
      document.removeEventListener('scroll', scheduleCatchUp, true)
      elements.forEach((element) => {
        element.classList.remove('reveal', 'is-visible')
        element.style.removeProperty('--reveal-delay')
      })
    }
  }, [])
}
