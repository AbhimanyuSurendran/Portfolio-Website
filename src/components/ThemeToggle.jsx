import { useRef } from 'react'
import { playSparks } from '../utils/sparks'

const SUN_RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

// Light / dark switch. The knob slides on a spring while the sun turns into a
// moon: the sun's disc grows and a second disc slides over it to cut the
// crescent, and the rays shrink away. The sky behind it fades from day
// (clouds) to night (twinkling stars). Everything is CSS (controls.css) and
// follows the real checkbox state, so keyboard and screen readers work too.
//
// The <input> must stay directly before the <label>: the CSS reads
// "#toggle:checked + .mode-toggle".
export default function ThemeToggle({ isDarkMode, onChange }) {
  const labelRef = useRef(null)

  return (
    <>
      <input
        type="checkbox"
        id="toggle"
        name="toggle"
        value="is_on"
        role="switch"
        aria-label="Dark mode"
        className="mode-input"
        checked={isDarkMode}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label
        htmlFor="toggle"
        className="mode-toggle"
        ref={labelRef}
        onPointerUp={(event) => playSparks(labelRef.current, event)}
      >
        <span className="mode-track" aria-hidden="true">
          <span className="mode-sky mode-sky-day"></span>
          <span className="mode-sky mode-sky-night">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </span>
        </span>
        <span className="mode-knob" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="mode-icon">
            <mask id="mode-moon-cut">
              <rect width="24" height="24" fill="#fff" />
              <circle className="mode-moon-cut" cx="24" cy="0" r="7" fill="#000" />
            </mask>
            <circle className="mode-sun-core" cx="12" cy="12" r="5" mask="url(#mode-moon-cut)" />
            <g className="mode-sun-rays">
              {SUN_RAY_ANGLES.map((angle) => (
                <line key={angle} x1="12" y1="2.2" x2="12" y2="4.6" transform={`rotate(${angle} 12 12)`} />
              ))}
            </g>
          </svg>
        </span>
      </label>
    </>
  )
}
