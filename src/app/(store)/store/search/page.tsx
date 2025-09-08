import { Suspense } from 'react'

import { Client } from './Client'

// Metadatos estáticos para la página de búsqueda
export const metadata = {
  description:
    'Encuentra las obras de arte perfectas en nuestra galería. Busca por artista, estilo, técnica o palabra clave.',
  robots: 'index, follow',
  title: 'Buscar productos - Impulso Galería',
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className='flex h-64 items-center justify-center'>
          <div className='size-12 animate-spin rounded-full border-y-2 border-blue-600'></div>
        </div>
      }
    >
      <Client />
    </Suspense>
  )
}
