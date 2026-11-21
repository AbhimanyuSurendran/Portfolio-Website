// Section heading whose words rise into place one after another.
// Only opacity and transform are animated (see .split-word in animation.css),
// so it stays smooth even on slow phones.
export default function SplitHeading({ text, className = 'section-heading' }) {
  return (
    <h1 className={className} aria-label={text}>
      {text.split(' ').map((word, index) => (
        <span key={index} className="split-word" aria-hidden="true" style={{ '--word-index': index }}>
          {word}
        </span>
      ))}
    </h1>
  )
}
