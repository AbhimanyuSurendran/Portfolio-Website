import PageLayout from '../components/PageLayout'
import SplitHeading from '../components/SplitHeading'
import SkillCard from '../components/SkillCard'
import TechStackGame from '../components/TechStackGame'
import { backendSkills, frontendSkills, topSkills } from '../data/skills'
import { assetUrl } from '../utils/assetUrl'
import skillsCss from '../styles/skills.css?inline'

// Panel with a title and a grid of technology logos.
function SkillImagePanel({ className, title, skills }) {
  return (
    <div className={`${className} glass-panel`}>
      <h1 className="section-heading">{title}</h1>
      <div className="image-gallery">
        {skills.map((skill) => (
          <img key={skill.image} className="skill-img" loading="lazy" src={assetUrl(skill.image)} alt={skill.alt} />
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  return (
    <PageLayout title="Skills" pageCss={skillsCss}>
      <div className="main-content">
        <div className="top-skill-sets glass-panel">
          <SplitHeading text="Top Skill Sets" />
          <div className="skills-gallery">
            {topSkills.map((skill, index) => (
              <SkillCard key={skill.image} skill={skill} index={index} />
            ))}
          </div>
        </div>

        <div className="fullstack">
          <SkillImagePanel className="frontend" title="Frontend Languages" skills={frontendSkills} />
          <SkillImagePanel className="backend" title="Backend Languages" skills={backendSkills} />
        </div>

        <TechStackGame />
      </div>
    </PageLayout>
  )
}
