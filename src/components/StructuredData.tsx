'use client'

import {
  generateArticleStructuredData,
  generateArtistStructuredData,
  generateBreadcrumbStructuredData,
  generateEventStructuredData,
  generateProductStructuredData,
  generateSiteNavigationStructuredData,
  organizationStructuredData,
  websiteStructuredData,
} from '@/lib/structured-data'

interface StructuredDataProps {
  data?: Record<string, unknown> | Record<string, unknown>[]
  type?: 'organization' | 'website' | 'custom'
}

export function StructuredData({ data, type = 'custom' }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return organizationStructuredData
      case 'website':
        return websiteStructuredData
      default:
        return data
    }
  }

  const structuredData = getStructuredData()

  if (!structuredData) return null

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// Componente específico para la página de inicio
export function HomeStructuredData() {
  return (
    <>
      <StructuredData type='organization' />
      <StructuredData type='website' />
      <StructuredData data={generateSiteNavigationStructuredData()} />
    </>
  )
}

// Componente para datos estructurados de artista
export function ArtistStructuredData({
  artist,
}: {
  artist: {
    firstName: string
    lastName: string
    email: string
    profile?: {
      occupation?: string
      bio?: string
      avatarUrl?: string
    }
    products?: {
      id: string
      title: string
      description?: string
      images?: string[]
      price?: number
    }[]
  }
}) {
  const structuredData = generateArtistStructuredData(artist)

  return <StructuredData data={structuredData} />
}

// Componente para datos estructurados de producto
export function ProductStructuredData({
  product,
}: {
  product: {
    id: string
    title: string
    description?: string
    images?: string[]
    price?: number
    artist?: string
    category?: string
  }
}) {
  const structuredData = generateProductStructuredData(product)

  return <StructuredData data={structuredData} />
}

// Componente para datos estructurados de evento
export function EventStructuredData({
  event,
}: {
  event: {
    title: string
    description?: string
    startDate?: string
    endDate?: string
    location?: string
    images?: string[]
    organizer?: string
  }
}) {
  const structuredData = generateEventStructuredData(event)

  return <StructuredData data={structuredData} />
}

// Componente para breadcrumbs
export function BreadcrumbStructuredData({
  items,
}: {
  items: {
    name: string
    url: string
  }[]
}) {
  const structuredData = generateBreadcrumbStructuredData(items)

  return <StructuredData data={structuredData} />
}

// Componente para artículo
export function ArticleStructuredData({
  article,
}: {
  article: {
    title: string
    description?: string
    author?: string
    publishDate?: string
    modifiedDate?: string
    images?: string[]
    url: string
  }
}) {
  const structuredData = generateArticleStructuredData(article)

  return <StructuredData data={structuredData} />
}
