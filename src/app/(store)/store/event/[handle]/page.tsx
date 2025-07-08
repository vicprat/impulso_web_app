import { notFound } from 'next/navigation'

import { type Event } from '@/models/Event'
import { getServerSession } from '@/modules/auth/server/server'
import { api } from '@/modules/shopify/api'
import {
  getPrivateProductIds,
  getPrivateRoomByUserId,
  shopifyService,
} from '@/modules/shopify/service'

import { EventClient } from './EventClient'

import type { Product } from '@/src/modules/shopify/types'

interface PrivateRoomProduct {
  id: string
  privateRoomId: string
  productId: string
}

export default async function EventPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  try {
    const session = await getServerSession()
    const privateProductIds = await getPrivateProductIds()

    let productResponse
    let event: Event | null = null

    try {
      productResponse = await api.getProductByHandle(handle)
      event = productResponse.data as Event
    } catch (error) {
      console.error('Error fetching product by handle:', error)
      if (!session) {
        notFound()
      }
      event = null
    }

    if (!event) {
      notFound()
    }

    if (event.productType !== 'Evento') {
      notFound()
    }

    if (privateProductIds.includes(event.id)) {
      if (!session) {
        notFound()
      }

      const userRoles = session.user.roles
      const isAdminOrManager = userRoles.includes('admin') || userRoles.includes('manager')
      const isVipCustomer = userRoles.includes('vip_customer')

      if (isAdminOrManager) {
        // Allow access
      } else if (isVipCustomer) {
        try {
          const userPrivateRoom = await getPrivateRoomByUserId(session.user.id)

          if (
            !userPrivateRoom?.products.some((p: PrivateRoomProduct) => p.productId === event.id)
          ) {
            notFound()
          }
        } catch (privateRoomError) {
          console.error('Error checking private room access:', privateRoomError)
          notFound()
        }
      } else {
        notFound()
      }
    }

    let relatedEvents: Event[] = []
    try {
      const relatedProducts = await shopifyService.getRelatedProducts(event as Product)
      relatedEvents = relatedProducts.filter((p) => p.productType === 'Evento') as Event[]
    } catch (relatedError) {
      console.error('Error fetching related events:', relatedError)
      relatedEvents = []
    }

    return <EventClient event={event} relatedEvents={relatedEvents} session={session} />
  } catch (error) {
    console.error('Error in EventPage:', error)
    notFound()
  }
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  try {
    const productResponse = await api.getProductByHandle(handle)
    const event = productResponse.data as Event

    if (event.productType !== 'Evento') {
      return {
        title: 'Evento no encontrado',
      }
    }

    const eventDate = event.eventDetails?.date

    const eventLocation = event.eventDetails?.location

    const eventDetails = [
      eventDate && `📅 ${new Date(eventDate).toLocaleDateString('es-MX')}`,
      eventLocation && `📍 ${eventLocation}`,
    ]
      .filter(Boolean)
      .join(' • ')

    return {
      description: eventDetails || event.descriptionHtml || `Evento: ${event.title}`,
      openGraph: {
        description:
          eventDetails || event.descriptionHtml || `Únete a este evento especial: ${event.title}`,
        images: event.images[0] ? [event.images[0].url] : [],
        title: `🎫 ${event.title}`,
        type: 'website',
      },
      title: `${event.title} - Evento`,
      twitter: {
        card: 'summary_large_image',
        description: eventDetails || event.descriptionHtml,
        images: event.images[0] ? [event.images[0].url] : [],
        title: `🎫 ${event.title}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Evento no encontrado',
    }
  }
}
