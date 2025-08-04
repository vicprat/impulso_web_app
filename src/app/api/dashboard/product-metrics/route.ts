import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/src/config/Permissions'
import { type Product } from '@/src/models/Product'
import { requirePermission } from '@/src/modules/auth/server/server'
import { productService } from '@/src/services/product/service'

export async function GET() {
  try {
    const session = await requirePermission(PERMISSIONS.VIEW_ANALYTICS)

    const { products } = await productService.getProducts({ limit: 100 }, session)

    const data = {
      activeProducts: products.filter((p) => p.status === 'ACTIVE').length,
      archivedProducts: products.filter((p) => p.status === 'ARCHIVED').length,
      averagePrice:
        products.length > 0
          ? products.reduce(
            (sum: number, p: Product) => sum + parseFloat(p.primaryVariant?.price?.amount ?? '0'),
            0
          ) / products.length
          : 0,
      draftProducts: products.filter((p) => p.status === 'DRAFT').length,
      productsByArtist: products.reduce(
        (acc: Record<string, number>, product: Product) => {
          const artist = product.vendor ?? 'Sin artista'
          acc[ artist ] = (acc[ artist ] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      productsByCategory: products.reduce(
        (acc: Record<string, number>, product: Product) => {
          const category = product.productType ?? 'Sin categoría'
          acc[ category ] = (acc[ category ] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      totalInventoryValue: products.reduce(
        (sum: number, p: Product) => sum + parseFloat(p.primaryVariant?.price?.amount ?? '0'),
        0
      ),
      totalProducts: products.length,
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching product metrics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
