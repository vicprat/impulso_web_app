'use client'

import { Card } from '@/components/Card'
import { useCollections } from '@/services/collection/hooks'

import type { Collection } from '@/services/collection/types'

export default function Page() {
  const {
    data: collectionsData,
    error,
    isLoading,
  } = useCollections({
    limit: 250,
  })

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='size-12 animate-spin rounded-full border-y-2 border-primary'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='py-12 text-center'>
        <p className='text-lg text-error'>Error al cargar las colecciones</p>
        <button
          onClick={() => window.location.reload()}
          className='hover:bg-primary/90 mt-4 rounded bg-primary px-4 py-2 text-white'
        >
          Reintentar
        </button>
      </div>
    )
  }

  const collections = collectionsData?.collections ?? []

  return (
    <div>
      {collections.length > 0 ? (
        <Card.Container>
          {collections.map((collection: Collection) => (
            <Card.Collection key={collection.id} collection={collection} />
          ))}
        </Card.Container>
      ) : (
        <div className='py-12 text-center'>
          <p className='text-lg text-muted-foreground'>No se encontraron colecciones</p>
        </div>
      )}
    </div>
  )
}
