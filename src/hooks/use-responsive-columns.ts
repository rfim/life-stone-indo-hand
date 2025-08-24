import { useEffect, useState } from 'react'
import { useIsMobile } from './use-mobile'

export interface ResponsiveColumn {
  id: string
  label: string
  priority: 1 | 2 | 3 // 1 = must show, 2 = important, 3 = optional
  visible: boolean
}

interface UseResponsiveColumnsOptions {
  columns: ResponsiveColumn[]
  breakpoints?: {
    sm: number // Show priority 1 only
    md: number // Show priority 1-2
    lg: number // Show all
  }
}

export function useResponsiveColumns({ 
  columns, 
  breakpoints = { sm: 640, md: 768, lg: 1024 } 
}: UseResponsiveColumnsOptions) {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )
  const [visibleColumns, setVisibleColumns] = useState<ResponsiveColumn[]>(columns)
  const isMobile = useIsMobile()

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update visible columns based on screen size and priority
  useEffect(() => {
    let maxPriority: number

    if (windowWidth < breakpoints.sm) {
      maxPriority = 1 // Show only essential columns on very small screens
    } else if (windowWidth < breakpoints.md) {
      maxPriority = 1 // Show only essential columns on small screens  
    } else if (windowWidth < breakpoints.lg) {
      maxPriority = 2 // Show essential and important columns on medium screens
    } else {
      maxPriority = 3 // Show all columns on large screens
    }

    const updatedColumns = columns.map(column => ({
      ...column,
      visible: column.visible && column.priority <= maxPriority
    }))

    setVisibleColumns(updatedColumns)
  }, [windowWidth, columns, breakpoints])

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    )
  }

  const setColumnVisibility = (columnId: string, visible: boolean) => {
    setVisibleColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, visible } : col
      )
    )
  }

  const resetToDefaults = () => {
    let maxPriority: number

    if (windowWidth < breakpoints.sm) {
      maxPriority = 1
    } else if (windowWidth < breakpoints.md) {
      maxPriority = 1
    } else if (windowWidth < breakpoints.lg) {
      maxPriority = 2
    } else {
      maxPriority = 3
    }

    const resetColumns = columns.map(column => ({
      ...column,
      visible: column.priority <= maxPriority
    }))

    setVisibleColumns(resetColumns)
  }

  const getColumnsByPriority = (priority: 1 | 2 | 3) => {
    return visibleColumns.filter(col => col.priority === priority)
  }

  const getHiddenColumns = () => {
    return columns.filter(col => {
      const visibleCol = visibleColumns.find(v => v.id === col.id)
      return !visibleCol?.visible
    })
  }

  const getCurrentBreakpoint = () => {
    if (windowWidth < breakpoints.sm) return 'xs'
    if (windowWidth < breakpoints.md) return 'sm'
    if (windowWidth < breakpoints.lg) return 'md'
    return 'lg'
  }

  return {
    visibleColumns,
    hiddenColumns: getHiddenColumns(),
    toggleColumnVisibility,
    setColumnVisibility,
    resetToDefaults,
    getColumnsByPriority,
    currentBreakpoint: getCurrentBreakpoint(),
    isMobile,
    windowWidth
  }
}