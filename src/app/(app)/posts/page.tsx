'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type TableMeta,
  useReactTable,
} from '@tanstack/react-table'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Confirm } from '@/components/Dialog/Confirm'
import { Permission } from '@/components/Guards/Permission'
import { Table } from '@/components/Table'
import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/config/Permissions'
import { ROUTES } from '@/config/routes'
// import { useDebounce } from '@/hooks/use-debounce'
import { blogApi } from '@/modules/blog/api'
import { BLOG_KEYS, useAdminPosts, useCategories, useTags } from '@/modules/blog/hooks'

import { columns } from './columns'

import type { PostFilters, PostStatus, PostWithRelations } from '@/modules/blog/types'


export default function BlogAdminPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const pageInUrl = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSizeInUrl = parseInt(searchParams.get('pageSize') ?? '20', 10)
  const qInUrl = searchParams.get('q') ?? ''
  const statusInUrl = searchParams.get('status') ?? ''
  const featuredParam = searchParams.get('featured')
  const featuredInUrl = featuredParam === null ? undefined : featuredParam === 'true'
  const categoryIdInUrl = searchParams.get('categoryId') ?? undefined
  const tagIdInUrl = searchParams.get('tagId') ?? undefined
  const sortByInUrl = (searchParams.get('sortBy') ?? 'publishedAt') as PostFilters[ 'sortBy' ]
  const sortOrderInUrl = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc'

  const [ sorting, setSorting ] = useState<SortingState>([])
  const [ rowSelection, setRowSelection ] = useState<Record<string, boolean>>({})
  const [ searchTerm, setSearchTerm ] = useState(qInUrl)

  const filtersMemo = useMemo(() => ({
    authorId: undefined,
    categoryId: categoryIdInUrl,
    featured: featuredInUrl,
    page: pageInUrl,
    pageSize: pageSizeInUrl,
    q: qInUrl,
    sortBy: sortByInUrl,
    sortOrder: sortOrderInUrl,
    status: (statusInUrl || undefined) as PostFilters[ 'status' ],
    tagId: tagIdInUrl,
  } satisfies PostFilters), [ categoryIdInUrl, featuredInUrl, pageInUrl, pageSizeInUrl, qInUrl, sortByInUrl, sortOrderInUrl, statusInUrl, tagIdInUrl ])
  const { data, isLoading } = useAdminPosts(filtersMemo)
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  const queryClient = useQueryClient()

  // Sin debounce: el usuario debe confirmar con Enter o botón

  useEffect(() => {
    setSorting([ { desc: sortOrderInUrl === 'desc', id: sortByInUrl } ])

  }, [ sortByInUrl, sortOrderInUrl ])

  const [ showConfirm, setShowConfirm ] = useState(false)
  const [ idsToDelete, setIdsToDelete ] = useState<string[]>([])

  const tableMeta: {
    updateStatus: (id: string, status: PostStatus) => Promise<void>
    updateFeatured: (id: string, featured: boolean) => Promise<void>
    openDeleteConfirm: (ids: string[]) => void
  } = {
    openDeleteConfirm: (ids) => {
      setIdsToDelete(ids)
      setShowConfirm(true)
    },
    updateFeatured: async (id, featured) => {
      try {
        await blogApi.posts.update(id, { featured })
        toast.success('Post actualizado')
        void queryClient.invalidateQueries({ queryKey: BLOG_KEYS.posts() })
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Error al actualizar post'
        toast.error(message)
      }
    },
    updateStatus: async (id, status) => {
      try {
        await blogApi.posts.update(id, { status })
        toast.success('Estado del post actualizado')
        void queryClient.invalidateQueries({ queryKey: BLOG_KEYS.posts() })
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Error al actualizar estado'
        toast.error(message)
      }
    },
  }

  const table = useReactTable<PostWithRelations>({
    columns,
    data: data?.items ?? [],
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    meta: tableMeta as unknown as TableMeta<PostWithRelations>,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next.length > 0) {
        const { desc, id } = next[ 0 ]
        params.set('sortBy', String(id))
        params.set('sortOrder', desc ? 'desc' : 'asc')
      } else {
        params.set('sortBy', 'publishedAt')
        params.set('sortOrder', 'desc')
      }
      params.set('page', '1')
      router.push(`/posts?${params.toString()}`, { scroll: false })
    },
    rowCount: data?.total ?? 0,
    state: {
      pagination: {
        pageIndex: pageInUrl - 1,
        pageSize: pageSizeInUrl,
      },
      rowSelection,
      sorting,
    },
  })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>Entradas del Blog</h1>
        <Permission permission={PERMISSIONS.MANAGE_OWN_BLOG_POSTS}>
          <Button asChild>
            <a href={ROUTES.ADMIN.BLOG.CREATE.PATH}>Nueva entrada</a>
          </Button>
        </Permission>
      </div>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <div className='mb-6'>
          <Table.Toolbar
            onSearchChange={(val) => setSearchTerm(val)}
            placeholder='Buscar por título o contenido...'
            searchTerm={searchTerm}
            onSubmit={() => {
              const params = new URLSearchParams(searchParams.toString())
              if (searchTerm) params.set('q', searchTerm)
              else params.delete('q')
              params.set('page', '1')
              router.push(`/posts?${params.toString()}`, { scroll: false })
            }}
          >
            <div className='flex items-center space-x-2'>
              <select
                value={statusInUrl}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (e.target.value) params.set('status', e.target.value)
                  else params.delete('status')
                  params.set('page', '1')
                  router.push(`/posts?${params.toString()}`, { scroll: false })
                }}
                className='w-full rounded-lg border border-input p-2 text-sm focus:ring-2 focus:ring-ring'
              >
                <option value=''>Todos los estados</option>
                <option value='DRAFT'>Borradores</option>
                <option value='PUBLISHED'>Publicados</option>
                <option value='ARCHIVED'>Archivados</option>
              </select>

              <select
                value={featuredInUrl === undefined ? '' : String(featuredInUrl)}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (e.target.value === '') params.delete('featured')
                  else params.set('featured', e.target.value)
                  params.set('page', '1')
                  router.push(`/posts?${params.toString()}`, { scroll: false })
                }}
                className='w-full rounded-lg border border-input bg-background p-2 text-sm focus:ring-2 focus:ring-ring'
              >
                <option value=''>Todos</option>
                <option value='true'>Destacados</option>
                <option value='false'>No destacados</option>
              </select>

              <Button type='submit' className='px-4'>Buscar</Button>
            </div>
          </Table.Toolbar>
        </div>

        <div className='mb-6'>
          <div className='flex items-center space-x-2'>
            <select
              value={categoryIdInUrl ?? ''}
              className='w-full rounded-lg border border-input p-2 text-sm focus:ring-2 focus:ring-ring'
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString())
                if (e.target.value) params.set('categoryId', e.target.value)
                else params.delete('categoryId')
                params.set('page', '1')
                router.push(`/posts?${params.toString()}`, { scroll: false })
              }}
            >
              <option value=''>Todas las categorías</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={tagIdInUrl ?? ''}
              className='w-full rounded-lg border border-input bg-background p-2 text-sm focus:ring-2 focus:ring-ring'
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString())
                if (e.target.value) params.set('tagId', e.target.value)
                else params.delete('tagId')
                params.set('page', '1')
                router.push(`/posts?${params.toString()}`, { scroll: false })
              }}
            >
              <option value=''>Todos los tags</option>
              {(tags ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(qInUrl !== '' || statusInUrl !== '' || featuredInUrl !== undefined || (categoryIdInUrl ?? '') !== '' || (tagIdInUrl ?? '') !== '' || sortByInUrl !== 'publishedAt' || sortOrderInUrl !== 'desc' || pageInUrl !== 1 || pageSizeInUrl !== 20) && (
          <div className='mb-6 flex items-center'>
            <Button
              variant='container-destructive'
              size='sm'
              onClick={() => router.replace('/posts', { scroll: false })}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {Object.keys(rowSelection).length > 0 && (
        <div className='mb-2 flex items-center justify-between rounded-md border bg-muted px-3 py-2 text-sm'>
          <span>
            {Object.values(rowSelection).filter(Boolean).length} seleccionados
          </span>
          <div className='space-x-2'>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => {
                const selectedIds = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id)
                setIdsToDelete(selectedIds)
                setShowConfirm(true)
              }}
            >
              Eliminar seleccionados
            </Button>
            <Button variant='ghost' size='sm' onClick={() => table.resetRowSelection()}>
              Limpiar selección
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Table.Loader />
      ) : (
        <div className='overflow-hidden rounded-lg border bg-card shadow-md'>
          <Table.Data<PostWithRelations> table={table} emptyMessage='No hay posts para mostrar.' />
        </div>
      )}

      <Table.Pagination
        currentPage={pageInUrl}
        hasNextPage={data?.hasNextPage}
        hasPreviousPage={data?.hasPreviousPage}
        isServerSide
        onPageChange={(p) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set('page', String(p))
          router.push(`/posts?${params.toString()}`, { scroll: false })
        }}
        onPageSizeChange={(s) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set('pageSize', String(s))
          params.set('page', '1')
          router.push(`/posts?${params.toString()}`, { scroll: false })
        }}
        table={table}
        totalItems={data?.total}
      />

      <Confirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={idsToDelete.length > 1 ? 'Eliminar posts' : 'Eliminar post'}
        message={
          idsToDelete.length > 1
            ? `¿Seguro que deseas eliminar ${idsToDelete.length} posts? Esta acción no se puede deshacer.`
            : '¿Seguro que deseas eliminar este post? Esta acción no se puede deshacer.'
        }
        onConfirm={async () => {
          try {
            await Promise.all(idsToDelete.map((id) => blogApi.posts.remove(id)))
            toast.success(idsToDelete.length > 1 ? 'Posts eliminados' : 'Post eliminado')
            setRowSelection({})
            setIdsToDelete([])
            void queryClient.invalidateQueries({ queryKey: BLOG_KEYS.posts() })
          } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al eliminar'
            toast.error(message)
          }
        }}
      />
    </div>
  )
}


