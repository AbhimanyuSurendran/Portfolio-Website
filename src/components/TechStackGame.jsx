import { useEffect, useRef, useState } from 'react'
import { techStacks, technologies } from '../data/skills'

const HIGHLIGHT_FLASH_MS = 350

// Looks for a known stack made of exactly the chosen technologies
// (order does not matter) and returns its message, or a progress hint.
function getStackMessage(stackIds) {
  const chosen = new Set(stackIds)

  for (const [combo, message] of Object.entries(techStacks)) {
    const comboIds = combo.split('+')
    const isSameSet = comboIds.length === chosen.size && comboIds.every((id) => chosen.has(id))
    if (isSameSet) return message
  }

  return stackIds.length === 0 ? 'Waiting for a valid tech stack...' : 'Stack in progress... add more techs!'
}

// "Tech Stack Builder": drag technologies into the box (or tap them on touch
// screens) to build a stack. Famous combinations like MERN or LAMP get a description.
export default function TechStackGame() {
  const [stackIds, setStackIds] = useState([])
  const [isDropAreaHighlighted, setIsDropAreaHighlighted] = useState(false)
  const flashTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(flashTimerRef.current), [])

  function addTech(techId) {
    setStackIds((current) => (current.includes(techId) ? current : [...current, techId]))
  }

  function removeTech(techId) {
    setStackIds((current) => current.filter((id) => id !== techId))
  }

  // Phones do not support HTML5 drag and drop, so tapping a technology adds it
  // too. The brief glow shows the visitor where it went.
  function addTechByClick(techId) {
    addTech(techId)
    setIsDropAreaHighlighted(true)
    clearTimeout(flashTimerRef.current)
    flashTimerRef.current = setTimeout(() => setIsDropAreaHighlighted(false), HIGHLIGHT_FLASH_MS)
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDropAreaHighlighted(false)
    addTech(event.dataTransfer.getData('text/plain'))
  }

  return (
    <div id="techStackGame" className="glass-panel">
      <h1 className="section-heading">🚀 Tech Stack Builder Game 🚀</h1>
      <p className="instructions">Drag technologies below into the box to build your own Stack! 🎯</p>

      <div className="drag-zone" id="dragZone">
        {technologies.map((tech) => (
          <div
            key={tech.id}
            className="tech"
            draggable="true"
            data-id={tech.id}
            onDragStart={(event) => event.dataTransfer.setData('text/plain', tech.id)}
            onClick={() => addTechByClick(tech.id)}
          >
            {tech.label}
          </div>
        ))}
      </div>

      <div
        className={isDropAreaHighlighted ? 'drop-area highlight' : 'drop-area'}
        id="dropArea"
        onDragOver={(event) => {
          event.preventDefault() // required, otherwise the browser refuses the drop
          setIsDropAreaHighlighted(true)
        }}
        onDragLeave={() => setIsDropAreaHighlighted(false)}
        onDrop={handleDrop}
      >
        Drop your stack here 👇
        {stackIds.map((techId) => (
          <div key={techId} className="tech clone" data-id={techId} title="Click to remove" onClick={() => removeTech(techId)}>
            {techId.toUpperCase()}
          </div>
        ))}
      </div>

      <div className="message-box" id="messageBox">
        {getStackMessage(stackIds)}
      </div>
    </div>
  )
}
