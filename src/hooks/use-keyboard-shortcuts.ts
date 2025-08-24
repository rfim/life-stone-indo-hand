import { useEffect } from 'react'
import { useSidebarState } from './use-sidebar-state'

export function useKeyboardShortcuts() {
  const { cycle, collapse, expand, isHidden } = useSidebarState()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + B: Cycle sidebar states
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        cycle()
        return
      }

      // [ key: Collapse sidebar (only if not hidden)
      if (event.key === '[' && !event.ctrlKey && !event.metaKey && !event.altKey && !isHidden) {
        const target = event.target as HTMLElement
        // Don't trigger if user is typing in an input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          event.preventDefault()
          collapse()
          return
        }
      }

      // ] key: Expand sidebar (only if not hidden)
      if (event.key === ']' && !event.ctrlKey && !event.metaKey && !event.altKey && !isHidden) {
        const target = event.target as HTMLElement
        // Don't trigger if user is typing in an input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          event.preventDefault()
          expand()
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [cycle, collapse, expand, isHidden])
}