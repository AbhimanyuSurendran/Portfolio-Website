import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Preloader from './pages/Preloader'
import SiteLayout from './components/SiteLayout'
import { useDisableRightClick } from './hooks/useDisableRightClick'
import { useImageFallbacks } from './hooks/useImageFallbacks'
import { usePointerEffects } from './hooks/usePointerEffects'

// Each page is its own chunk, so a visitor only downloads the pages they open.
const Home = lazy(() => import('./pages/Home'))
const Projects = lazy(() => import('./pages/Projects'))
const Skills = lazy(() => import('./pages/Skills'))
const Certificates = lazy(() => import('./pages/Certificates'))
const Publications = lazy(() => import('./pages/Publications'))
const About = lazy(() => import('./pages/About'))

export default function App() {
  // Behaviours that apply to the whole site, whichever page is open.
  useDisableRightClick()
  useImageFallbacks()
  usePointerEffects()

  return (
    <Routes>
      <Route path="/" element={<Preloader />} />
      {/* SiteLayout (header + background layers) stays mounted while these pages change. */}
      <Route element={<SiteLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/about" element={<About />} />
      </Route>
      {/* Unknown address: go to the Home page. */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
