/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from 'next/navigation'

import { getServerSession } from '@/modules/auth/server/server'
import { api } from '@/modules/shopify/api'
import {
  getPrivateProductIds,
  getPrivateRoomByUserId,
  shopifyService,
} from '@/modules/shopify/service'
import { type Product } from '@/modules/shopify/types'

import { Client } from './Client'

interface PrivateRoomProduct {
  id: string
  privateRoomId: string
  productId: string
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  try {
    const session = await getServerSession()
    const privateProductIds = await getPrivateProductIds()

    let productResponse
    let product

    try {
      productResponse = await api.getProductByHandle(handle)
      product = productResponse?.data
    } catch (error) {
      if (!session) {
        notFound()
      }
      product = null
    }

    if (!product) {
      notFound()
    }

    if (privateProductIds.includes(product.id)) {
      if (!session) {
        notFound()
      }

      const userRoles = session.user.roles
      const isAdminOrManager = userRoles.includes('admin') || userRoles.includes('manager')
      const isVipCustomer = userRoles.includes('vip_customer')

      if (isAdminOrManager) {
      } else if (isVipCustomer) {
        try {
          const userPrivateRoom = await getPrivateRoomByUserId(session.user.id)

          if (
            !userPrivateRoom?.products.some((p: PrivateRoomProduct) => p.productId === product.id)
          ) {
            notFound()
          }
        } catch (privateRoomError) {
          notFound()
        }
      } else {
        notFound()
      }
    }

    let relatedProducts: Product[] = []
    try {
      relatedProducts = await shopifyService.getRelatedProducts(product)
    } catch (relatedError) {
      relatedProducts = []
    }

    return <Client product={product} relatedProducts={relatedProducts} />
  } catch (error) {
    notFound()
  }
}
