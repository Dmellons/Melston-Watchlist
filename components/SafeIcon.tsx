'use client'
import { useState, useEffect } from 'react'
import { LucideIcon } from 'lucide-react'

interface SafeIconProps {
  icon: LucideIcon
  className?: string
  size?: number
  strokeWidth?: number
  fallback?: React.ReactNode
}

/**
 * SafeIcon component prevents hydration mismatches with lucide-react icons
 * by only rendering the icon after the component has mounted on the client
 */
export function SafeIcon({ 
  icon: Icon, 
  className, 
  size, 
  strokeWidth,
  fallback = null
}: SafeIconProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return (
      <>
        {fallback || (
          <div 
            className={className} 
            style={{ 
              width: size || 24, 
              height: size || 24,
              display: 'inline-block'
            }} 
          />
        )}
      </>
    )
  }

  return (
    <Icon 
      className={className} 
      size={size} 
      strokeWidth={strokeWidth} 
    />
  )
}

export default SafeIcon