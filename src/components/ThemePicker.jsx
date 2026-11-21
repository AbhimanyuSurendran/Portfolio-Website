import { useEffect, useRef, useState } from 'react'
import { playSparks } from '../utils/sparks'

// Button in the header that opens a panel with the 6 palettes of the current
// mode. The panel STAYS OPEN while you pick, so you can try several palettes
// in a row; it closes with Escape, the close button, or a click outside.
//
// Each miniature carries its own data-theme attribute, so its colours come
// from themes.css and are never repeated here.
export default function ThemePicker({ themes, themeId, modeLabel, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    function closeOnEscape(event) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    function closeOnOutsideClick(event) {
      if (!pickerRef.current.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOnOutsideClick)
    }
  }, [isOpen])

  return (
    <div className="theme-picker" ref={pickerRef}>
      <button
        type="button"
        ref={buttonRef}
        className="theme-picker-button"
        aria-label="Choose colour theme"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onPointerUp={(event) => playSparks(buttonRef.current, event)}
      >
        {/* key={themeId}: a new element per palette, so the pop animation replays on every change. */}
        <span key={themeId} className="theme-swatch" data-theme={themeId}></span>
      </button>

      {isOpen && (
        <div className="theme-menu" role="dialog" aria-label="Colour theme">
          <div className="theme-menu-header">
            <div>
              <p className="theme-menu-title">Colour theme</p>
              <p className="theme-menu-subtitle">{modeLabel} palettes</p>
            </div>
            <button type="button" className="theme-menu-close" aria-label="Close theme menu" onClick={() => setIsOpen(false)}>
              &times;
            </button>
          </div>

          <div className="theme-grid" role="radiogroup" aria-label="Palette">
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={theme.id === themeId}
                className="theme-card"
                onClick={() => onChange(theme.id)}
              >
                {/* Miniature of the page in this palette. */}
                <span className="theme-preview" data-theme={theme.id} aria-hidden="true">
                  <span className="theme-preview-bar"></span>
                  <span className="theme-preview-dots">
                    <i></i>
                    <i></i>
                  </span>
                </span>
                <span className="theme-card-name">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
