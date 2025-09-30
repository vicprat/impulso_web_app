import { type NextRequest, NextResponse } from 'next/server'

import { getPublicArtists } from '@/lib/landing-data'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const artistType = searchParams.get('type') as 'IMPULSO' | 'COLLECTIVE' | null

    if (artistType && !['IMPULSO', 'COLLECTIVE'].includes(artistType)) {
      return NextResponse.json({ error: 'Tipo de artista inválido' }, { status: 400 })
    }

    const artists = await getPublicArtists(artistType || undefined)

    return NextResponse.json({ artists })
  } catch (error) {
    console.error('Error fetching public artists:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}