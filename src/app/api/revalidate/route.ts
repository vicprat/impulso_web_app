import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

import { CacheManager } from '@/lib/cache'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const path = searchParams.get('path')
    const tag = searchParams.get('tag')
    const type = searchParams.get('type')

    // También verificar el body JSON si no hay query parameters
    let bodyData: any = {}
    try {
      bodyData = await request.json()
    } catch {
      // Si no hay body JSON, continuar con query parameters
    }

    // Usar token del header Authorization o del body
    const authHeader = request.headers.get('authorization')
    const authToken = authHeader?.replace('Bearer ', '')
    const finalToken = token || authToken || bodyData.token

    // Verificar token de seguridad
    if (finalToken !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Usar datos del body o query parameters
    const finalType = type || bodyData.type
    const finalPath = path || bodyData.path
    const finalTag = tag || bodyData.tag
    const productId = bodyData.productId

    // Revalidar por tipo
    if (finalType) {
      switch (finalType) {
        case 'products':
          CacheManager.revalidateProducts()
          break
        case 'inventory':
          CacheManager.revalidateInventory()
          if (productId) {
            CacheManager.revalidateProducts(productId)
          }
          break
        case 'artists':
          CacheManager.revalidateArtists()
          break
        case 'collections':
          CacheManager.revalidateCollections()
          break
        case 'homepage':
          CacheManager.revalidateHomepage()
          break
        case 'all':
          CacheManager.revalidateProducts()
          CacheManager.revalidateInventory()
          CacheManager.revalidateArtists()
          CacheManager.revalidateCollections()
          CacheManager.revalidateHomepage()
          break
        default:
          return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
      }
    }

    // Revalidar por path específico
    if (finalPath) {
      revalidatePath(finalPath)
    }

    // Revalidar por tag específico
    if (finalTag) {
      revalidateTag(finalTag, 'max')
    }

    return NextResponse.json({
      message: 'Cache revalidated successfully',
      revalidated: {
        path: finalPath,
        tag: finalTag,
        type: finalType,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error revalidating cache:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// TEST TO REVALIDATE IN "Health Check"
export async function GET() {
  return NextResponse.json({
    availableTypes: ['products', 'inventory', 'artists', 'collections', 'homepage', 'all'],
    message: 'Cache revalidation endpoint is active',
    timestamp: new Date().toISOString(),
    usage: {
      revalidateByPath: 'POST /api/revalidate?token=YOUR_TOKEN&path=/store',
      revalidateByTag: 'POST /api/revalidate?token=YOUR_TOKEN&tag=products',
      revalidateByType: 'POST /api/revalidate?token=YOUR_TOKEN&type=products',
    },
  })
}
