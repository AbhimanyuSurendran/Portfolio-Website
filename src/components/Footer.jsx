import SiteLink from './SiteLink'
import { assetUrl } from '../utils/assetUrl'

const SOCIAL_LINKS = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/abhimanyu-surendran-53b9b3234/', logo: 'home_elements/linkedin-logo.png' },
  { name: 'GitHub', url: 'https://github.com/AbhimanyuSurendran', logo: 'home_elements/github-logo.png' },
  { name: 'Facebook', url: 'https://www.facebook.com/abhi.surendran.169/', logo: 'home_elements/facebook-logo.png' },
  { name: 'Instagram', url: 'https://www.instagram.com/abhimanyusurendran01/', logo: 'home_elements/instagram-logo.png' },
]

const SERVICES = [
  'Web Development',
  'Web Design',
  'Android Development',
  'Java Development',
  'React Development',
  'SQL / MongoDB / Firebase',
]

const QUICK_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/publications', label: 'Publications' },
  { to: '/about', label: 'About' },
]

// Contact details, social links, quick links and map shown at the bottom of the About page.
export default function Footer() {
  return (
    <footer className="glass-panel">
      <div className="footer-top">
        <div className="footer-top-items glass-card">
          <img src={assetUrl('about_elements/footer-call-logo.png')} alt="image" />
          <div className="footer-top-content">
            <h1>Call Me</h1>
            <p>+91 8839261551</p>
          </div>
        </div>
        <div className="footer-top-items glass-card">
          <img src={assetUrl('about_elements/footer-message-logo.png')} alt="image" />
          <div className="footer-top-content">
            <h1>Mail Me</h1>
            <p>abhimanyu.surendran01@gmail.com</p>
            <p>abhiyoyo165@gmail.com</p>
          </div>
        </div>
        <div className="footer-top-items glass-card">
          <img src={assetUrl('about_elements/footer-whatsapp-logo.png')} alt="image" />
          <div className="footer-top-content">
            <button className="btn glass-btn">
              <svg width="150" height="60" viewBox="0 0 150 60" className="border">
                <polyline points="179,1 179,59 1,59 1,1 179,1" className="bg-line" />
                <polyline points="179,1 179,59 1,59 1,1 179,1" className="hl-line" />
              </svg>
              <span>
                <a href="https://wa.me/+918839261551" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-column-1">
          <div className="footer-column-upper">
            <h1>ABOUT ME</h1>
            <p>
              Passionate developer crafting seamless web and mobile experiences, merging creativity with technical
              expertise to inspire users.
            </p>
          </div>
          <div className="footer-column-lower">
            <h1>SOCIAL</h1>
            <div className="social-pair-container">
              {SOCIAL_LINKS.map((social) => (
                <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="social-pair">
                  <img src={assetUrl(social.logo)} alt={social.name} />
                  <h6>{social.name}</h6>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-column">
          <h1>PRODUCTS &amp; SERVICES</h1>
          {SERVICES.map((service) => (
            <p key={service}>{service}</p>
          ))}
        </div>
        <div className="footer-column">
          <h1>QUICK LINKS</h1>
          {QUICK_LINKS.map((link) => (
            <SiteLink key={link.to} to={link.to}>
              {link.label}
            </SiteLink>
          ))}
        </div>
        <div className="footer-column">
          <h1>LOCATION</h1>
          <div className="map-container">
            <iframe
              title="Location map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d458.5230561150662!2d77.41476017509488!3d23.16346722779044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c437cdd5a4be7%3A0xf216124eaea54d3c!2sG95%2C%20Varun%20Nagar%2C%20Lalita%20Nagar%2C%20Kolar%20Rd%2C%20Bhopal%2C%20Madhya%20Pradesh%20462042!5e0!3m2!1sen!2sin!4v1728796936117!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <h5>&copy; 2024 Abhimanyu Surendran. All rights reserved.</h5>
        </div>
      </div>
    </footer>
  )
}
