import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { DEFAULT_THEME, THEMES } from '../data/themes'
import { runWithCircleReveal } from '../utils/circleReveal'

// Saved in localStorage. The same keys are read by the small script in index.html
// that applies the theme before the page is painted.
const MODE_KEY = 'darkMode' // 'true' / 'false'
const THEME_KEYS = { dark: 'themeDark', light: 'themeLight' } // the palette chosen for each mode

function readStorage(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null // storage blocked (e.g. private mode)
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Saving is optional; the theme still changes for this visit.
  }
}

// The saved palette for a mode, or that mode's default if nothing valid is saved.
function readSavedThemeId(mode) {
  const savedId = readStorage(THEME_KEYS[mode])
  const isKnownTheme = THEMES[mode].some((theme) => theme.id === savedId)
  return isKnownTheme ? savedId : DEFAULT_THEME[mode]
}

function readSavedAppearance() {
  return {
    isDarkMode: readStorage(MODE_KEY) !== 'false', // dark is the default
    themeIds: { dark: readSavedThemeId('dark'), light: readSavedThemeId('light') },
  }
}

// Light/dark mode plus one of 6 palettes inside each mode.
//   - mode:    the "dark-mode" class on <body> (see glass.css)
//   - palette: the data-theme attribute on <html> (see themes.css)
// Each mode remembers its own palette, so switching to light and back to dark
// returns to the dark palette the visitor picked.
//
// changeAppearance({ isDarkMode?, themeId? }) is the ONLY way the theme changes.
// The new look grows out of the click point as a circle (utils/circleReveal.js).
export function useTheme() {
  const [appearance, setAppearance] = useState(readSavedAppearance)
  // The newest choice. Two quick clicks can arrive before React has rendered the
  // first one, so each change builds on this instead of on possibly outdated state.
  const latestAppearanceRef = useRef(appearance)

  const { isDarkMode, themeIds } = appearance
  const mode = isDarkMode ? 'dark' : 'light'
  const themeId = themeIds[mode]

  // Layout effect = applied before the browser paints, so the page never
  // flashes the wrong theme.
  useLayoutEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode)
    document.documentElement.dataset.theme = themeId
  }, [isDarkMode, themeId])

  // `changes.themeId` is a palette of the mode that results from the change.
  function changeAppearance(changes) {
    const current = latestAppearanceRef.current
    const nextIsDarkMode = changes.isDarkMode ?? current.isDarkMode
    const nextMode = nextIsDarkMode ? 'dark' : 'light'
    const nextThemeIds = changes.themeId ? { ...current.themeIds, [nextMode]: changes.themeId } : current.themeIds
    latestAppearanceRef.current = { isDarkMode: nextIsDarkMode, themeIds: nextThemeIds }

    if (changes.isDarkMode !== undefined) writeStorage(MODE_KEY, nextIsDarkMode)
    if (changes.themeId) writeStorage(THEME_KEYS[nextMode], changes.themeId)

    // flushSync: React renders (and the layout effect above updates <html> and
    // <body>) before this function returns. The browser takes its "after"
    // picture right then, so waiting for a normal render would show the old colours.
    runWithCircleReveal(() => flushSync(() => setAppearance(latestAppearanceRef.current)))
  }

  return { isDarkMode, themes: THEMES[mode], themeId, changeAppearance }
}
