import { useEffect } from 'react'

// Disables the right-click menu on the whole site.
// Keyboard shortcuts (F12, Ctrl+Shift+I, Ctrl+U ...) are left alone on purpose.
export function useDisableRightClick() {
  useEffect(() => {
    function blockContextMenu(event) {
      event.preventDefault()
    }

    document.addEventListener('contextmenu', blockContextMenu)
    return () => document.removeEventListener('contextmenu', blockContextMenu)
  }, [])
}
