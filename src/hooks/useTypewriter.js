import { useEffect, useState } from 'react'

const TYPING_DELAY_MS = 100
const ERASING_DELAY_MS = 100
const PAUSE_AFTER_WORD_MS = 1000
const PAUSE_BEFORE_NEXT_WORD_MS = 1200
const START_DELAY_MS = 1250

// Types each word one letter at a time, pauses, erases it, then moves to the
// next word (looping forever).
// Returns the text typed so far and whether a letter is being typed/erased
// right now (the cursor stops blinking while this is true).
export function useTypewriter(words) {
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!words.length) return

    let wordIndex = 0
    let charCount = 0
    let timerId

    function type() {
      const word = words[wordIndex]
      if (charCount < word.length) {
        setIsTyping(true)
        charCount++
        setText(word.slice(0, charCount))
        timerId = setTimeout(type, TYPING_DELAY_MS)
      } else {
        setIsTyping(false)
        timerId = setTimeout(erase, PAUSE_AFTER_WORD_MS)
      }
    }

    function erase() {
      if (charCount > 0) {
        setIsTyping(true)
        charCount--
        setText(words[wordIndex].slice(0, charCount))
        timerId = setTimeout(erase, ERASING_DELAY_MS)
      } else {
        setIsTyping(false)
        wordIndex = (wordIndex + 1) % words.length
        timerId = setTimeout(type, PAUSE_BEFORE_NEXT_WORD_MS)
      }
    }

    timerId = setTimeout(type, START_DELAY_MS)
    return () => clearTimeout(timerId)
  }, [words])

  return { text, isTyping }
}
