import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import CreativeLayer from './CreativeLayer'

// The parts of the site that stay on screen while moving between pages:
// the header (navbar) and the decorative background layers.
// Only the page inside <Outlet /> is swapped, so the navbar never
// disappears or flickers during navigation.
export default function SiteLayout() {
  return (
    <>
      <Header />
      {/* Blank while a page's code downloads; the header stays visible. */}
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <CreativeLayer />
    </>
  )
}
