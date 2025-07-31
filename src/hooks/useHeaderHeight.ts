import { useEffect, useState } from 'react'

export function useHeaderHeight() {
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header')
      if (header) {
        const height = header.offsetHeight
        setHeaderHeight(height)
      }
    }

    // Medir inicialmente
    updateHeaderHeight()

    // Observar cambios en el header
    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight()
    })

    const header = document.querySelector('header')
    if (header) {
      resizeObserver.observe(header)
    }

    // También escuchar cambios en el DOM
    const mutationObserver = new MutationObserver(() => {
      updateHeaderHeight()
    })

    if (header) {
      mutationObserver.observe(header, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      })
    }

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return headerHeight
} 