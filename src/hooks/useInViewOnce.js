import { useEffect, useState } from 'react'

// true once the element has scrolled into view (and stays true afterwards).
// Used to start an animation only when the visitor can actually see it.
// Without IntersectionObserver support it starts as true, so the finished
// state is shown instead of an element stuck at its start.
export function useInViewOnce(elementRef, threshold = 0.35) {
  const [isInView, setIsInView] = useState(() => !('IntersectionObserver' in window))

  useEffect(() => {
    const element = elementRef.current
    if (!element || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsInView(true)
        observer.disconnect()
      },
      { threshold }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, threshold])

  return isInView
}
