import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { ROUTES, replaceRouteParams } from '@/config/routes'

import type { PostStatus, PostWithRelations } from '@/modules/blog/types'

interface PostsTableMeta {
  updateStatus?: (id: string, status: PostStatus) => Promise<void>
  updateFeatured?: (id: string, featured: boolean) => Promise<void>
  openDeleteConfirm?: (ids: string[]) => void
}

export const columns: ColumnDef<PostWithRelations>[] = [
  {
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
      />
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todos'
      />
    ),
    id: 'select',
  },
  {
    accessorKey: 'title',
    cell: ({ row }) => {
      const post = row.original
      return (
        <div className='flex flex-col gap-2'>

          <span className='font-bold'>
            {post.title}
          </span>
          <span className='text-xs text-muted-foreground'>ID: {post.id}</span>

        </div>
      )
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Título
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'author',
    cell: ({ row }) => {
      const a = row.original.author
      const name = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim()
      return name || a.email
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Autor
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    id: 'author',
  },
  {
    accessorKey: 'categories',
    cell: ({ row }) => row.original.categories.map((c) => c.category.name).join(', ') || '—',
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Categorías
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    id: 'categoriesCount',
  },
  {
    accessorKey: 'publishedAt',
    cell: ({ row }) => (row.original.publishedAt ? new Date(row.original.publishedAt).toLocaleString() : '—'),
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Publicado
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },


  {
    accessorKey: 'updatedAt',
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Actualizado
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'status',
    cell: ({ row, table }) => {
      const post = row.original
      const meta = table.options.meta as PostsTableMeta | undefined
      const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const next = e.target.value as PostStatus
        await meta?.updateStatus?.(post.id, next)
      }
      return (
        <select defaultValue={post.status} onChange={onChange} className='rounded border px-2 py-1 text-sm'>
          <option value='DRAFT'>Borrador</option>
          <option value='PUBLISHED'>Publicado</option>
          <option value='ARCHIVED'>Archivado</option>
        </select>
      )
    },
    header: 'Estado',
  },
  {
    accessorKey: 'featured',
    cell: ({ row, table }) => {
      const post = row.original
      const meta = table.options.meta as PostsTableMeta | undefined
      return (
        <Switch
          checked={post.featured}
          onCheckedChange={(checked) => meta?.updateFeatured?.(post.id, checked)}
          aria-label='Toggle destacado'
        />
      )
    },
    header: 'Destacado',
  },
  {
    cell: ({ row, table }) => {
      const post = row.original
      const href = replaceRouteParams(ROUTES.ADMIN.BLOG.DETAIL.PATH, { id: post.id })
      const meta = table.options.meta as PostsTableMeta | undefined
      return (
        <div className='flex gap-2'>
          <Link href={href}>
            <Button variant='ghost' title='Editar'> <Edit className='size-4' /></Button>
          </Link>
          <Button
            variant='ghost-destructive'
            title='Eliminar'
            onClick={() => meta?.openDeleteConfirm?.([ post.id ])}
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
      )
    },
    header: 'Acciones',
    id: 'actions',
  },
]


