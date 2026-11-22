import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import Footer from '../components/Footer'
import DownloadButton from '../components/DownloadButton'
import SiteLink from '../components/SiteLink'
import ExperienceTimeline from '../components/ExperienceTimeline'
import { certifications, education, experience, featuredProjects, freelance, internships, skillGroups } from '../data/about'
import { assetUrl } from '../utils/assetUrl'
import aboutCss from '../styles/about.css?inline'
// Address of the bundled resume file, used as the plain link (new tab / no JavaScript).
import resumeUrl from '../assets/resume.pdf?url'

// The resume is bundled into the site's own JavaScript (loaded only when the
// button is clicked) and turned back into a file in the browser. Requesting a
// ".pdf" address from the server failed on some browsers/machines with
// "File wasn't available on site", and this avoids that request completely.
async function loadResume() {
  const { default: dataUrl } = await import('../assets/resume.pdf?inline')
  const [header, base64] = dataUrl.split(',')
  const mimeType = header.slice(header.indexOf(':') + 1, header.indexOf(';'))
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
  return new Blob([bytes], { type: mimeType })
}

const PERSONAL_DETAILS = [
  { icon: 'about_elements/about-calendar-logo.png', label: 'Date of Birth', value: '01/09/2003' },
  { icon: 'about_elements/about-location-logo.png', label: 'Location', value: 'Mumbai, Maharashtra, India' },
  { icon: 'about_elements/about-message-logo.png', label: 'Email', value: 'abhimanyu.surendran01@gmail.com' },
  { icon: 'about_elements/about-call-logo.png', label: 'Phone', value: '+91 8839261551' },
]

// Left panel: photo, short summary and the resume download.
function ResumeProfile() {
  return (
    <div className="resume-profile glass-panel">
      <img src={assetUrl('about_elements/profile_photo.JPG')} alt="image" className="personal-photo" />
      <h1>Abhimanyu Surendran</h1>
      <h2>Software Developer</h2>
      <p className="about-tagline">Full Stack · JavaScript · TypeScript · Java · React.js · Node.js · PostgreSQL</p>
      {PERSONAL_DETAILS.map((detail) => (
        <div key={detail.label} className="detail-item">
          <img src={assetUrl(detail.icon)} alt="image" />
          <p>
            <b>{detail.label}:</b> {detail.value}
          </p>
        </div>
      ))}
      <div className="resume-button">
        <DownloadButton
          loadFile={loadResume}
          href={resumeUrl}
          fileName="resume.pdf"
          className="resume-link"
        />
      </div>
    </div>
  )
}

// A job or internship: logo (or a letter tile when there is no logo), title lines and a description.
function ExperienceCard({ item }) {
  return (
    <div className="card glass-card">
      <div className="card-content">
        {item.logo ? (
          <img loading="lazy" src={assetUrl(item.logo)} alt={item.logoAlt} />
        ) : (
          <div className="about-logo-tile" aria-hidden="true">
            {item.logoLetter}
          </div>
        )}
        <div className="card-text">
          <h3>{item.heading}</h3>
          <h3>{item.role}</h3>
          <h3>{item.period}</h3>
          <p>{item.description}</p>
        </div>
      </div>
    </div>
  )
}

// Right panel: the long scrollable story. It has its own scroll bar,
// so its scroll position drives the progress line at the top.
function MainProfile() {
  const [scrollPercent, setScrollPercent] = useState(0)

  function updateScrollProgress(event) {
    const panel = event.currentTarget
    const scrollableHeight = panel.scrollHeight - panel.clientHeight
    setScrollPercent(scrollableHeight > 0 ? (panel.scrollTop / scrollableHeight) * 100 : 0)
  }

  return (
    <div className="main-profile glass-panel" onScroll={updateScrollProgress}>
      <div className="progress-container">
        <div className="progress-bar" id="progress-bar" style={{ width: `${scrollPercent}%` }}></div>
      </div>

      <div className="about-me glass-card">
        <h1>About Me</h1>
        <p>
          I’m a Software Developer at PUNON Technologies, where I build and upgrade enterprise applications, and a
          developer with a strong focus on creating smooth, responsive web and Android applications. My expertise spans
          JavaScript, React, Java, and SQL, extended today by TypeScript, Node.js, Express.js, and PostgreSQL/MySQL, with
          hands-on experience in both full-stack development and mobile solutions, including three deployed projects
          covering REST APIs, authentication, and role-based workflows.
        </p>
        <p>
          I take pride in delivering clean, functional, and user-friendly code that brings ideas to life. Whether it's
          developing dynamic websites or building mobile apps, I enjoy solving complex problems with practical, effective
          solutions, and along the way I’ve built strong debugging and API optimization experience. I’ve also mentored
          100+ learners in software development fundamentals. With a passion for detail and a love for coding, I aim to
          craft digital experiences that are seamless and engaging for users.
        </p>
      </div>

      <div className="my-mission glass-card">
        <img loading="lazy" src={assetUrl('about_elements/about_mission.webp')} alt="Image" />
        <div className="my-mission-text-content">
          <h1>My Mission</h1>
          <p>
            As a software developer, my vision is to use technology to create innovative solutions that enhance user
            experiences and solve real-world problems. I aim to stay at the forefront of emerging technologies,
            continually refining my skills in full-stack development, mobile applications, and cloud computing. I want
            to contribute to projects that prioritize user-centric design, seamless functionality, and scalability, and
            to collaborate with diverse teams in a culture of creativity and continuous learning. Ultimately, I want to
            build applications that not only meet people’s needs but also inspire and empower them in their everyday
            lives.
          </p>
        </div>
      </div>

      <h1 className="title section-heading">My Experience</h1>
      <div className="card-container">
        {experience.map((item) => (
          <ExperienceCard key={item.heading} item={item} />
        ))}
      </div>

      <h1 className="title section-heading">My Freelance Work</h1>
      <div className="card-container">
        {freelance.map((item) => (
          <ExperienceCard key={item.heading} item={item} />
        ))}
      </div>

      <h1 className="title section-heading">My Internships</h1>
      <div className="card-container">
        {internships.map((item) => (
          <ExperienceCard key={item.heading} item={item} />
        ))}
      </div>

      <h1 className="title section-heading">Featured Projects</h1>
      <div className="card-container">
        {featuredProjects.map((project) => (
          <div key={project.title} className="card glass-card about-project">
            <h3>{project.title}</h3>
            <p className="about-project-meta">{project.meta}</p>
            <ul className="about-highlights">
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="glass-btn about-project-link">
              Live Demo
            </a>
          </div>
        ))}
      </div>

      <div className="my-skills glass-card">
        <div className="my-skills-text-content">
          <h1>Skills & Strength</h1>
          <p>
            I’m skilled in web development, with proficiency in HTML, CSS, JavaScript, TypeScript, and React, which lets
            me build responsive, user-friendly websites and web applications. I also have expertise in Android app
            development using Java, creating intuitive mobile experiences, and I now work with Android DPC, Apple MDM,
            and Firebase Cloud Messaging on enterprise device management.
          </p>
          <p>
            My knowledge extends to backend technologies: server-side programming with Node.js and Express.js,
            databases like SQL, PostgreSQL, and MySQL, and API integration for dynamic applications, including RESTful
            API development, ORMs, JWT authentication, and role-based access. I excel at problem-solving, with a strong
            ability to find efficient solutions to complex challenges. Adaptable and quick to learn, I stay up to date
            with the latest industry trends, and I thrive in collaborative environments with strong communication and
            teamwork skills.
          </p>
        </div>
        <img loading="lazy" src={assetUrl('about_elements/about_skills.webp')} alt="Image" />
      </div>

      <h1 className="title section-heading">Technical Skills</h1>
      <div className="about-skill-grid">
        {skillGroups.map((group) => (
          <div key={group.title} className="about-skill-group glass-card">
            <h3>{group.title}</h3>
            <p>{group.skills}</p>
          </div>
        ))}
      </div>

      <div className="my-achievements glass-card">
        <img loading="lazy" src={assetUrl('about_elements/about_achievements.gif')} alt="Image" />
        <div className="my-achievements-text-content">
          <h1>My Achievements</h1>
          <p>
            I completed my Bachelor's in Computer Applications (BCA), specializing in mobile applications and cloud
            technology, as a Gold Medalist, and I am currently pursuing a Master's in Computer Applications (MCA) with a
            focus on full-stack development. Along the way, I’ve earned multiple certifications in programming, web
            development, and cloud, including the AWS Cloud Essentials Learning Plan, mastering technologies like
            JavaScript, React, HTML, CSS, and SQL. I have also gained proficiency in Android development using Java,
            allowing me to create functional and user-friendly mobile apps.
          </p>
          <p>
            Throughout my journey, I’ve honed strong problem-solving and teamwork skills, consistently delivering
            high-quality solutions in collaborative projects and learning environments, and I’ve gone on to mentor 100+
            learners and to deploy three full-stack projects.
          </p>
        </div>
      </div>

      <h1 className="title section-heading">Education</h1>
      {education.map((item) => (
        <div key={item.years} className="education glass-card">
          <h1>{item.years}</h1>
          <div className="education-description">
            <h2>{item.degree}</h2>
            <h3>{item.school}</h3>
            <p>{item.description}</p>
          </div>
        </div>
      ))}

      <h1 className="title section-heading">Certifications</h1>
      <div className="about-certs glass-card">
        <ul>
          {certifications.map((certification) => (
            <li key={certification.name}>
              <span>{certification.name}</span>
              <span className="about-cert-issuer">{certification.issuer}</span>
            </li>
          ))}
        </ul>
        <SiteLink to="/certificates" className="about-certs-link">
          View all certificates →
        </SiteLink>
      </div>
    </div>
  )
}

export default function About() {
  return (
    <PageLayout title="About" description="Learn about Abhimanyu Surendran: software developer at PUNON Technologies, MCA student and BCA gold medalist, with experience, internships, education and certifications." pageCss={aboutCss}>
      <div className="main-content">
        <div className="profile-column">
          <ResumeProfile />
          <ExperienceTimeline />
        </div>
        <MainProfile />
      </div>
      <Footer />
    </PageLayout>
  )
}
