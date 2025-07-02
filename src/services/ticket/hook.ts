import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export interface TicketWithEvent {
  id: string
  userId: string
  eventId: string
  qrCode: string
  status: string
  createdAt: string
  updatedAt: string
  event: {
    id: string
    title: string
    handle: string
    vendor: string
    eventDetails: {
      date: string | null
      location: string | null
      startTime: string | null
      endTime: string | null
      organizer: string | null
    }
    status: string
    primaryImage: {
      url: string
      altText: string | null
    } | null
    price: {
      amount: string
      currencyCode: string
    }
  } | null
}

const TICKETS_QUERY_KEY = 'userTickets'

// 🔄 FIXED: No pasar userId - el backend usará session.user.id
export const useGetTicketsByUserId = () => {
  return useQuery<TicketWithEvent[]>({
    queryKey: [TICKETS_QUERY_KEY],
    queryFn: async () => {
      // ✅ NO enviar userId - el backend lo tomará de la sesión
      const { data } = await axios.get('/api/management/tickets')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useGetTicket = (ticketId: string | null) => {
  return useQuery<TicketWithEvent>({
    enabled: !!ticketId,
    queryFn: async () => {
      if (!ticketId) throw new Error('Ticket ID is required')
      const { data } = await axios.get(`/api/management/tickets/${ticketId}`)
      return data
    },
    queryKey: [TICKETS_QUERY_KEY, 'detail', ticketId],
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { eventId: string; qrCode: string }): Promise<TicketWithEvent> => {
      const { data } = await axios.post('/api/management/tickets', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY] })
    },
  })
}

export const useUpdateTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; status?: string }): Promise<TicketWithEvent> => {
      const { data } = await axios.put(`/api/management/tickets/${payload.id}`, payload)
      return data
    },
    onSuccess: (updatedTicket) => {
      queryClient.setQueryData([TICKETS_QUERY_KEY, 'detail', updatedTicket.id], updatedTicket)
      queryClient.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY] })
    },
  })
}
