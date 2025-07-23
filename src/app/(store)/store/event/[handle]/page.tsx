'use client'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'

import { type Event } from '@/models/Event'
import { getPrivateProductIds, shopifyService } from '@/modules/shopify/service'
import { useAuth } from '@/src/modules/auth/context/useAuth'
import { useGetEventByHandle } from '@/src/services/event/hook'

import { EventClient } from './EventClient'

import type { Product } from '@/src/modules/shopify/types'

interface EventPageProps {
  params: Promise<{ handle: string }>
}

export default function EventPage({ params }: EventPageProps) {
  const [handle, setHandle] = useState<string | null>(null)
  const [privateProductIds, setPrivateProductIds] = useState<string[]>([])
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { user } = useAuth()
  const { data: event, isLoading: eventLoading } = useGetEventByHandle(handle || '')

  useEffect(() => {
    const initializePage = async () => {
      try {
        const { handle: eventHandle } = await params
        setHandle(eventHandle)

        // Obtener IDs de productos privados
        const privateIds = await getPrivateProductIds()
        setPrivateProductIds(privateIds)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    initializePage()
  }, [params])

  useEffect(() => {
    const fetchRelatedEvents = async () => {
      if (!event) return

      try {
        const relatedProducts = await shopifyService.getRelatedProducts(event as Product)
        const filteredEvents = relatedProducts.filter((p) => p.productType === 'Evento') as Event[]
        setRelatedEvents(filteredEvents)
      } catch (relatedError) {
        console.error('Error fetching related events:', relatedError)
        setRelatedEvents([])
      }
    }

    if (event) {
      fetchRelatedEvents()
    }
  }, [event])

  // Mostrar loading mientras se inicializa
  if (isLoading || eventLoading) {
    return <div className='flex min-h-screen items-center justify-center'>Cargando...</div>
  }

  // Mostrar error si ocurrió alguno
  if (error) {
    console.error('Error in EventPage:', error)
    notFound()
  }

  // Validaciones del evento
  if (!event) {
    notFound()
  }

  if (event.productType !== 'Evento') {
    notFound()
  }

  if (privateProductIds.includes(event.id)) {
    notFound()
  }

  return <EventClient event={event} relatedEvents={relatedEvents} session={user} />
}
