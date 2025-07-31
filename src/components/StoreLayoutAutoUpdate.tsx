'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StoreLayoutAutoUpdateProps {
  children: React.ReactNode
}

export function StoreLayoutAutoUpdate({ children }: StoreLayoutAutoUpdateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [ lastUpdate, setLastUpdate ] = useState(Date.now())

  useEffect(() => {
    // Función para verificar actualizaciones de la tienda
    const checkForUpdates = async () => {
      try {
        // Verificar si hay actualizaciones de productos
        const response = await fetch('/api/store/check-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lastUpdate,
          }),
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

    // Función para verificar actualizaciones de productos/eventos individuales
    const checkProductUpdates = async () => {
      try {
        // Extraer el handle de la URL
        const pathParts = pathname.split('/')
        const handle = pathParts[ pathParts.length - 1 ]

        if (handle && (pathname.includes('/store/product/') || pathname.includes('/store/event/'))) {
          const response = await fetch(`/api/products/${handle}/check-update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lastUpdate,
            }),
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

    // Verificar actualizaciones cada 5 minutos
    const storeInterval = setInterval(checkForUpdates, 300000) // 5 minutos
    const productInterval = setInterval(checkProductUpdates, 300000) // 5 minutos

    // Verificar inmediatamente al cargar
    checkForUpdates()
    checkProductUpdates()

    return () => {
      clearInterval(storeInterval)
      clearInterval(productInterval)
    }
  }, [ lastUpdate, router, pathname ])

  return <>{children}</>
} 