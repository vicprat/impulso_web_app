import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { isValidOption } from '@/src/config/options'

import { Client } from './Client'
import { ArtistsClient } from '../artists/ArtistsClient'

interface PageProps {
  params: Promise<{ name: string }>
}

export default async function OptionsPage({ params }: PageProps) {
  const { name } = await params

  if (name === 'artists') {
    return (
      <Suspense>
        <ArtistsClient />
      </Suspense>
    )
  }

  if (!isValidOption(name)) {
    notFound()
  }

  return (
    <Suspense>
      <Client optionName={name} />
    </Suspense>
  )
}
