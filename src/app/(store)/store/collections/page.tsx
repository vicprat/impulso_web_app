'use client'

import { FolderOpen, Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { Card } from '@/components/Card'
import { Pagination } from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCollections } from '@/services/collection/hooks'

import type { Collection } from '@/services/collection/types'

const defaultLimit = 24
const limitOptions = [12, 24, 36, 48]

type SortOption = 'title-asc' | 'title-desc' | 'products-desc' | 'products-asc' | 'updated-desc'

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Título (A-Z)', value: 'title-asc' },
  { label: 'Título (Z-A)', value: 'title-desc' },
  { label: 'Más productos', value: 'products-desc' },
  { label: 'Menos productos', value: 'products-asc' },
  { label: 'Más recientemente', value: 'updated-desc' },
]

const sortCollections = (collections: Collection[], sortBy: SortOption): Collection[] => {
  const sorted = [...collections]
  switch (sortBy) {
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'products-desc':
      return sorted.sort((a, b) => b.productsCount - a.productsCount)
    case 'products-asc':
      return sorted.sort((a, b) => a.productsCount - b.productsCount)
    case 'updated-desc':
      return sorted.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    default:
      return sorted
  }
}

export default function Page() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const pageInUrl = parseInt(searchParams.get('page') ?? '1', 10)
  const afterCursorInUrl = searchParams.get('after') ?? null
  const limitInUrl = parseInt(searchParams.get('limit') ?? defaultLimit.toString(), 10)
  const queryInUrl = searchParams.get('query') ?? ''
  const sortInUrl = (searchParams.get('sort') as SortOption) ?? 'title-asc'

  const [historyCursors, setHistoryCursors] = useState<Record<number, string | null>>({})
  const [previousLimit, setPreviousLimit] = useState(limitInUrl)
  const [searchQuery, setSearchQuery] = useState(queryInUrl)

  const buildSearchParams = useCallback(() => {
    return {
      cursor: afterCursorInUrl ?? undefined,
      limit: limitInUrl,
      query: queryInUrl || undefined,
    }
  }, [afterCursorInUrl, limitInUrl, queryInUrl])

  const { data: collectionsData, error, isLoading } = useCollections(buildSearchParams())

  const handlePageChange = (newPage: number) => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    let targetCursor: string | null | undefined = undefined

    if (newPage === 1) {
      targetCursor = null
    } else {
      targetCursor = historyCursors[newPage]
    }

    if (newPage > pageInUrl && newPage === pageInUrl + 1) {
      if (collectionsData?.pageInfo?.hasNextPage && collectionsData.pageInfo.endCursor) {
        targetCursor = collectionsData.pageInfo.endCursor
      }
    }

    newUrlParams.set('page', newPage.toString())
    if (targetCursor === null) {
      newUrlParams.delete('after')
    } else if (targetCursor) {
      newUrlParams.set('after', targetCursor)
    } else {
      console.warn(`Cursor para página ${newPage} no encontrado. Volviendo a página 1.`)
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
    }

    router.push(`/store/collections?${newUrlParams.toString()}`, { scroll: false })
  }

  const handleLimitChange = (value: string) => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    newUrlParams.set('limit', value)
    newUrlParams.set('page', '1')
    newUrlParams.delete('after')
    router.push(`/store/collections?${newUrlParams.toString()}`, { scroll: false })
  }

  const handleSortChange = (value: SortOption) => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    newUrlParams.set('sort', value)
    router.push(`/store/collections?${newUrlParams.toString()}`, { scroll: false })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newUrlParams = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      newUrlParams.set('query', searchQuery.trim())
    } else {
      newUrlParams.delete('query')
    }
    newUrlParams.set('page', '1')
    newUrlParams.delete('after')
    router.push(`/store/collections?${newUrlParams.toString()}`, { scroll: false })
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    const newUrlParams = new URLSearchParams(searchParams.toString())
    newUrlParams.delete('query')
    newUrlParams.set('page', '1')
    newUrlParams.delete('after')
    router.push(`/store/collections?${newUrlParams.toString()}`, { scroll: false })
  }

  const handleRetry = () => {
    router.refresh()
  }

  useEffect(() => {
    if (limitInUrl !== previousLimit) {
      setPreviousLimit(limitInUrl)
      if (pageInUrl > 1 || afterCursorInUrl) {
        const newUrlParams = new URLSearchParams(searchParams.toString())
        newUrlParams.set('page', '1')
        newUrlParams.delete('after')
        router.push(`/store/collections?${newUrlParams.toString()}`, { scroll: false })
        setHistoryCursors({})
      }
    }
  }, [limitInUrl, previousLimit, pageInUrl, afterCursorInUrl, router, searchParams])

  useEffect(() => {
    setHistoryCursors((prev) => {
      const newCursors = { ...prev }
      let changed = false

      if (newCursors[pageInUrl] !== afterCursorInUrl) {
        newCursors[pageInUrl] = afterCursorInUrl
        changed = true
      }

      if (collectionsData?.pageInfo?.hasNextPage && collectionsData.pageInfo.endCursor) {
        const nextPageNumber = pageInUrl + 1
        if (newCursors[nextPageNumber] !== collectionsData.pageInfo.endCursor) {
          newCursors[nextPageNumber] = collectionsData.pageInfo.endCursor
          changed = true
        }
      } else if (collectionsData && !collectionsData.pageInfo?.hasNextPage) {
        const nextPageNumber = pageInUrl + 1
        if (nextPageNumber in newCursors) {
          delete newCursors[nextPageNumber]
          changed = true
        }
      }

      return changed ? newCursors : prev
    })
  }, [pageInUrl, afterCursorInUrl, collectionsData])

  useEffect(() => {
    const pageStr = searchParams.get('page')
    const currentAfterCursor = searchParams.get('after')

    if (pageStr) {
      const pageNum = parseInt(pageStr, 10)
      if (pageNum > 1 && !currentAfterCursor) {
        if (collectionsData ?? error) {
          const params = new URLSearchParams(searchParams.toString())
          params.set('page', '1')
          params.delete('after')
          router.replace(`/store/collections?${params.toString()}`, { scroll: false })
        }
      }
    }
  }, [searchParams, router, collectionsData, error])

  if (isLoading) {
    return <Card.Loader />
  }

  if (error) {
    return (
      <div className='py-12 text-center'>
        <p className='text-lg text-error'>Error al cargar las colecciones</p>
        <button
          onClick={handleRetry}
          className='hover:bg-primary/90 mt-4 rounded bg-primary px-4 py-2 text-white'
        >
          Reintentar
        </button>
      </div>
    )
  }

  const collections = collectionsData?.collections ?? []
  const publishedCollections = collections.filter(
    (c: Collection) => c.publishedOnCurrentPublication
  )
  const sortedCollections = sortCollections(publishedCollections, sortInUrl)
  const totalPages = collectionsData?.pageInfo?.hasNextPage ? pageInUrl + 1 : pageInUrl

  return (
    <div>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-3xl font-bold tracking-tight text-on-surface'>Todas las colecciones</h1>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          <form onSubmit={handleSearch} className='relative'>
            <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Buscar colecciones...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full px-10 sm:w-[250px]'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={handleClearSearch}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <X className='size-4' />
              </button>
            )}
          </form>

          <div className='flex items-center gap-2'>
            <label className='whitespace-nowrap text-sm font-medium text-on-surface-variant'>
              Ordenar:
            </label>
            <Select value={sortInUrl} onValueChange={handleSortChange}>
              <SelectTrigger className='w-[180px] border-outline bg-surface-container focus:border-primary'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='border-outline-variant'>
                {sortOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className='hover:bg-surface-container-highest focus:bg-surface-container-highest'
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2'>
            <label className='whitespace-nowrap text-sm font-medium text-on-surface-variant'>
              Mostrar:
            </label>
            <Select value={limitInUrl.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className='w-[140px] border-outline bg-surface-container focus:border-primary'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='border-outline-variant'>
                {limitOptions.map((option) => (
                  <SelectItem
                    key={option}
                    value={option.toString()}
                    className='hover:bg-surface-container-highest focus:bg-surface-container-highest'
                  >
                    {option} por página
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {queryInUrl && (
        <div className='mb-4 flex items-center gap-2 text-sm text-muted-foreground'>
          <span>Resultados para:</span>
          <span className='rounded bg-primary-container px-2 py-0.5 font-medium text-on-primary'>
            {queryInUrl}
          </span>
          <button onClick={handleClearSearch} className='text-primary hover:underline'>
            Limpiar
          </button>
        </div>
      )}

      {sortedCollections.length > 0 ? (
        <>
          <Card.Container>
            {sortedCollections.map((collection: Collection) => (
              <Card.Collection key={collection.id} collection={collection} />
            ))}
          </Card.Container>

          {totalPages > 1 && (
            <div className='mt-8 flex justify-center'>
              <Pagination
                currentPage={pageInUrl}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className='py-16 text-center'>
          <div className='mx-auto max-w-md'>
            <div className='mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-surface-container-highest'>
              <FolderOpen className='size-8 text-on-surface-variant' />
            </div>
            <h3 className='mb-2 text-xl font-semibold text-on-surface'>
              {queryInUrl ? 'No se encontraron colecciones' : 'No hay colecciones disponibles'}
            </h3>
            <p className='mb-4 text-on-surface-variant'>
              {queryInUrl
                ? 'No se encontraron colecciones que coincidan con tu búsqueda.'
                : 'No hay colecciones publicadas disponibles en este momento.'}
            </p>
            {queryInUrl && (
              <button
                onClick={handleClearSearch}
                className='hover:bg-primary/90 rounded bg-primary px-4 py-2 text-white'
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
