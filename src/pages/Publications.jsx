import PageLayout from '../components/PageLayout'
import { papers } from '../data/publications'
import { assetUrl } from '../utils/assetUrl'
import publicationsCss from '../styles/publications.css?inline'

export default function Publications() {
  return (
    <PageLayout title="Publications" pageCss={publicationsCss}>
      <div className="main-content">
        {papers.map((paper) => (
          <div key={paper.link} className="research-paper glass-panel">
            <img src={assetUrl(paper.logo)} alt="Research Image" />
            <div className="text-content">
              <h1>Publication :- {paper.publication}</h1>
              <h1>Paper Title :- {paper.title}</h1>
              <h1>Published on :- {paper.publishedOn}</h1>
              <p>{paper.summary}</p>
              <div className="visit-paper">
                <a href={paper.link} target="_blank" rel="noopener noreferrer" className="paper-link glass-btn">
                  Visit paper
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
