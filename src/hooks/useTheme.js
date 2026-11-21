import { useLayoutEffect, useState } from 'react'
import { DEFAULT_THEME, THEMES } from '../data/themes'

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

// Light/dark mode plus one of 6 palettes inside each mode.
//   - mode:    the "dark-mode" class on <body> (see glass.css)
//   - palette: the data-theme attribute on <html> (see themes.css)
// Each mode remembers its own palette, so switching to light and back to dark
// returns to the dark palette the visitor picked.
export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => readStorage(MODE_KEY) !== 'false') // dark is the default
  const [themeIds, setThemeIds] = useState(() => ({
    dark: readSavedThemeId('dark'),
    light: readSavedThemeId('light'),
  }))

  const mode = isDarkMode ? 'dark' : 'light'
  const themeId = themeIds[mode]

  // Layout effect = applied before the browser paints, so the page never
  // flashes the wrong theme.
  useLayoutEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode)
    document.documentElement.dataset.theme = themeId
  }, [isDarkMode, themeId])

  function changeMode(nextIsDarkMode) {
    setIsDarkMode(nextIsDarkMode)
    writeStorage(MODE_KEY, nextIsDarkMode)
  }

  function changeTheme(nextThemeId) {
    setThemeIds((current) => ({ ...current, [mode]: nextThemeId }))
    writeStorage(THEME_KEYS[mode], nextThemeId)
  }

  return { isDarkMode, changeMode, themes: THEMES[mode], themeId, changeTheme }
}
