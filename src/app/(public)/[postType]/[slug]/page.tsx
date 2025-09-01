import { Suspense } from 'react'

import { PostDetailPageClient } from '../PostDetailPageClient'

// Componente de Loading Skeleton
const PostDetailSkeleton = () => {
  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto max-w-4xl px-4 py-8'>
        {/* Botón de regreso skeleton */}
        <div className='mb-6'>
          <div className='h-10 w-24 animate-pulse rounded-md bg-muted' />
        </div>

        {/* Header skeleton */}
        <div className='mb-8'>
          <div className='mb-4 flex gap-2'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className='h-6 w-20 animate-pulse rounded-full bg-muted' />
            ))}
          </div>
          <div className='mb-4 h-12 w-full animate-pulse rounded bg-muted' />
          <div className='mb-4 h-6 w-3/4 animate-pulse rounded bg-muted' />
          <div className='flex items-center gap-4'>
            <div className='h-5 w-32 animate-pulse rounded bg-muted' />
            <div className='h-5 w-24 animate-pulse rounded bg-muted' />
          </div>
        </div>

        {/* Imagen destacada skeleton */}
        <div className='mb-8'>
          <div className='aspect-[16/9] w-full animate-pulse rounded-lg bg-muted' />
        </div>

        {/* Contenido skeleton */}
        <div className='space-y-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <div className='h-4 w-full animate-pulse rounded bg-muted' />
              <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Wrapper con Suspense
export default async function PostDetailPageWrapper({
  params
}: {
  params: Promise<{ postType: string; slug: string }>
}) {
  const resolvedParams = await params

  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <PostDetailPageClient postType={resolvedParams.postType} slug={resolvedParams.slug} />
    </Suspense>
  )
}
