import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'
import SocialDock from '../components/SocialDock'
import { useTypewriter } from '../hooks/useTypewriter'
import homeCss from '../styles/home.css?inline'

const ROLES = ['Software Developer', 'Full-Stack Developer', 'Web Developer', 'React Developer', 'Android Developer']

const CONTACT_LINKS = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/abhimanyu-surendran-53b9b3234/', logo: 'home_elements/linkedin-logo.png' },
  { name: 'GitHub', url: 'https://github.com/AbhimanyuSurendran', logo: 'home_elements/github-logo.png' },
  { name: 'Facebook', url: 'https://www.facebook.com/abhi.surendran.169/', logo: 'home_elements/facebook-logo.png' },
  { name: 'Instagram', url: 'https://www.instagram.com/abhimanyusurendran01/', logo: 'home_elements/instagram-logo.png' },
]

// The photos themselves are CSS backgrounds (li:nth-child rules in home.css).
const SLIDE_COUNT = 6
const FIRST_CHANGE_DELAY_MS = 3000
const SLIDE_INTERVAL_MS = 8000

// Chat widget (Botpress). The second script holds the bot's configuration and
// needs the first one to be loaded already, so they are added one after the other.
const CHATBOT_SCRIPTS = [
  'https://cdn.botpress.cloud/webchat/v2.2/inject.js',
  'https://files.bpcontent.cloud/2025/04/01/10/20250401103738-L5WYZ13S.js',
]

function loadScriptsInOrder(urls) {
  const [nextUrl, ...remainingUrls] = urls
  if (!nextUrl) return
  // Visiting Home twice must not add the widget twice.
  if (document.querySelector(`script[src="${nextUrl}"]`)) {
    loadScriptsInOrder(remainingUrls)
    return
  }
  const script = document.createElement('script')
  script.src = nextUrl
  script.onload = () => loadScriptsInOrder(remainingUrls)
  document.body.appendChild(script)
}

// Index of the photo to show: starts at the first one, then moves on every few seconds.
function useSlideshow(slideCount) {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    let intervalId
    const startTimer = setTimeout(() => {
      intervalId = setInterval(() => {
        setActiveSlide((current) => (current + 1) % slideCount)
      }, SLIDE_INTERVAL_MS)
    }, FIRST_CHANGE_DELAY_MS)

    return () => {
      clearTimeout(startTimer)
      clearInterval(intervalId)
    }
  }, [slideCount])

  return activeSlide
}

export default function Home() {
  const { text: typedRole, isTyping } = useTypewriter(ROLES)
  const activeSlide = useSlideshow(SLIDE_COUNT)

  // The chat widget is not needed to read the page, so it loads once the
  // browser is idle (or after 4s at most) instead of competing with the first paint.
  useEffect(() => {
    const startLoading = () => loadScriptsInOrder(CHATBOT_SCRIPTS)
    if (!('requestIdleCallback' in window)) {
      const timerId = setTimeout(startLoading, 2000)
      return () => clearTimeout(timerId)
    }
    const idleId = requestIdleCallback(startLoading, { timeout: 4000 })
    return () => cancelIdleCallback(idleId)
  }, [])

  return (
    <PageLayout title="Home" description="Abhimanyu Surendran is a full-stack software developer building web and Android applications with React, Node.js, TypeScript, Java and PostgreSQL." pageCss={homeCss}>
      {/* Hero: two-column glass layout (text left, photo slider right) */}
      <main className="hero">
        <div className="profile-title">
          <h1 className="name">Abhimanyu Surendran</h1>
          <h2>
            I am a <span className="typed-text">{typedRole}</span>
            <span className={isTyping ? 'cursor typing' : 'cursor'}>&nbsp;</span>
          </h2>
          <h3>
            I'm a developer focused on creating smooth, responsive web and Android experiences. I turn ideas into
            functional, user-friendly digital solutions.
          </h3>
          <h4 style={{ textAlign: 'center' }}>Contact Me</h4>
          <SocialDock links={CONTACT_LINKS} />
        </div>

        <div className="profile-image">
          <div className="profile-container">
            <div className="row full-height justify-content-center">
              <div className="col-lg-10 col-xl-8 align-self-center padding-tb">
                <div className="section mx-auto text-center slider-height-padding">
                  <ul>
                    {Array.from({ length: SLIDE_COUNT }, (_, index) => (
                      <li key={index} className={index === activeSlide ? 'slide active' : 'slide'}></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <h1>Abhimanyu Surendran</h1>
        </div>
      </main>
    </PageLayout>
  )
}
