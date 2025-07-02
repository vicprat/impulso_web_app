// app/store/event/[handle]/page.tsx - CORREGIDA
import { getServerSession } from '@/modules/auth/server/server'
import { api } from '@/modules/shopify/api' // ✅ Usar Storefront API, no Admin API
import {
  getPrivateProductIds,
  getPrivateRoomByUserId,
  shopifyService,
} from '@/modules/shopify/service'
import { notFound } from 'next/navigation'
import { EventClient } from './EventClient'

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
    let product

    try {
      // ✅ Usar Storefront API (no Admin API)
      productResponse = await api.getProductByHandle(handle)
      product = productResponse?.data
    } catch (error) {
      console.error('Error fetching product by handle:', error)
      if (!session) {
        notFound()
      }
      product = null
    }

    if (!product) {
      notFound()
    }

    // ✅ Verificar que sea realmente un evento
    if (product.productType !== 'Evento') {
      console.log(
        `Product ${handle} is not an event (type: ${product.productType}), redirecting to product page`
      )
      // Opcional: redirigir a la página de producto regular
      // redirect(`/store/product/${handle}`)
      notFound()
    }

    // ✅ Manejar productos privados (lógica existente)
    if (privateProductIds.includes(product.id)) {
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
            !userPrivateRoom?.products.some((p: PrivateRoomProduct) => p.productId === product.id)
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

    // ✅ Obtener eventos relacionados usando Storefront API
    let relatedEvents: any[] = []
    try {
      const relatedProducts = await shopifyService.getRelatedProducts(product)
      // Filtrar solo eventos de los productos relacionados
      relatedEvents = relatedProducts.filter((p) => p.productType === 'Evento')
    } catch (relatedError) {
      console.error('Error fetching related events:', relatedError)
      relatedEvents = []
    }

    return (
      <EventClient
        product={product} // ✅ Pasar el producto de Storefront API
        relatedEvents={relatedEvents}
        session={session}
      />
    )
  } catch (error) {
    console.error('Error in EventPage:', error)
    notFound()
  }
}

// ✅ Generar metadata usando Storefront API
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  try {
    // ✅ Usar Storefront API para metadata
    const productResponse = await api.getProductByHandle(handle)
    const product = productResponse?.data

    if (!product || product.productType !== 'Evento') {
      return {
        title: 'Evento no encontrado',
      }
    }

    // ✅ Extraer detalles del evento de metafields si están disponibles
    const eventDate = product.metafields?.find(
      (m) => m.namespace === 'event_details' && m.key === 'date'
    )?.value

    const eventLocation = product.metafields?.find(
      (m) => m.namespace === 'event_details' && m.key === 'location'
    )?.value

    const eventDetails = [
      eventDate && `📅 ${new Date(eventDate).toLocaleDateString('es-MX')}`,
      eventLocation && `📍 ${eventLocation}`,
    ]
      .filter(Boolean)
      .join(' • ')

    return {
      title: `${product.title} - Evento`,
      description: eventDetails || product.description || `Evento: ${product.title}`,
      openGraph: {
        title: `🎫 ${product.title}`,
        description:
          eventDetails || product.description || `Únete a este evento especial: ${product.title}`,
        images: product.images?.[0] ? [product.images[0].url] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `🎫 ${product.title}`,
        description: eventDetails || product.description,
        images: product.images?.[0] ? [product.images[0].url] : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Evento no encontrado',
    }
  }
}
