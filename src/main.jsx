import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
// Shared by every page, loaded in the same order as the old static pages.
// (Each page's own stylesheet is added by PageLayout while that page is open.)
import './styles/glass.css'
import './styles/header.css'
import './styles/creative.css'
import './styles/liquid.css'
import './styles/animation.css'
// Must stay last: re-skins the glass system (colours, edges, fonts) set above.
import './styles/refraction.css'
// The 12 colour themes (and the picker styles). Needs refraction.css above.
import './styles/themes.css'
// The two header buttons (theme picker + light/dark switch).
import './styles/controls.css'
// Animated download button (About page resume).
import './styles/download-button.css'
// Tech Stack Builder game (Skills page).
import './styles/stack-builder.css'
import App from './App'

// HashRouter keeps the route after the "#" (e.g. /#/projects), so refreshing
// or opening a deep link works on GitHub Pages without any server rewrite rules.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
