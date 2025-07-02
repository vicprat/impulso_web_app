import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

import { type Event } from '@/models/Event'
import {
  type CreateEventPayload,
  type GetEventsParams,
  type PaginatedEventsResponse,
  type UpdateEventPayload,
} from '@/services/event/types'

import type { ApiError } from '@/src/types'

const EVENTS_QUERY_KEY = 'managementEvents'

export const useGetEventsPaginated = (params: GetEventsParams = {}) => {
  return useQuery<PaginatedEventsResponse>({
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.search) searchParams.append('search', params.search)
      if (params.cursor) searchParams.append('cursor', params.cursor)
      if (params.limit) searchParams.append('limit', params.limit.toString())

      const { data } = await axios.get(`/api/management/events?${searchParams.toString()}`)
      return data
    },
    queryKey: [EVENTS_QUERY_KEY, 'paginated', params],
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetEvent = (eventId: string | null) => {
  return useQuery<Event>({
    enabled: !!eventId,
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID is required')

      const { data } = await axios.get(`/api/management/events/${eventId}`)
      return data
    },
    queryKey: [EVENTS_QUERY_KEY, 'detail', eventId],
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateEventPayload): Promise<Event> => {
      const { data } = await axios.post('/api/management/events', payload)
      return data
    },
    onError: (error: ApiError) => {
      toast.error(`Error al crear evento: ${error.message ?? 'Error desconocido'}`)
    },
    onSuccess: () => {
      toast.success('Evento creado exitosamente')
      void queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] })
    },
  })
}

export const useUpdateEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateEventPayload): Promise<Event> => {
      const eventId = payload.id.split('/').pop()
      if (!eventId) throw new Error('Invalid Event ID for update')

      const { data } = await axios.put(`/api/management/events/${eventId}`, payload)
      return data
    },
    onError: (error: ApiError) => {
      toast.error(`Error al actualizar evento: ${error.message ?? 'Error desconocido'}`)
    },
    onSuccess: (updatedEvent) => {
      const eventId = updatedEvent.id.split('/').pop()

      toast.success('Evento actualizado exitosamente')
      void queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, 'paginated'] })
      queryClient.setQueryData([EVENTS_QUERY_KEY, 'detail', eventId], updatedEvent)
    },
  })
}

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (eventId: string) => {
      const numericId = eventId.split('/').pop()
      if (!numericId) throw new Error('Invalid Event ID for deletion')

      const { data } = await axios.delete(`/api/management/events/${numericId}`)
      return data
    },
    onError: (error: ApiError) => {
      toast.error(`Error al eliminar evento: ${error.message ?? 'Error desconocido'}`)
    },
    onSuccess: (_, deletedEventId) => {
      const numericId = deletedEventId.split('/').pop()

      toast.success('Evento eliminado exitosamente')
      void queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, 'paginated'] })
      queryClient.removeQueries({ queryKey: [EVENTS_QUERY_KEY, 'detail', numericId] })
    },
  })
}

export const useDeleteMultipleEvents = () => {
  const { isPending, mutateAsync: deleteEvent } = useDeleteEvent()

  return {
    deleteMultiple: async (eventIds: string[]) => {
      try {
        const results = await Promise.allSettled(eventIds.map((id) => deleteEvent(id)))

        const successful = results.filter((result) => result.status === 'fulfilled').length
        const failed = results.filter((result) => result.status === 'rejected').length

        if (failed === 0) {
          toast.success(
            `${successful} evento${successful > 1 ? 's' : ''} eliminado${successful > 1 ? 's' : ''} exitosamente`
          )
        } else if (successful === 0) {
          toast.error('Error al eliminar los eventos seleccionados')
        } else {
          toast.warning(`${successful} eventos eliminados, ${failed} fallaron`)
        }

        return { failed, successful, total: eventIds.length }
      } catch (error) {
        toast.error('Error al eliminar los eventos seleccionados')
        throw error
      }
    },
    isPending,
  }
}
