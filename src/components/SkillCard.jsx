import { useRef } from 'react'
import CountUp from './CountUp'
import { useInViewOnce } from '../hooks/useInViewOnce'
import { assetUrl } from '../utils/assetUrl'

// Ring geometry. The circle has radius 34, so its edge is about 213.6 long;
// the progress arc is drawn by hiding part of that length (stroke-dashoffset).
const RING_RADIUS = 34
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

// Word shown under the name, chosen from the percentage.
function levelFor(percent) {
  if (percent >= 90) return 'Expert'
  if (percent >= 80) return 'Advanced'
  if (percent >= 70) return 'Proficient'
  return 'Intermediate'
}

// One "Top Skill" card: logo, name, level and a ring that fills up to the
// percentage when the card scrolls into view.
export default function SkillCard({ skill, index }) {
  const cardRef = useRef(null)
  const isInView = useInViewOnce(cardRef)
  const gradientId = `skill-ring-${index}` // each ring needs its own gradient id

  // Before the card is seen the ring is empty; afterwards it shows the real value.
  const ringOffset = isInView ? RING_LENGTH * (1 - skill.percent / 100) : RING_LENGTH

  return (
    <article ref={cardRef} className={isInView ? 'skill-item skill-card glass-card in-view' : 'skill-item skill-card glass-card'}>
      <div className="skill-logo">
        <img src={assetUrl(skill.image)} alt={skill.alt} />
      </div>

      <div className="skill-info">
        <h3 className="skill-name">{skill.name}</h3>
        <span className="skill-level">{levelFor(skill.percent)}</span>
      </div>

      <div
        className="skill-ring"
        role="progressbar"
        aria-label={`${skill.name} proficiency`}
        aria-valuenow={skill.percent}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" className="skill-ring-stop-a" />
              <stop offset="100%" className="skill-ring-stop-b" />
            </linearGradient>
          </defs>
          <circle className="skill-ring-track" cx="40" cy="40" r={RING_RADIUS} />
          <circle
            className="skill-ring-arc"
            cx="40"
            cy="40"
            r={RING_RADIUS}
            stroke={`url(#${gradientId})`}
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={ringOffset}
          />
        </svg>
        <span className="skill-percent">
          <CountUp to={skill.percent} suffix="%" />
        </span>
      </div>
    </article>
  )
}
