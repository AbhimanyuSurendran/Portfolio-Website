import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../utils/mediaQueries'

const CONNECT_MS = 1600 // shrink to a circle (0.5s) + "typing" (1.1s). Matches contact-button.css
const REDIRECT_DELAY_MS = 1300 // the pop-open animation (1s) plays first, then the chat opens
const RESET_AFTER_MS = 3800 // how long "Message sent" stays before the button resets

// Contact button with its own short animation:
//   idle        chat-bubble icon + label (the bubble bobs on hover)
//   connecting  the button shrinks into a small circle, a ring spins around it
//               and three "typing" dots bounce inside
//   done        the circle shows a check mark, then pops open again into the
//               full button saying "Message sent"; THEN the chat opens in a
//               new tab, and after a few seconds the button resets
//
// Nothing opens until the animation has ended. If the browser blocks the new tab
// (it was not opened straight after a click), this page itself goes to the chat.
// Without JavaScript (or with ctrl/shift/middle click) it is a normal link.
//
// Props:
//   href   address to open (for example a wa.me chat link)
//   label  text in the idle state
export default function ContactButton({ href, label = 'Contact Me', className = '' }) {
  const [status, setStatus] = useState('idle') // 'idle' | 'connecting' | 'done'
  const timersRef = useRef([])

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  function later(callback, delayMs) {
    timersRef.current.push(setTimeout(callback, delayMs))
  }

  function openChat() {
    const chatTab = window.open(href, '_blank')
    if (chatTab) {
      chatTab.opener = null // the new tab gets no access back to this page
    } else {
      window.location.href = href // new tab blocked: go there in this tab instead
    }
  }

  function finish() {
    setStatus('done')
    later(openChat, prefersReducedMotion() ? 0 : REDIRECT_DELAY_MS)
    later(() => setStatus('idle'), RESET_AFTER_MS)
  }

  function handleClick(event) {
    const isPlainLeftClick = event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    if (!isPlainLeftClick) return // let the browser handle it as a normal link
    event.preventDefault()
    if (status !== 'idle') return // already running

    if (prefersReducedMotion()) {
      finish()
      return
    }
    setStatus('connecting')
    later(finish, CONNECT_MS)
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`glass-btn contact-btn ${className}`}
      data-status={status}
      onClick={handleClick}
      aria-live="polite"
    >
      {/* Shown only while the button is a small circle. */}
      <span className="contact-core" aria-hidden="true">
        <span className="contact-ring"></span>
        <span className="contact-dots">
          <i></i>
          <i></i>
          <i></i>
        </span>
        <svg className="contact-core-check" viewBox="0 0 24 24">
          <path d="m6.5 12.5 3.8 3.8 7.2-8" />
        </svg>
      </span>

      <span className="contact-stage">
        <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path className="contact-bubble" d="M21 11.5a8.4 8.4 0 0 1-12.2 7.5L3.5 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5Z" />
          <path className="contact-check" d="m7.5 12.5 3.3 3.3 5.9-6.6" />
        </svg>
        <span className="contact-label">{status === 'done' ? 'Message sent' : label}</span>
      </span>
    </a>
  )
}
