import { NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { cleanupOrphanedArtists, getOrphanedArtists } from '@/modules/user/user.service'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)

    const orphanedArtists = await getOrphanedArtists()

    return NextResponse.json({
      orphanedArtists,
      count: orphanedArtists.length,
    })
  } catch (error) {
    console.error('Error al obtener artistas huérfanos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST() {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)

    const cleanedCount = await cleanupOrphanedArtists()

    return NextResponse.json({
      success: true,
      message: `Se limpiaron ${cleanedCount} artistas huérfanos`,
      cleanedCount,
    })
  } catch (error) {
    console.error('Error al limpiar artistas huérfanos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 