import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export interface TicketWithEvent {
  id: string
  userId: string
  eventId: string
  qrCode: string
  quantity: number
  status: string
  orderId?: string
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

export const useGetTicketsByUserId = () => {
  return useQuery<TicketWithEvent[]>({
    queryFn: async () => {
      const { data } = await axios.get('/api/management/tickets')
      return data
    },
    queryKey: [TICKETS_QUERY_KEY],
    staleTime: 5 * 60 * 1000,
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
      void queryClient.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY] })
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
      void queryClient.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY] })
    },
  })
}
