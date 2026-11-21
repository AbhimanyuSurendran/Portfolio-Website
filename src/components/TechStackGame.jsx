import { useMemo, useRef, useState } from 'react'
import { techStacks, technologies } from '../data/skills'
import { playSparks } from '../utils/sparks'

// The four layers of a stack, top to bottom. Every technology belongs to one
// of them (see "category" in data/skills.js) and lands in that row.
const LAYERS = [
  { id: 'frontend', label: 'Frontend', note: 'What visitors see' },
  { id: 'backend', label: 'Backend', note: 'Server and logic' },
  { id: 'database', label: 'Database', note: 'Where data lives' },
  { id: 'cloud', label: 'Cloud and tools', note: 'Hosting and servers' },
]

const STORAGE_KEY = 'discoveredStacks'
const TECH_LABELS = Object.fromEntries(technologies.map((tech) => [tech.id, tech.label]))

// "🌐 MERN Stack: React frontend with Express + MongoDB!\nOne of the most..."
// becomes { title: 'MERN Stack', tagline: 'React frontend with Express + MongoDB!', description: 'One of the most...' }.
function parseStackMessage(key, message) {
  const [firstLine, ...otherLines] = message.split('\n')
  const colonIndex = firstLine.indexOf(':')
  const rawTitle = firstLine.slice(0, colonIndex)
  return {
    key,
    ids: key.split('+'),
    // Removes the emoji (anything before the first letter, digit or dot).
    title: rawTitle.replace(/^[^\p{L}\p{N}.]+/u, '').trim(),
    tagline: firstLine.slice(colonIndex + 1).trim(),
    description: otherLines.join(' ').trim(),
  }
}

const ALL_STACKS = Object.entries(techStacks).map(([key, message]) => parseStackMessage(key, message))

// The known stack made of exactly the chosen technologies (order does not matter), or undefined.
function findStack(stackIds) {
  const chosen = new Set(stackIds)
  return ALL_STACKS.find((stack) => stack.ids.length === chosen.size && stack.ids.every((id) => chosen.has(id)))
}

function readDiscovered() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return [] // storage blocked or damaged: start fresh
  }
}

function saveDiscovered(keys) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  } catch {
    // Saving is optional.
  }
}

// "Tech Stack Builder": a small game. Drag technologies (or tap them) into the
// four layers of a stack. When the chosen technologies match a famous stack
// such as MERN or LAMP, it is unlocked and added to the collection.
export default function TechStackGame() {
  const [stackIds, setStackIds] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [isDragOver, setIsDragOver] = useState(false)
  const [discoveredKeys, setDiscoveredKeys] = useState(readDiscovered)
  const [hint, setHint] = useState('')
  const resultRef = useRef(null)

  const matchedStack = findStack(stackIds)
  const visibleTechnologies = useMemo(
    () => technologies.filter((tech) => activeTab === 'all' || tech.category === activeTab),
    [activeTab]
  )

  // Single place that changes the stack, so unlocking is checked every time.
  function changeStack(nextIds) {
    setStackIds(nextIds)
    setHint('')

    const stack = findStack(nextIds)
    if (!stack || discoveredKeys.includes(stack.key)) return
    const nextDiscovered = [...discoveredKeys, stack.key]
    setDiscoveredKeys(nextDiscovered)
    saveDiscovered(nextDiscovered)
    // The result card is rendered after this update; wait one frame for it.
    requestAnimationFrame(() => resultRef.current && playSparks(resultRef.current, null))
  }

  function addTech(techId) {
    if (!TECH_LABELS[techId] || stackIds.includes(techId)) return
    changeStack([...stackIds, techId])
  }

  function removeTech(techId) {
    changeStack(stackIds.filter((id) => id !== techId))
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragOver(false)
    addTech(event.dataTransfer.getData('text/plain'))
  }

  // Names two technologies of a stack the visitor has not found yet.
  function showHint() {
    const undiscovered = ALL_STACKS.filter((stack) => !discoveredKeys.includes(stack.key))
    if (undiscovered.length === 0) {
      setHint('You found every stack. Impressive!')
      return
    }
    const stack = undiscovered[Math.floor(Math.random() * undiscovered.length)]
    const firstTwo = stack.ids.slice(0, 2).map((id) => TECH_LABELS[id]).join(' + ')
    setHint(`Try a stack that includes ${firstTwo} (${stack.ids.length} technologies in total).`)
  }

  // Chips are divs (not buttons) because Firefox cannot drag a <button>.
  function chipKeyboard(event, techId) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    addTech(techId)
  }

  const progressPercent = (discoveredKeys.length / ALL_STACKS.length) * 100

  return (
    <div id="techStackGame" className="glass-panel stack-lab">
      <header className="lab-header">
        <h1 className="section-heading">Tech Stack Builder</h1>
        <p className="instructions">
          Build a real-world stack. Drag technologies into the layers, or tap them, and unlock famous combinations.
        </p>
        <div className="lab-progress">
          <span>
            <strong>{discoveredKeys.length}</strong> / {ALL_STACKS.length} stacks discovered
          </span>
          <span className="lab-progress-track" aria-hidden="true">
            <i style={{ transform: `scaleX(${progressPercent / 100})` }}></i>
          </span>
        </div>
      </header>

      <div className="lab-body">
        {/* ---- Palette: all technologies, filterable by layer ---- */}
        <section className="lab-palette" aria-label="Technologies">
          <div className="lab-tabs" role="tablist">
            {[{ id: 'all', label: 'All' }, ...LAYERS].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className="lab-tab"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="lab-chips">
            {visibleTechnologies.map((tech) => (
              <div
                key={tech.id}
                className={stackIds.includes(tech.id) ? 'lab-chip is-added' : 'lab-chip'}
                data-layer={tech.category}
                role="button"
                tabIndex={0}
                draggable="true"
                onDragStart={(event) => event.dataTransfer.setData('text/plain', tech.id)}
                onClick={() => addTech(tech.id)}
                onKeyDown={(event) => chipKeyboard(event, tech.id)}
              >
                {tech.label}
              </div>
            ))}
          </div>
        </section>

        {/* ---- Board: the four layers of the stack ---- */}
        <section
          className={isDragOver ? 'lab-board is-over' : 'lab-board'}
          aria-label="Your stack"
          onDragOver={(event) => {
            event.preventDefault() // required, otherwise the browser refuses the drop
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {LAYERS.map((layer) => {
            const layerTechs = stackIds.filter((id) => technologies.find((tech) => tech.id === id)?.category === layer.id)
            return (
              <div key={layer.id} className="lab-layer" data-layer={layer.id}>
                <div className="lab-layer-name">
                  <strong>{layer.label}</strong>
                  <small>{layer.note}</small>
                </div>
                <div className="lab-layer-slots">
                  {layerTechs.length === 0 && <span className="lab-empty">Drop here</span>}
                  {layerTechs.map((techId) => (
                    <button
                      key={techId}
                      type="button"
                      className="lab-placed"
                      data-layer={layer.id}
                      title="Click to remove"
                      onClick={() => removeTech(techId)}
                    >
                      {TECH_LABELS[techId]}
                      <span aria-hidden="true">&times;</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="lab-actions">
            <button type="button" className="lab-action" onClick={showHint}>
              Need a hint?
            </button>
            <button type="button" className="lab-action" disabled={stackIds.length === 0} onClick={() => changeStack([])}>
              Clear stack
            </button>
          </div>
        </section>
      </div>

      {/* ---- Result ---- */}
      <div className={matchedStack ? 'lab-result is-unlocked' : 'lab-result'} ref={resultRef} aria-live="polite">
        {matchedStack ? (
          // key: a new element per stack, so the entrance animation replays.
          <div key={matchedStack.key} className="lab-result-content">
            <span className="lab-badge">Stack unlocked</span>
            <h3>{matchedStack.title}</h3>
            <p className="lab-tagline">{matchedStack.tagline}</p>
            <p>{matchedStack.description}</p>
          </div>
        ) : (
          <div className="lab-result-content">
            <h3 className="lab-waiting">{stackIds.length === 0 ? 'Your stack is empty' : 'Stack in progress'}</h3>
            <p>
              {hint ||
                (stackIds.length === 0
                  ? 'Pick a technology to start. Try HTML, CSS and JavaScript.'
                  : `${stackIds.length} selected. Keep adding, or remove one, until it matches a known stack.`)}
            </p>
          </div>
        )}
      </div>

      {/* ---- Collection: every stack, lit up once found ---- */}
      <div className="lab-collection" aria-label="Stack collection">
        {ALL_STACKS.map((stack) => (
          <span key={stack.key} className={discoveredKeys.includes(stack.key) ? 'lab-trophy is-found' : 'lab-trophy'}>
            {discoveredKeys.includes(stack.key) ? stack.title : '???'}
          </span>
        ))}
      </div>
    </div>
  )
}
