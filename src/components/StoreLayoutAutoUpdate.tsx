'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StoreLayoutAutoUpdateProps {
  children: React.ReactNode
}

export function StoreLayoutAutoUpdate({ children }: StoreLayoutAutoUpdateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const response = await fetch('/api/store/check-update', {
          body: JSON.stringify({
            lastUpdate,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })

        if (response.ok) {
          const { hasUpdates } = await response.json()

          if (hasUpdates) {
            router.refresh()
            setLastUpdate(Date.now())
          }
        }
      } catch (error) {
        // Silenciar errores de verificación
      }
    }

    const checkProductUpdates = async () => {
      try {
        const pathParts = pathname.split('/')
        const handle = pathParts[pathParts.length - 1]

        if (
          handle &&
          (pathname.includes('/store/product/') || pathname.includes('/store/event/'))
        ) {
          const response = await fetch(`/api/products/${handle}/check-update`, {
            body: JSON.stringify({
              lastUpdate,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          if (response.ok) {
            const { hasUpdates } = await response.json()

            if (hasUpdates) {
              router.refresh()
              setLastUpdate(Date.now())
            }
          }
        }
      } catch (error) {
        // Silenciar errores de verificación
      }
    }

    const storeInterval = setInterval(checkForUpdates, 300000)
    const productInterval = setInterval(checkProductUpdates, 300000)

    void checkForUpdates()
    void checkProductUpdates()

    return () => {
      clearInterval(storeInterval)
      clearInterval(productInterval)
    }
  }, [lastUpdate, router, pathname])

  return <>{children}</>
}
