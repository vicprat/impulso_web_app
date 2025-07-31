'use client'
import { useEffect, useState } from 'react'

import { Card } from '@/components/Card'
import { type Event } from '@/models/Event'
import { publicEventService } from '@/services/event/publicService'
import { ROUTES } from '@/src/config/routes'

export default function EventsPage() {
  const [ events, setEvents ] = useState<Event[]>([])
  const [ isLoading, setIsLoading ] = useState(true)
  const [ error, setError ] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await publicEventService.getPublicEvents({
          first: 50,
        })
        setEvents(response.events)
      } catch (err) {
        setError('Error al cargar los eventos')
        console.error('Error fetching events:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (isLoading) {
    return <Card.Loader />
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-red-500'>{error}</div>
      </div>
    )
  }


  return (
    <div className='container mx-auto px-6 py-8'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>{ROUTES.STORE.EVENTS.LABEL}</h1>
        <p>{ROUTES.STORE.EVENTS.DESCRIPTION}</p>
      </div>

      {events.length === 0 ? (
        <div className='py-12 text-center'>
          <p className='text-lg text-gray-500'>No hay eventos disponibles en este momento.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {events.map((event) => (
            <Card.Product key={event.id} product={event} />
          ))}
        </div>
      )}
    </div>
  )
}