'use client'

import { Filter, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

import { BlogCard } from '@/components/Card/Blog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCategories, usePosts, useTags } from '@/modules/blog/hooks'

import type { PostSortField } from '@/modules/blog/types'

// Componente de Loading Skeleton elegante
const BlogPageSkeleton = () => {
  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        {/* Header Skeleton */}
        <div className='mb-8'>
          <div className='mb-2 h-8 w-24 animate-pulse rounded bg-muted' />
          <div className='h-5 w-80 animate-pulse rounded bg-muted' />
        </div>

        {/* Filtros Skeleton */}
        <div className='mb-8'>
          <Card className='bg-card p-6 shadow-elevation-1'>
            <div className='space-y-4'>
              {/* Search bar skeleton */}
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                </div>
                <div className='h-10 w-20 animate-pulse rounded-md bg-muted' />
              </div>

              {/* Filtros grid skeleton */}
              <div className='grid gap-3 md:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='h-10 animate-pulse rounded-md bg-muted' />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Posts Grid Skeleton */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className='overflow-hidden bg-card shadow-elevation-1'>
              {/* Image skeleton */}
              <div className='aspect-[4/3] animate-pulse bg-muted' />

              <CardContent className='space-y-3 p-4'>
                {/* Badges skeleton */}
                <div className='flex gap-2'>
                  <div className='h-5 w-16 animate-pulse rounded-full bg-muted' />
                  <div className='h-5 w-20 animate-pulse rounded-full bg-muted' />
                </div>

                {/* Title skeleton */}
                <div className='space-y-2'>
                  <div className='h-6 w-full animate-pulse rounded bg-muted' />
                  <div className='h-6 w-3/4 animate-pulse rounded bg-muted' />
                </div>

                {/* Content skeleton */}
                <div className='space-y-2'>
                  {[ 1, 2, 3 ].map((j) => (
                    <div key={j} className='h-4 w-full animate-pulse rounded bg-muted' />
                  ))}
                </div>

                {/* Metadata skeleton */}
                <div className='flex justify-between border-t border-border pt-2'>
                  <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                  <div className='h-4 w-16 animate-pulse rounded bg-muted' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className='mt-12'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='h-10 w-24 animate-pulse rounded bg-muted' />
            <div className='h-5 w-48 animate-pulse rounded bg-muted' />
            <div className='h-10 w-24 animate-pulse rounded bg-muted' />
          </div>
        </div>

        {/* Floating loading indicator */}
        <div className='fixed bottom-6 right-6 z-50'>
          <Card className='bg-card/90 border-primary/20 shadow-elevation-3 backdrop-blur-sm'>
            <CardContent className='flex items-center gap-3 p-4'>
              <div className='size-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              <span className='text-sm font-medium text-foreground'>Cargando artículos...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Componente Container
const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {children}
    </div>
  )
}

// Componente Select personalizado
const Select = ({ children, className = '', onChange, placeholder, value }: {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
}) => {
  return (
    <select
      className={`focus:ring-primary/20 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-container focus:outline-none focus:ring-2 ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value=''>{placeholder}</option>}
      {children}
    </select>
  )
}

// Componente principal
function BlogPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const q = searchParams.get('q') ?? ''
  const categoryId = searchParams.get('category') ?? undefined
  const tagId = searchParams.get('tag') ?? undefined
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? '12')
  const sortBy = (searchParams.get('sortBy') as PostSortField | null) ?? 'publishedAt'
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? 'desc'

  const filters = useMemo(() => ({
    categoryId,
    page,
    pageSize,
    q,
    sortBy,
    sortOrder,
    status: 'PUBLISHED' as const,
    tagId
  }), [ q, categoryId, tagId, page, pageSize, sortBy, sortOrder ])

  const { data, isLoading } = usePosts(filters)
  const { data: cats } = useCategories()
  const { data: tags } = useTags()

  const [ localQ, setLocalQ ] = useState(q)
  useEffect(() => {
    setLocalQ(q)
  }, [ q ])

  const updateQuery = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([ key, value ]) => {
      if (value === undefined || value === '') params.delete(key)
      else params.set(key, String(value))
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  const hasActiveFilters = [ Boolean(q), Boolean(categoryId), Boolean(tagId), sortBy !== 'publishedAt' ]
    .some((v) => v)

  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-foreground'>Blog</h1>
          <p className='text-muted-foreground'>
            Descubre artículos sobre arte, cultura y creatividad
          </p>
        </div>

        {/* Filtros */}
        <div className='mb-8'>
          <Card className='bg-card p-6 shadow-elevation-1'>
            <div className='space-y-4'>
              {/* Barra de búsqueda controlada (solo busca al enviar) */}
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Buscar artículos...'
                    value={localQ}
                    onChange={(e) => setLocalQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateQuery({ page: 1, q: localQ || undefined })
                      }
                    }}
                    className='border-border bg-surface-container pl-10'
                  />
                </div>
                <Button
                  onClick={() => updateQuery({ page: 1, q: localQ || undefined })}
                  className='hover:bg-primary/90 shrink-0 bg-primary text-on-primary'
                >
                  Buscar
                </Button>
              </div>

              {/* Filtros en grid */}
              <div className='grid gap-3 md:grid-cols-4'>
                <Select
                  value={categoryId ?? ''}
                  onChange={(value) => updateQuery({ category: value || undefined, page: 1 })}
                  placeholder='Todas las categorías'
                >
                  {cats?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>

                <Select
                  value={tagId ?? ''}
                  onChange={(value) => updateQuery({ page: 1, tag: value || undefined })}
                  placeholder='Todos los tags'
                >
                  {tags?.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>

                <Select
                  value={sortBy}
                  onChange={(value) => updateQuery({ page: 1, sortBy: value })}
                  placeholder='Ordenar por'
                >
                  <option value='publishedAt'>Más recientes</option>
                  <option value='title'>Título A-Z</option>
                  <option value='createdAt'>Fecha de creación</option>
                  <option value='updatedAt'>Última actualización</option>
                </Select>

                <Select
                  value={sortOrder}
                  onChange={(value) => updateQuery({ page: 1, sortOrder: value })}
                  placeholder='Orden'
                >
                  <option value='desc'>Descendente</option>
                  <option value='asc'>Ascendente</option>
                </Select>
              </div>

              {/* Botón limpiar filtros */}
              {hasActiveFilters && (
                <div className='flex items-center justify-between border-t border-border pt-2'>
                  <span className='text-sm text-muted-foreground'>
                    {data?.total ?? 0} artículos encontrados
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={clearFilters}
                    className='text-xs'
                  >
                    <Filter className='mr-1 size-3' />
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Container>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className='bg-card shadow-elevation-1'>
                <div className='aspect-[4/3] animate-pulse bg-muted' />
                <CardContent className='space-y-3 p-4'>
                  <div className='flex gap-2'>
                    <div className='h-5 w-16 animate-pulse rounded-full bg-muted' />
                    <div className='h-5 w-20 animate-pulse rounded-full bg-muted' />
                  </div>
                  <div className='space-y-2'>
                    <div className='h-6 w-full animate-pulse rounded bg-muted' />
                    <div className='h-6 w-3/4 animate-pulse rounded bg-muted' />
                  </div>
                  <div className='space-y-2'>
                    {[ 1, 2, 3 ].map((i) => (
                      <div key={i} className='h-4 w-full animate-pulse rounded bg-muted' />
                    ))}
                  </div>
                  <div className='flex justify-between pt-2'>
                    <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                    <div className='h-4 w-16 animate-pulse rounded bg-muted' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </Container>
        )}

        {/* Posts Grid */}
        {!isLoading && data?.items && data.items.length > 0 && (
          <Container>
            {data.items.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </Container>
        )}

        {/* Empty State */}
        {!isLoading && (!data?.items || data.items.length === 0) && (
          <div className='flex flex-col items-center justify-center py-16'>
            <div className='mb-4 flex size-24 items-center justify-center rounded-full bg-muted'>
              <Search className='size-8 text-muted-foreground' />
            </div>
            <h3 className='mb-2 text-lg font-semibold text-foreground'>
              No se encontraron artículos
            </h3>
            <p className='max-w-md text-center text-muted-foreground'>
              {hasActiveFilters
                ? 'Intenta ajustar los filtros o términos de búsqueda.'
                : 'Aún no hay artículos publicados.'}
            </p>
            {hasActiveFilters && (
              <Button
                variant='outline'
                onClick={clearFilters}
                className='mt-4'
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {/* Paginación */}
        {data && data.totalPages > 1 && (
          <div className='mt-12'>
            <Card className='bg-card p-6 shadow-elevation-1'>
              <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                <Button
                  disabled={!data.hasPreviousPage || isLoading}
                  onClick={() => updateQuery({ page: Math.max(1, page - 1) })}
                  variant='outline'
                  className='w-full sm:w-auto'
                >
                  ← Anterior
                </Button>

                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <span>
                    Página <span className='font-medium text-foreground'>{data.page}</span> de{' '}
                    <span className='font-medium text-foreground'>{data.totalPages}</span>
                  </span>
                  <span className='hidden sm:inline'>
                    • {data.total} artículos en total
                  </span>
                </div>

                <Button
                  disabled={!data.hasNextPage || isLoading}
                  onClick={() => updateQuery({ page: page + 1 })}
                  className='hover:bg-primary/90 w-full bg-primary text-on-primary sm:w-auto'
                >
                  Siguiente →
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PublicBlogPage() {
  return (
    <Suspense fallback={<BlogPageSkeleton />}>
      <BlogPageContent />
    </Suspense>
  )
}