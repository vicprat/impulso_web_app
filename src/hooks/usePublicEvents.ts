'use client'

import { useEffect, useState } from 'react'

import { type Event } from '@/models/Event'
import { publicEventService } from '@/services/event/publicService'

export const usePublicEvents = (limit = 10) => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await publicEventService.getPublicEvents({
          first: limit,
        })
        setEvents(response.events)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar eventos')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [limit])

  return { events, loading, error }
} 