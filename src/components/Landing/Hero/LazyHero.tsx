'use client'

import { useEffect, useRef, useState } from 'react'

interface LazyHeroProps {
  children: React.ReactNode
  rootMargin?: string
}

export const LazyHero: React.FC<LazyHeroProps> = ({ children, rootMargin = '400px' }) => {
  const [shouldRender, setShouldRender] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [rootMargin])

  return (
    <div ref={containerRef} className='min-h-[90vh]'>
      {shouldRender ? children : null}
    </div>
  )
}
