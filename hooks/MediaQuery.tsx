'use client'
import { useState, useEffect } from 'react'

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === 'undefined'

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = false,
  }: UseMediaQueryOptions = {},
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  })

  // Track if component has mounted to prevent hydration mismatches
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!hasMounted) return

    const matchMedia = window.matchMedia(query)

    // Triggered at the first client-side load and if query changes
    const handleChange = () => {
      setMatches(getMatches(query))
    }

    // Set initial value after mount
    handleChange()

    // Use the preferred modern method if available
    if (matchMedia.addEventListener) {
      matchMedia.addEventListener('change', handleChange)
    } else {
      // Fall back to deprecated method for older browsers
      matchMedia.addListener(handleChange)
    }

    return () => {
      if (matchMedia.removeEventListener) {
        matchMedia.removeEventListener('change', handleChange)
      } else {
        matchMedia.removeListener(handleChange)
      }
    }
  }, [query, hasMounted])

  // Return default value during SSR and before hydration
  if (!hasMounted) {
    return defaultValue
  }

  return matches
}

// Hook for common breakpoints with proper hydration handling
export function useBreakpoint() {
  const [hasMounted, setHasMounted] = useState(false)
  
  const isSm = useMediaQuery('(min-width: 640px)', { defaultValue: false })
  const isMd = useMediaQuery('(min-width: 768px)', { defaultValue: false })
  const isLg = useMediaQuery('(min-width: 1024px)', { defaultValue: false })
  const isXl = useMediaQuery('(min-width: 1280px)', { defaultValue: false })
  const is2Xl = useMediaQuery('(min-width: 1536px)', { defaultValue: false })

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return {
    isSm: hasMounted ? isSm : false,
    isMd: hasMounted ? isMd : false,
    isLg: hasMounted ? isLg : false,
    isXl: hasMounted ? isXl : false,
    is2Xl: hasMounted ? is2Xl : false,
    isDesktop: hasMounted ? isMd : false,
    isMobile: hasMounted ? !isMd : true, // Default to mobile for SSR
    hasMounted,
  }
}