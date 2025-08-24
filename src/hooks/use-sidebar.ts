import { useEffect, useState } from 'react'

export type SidebarState = 'expanded' | 'collapsed' | 'hidden'

const STORAGE_KEY = 'ls.sidebar.state'
const WIDTH_KEY = 'ls.sidebar.width'
const DEFAULT_WIDTH = 264

export function useSidebar() {
  const [state, setState] = useState<SidebarState>('expanded')
  const [width, setWidth] = useState(DEFAULT_WIDTH)

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY) as SidebarState
    const savedWidth = localStorage.getItem(WIDTH_KEY)
    
    if (savedState && ['expanded', 'collapsed', 'hidden'].includes(savedState)) {
      setState(savedState)
    }
    
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth, 10)
      if (!isNaN(parsedWidth) && parsedWidth > 0) {
        setWidth(parsedWidth)
      }
    }
  }, [])

  const updateState = (newState: SidebarState) => {
    setState(newState)
    localStorage.setItem(STORAGE_KEY, newState)
    
    // Update CSS variable
    const root = document.documentElement
    if (newState === 'hidden') {
      root.style.setProperty('--sidebar-width', '0px')
    } else if (newState === 'collapsed') {
      root.style.setProperty('--sidebar-width', '72px')
    } else {
      root.style.setProperty('--sidebar-width', `${width}px`)
    }
  }

  const updateWidth = (newWidth: number) => {
    setWidth(newWidth)
    localStorage.setItem(WIDTH_KEY, newWidth.toString())
    
    if (state === 'expanded') {
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`)
    }
  }

  const toggle = () => {
    if (state === 'hidden') {
      updateState('expanded')
    } else if (state === 'expanded') {
      updateState('collapsed')
    } else {
      updateState('expanded')
    }
  }

  const cycle = () => {
    if (state === 'expanded') {
      updateState('collapsed')
    } else if (state === 'collapsed') {
      updateState('hidden')
    } else {
      updateState('expanded')
    }
  }

  const expand = () => updateState('expanded')
  const collapse = () => updateState('collapsed')
  const hide = () => updateState('hidden')
  const show = () => updateState('expanded')

  return {
    state,
    width,
    updateState,
    updateWidth,
    toggle,
    cycle,
    expand,
    collapse,
    hide,
    show,
    isExpanded: state === 'expanded',
    isCollapsed: state === 'collapsed',
    isHidden: state === 'hidden'
  }
}