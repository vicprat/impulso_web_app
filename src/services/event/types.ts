import { type Event, type EventDetails } from '@/models/Event'

export interface GetEventsParams {
  limit?: number
  cursor?: string
  search?: string
}

export interface CreateEventPayload {
  title: string
  description: string
  vendor?: string
  status: 'ACTIVE' | 'DRAFT'
  tags: string[]
  price: string
  inventoryQuantity?: number
  details?: Partial<EventDetails>
  images?: {
    mediaContentType: 'IMAGE'
    originalSource: string
  }[]
}

export type UpdateEventPayload = Partial<CreateEventPayload> & { id: string }

export interface PaginatedEventsResponse {
  products: Event[]
  pageInfo: {
    hasNextPage: boolean
    endCursor?: string | null
  }
}
