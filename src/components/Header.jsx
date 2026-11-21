import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SiteLink from './SiteLink'
import { useTheme } from '../hooks/useTheme'
import ThemePicker from './ThemePicker'
import ThemeToggle from './ThemeToggle'
import { assetUrl } from '../utils/assetUrl'

const NAV_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/publications', label: 'Publications' },
  { to: '/about', label: 'About' },
]

// Props that mark the link of the page you are currently on.
function activeLinkProps(linkPath, currentPath) {
  const isActive = linkPath === currentPath
  return {
    className: isActive ? 'is-active' : undefined,
    'aria-current': isActive ? 'page' : undefined,
  }
}

// Desktop menu. A glass pill (.nav-indicator) slides to whichever link is
// hovered and rests on the current page's link otherwise.
function DesktopNav({ currentPath }) {
  const navbarRef = useRef(null)
  const indicatorRef = useRef(null)
  const isFirstPlacementRef = useRef(true)

  useLayoutEffect(() => {
    const navbar = navbarRef.current
    const indicator = indicatorRef.current
    const activeLink = navbar.querySelector('a.is-active')

    function moveIndicatorTo(link) {
      if (!link) {
        indicator.style.opacity = '0'
        return
      }
      // Measure against the navbar itself (each <li> is positioned, so
      // link.offsetLeft alone would always be 0).
      const left = link.getBoundingClientRect().left - navbar.getBoundingClientRect().left
      indicator.style.width = link.offsetWidth + 'px'
      indicator.style.transform = 'translateX(' + left + 'px)'
      indicator.style.opacity = '1'
    }

    function moveToActiveLink() {
      moveIndicatorTo(activeLink)
    }

    // The very first placement happens instantly (no slide-in from the left
    // edge). After that the header stays mounted between pages, so the pill
    // slides to the new page's link.
    if (isFirstPlacementRef.current) {
      isFirstPlacementRef.current = false
      indicator.style.transition = 'none'
      moveToActiveLink()
      void indicator.offsetWidth // apply the position before re-enabling transitions
      indicator.style.transition = ''
    } else {
      moveToActiveLink()
    }

    const links = Array.from(navbar.querySelectorAll('a'))
    const hoverHandlers = links.map((link) => () => moveIndicatorTo(link))
    links.forEach((link, index) => {
      link.addEventListener('mouseenter', hoverHandlers[index])
      link.addEventListener('focus', hoverHandlers[index])
      link.addEventListener('blur', moveToActiveLink)
    })
    navbar.addEventListener('mouseleave', moveToActiveLink)

    // Web fonts change link widths after first paint, so measure again when
    // fonts are ready and whenever the bar is resized.
    document.fonts?.ready.then(moveToActiveLink)
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(moveToActiveLink) : null
    resizeObserver?.observe(navbar)
    window.addEventListener('resize', moveToActiveLink)

    return () => {
      links.forEach((link, index) => {
        link.removeEventListener('mouseenter', hoverHandlers[index])
        link.removeEventListener('focus', hoverHandlers[index])
        link.removeEventListener('blur', moveToActiveLink)
      })
      navbar.removeEventListener('mouseleave', moveToActiveLink)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', moveToActiveLink)
    }
  }, [currentPath])

  return (
    <nav className="nav-desktop">
      <ul className="navbar" ref={navbarRef}>
        {NAV_LINKS.map((link) => (
          <li key={link.to}>
            <SiteLink to={link.to} {...activeLinkProps(link.to, currentPath)}>
              {link.label}
            </SiteLink>
          </li>
        ))}
        <span className="nav-indicator" aria-hidden="true" ref={indicatorRef}></span>
      </ul>
    </nav>
  )
}

// Full-screen menu for small screens.
function MobileNav({ currentPath }) {
  // null until the visitor first opens the menu. The inline display styles
  // below are only added after that, so the stylesheet decides the first look.
  const [isOpen, setIsOpen] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    function closeOnEscape(event) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  const menuButtonStyle = isOpen === null ? undefined : { display: isOpen ? 'none' : 'block' }
  const closeButtonStyle = isOpen === null ? undefined : { display: isOpen ? 'block' : 'none' }

  return (
    <nav className="nav-mobile">
      <button id="menu-btn" className="menu-btn" aria-label="Open menu" style={menuButtonStyle} onClick={() => setIsOpen(true)}>
        ☰
      </button>

      {/* Clicking the dark area around the links also closes the menu. */}
      <div
        id="nav-overlay"
        className={isOpen ? 'nav-overlay visible' : 'nav-overlay'}
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false)
        }}
      >
        <button id="close-btn" className="close-btn" aria-label="Close menu" style={closeButtonStyle} onClick={() => setIsOpen(false)}>
          &times;
        </button>
        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              {/* The header stays mounted between pages, so close the menu on tap. */}
              <SiteLink to={link.to} onClick={() => setIsOpen(false)} {...activeLinkProps(link.to, currentPath)}>
                {link.label}
              </SiteLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

// Site header: logo, navigation (desktop + mobile) and the dark/light switch.
export default function Header() {
  const { pathname } = useLocation()
  const { isDarkMode, changeMode, themes, themeId, changeTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)

  // header.css uses .is-scrolled to strengthen the glass once the page moves.
  useEffect(() => {
    function updateScrolledState() {
      setIsScrolled(window.scrollY > 8)
    }
    updateScrolledState()
    window.addEventListener('scroll', updateScrolledState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrolledState)
  }, [])

  return (
    <header className={isScrolled ? 'is-scrolled' : undefined}>
      <div className="logo">
        <SiteLink to="/">
          {/* Always animated: it is one small image, so no need for the hover-only still. */}
          <img src={assetUrl('home_elements/logo.anim.webp')} alt="Logo" />
        </SiteLink>
      </div>

      <DesktopNav currentPath={pathname} />
      <MobileNav currentPath={pathname} />

      <ThemePicker themes={themes} themeId={themeId} modeLabel={isDarkMode ? 'Dark' : 'Light'} onChange={changeTheme} />

      {/* Light / dark switch. The 6 palettes of the chosen mode are in the picker above. */}
      <ThemeToggle isDarkMode={isDarkMode} onChange={changeMode} />
    </header>
  )
}
