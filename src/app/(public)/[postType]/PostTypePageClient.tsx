'use client'

import { Filter, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Card as ProductCard } from '@/components/Card'
import { BlogCard } from '@/components/Card/Blog'
import { Pagination } from '@/components/Pagination/Pagination'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { type Event } from '@/models/Event'
import { useCategories, usePosts, useTags } from '@/modules/blog/hooks'
import {
  type Category,
  type PaginatedResult,
  type PostWithRelations,
  type Tag,
} from '@/modules/blog/types'
import { publicEventService } from '@/services/event/publicService'

import { Loader } from './components/Loader'

import type { PostSortField } from '@/modules/blog/types'

interface State {
  searchTerm: string
  selectedCategories: string[]
  selectedTags: string[]
  sortField: PostSortField
  sortOrder: 'asc' | 'desc'
  currentPage: number
  storeEvents: Event[]
  storeEventsLoading: boolean
  storeEventsError: string | null
}

const INITIAL_STATE: State = {
  currentPage: 1,
  searchTerm: '',
  selectedCategories: [],
  selectedTags: [],
  sortField: 'publishedAt',
  sortOrder: 'desc',
  storeEvents: [],
  storeEventsError: null,
  storeEventsLoading: false,
}

interface Props {
  postType: string
  initialPosts: PaginatedResult<PostWithRelations>
  initialCategories: Category[]
  initialTags: Tag[]
}

export const PostTypePageClient: React.FC<Props> = ({
  initialCategories,
  initialPosts,
  initialTags,
  postType,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [state, setState] = useState(INITIAL_STATE)

  const validPostType = postType.toUpperCase()
  const isValidPostType =
    validPostType === 'BLOG' || validPostType === 'EVENT' || validPostType === 'EVENTS'

  const apiPostType = validPostType === 'EVENTS' ? 'EVENT' : validPostType

  const shouldRefetch =
    state.currentPage !== 1 ||
    state.searchTerm !== '' ||
    state.selectedCategories.length > 0 ||
    state.selectedTags.length > 0 ||
    state.sortField !== 'publishedAt' ||
    state.sortOrder !== 'desc'

  const { data: postsData, isLoading } = usePosts({
    categoryId: state.selectedCategories[0],
    page: state.currentPage,
    postType: apiPostType as 'BLOG' | 'EVENT',
    q: state.searchTerm,
    sortBy: state.sortField,
    sortOrder: state.sortOrder,
    tagId: state.selectedTags[0],
  })

  const { data: categoriesData } = useCategories()
  const { data: tagsData } = useTags()

  const posts = shouldRefetch ? postsData : initialPosts
  const categories = categoriesData ?? initialCategories
  const tags = tagsData ?? initialTags

  const filteredPosts = posts?.items ?? []

  const clearFilters = () => {
    setState(() => ({ ...INITIAL_STATE }))
  }

  const handlePageChange = (page: number) => {
    setState((previous) => ({ ...previous, currentPage: page }))
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
      return 'Descubre nuestros eventos, con los que vivirás experiencias artísticas únicas'
    }
    return 'Explora contenido interesante'
  }

  useEffect(() => {
    const params = new URLSearchParams()
    if (state.searchTerm) params.set('search', state.searchTerm)
    if (state.selectedCategories.length > 0)
      params.set('categories', state.selectedCategories.join(','))
    if (state.selectedTags.length > 0) params.set('tags', state.selectedTags.join(','))
    if (state.sortField !== 'publishedAt') params.set('sort', state.sortField)
    if (state.sortOrder !== 'desc') params.set('order', state.sortOrder)

    const newUrl = `${pathname}?${params.toString()}`
    router.replace(newUrl)
  }, [
    state.searchTerm,
    state.selectedCategories,
    state.selectedTags,
    state.sortField,
    state.sortOrder,
    pathname,
    router,
  ])

  useEffect(() => {
    const search = searchParams.get('search')
    const categories = searchParams.get('categories')
    const tags = searchParams.get('tags')
    const sort = searchParams.get('sort')
    const order = searchParams.get('order')

    if (search) setState((previous) => ({ ...previous, searchTerm: search }))
    if (categories)
      setState((previous) => ({ ...previous, selectedCategories: categories.split(',') }))
    if (tags) setState((previous) => ({ ...previous, selectedTags: tags.split(',') }))
    if (sort) setState((previous) => ({ ...previous, sortField: sort as PostSortField }))
    if (order) setState((previous) => ({ ...previous, sortOrder: order as 'asc' | 'desc' }))
  }, [searchParams])

  useEffect(() => {
    if (!isValidPostType) {
      router.push('/')
    }
  }, [isValidPostType, router])

  useEffect(() => {
    if (validPostType === 'EVENTS') {
      const fetchStoreEvents = async () => {
        try {
          setState((previous) => ({
            ...previous,
            storeEventsError: null,
            storeEventsLoading: true,
          }))
          const response = await publicEventService.getPublicEvents({
            first: 50,
          })
          setState((previous) => ({ ...previous, storeEvents: response.events }))
        } catch {
          setState((previous) => ({
            ...previous,
            storeEventsError: 'Error al cargar los eventos del store',
          }))
        } finally {
          setState((previous) => ({ ...previous, storeEventsLoading: false }))
        }
      }

      void fetchStoreEvents()
    }
  }, [validPostType])

  if (!isValidPostType) {
    return null
  }

  if (validPostType !== 'EVENTS' && isLoading) {
    return <Loader.List />
  }

  if (validPostType === 'EVENTS' && (state.storeEventsLoading || isLoading)) {
    return <Loader.List />
  }

  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-foreground'>{getPageTitle()}</h1>
          <p className='text-lg text-muted-foreground'>{getPageDescription()}</p>
        </div>

        {validPostType !== 'EVENTS' && (
          <Card className='mb-8 bg-card p-6 shadow-elevation-1'>
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    className='pl-10'
                    placeholder='Buscar artículos...'
                    value={state.searchTerm}
                    onChange={(e) =>
                      setState((previous) => ({ ...previous, searchTerm: e.target.value }))
                    }
                  />
                </div>
                <Button variant='outline' onClick={clearFilters}>
                  Limpiar
                </Button>
              </div>

              <div className='grid gap-3 md:grid-cols-4'>
                <select
                  className='rounded-md border border-input bg-background px-3 py-2 text-sm'
                  value={state.sortField}
                  onChange={(e) =>
                    setState((previous) => ({
                      ...previous,
                      sortField: e.target.value as PostSortField,
                    }))
                  }
                >
                  <option value='publishedAt'>Fecha de publicación</option>
                  <option value='title'>Título</option>
                  <option value='createdAt'>Fecha de creación</option>
                </select>

                <select
                  className='rounded-md border border-input bg-background px-3 py-2 text-sm'
                  value={state.sortOrder}
                  onChange={(e) =>
                    setState((previous) => ({
                      ...previous,
                      sortOrder: e.target.value as 'asc' | 'desc',
                    }))
                  }
                >
                  <option value='desc'>Descendente</option>
                  <option value='asc'>Ascendente</option>
                </select>

                <select
                  className='rounded-md border border-input bg-background px-3 py-2 text-sm'
                  value={state.selectedCategories[0] ?? ''}
                  onChange={(e) =>
                    setState((previous) => ({
                      ...previous,
                      selectedCategories: e.target.value ? [e.target.value] : [],
                    }))
                  }
                >
                  <option value=''>Todas las categorías</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  className='rounded-md border border-input bg-background px-3 py-2 text-sm'
                  value={state.selectedTags[0] ?? ''}
                  onChange={(e) =>
                    setState((previous) => ({
                      ...previous,
                      selectedTags: e.target.value ? [e.target.value] : [],
                    }))
                  }
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

        {validPostType === 'EVENTS' ? (
          <>
            <div className='mb-12'>
              {state.storeEventsError && (
                <Card className='bg-card p-12 text-center shadow-elevation-1'>
                  <div className='text-red-500'>{state.storeEventsError}</div>
                </Card>
              )}

              {state.storeEvents.length === 0 && !state.storeEventsError ? (
                <></>
              ) : (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                  {state.storeEvents.map((event) => (
                    <ProductCard.Product key={event.id} product={event} />
                  ))}
                </div>
              )}
            </div>

            <div className='mb-12'>
              <h2 className='mb-6 text-2xl font-bold text-foreground'>Eventos Pasados</h2>

              {filteredPosts.length > 0 ? (
                <>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {filteredPosts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>

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
                    <h3 className='text-xl font-semibold text-foreground'>
                      No hay posts de eventos
                    </h3>
                    <p className='text-muted-foreground'>
                      No hay posts de eventos disponibles en este momento.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </>
        ) : (
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
                  <h3 className='text-xl font-semibold text-foreground'>
                    No se encontraron artículos
                  </h3>
                  <p className='text-muted-foreground'>
                    Intenta ajustar los filtros o la búsqueda para encontrar más contenido.
                  </p>
                </div>
              </Card>
            )}

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
    </div>
  )
}
