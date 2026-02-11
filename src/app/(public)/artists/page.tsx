import { Users } from 'lucide-react'

import { Grid } from './components/Grid'

import type { Metadata } from 'next'

import { getPublicArtists } from '@/lib/landing-data'
import { routeMetadata } from '@/lib/metadata'

export const metadata: Metadata = routeMetadata['/artists']
export const dynamic = 'force-dynamic'

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  try {
    const params = await searchParams

    const artistType =
      params.type === 'collective'
        ? 'COLLECTIVE'
        : params.type === 'impulso'
          ? 'IMPULSO'
          : undefined

    const artists = await getPublicArtists(artistType)

    return <Grid artists={artists} />
  } catch {
    return (
      <main className='container mx-auto px-4 py-8'>
        <div className='py-16 text-center'>
          <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-error-container'>
            <Users className='size-8 text-error' />
          </div>
          <h2 className='mb-2 text-xl font-semibold text-foreground'>Error al cargar artistas</h2>
          <p className='text-muted-foreground'>
            No pudimos cargar la información de los artistas. Por favor, intenta más tarde.
          </p>
        </div>
      </main>
    )
  }
}
