import { useState, useEffect } from 'react'

export function useRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  const replace = (path: string) => {
    window.history.replaceState({}, '', path)
    setCurrentPath(path)
  }

  return {
    currentPath,
    navigate,
    replace
  }
}