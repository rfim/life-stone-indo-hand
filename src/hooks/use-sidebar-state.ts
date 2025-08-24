import { useState, useEffect, useCallback } from 'react'

export type SidebarState = 'expanded' | 'collapsed' | 'hidden'

interface SidebarStore {
  state: SidebarState
  width: number
  groupCollapsed: Record<string, boolean>
}

const DEFAULT_WIDTH = 264
const MIN_WIDTH = 220
const MAX_WIDTH = 320
const COLLAPSED_WIDTH = 72

const getStoredState = (): SidebarStore => {
  if (typeof window === 'undefined') {
    return {
      state: 'expanded',
      width: DEFAULT_WIDTH,
      groupCollapsed: {}
    }
  }

  const state = (localStorage.getItem('ls.sidebar.state') as SidebarState) || 'expanded'
  const width = parseInt(localStorage.getItem('ls.sidebar.width') || DEFAULT_WIDTH.toString(), 10)
  const groupCollapsed: Record<string, boolean> = {}
  
  // Load group collapsed states
  const groups = [
    'Masters', 'Purchasing', 'Warehouse', 'Marketing', 'Social Media',
    'Logistics/Delivery', 'Finance', 'Dashboards', 'Settings & User Privilege',
    'Security', 'Driver'
  ]
  
  groups.forEach(group => {
    const stored = localStorage.getItem(`ls.sidebar.group.${group}`)
    groupCollapsed[group] = stored ? stored === 'true' : false
  })

  return {
    state: ['expanded', 'collapsed', 'hidden'].includes(state) ? state : 'expanded',
    width: Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH),
    groupCollapsed
  }
}

const updateCSSVariable = (state: SidebarState, width: number) => {
  const root = document.documentElement
  let cssWidth = '0px'
  
  if (state === 'expanded') {
    cssWidth = `${width}px`
  } else if (state === 'collapsed') {
    cssWidth = `${COLLAPSED_WIDTH}px`
  }
  
  root.style.setProperty('--sidebar-width', cssWidth)
}

const emitSidebarChanged = (state: SidebarState, width: number) => {
  const event = new CustomEvent('sidebar:changed', {
    detail: { state, width: state === 'hidden' ? 0 : state === 'collapsed' ? COLLAPSED_WIDTH : width }
  })
  window.dispatchEvent(event)
}

export const useSidebarState = () => {
  const [store, setStore] = useState<SidebarStore>(getStoredState)

  const updateState = useCallback((newState: SidebarState) => {
    setStore(prev => {
      const updated = { ...prev, state: newState }
      localStorage.setItem('ls.sidebar.state', newState)
      updateCSSVariable(newState, updated.width)
      emitSidebarChanged(newState, updated.width)
      return updated
    })
  }, [])

  const updateWidth = useCallback((newWidth: number) => {
    const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH)
    setStore(prev => {
      const updated = { ...prev, width: clampedWidth }
      localStorage.setItem('ls.sidebar.width', clampedWidth.toString())
      if (updated.state === 'expanded') {
        updateCSSVariable(updated.state, clampedWidth)
        emitSidebarChanged(updated.state, clampedWidth)
      }
      return updated
    })
  }, [])

  const toggleGroupCollapsed = useCallback((group: string) => {
    setStore(prev => {
      const newCollapsed = !prev.groupCollapsed[group]
      const updated = {
        ...prev,
        groupCollapsed: { ...prev.groupCollapsed, [group]: newCollapsed }
      }
      localStorage.setItem(`ls.sidebar.group.${group}`, newCollapsed.toString())
      return updated
    })
  }, [])

  const expand = useCallback(() => updateState('expanded'), [updateState])
  const collapse = useCallback(() => updateState('collapsed'), [updateState])
  const hide = useCallback(() => updateState('hidden'), [updateState])

  const toggle = useCallback(() => {
    if (store.state === 'hidden') {
      updateState('expanded')
    } else {
      updateState('hidden')
    }
  }, [store.state, updateState])

  const cycle = useCallback(() => {
    switch (store.state) {
      case 'expanded':
        updateState('collapsed')
        break
      case 'collapsed':
        updateState('hidden')
        break
      case 'hidden':
        updateState('expanded')
        break
    }
  }, [store.state, updateState])

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ls.sidebar.state' && e.newValue) {
        const newState = e.newValue as SidebarState
        if (['expanded', 'collapsed', 'hidden'].includes(newState)) {
          setStore(prev => ({ ...prev, state: newState }))
          updateCSSVariable(newState, store.width)
        }
      } else if (e.key === 'ls.sidebar.width' && e.newValue) {
        const newWidth = parseInt(e.newValue, 10)
        if (!isNaN(newWidth)) {
          setStore(prev => ({ ...prev, width: newWidth }))
          if (store.state === 'expanded') {
            updateCSSVariable(store.state, newWidth)
          }
        }
      } else if (e.key?.startsWith('ls.sidebar.group.')) {
        const group = e.key.replace('ls.sidebar.group.', '')
        const collapsed = e.newValue === 'true'
        setStore(prev => ({
          ...prev,
          groupCollapsed: { ...prev.groupCollapsed, [group]: collapsed }
        }))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [store.state, store.width])

  // Initialize CSS variable on mount
  useEffect(() => {
    updateCSSVariable(store.state, store.width)
    emitSidebarChanged(store.state, store.width)
  }, [])

  return {
    state: store.state,
    width: store.width,
    groupCollapsed: store.groupCollapsed,
    isExpanded: store.state === 'expanded',
    isCollapsed: store.state === 'collapsed',
    isHidden: store.state === 'hidden',
    expand,
    collapse,
    hide,
    toggle,
    cycle,
    setWidth: updateWidth,
    toggleGroupCollapsed,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH,
    collapsedWidth: COLLAPSED_WIDTH
  }
}