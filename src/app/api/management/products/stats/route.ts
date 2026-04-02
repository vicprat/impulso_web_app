import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/config/Permissions'
import { registerGlobalCache } from '@/lib/cache'
import { requirePermission } from '@/modules/auth/server/server'
import { productService } from '@/services/product/service'

interface StatsCacheEntry {
  data: unknown
  fetchedAt: number
}
const statsCache = new Map<string, StatsCacheEntry>()
const STATS_CACHE_TTL = 2 * 60 * 1000

registerGlobalCache('management-stats', statsCache)

export async function GET(request: Request) {
  try {
    const session = await requirePermission([
      PERMISSIONS.MANAGE_PRODUCTS,
      PERMISSIONS.MANAGE_OWN_PRODUCTS,
    ])

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? undefined

    const cacheKey = `stats-${search ?? 'all'}`
    const cached = statsCache.get(cacheKey)
    const now = Date.now()
    if (cached && now - cached.fetchedAt < STATS_CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const stats = await productService.getProductStats(search, session)

    statsCache.set(cacheKey, { data: stats, fetchedAt: now })

    return NextResponse.json(stats)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Error en endpoint de stats:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
