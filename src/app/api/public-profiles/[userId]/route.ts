import { NextResponse } from 'next/server'

import { api as shopifyApi } from '@/modules/shopify/api'
import { getPublicProfileByUserId } from '@/modules/user/user.service'

import type { Product } from '@/src/modules/shopify/types'

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const userProfile = await getPublicProfileByUserId(userId)

    if (!userProfile) {
      return NextResponse.json({ error: 'Public profile not found' }, { status: 404 })
    }

    let products: Product[] = []
    if (userProfile.roles.includes('artist') && userProfile.artist?.name) {
      try {
        const productData = await shopifyApi.getProducts({
          filters: { vendor: [userProfile.artist.name] },
          first: 10,
        })
        products = productData.data.products
      } catch (productError) {
        console.error('[API/public-profiles/userId GET] Error fetching products:', productError)
      }
    }

    const responseData = {
      ...userProfile,
      products,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('[API/public-profiles/userId GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
