import { notFound } from 'next/navigation'

import { type Product } from '@/models/Product'
import { getServerSession } from '@/modules/auth/server/server'
import {
  getPrivateProductIds,
  getPrivateRoomByUserId,
} from '@/modules/shopify/service'
import { productService } from '@/services/product/service'

import { Client } from './Client'

interface PrivateRoomProduct {
  id: string
  privateRoomId: string
  productId: string
}

// Página dinámica - se actualiza en cada request
export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  try {
    const session = await getServerSession()
    const privateProductIds = await getPrivateProductIds()

    let product: Product | null = null

    try {
      // Usar nuestro servicio personalizado para obtener el producto enriquecido
      if (session) {
        product = await productService.getProductByHandle(handle, session)
      }
    } catch {
      if (!session) {
        notFound()
      }
      product = null
    }

    if (!product) {
      notFound()
    }

    // Convertir el modelo Product a un objeto plano para evitar problemas de serialización
    const productData = {
      id: product.id,
      handle: product.handle,
      title: product.title,
      descriptionHtml: product.descriptionHtml,
      productType: product.productType,
      vendor: product.vendor,
      status: product.status,
      images: product.images,
      media: product.media,
      variants: product.variants,
      tags: product.tags,
      manualTags: product.manualTags,
      autoTags: product.autoTags,
      artworkDetails: product.artworkDetails,
      // Getters
      primaryImage: product.primaryImage,
      primaryVariant: product.primaryVariant,
      formattedPrice: product.formattedPrice,
      isAvailable: product.isAvailable,
      statusLabel: product.statusLabel,
    }

    if (privateProductIds.includes(product.id)) {
      if (!session) {
        notFound()
      }

      const userRoles = session.user.roles
      const isAdminOrManager = userRoles.includes('admin') || userRoles.includes('manager')
      const isVipCustomer = userRoles.includes('vip_customer')

      if (isAdminOrManager) {
        // Admins and managers are allowed; do nothing
      } else if (isVipCustomer) {
        try {
          const userPrivateRoom = await getPrivateRoomByUserId(session.user.id)

          if (
            !userPrivateRoom?.products.some((p: PrivateRoomProduct) => p.productId === product.id)
          ) {
            notFound()
          }
        } catch {
          notFound()
        }
      } else {
        notFound()
      }
    }

    let relatedProducts: Product[] = []
    try {
      // Obtener productos relacionados usando nuestro servicio
      if (session) {
        const relatedResponse = await productService.getProducts({
          limit: 10,
          vendor: product.vendor,
          status: 'ACTIVE'
        }, session)

        // Filtrar el producto actual y limitar a 6 productos relacionados
        relatedProducts = relatedResponse.products
          .filter(p => p.id !== product.id)
          .slice(0, 6)
      }
    } catch {
      relatedProducts = []
    }

    // Convertir los productos relacionados a objetos planos
    const relatedProductsData = relatedProducts.map(product => ({
      id: product.id,
      handle: product.handle,
      title: product.title,
      descriptionHtml: product.descriptionHtml,
      productType: product.productType,
      vendor: product.vendor,
      status: product.status,
      images: product.images,
      media: product.media,
      variants: product.variants,
      tags: product.tags,
      manualTags: product.manualTags,
      autoTags: product.autoTags,
      artworkDetails: product.artworkDetails,
      // Getters
      primaryImage: product.primaryImage,
      primaryVariant: product.primaryVariant,
      formattedPrice: product.formattedPrice,
      isAvailable: product.isAvailable,
      statusLabel: product.statusLabel,
    }))

    return <Client product={productData} relatedProducts={relatedProductsData} />
  } catch {
    notFound()
  }
}
