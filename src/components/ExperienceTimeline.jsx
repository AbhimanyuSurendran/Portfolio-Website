import { useRef } from 'react'
import { useInViewOnce } from '../hooks/useInViewOnce'
import { experience, freelance, internships } from '../data/about'
import { assetUrl } from '../utils/assetUrl'
import timelineCss from '../styles/timeline.css?inline'

// Internship periods are stored as "Duration :- 6 Months"; the timeline shows just "6 Months".
function shortPeriod(period) {
  return period.replace('Duration :-', '').trim()
}

// Months covered by a period such as "January 2025 - March 2026" or "May 2026 - Present"
// (both the first and the last month count). Returns 0 for anything else.
function monthsInPeriod(period) {
  const [startText, endText] = period.split(' - ')
  const start = new Date(startText + ' 1')
  const end = endText === 'Present' ? new Date() : new Date(endText + ' 1')
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
}

// Months in a duration such as "Duration :- 6 Months" or "Duration :- 1 Year". Returns 0 for anything else.
function monthsInDuration(period) {
  const match = period.match(/(\d+)\s*(year|month)/i)
  if (!match) return 0
  const amount = Number(match[1])
  return match[2].toLowerCase() === 'year' ? amount * 12 : amount
}

// "1 yr 10 mos"
function formatMonths(totalMonths) {
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const parts = []
  if (years > 0) parts.push(years + (years === 1 ? ' yr' : ' yrs'))
  if (months > 0) parts.push(months + (months === 1 ? ' mo' : ' mos'))
  return parts.join(' ') || 'Just started'
}

function totalMonthsOf(list) {
  return list.reduce((sum, item) => sum + monthsInDuration(item.period), 0)
}

function toTimelineItem(item) {
  return {
    name: item.heading,
    role: item.role,
    period: shortPeriod(item.period),
    logo: item.logo,
    logoLetter: item.logoLetter,
    isCurrent: item.period.includes('Present'),
  }
}

// Three groups. `start` keeps the entrance order running down all of them.
const workMonths = experience.reduce((sum, job) => sum + monthsInPeriod(job.period), 0)
const GROUPS = [
  { label: 'Total experience', total: formatMonths(workMonths), items: experience.map(toTimelineItem), start: 0 },
  {
    label: 'Total freelance',
    total: formatMonths(totalMonthsOf(freelance)),
    items: freelance.map(toTimelineItem),
    start: experience.length,
  },
  {
    label: 'Total internships',
    total: formatMonths(totalMonthsOf(internships)),
    items: internships.map(toTimelineItem),
    start: experience.length + freelance.length,
  },
]

// Vertical timeline for the profile sidebar. The rail draws down and the
// cards slide in one after another the first time it scrolls into view.
export default function ExperienceTimeline() {
  const timelineRef = useRef(null)
  const isInView = useInViewOnce(timelineRef, 0.08)

  return (
    <section ref={timelineRef} className={isInView ? 'timeline glass-panel is-in' : 'timeline glass-panel'} aria-label="Experience timeline">
      <style>{timelineCss}</style>
      <h3 className="timeline-title">Experience Timeline</h3>

      {GROUPS.map((group) => (
        <div key={group.label} className="timeline-group">
          <div className="timeline-total">
            <span className="timeline-total-label">{group.label}</span>
            <span className="timeline-total-value">{group.total}</span>
          </div>
          <ol className="timeline-list">
            {group.items.map((item, index) => (
              <li
                key={item.name}
                className={item.isCurrent ? 'timeline-item is-current' : 'timeline-item'}
                style={{ '--i': group.start + index }}
              >
                <span className="timeline-dot"></span>
                <div className="timeline-card">
                  {item.logo ? (
                    <img className="timeline-logo" loading="lazy" src={assetUrl(item.logo)} alt="" />
                  ) : (
                    <span className="timeline-logo timeline-logo-letter" aria-hidden="true">
                      {item.logoLetter}
                    </span>
                  )}
                  <div className="timeline-text">
                    <p className="timeline-name">{item.name}</p>
                    <p className="timeline-role">{item.role}</p>
                    <span className="timeline-period">{item.period}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  )
}
