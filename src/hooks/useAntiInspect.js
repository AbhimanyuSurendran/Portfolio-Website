import { useEffect } from 'react'

const WARNING_MESSAGE =
  '😂😂 Error 404: Inspect powers not found. Try again never. 🚫😂😂\n🛑 ACCESS DENIED 🛑\nYou really thought you could inspect this? 😂💻💀'

function isDevToolsShortcut(event) {
  const key = event.key.toLowerCase()
  const isInspectShortcut = event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)
  const isViewSource = event.ctrlKey && key === 'u'
  return event.key === 'F12' || isInspectShortcut || isViewSource
}

// Keeps the original site behaviour: right-click is disabled and the
// "open DevTools / view source" shortcuts show a joke warning instead.
export function useAntiInspect() {
  useEffect(() => {
    function blockContextMenu(event) {
      event.preventDefault()
    }

    function blockDevToolsShortcuts(event) {
      if (!isDevToolsShortcut(event)) return
      alert(WARNING_MESSAGE)
      event.preventDefault()
    }

    document.addEventListener('contextmenu', blockContextMenu)
    document.addEventListener('keydown', blockDevToolsShortcuts)
    return () => {
      document.removeEventListener('contextmenu', blockContextMenu)
      document.removeEventListener('keydown', blockDevToolsShortcuts)
    }
  }, [])
}
