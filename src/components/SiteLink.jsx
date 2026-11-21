import { Link, useLocation, useNavigate } from 'react-router-dom'
import { prefersReducedMotion } from '../utils/mediaQueries'

const FADE_OUT_MS = 200 // matches the content fade-out in animation.css

// A router <Link> for moving between pages of this site.
// It fades the current page's content out briefly (the .is-leaving class,
// see animation.css) before opening the next page. The header stays put.
// New tabs, modifier-clicks and links to the page you are already on are left alone.
export default function SiteLink({ to, onClick, ...linkProps }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleClick(event) {
    onClick?.(event)

    const isPlainLeftClick = event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    const isSamePage = pathname === to
    if (event.defaultPrevented || !isPlainLeftClick || isSamePage || prefersReducedMotion()) return

    event.preventDefault()
    document.body.classList.add('is-leaving')
    setTimeout(() => navigate(to), FADE_OUT_MS)
  }

  return <Link to={to} onClick={handleClick} {...linkProps} />
}
