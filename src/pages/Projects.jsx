import { useEffect, useRef, useState } from 'react'
import PageLayout from '../components/PageLayout'
import SplitHeading from '../components/SplitHeading'
import { allProjects, topProjects } from '../data/projects'
import { assetUrl } from '../utils/assetUrl'
import HoverAnimatedImage from '../components/HoverAnimatedImage'
import projectsCss from '../styles/projects.css?inline'

// A tile only expands once the pointer has rested on it this long,
// so sweeping the mouse across the row does not make the tiles jump around.
const EXPAND_DELAY_MS = 500

// "Top 5 Projects": a row of tiles; hovering one expands it to show details.
function TopProjects() {
  const [expandedIndex, setExpandedIndex] = useState(null)
  const hoverTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(hoverTimerRef.current), [])

  function expandAfterDelay(index) {
    clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => setExpandedIndex(index), EXPAND_DELAY_MS)
  }

  function collapse(index) {
    clearTimeout(hoverTimerRef.current)
    setExpandedIndex((current) => (current === index ? null : current))
  }

  return (
    <div className="top-projects-container glass-panel">
      <SplitHeading text="Top 5 Projects" />

      <div className="card-wrapper">
        {topProjects.map((project, index) => {
          const isExpanded = expandedIndex === index
          return (
            <div
              key={project.title}
              className={isExpanded ? 'top-projects glass-card expanded' : 'top-projects glass-card'}
              onMouseOver={() => expandAfterDelay(index)}
              onMouseLeave={() => collapse(index)}
            >
              <HoverAnimatedImage className="main-img" src={assetUrl(project.logo)} alt={project.title} />
              <img className="expanded-img" src={assetUrl(project.poster)} alt="" />

              <div className="details">
                <div className="title">{project.title}</div>
                <div className="top-projects-desc">{project.description}</div>
                {/* Hidden tiles keep their link out of the Tab order. */}
                <a className="button glass-btn" href={project.link} target="_blank" rel="noopener noreferrer" tabIndex={isExpanded ? 0 : -1}>
                  View Project
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Every project as a card, plus a side panel that shows the clicked project in detail.
function AllProjects() {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const detailPanelRef = useRef(null)
  const selectedProject = selectedIndex === null ? null : allProjects[selectedIndex]

  function selectProject(index) {
    setSelectedIndex(index)
    // On narrow screens the panel sits below the cards; bring it into view.
    if (window.innerWidth <= 1000) {
      detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Project cards are clickable divs, so make them work with Enter / Space too.
  function selectOnEnterOrSpace(event, index) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    selectProject(index)
  }

  // The panel keeps its elements in place and toggles display (projects.css
  // looks for display:none on the button to style the "nothing selected" state).
  const displayWhenSelected = { display: selectedProject ? 'block' : 'none' }

  return (
    <div className="main-content">
      <div className="card-container">
        {allProjects.map((project, index) => (
          <div
            key={project.title}
            className={index === selectedIndex ? 'card glass-card is-selected' : 'card glass-card'}
            data-tilt
            tabIndex={0}
            role="button"
            onClick={() => selectProject(index)}
            onKeyDown={(event) => selectOnEnterOrSpace(event, index)}
          >
            <h1>{project.label}</h1>
            <HoverAnimatedImage loading="lazy" src={assetUrl(project.logo)} alt={project.cardTitle} />
            <h3>{project.cardTitle}</h3>
          </div>
        ))}
      </div>

      <div className="description glass-panel" ref={detailPanelRef}>
        <h1 id="description-title">{selectedProject ? selectedProject.title : 'No items have been selected'}</h1>
        <div className="description-image" style={displayWhenSelected}>
          {selectedProject && <img id="description-image" src={assetUrl(selectedProject.poster)} alt="Image Loading..." />}
        </div>
        <div className="description-text" style={displayWhenSelected}>
          <p id="description-text">{selectedProject?.description}</p>
        </div>
        <button
          className="description-btn glass-btn"
          id="description-link"
          style={displayWhenSelected}
          onClick={() => window.open(selectedProject.link, '_blank', 'noopener,noreferrer')}
        >
          View Project on GitHub <img src={assetUrl('home_elements/github-logo.png')} alt="" />
        </button>
      </div>
    </div>
  )
}

export default function Projects() {
  return (
    <PageLayout title="Projects" pageCss={projectsCss}>
      <TopProjects />
      <AllProjects />
    </PageLayout>
  )
}
