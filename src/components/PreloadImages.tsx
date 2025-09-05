'use client'

import { useEffect } from 'react'

interface PreloadImagesProps {
  images: string[]
  priority?: boolean
}

export const PreloadImages: React.FC<PreloadImagesProps> = ({ images, priority = false }) => {
  useEffect(() => {
    if (!priority) return

    images.forEach((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  }, [ images, priority ])

  return null
}
