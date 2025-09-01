'use client'

import { Filter, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Card as ProductCard } from '@/components/Card'
import { BlogCard } from '@/components/Card/Blog'
import { Pagination } from '@/components/Pagination/Pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { type Event } from '@/models/Event'
import { useCategories, usePosts, useTags } from '@/modules/blog/hooks'
import { publicEventService } from '@/services/event/publicService'

import type { PostSortField } from '@/modules/blog/types'

// Componente de Loading Skeleton elegante
const PostTypePageSkeleton = () => {
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

// Componente principal de la página
export function PostTypePageClient({ postType }: { postType: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [ searchTerm, setSearchTerm ] = useState('')
  const [ selectedCategories, setSelectedCategories ] = useState<string[]>([])
  const [ selectedTags, setSelectedTags ] = useState<string[]>([])
  const [ sortField, setSortField ] = useState<PostSortField>('publishedAt')
  const [ sortOrder, setSortOrder ] = useState<'asc' | 'desc'>('desc')
  const [ currentPage, setCurrentPage ] = useState(1)

  // Estado para eventos del store
  const [ storeEvents, setStoreEvents ] = useState<Event[]>([])
  const [ storeEventsLoading, setStoreEventsLoading ] = useState(false)
  const [ storeEventsError, setStoreEventsError ] = useState<string | null>(null)

  // Validar que el tipo de post sea válido
  const validPostType = postType.toUpperCase()
  const isValidPostType = validPostType === 'BLOG' || validPostType === 'EVENT' || validPostType === 'EVENTS'

  // Mapear 'events' a 'EVENT' para la API de posts
  const apiPostType = validPostType === 'EVENTS' ? 'EVENT' : validPostType

  // Obtener datos - los hooks deben llamarse siempre
  const { data: posts, isLoading } = usePosts({
    categoryId: selectedCategories[ 0 ],
    page: currentPage,
    postType: apiPostType as 'BLOG' | 'EVENT',
    q: searchTerm,
    sortBy: sortField,
    sortOrder,
    tagId: selectedTags[ 0 ],
  })

  const { data: categories } = useCategories()
  const { data: tags } = useTags()

  // Actualizar URL cuando cambien los filtros
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','))
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','))
    if (sortField !== 'publishedAt') params.set('sort', sortField)
    if (sortOrder !== 'desc') params.set('order', sortOrder)

    const newUrl = `${pathname}?${params.toString()}`
    router.replace(newUrl)
  }, [ searchTerm, selectedCategories, selectedTags, sortField, sortOrder, pathname, router ])

  // Cargar filtros desde URL al montar el componente
  useEffect(() => {
    const search = searchParams.get('search')
    const categories = searchParams.get('categories')
    const tags = searchParams.get('tags')
    const sort = searchParams.get('sort')
    const order = searchParams.get('order')

    if (search) setSearchTerm(search)
    if (categories) setSelectedCategories(categories.split(','))
    if (tags) setSelectedTags(tags.split(','))
    if (sort) setSortField(sort as PostSortField)
    if (order) setSortOrder(order as 'asc' | 'desc')
  }, [ searchParams ])

  // Redirigir si el tipo no es válido
  useEffect(() => {
    if (!isValidPostType) {
      router.push('/')
    }
  }, [ isValidPostType, router ])

  // Cargar eventos del store cuando postType sea "events"
  useEffect(() => {
    if (validPostType === 'EVENTS') {
      const fetchStoreEvents = async () => {
        try {
          setStoreEventsLoading(true)
          setStoreEventsError(null)
          const response = await publicEventService.getPublicEvents({
            first: 50,
          })
          setStoreEvents(response.events)
        } catch (err) {
          setStoreEventsError('Error al cargar los eventos del store')
          console.error('Error fetching store events:', err)
        } finally {
          setStoreEventsLoading(false)
        }
      }

      void fetchStoreEvents()
    }
  }, [ validPostType ])

  // Los posts ya vienen filtrados del backend, no necesitamos filtrar aquí
  const filteredPosts = posts?.items ?? []

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedTags([])
    setSortField('publishedAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }

  const getPageTitle = () => {
    if (validPostType === 'BLOG') return 'Blog'
    if (validPostType === 'EVENT') return 'Eventos'
    if (validPostType === 'EVENTS') return 'Eventos'
    return 'Posts'
  }

  const getPageDescription = () => {
    if (validPostType === 'BLOG') {
      return 'Descubre artículos interesantes sobre arte, cultura y más'
    }
    if (validPostType === 'EVENT') {
      return 'Explora eventos emocionantes y únete a nuestra comunidad'
    }
    if (validPostType === 'EVENTS') {
      return 'Descubre eventos únicos del store y posts sobre eventos emocionantes'
    }
    return 'Explora contenido interesante'
  }

  // Si no es válido, no renderizar nada
  if (!isValidPostType) {
    return null
  }

  // Mostrar loading para posts normales
  if (validPostType !== 'EVENTS' && isLoading) {
    return <PostTypePageSkeleton />
  }

  // Mostrar loading para eventos (store + posts)
  if (validPostType === 'EVENTS' && (storeEventsLoading || isLoading)) {
    return <PostTypePageSkeleton />
  }

  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-foreground'>{getPageTitle()}</h1>
          <p className='text-lg text-muted-foreground'>{getPageDescription()}</p>
        </div>

        {/* Filtros - Solo para posts */}
        {validPostType !== 'EVENTS' && (
          <Card className='mb-8 bg-card p-6 shadow-elevation-1'>
            <div className='space-y-4'>
              {/* Barra de búsqueda */}
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    className='pl-10'
                    placeholder='Buscar artículos...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant='outline' onClick={clearFilters}>
                  Limpiar
                </Button>
              </div>

              {/* Filtros */}
              <div className='grid gap-3 md:grid-cols-4'>
                {/* Ordenar por */}
                <select
                  className='rounded-md border border-input bg-background px-3 py-2 text-sm'
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as PostSortField)}
                >
                  <option value='publishedAt'>Fecha de publicación</option>
                  <option value='title'>Título</option>
                  <option value='createdAt'>Fecha de creación</option>
                </select>

                {/* Orden */}
                <select
                  className='rounded-md border border-input bg-background px-3 py-2 text-sm'
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                >
                  <option value='desc'>Descendente</option>
                  <option value='asc'>Ascendente</option>
                </select>

                {/* Categorías */}
                <select
                  className='rounded-md border border-input bg-background px-3 py-2 text-sm'
                  value={selectedCategories[ 0 ] ?? ''}
                  onChange={(e) => setSelectedCategories(e.target.value ? [ e.target.value ] : [])}
                >
                  <option value=''>Todas las categorías</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Tags */}
                <select
                  className='rounded-md border border-input bg-background px-3 py-2 text-sm'
                  value={selectedTags[ 0 ] ?? ''}
                  onChange={(e) => setSelectedTags(e.target.value ? [ e.target.value ] : [])}
                >
                  <option value=''>Todos los tags</option>
                  {tags?.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Contenido dinámico basado en el tipo */}
        {validPostType === 'EVENTS' ? (
          // Contenido para eventos (store + posts)
          <>
            {/* Sección de eventos del store */}
            <div className='mb-12'>

              {storeEventsError && (
                <Card className='bg-card p-12 text-center shadow-elevation-1'>
                  <div className='text-red-500'>{storeEventsError}</div>
                </Card>
              )}

              {storeEvents.length === 0 && !storeEventsError ? (
                <></>
              ) : (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                  {storeEvents.map((event) => (
                    <ProductCard.Product key={event.id} product={event} />
                  ))}
                </div>
              )}
            </div>

            {/* Sección de posts de eventos */}
            <div className='mb-12'>
              <h2 className='mb-6 text-2xl font-bold text-foreground'>Posts de Eventos Pasados</h2>

              {filteredPosts.length > 0 ? (
                <>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {filteredPosts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>

                  {/* Paginación para posts de eventos */}
                  {posts && (
                    <div className='mt-8'>
                      <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                        <p className='text-sm text-muted-foreground'>
                          Mostrando {filteredPosts.length} de {posts.total} posts de eventos
                        </p>
                        <Pagination
                          currentPage={posts.page}
                          totalPages={posts.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Card className='bg-card p-12 text-center shadow-elevation-1'>
                  <div className='space-y-4'>
                    <Filter className='mx-auto size-12 text-muted-foreground' />
                    <h3 className='text-xl font-semibold text-foreground'>No hay posts de eventos</h3>
                    <p className='text-muted-foreground'>
                      No hay posts de eventos disponibles en este momento.
                    </p>
                  </div>
                </Card>
              )}
            </div>


          </>
        ) : (
          // Contenido para posts (blog y event)
          <>
            {filteredPosts.length > 0 ? (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <Card className='bg-card p-12 text-center shadow-elevation-1'>
                <div className='space-y-4'>
                  <Filter className='mx-auto size-12 text-muted-foreground' />
                  <h3 className='text-xl font-semibold text-foreground'>No se encontraron artículos</h3>
                  <p className='text-muted-foreground'>
                    Intenta ajustar los filtros o la búsqueda para encontrar más contenido.
                  </p>
                </div>
              </Card>
            )}

            {/* Paginación para posts */}
            {filteredPosts.length > 0 && posts && (
              <div className='mt-12'>
                <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                  <p className='text-sm text-muted-foreground'>
                    Mostrando {filteredPosts.length} de {posts.total} artículos
                  </p>
                  <Pagination
                    currentPage={posts.page}
                    totalPages={posts.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div >
  )
}
