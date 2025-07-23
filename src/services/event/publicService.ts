import { Event } from '@/models/Event'

export const publicEventService = {
  async getEventByHandle(handle: string): Promise<Event | null> {
    try {
      // Usar el endpoint de API que maneja la lógica del servidor
      const response = await fetch(`/api/store/events/${handle}`)

      if (!response.ok) {
        return null
      }

      const eventData = await response.json()

      // Crear instancia del modelo Event desde los datos del servidor
      return new Event(eventData, 'gid://shopify/Location/123456789')
    } catch (error) {
      console.error('Error fetching public event by handle:', error)
      return null
    }
  },

  async getEventById(id: string): Promise<Event | null> {
    try {
      // Para obtener por ID, necesitaríamos una consulta específica con metafields
      // Por ahora, usamos el método por handle si tenemos el handle
      return null
    } catch (error) {
      console.error('Error fetching public event by ID:', error)
      return null
    }
  },

  async getPublicEvents(
    params: {
      search?: string
      first?: number
      after?: string
    } = {}
  ): Promise<{
    events: Event[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string
      endCursor: string
    }
  }> {
    try {
      // Construir parámetros de consulta
      const searchParams = new URLSearchParams()
      if (params.search) searchParams.append('search', params.search)
      if (params.first) searchParams.append('first', params.first.toString())
      if (params.after) searchParams.append('after', params.after)

      // Usar el endpoint de API que maneja la lógica del servidor
      const response = await fetch(`/api/store/events?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error('Error fetching events')
      }

      const data = await response.json()

      // Convertir los datos del servidor a instancias del modelo Event
      const events = data.events
        .map((eventData: any) => {
          try {
            return new Event(eventData, 'gid://shopify/Location/123456789')
          } catch (error) {
            console.error('Error creating Event instance:', error)
            return null
          }
        })
        .filter(Boolean) // Filtrar eventos nulos

      return {
        events,
        pageInfo: data.pageInfo,
      }
    } catch (error) {
      console.error('Error fetching public events:', error)
      return {
        events: [],
        pageInfo: {
          endCursor: '',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: '',
        },
      }
    }
  },
}
