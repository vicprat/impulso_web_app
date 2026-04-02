'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table'
import { Edit, Info, Palette } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  OptionErrorState,
  OptionLoadingSkeleton,
  OptionPageHeader,
  OptionSearch,
  OptionStats,
} from '@/components/Options/OptionPageComponents'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { normalizeSearch } from '@/lib/utils'
import { useGetVendors, useUpdateVendor } from '@/services/product/hook'
import { Table } from '@/src/components/Table'

import type { ColumnDef, SortingState } from '@tanstack/react-table'

const PAGE_SIZE = 20

interface VendorRow {
  id: string
  name: string
}

interface ActionsCellProps {
  vendor: string
  onRefresh?: () => void
}

const ActionsCell = ({ onRefresh, vendor }: ActionsCellProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newVendorName, setNewVendorName] = useState(vendor)
  const [editError, setEditError] = useState<string | null>(null)

  const updateVendorMutation = useUpdateVendor({
    onError: (error: Error) => {
      toast.error(`Error al actualizar artista: ${error.message}`)
      setEditError(error.message)
    },
    onSuccess: () => {
      toast.success(`Artista actualizado exitosamente`)
      setIsEditDialogOpen(false)
      setEditError(null)
      onRefresh?.()
    },
  })

  const handleSave = () => {
    if (!newVendorName.trim()) {
      setEditError('El nombre es requerido')
      return
    }
    if (newVendorName.trim() === vendor) {
      setIsEditDialogOpen(false)
      return
    }
    setEditError(null)
    void updateVendorMutation.mutateAsync({ newVendor: newVendorName.trim(), oldVendor: vendor })
  }

  return (
    <>
      <Button variant='ghost' size='sm' onClick={() => setIsEditDialogOpen(true)}>
        <Edit className='size-4' />
      </Button>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Artista</DialogTitle>
            <DialogDescription>
              Cambiar &quot;{vendor}&quot; actualizará el nombre en todos los productos asociados.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='vendor-name'>Nombre del Artista</Label>
              <Input
                id='vendor-name'
                value={newVendorName}
                onChange={(e) => {
                  setNewVendorName(e.target.value)
                  setEditError(null)
                }}
                maxLength={100}
              />
              {editError && <p className='text-sm text-red-500'>{editError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateVendorMutation.isPending || !newVendorName.trim()}
            >
              {updateVendorMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const columns: ColumnDef<VendorRow>[] = [
  {
    accessorKey: 'name',
    cell: ({ row }) => (
      <div className='flex items-center gap-2 font-medium'>
        <Palette className='size-4 text-blue-500' />
        {row.original.name}
      </div>
    ),
    header: 'Nombre del Artista',
  },
  {
    cell: ({ row, table }) => {
      const { onRefresh } = table.options.meta as { onRefresh?: () => void }
      return <ActionsCell vendor={row.original.name} onRefresh={onRefresh} />
    },
    header: 'Acciones',
    id: 'actions',
  },
]

export function ArtistsClient() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [showInfoDialog, setShowInfoDialog] = useState(false)

  const queryClient = useQueryClient()
  const { data: vendors = [], error, isFetching, isLoading } = useGetVendors()

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['vendors'] })
  }

  const vendorRows: VendorRow[] = useMemo(() => {
    return vendors.map((name) => ({ id: name, name }))
  }, [vendors])

  const filteredVendors = useMemo(() => {
    const normalizedSearch = normalizeSearch(searchTerm)
    return vendorRows.filter((v) => normalizeSearch(v.name).includes(normalizedSearch))
  }, [vendorRows, searchTerm])

  const table = useReactTable({
    columns,
    data: filteredVendors,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    meta: {
      onRefresh: handleRefresh,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    pageCount: Math.ceil(filteredVendors.length / PAGE_SIZE),
    state: {
      pagination,
      sorting,
    },
  })

  if (isLoading) {
    return <OptionLoadingSkeleton />
  }

  if (error) {
    return (
      <OptionErrorState
        message={error.message}
        onRetry={handleRefresh}
        title='Error al cargar artistas'
      />
    )
  }

  const handleShowCreateInfo = () => {
    setShowInfoDialog(true)
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col space-y-4 p-4'>
      <OptionPageHeader
        createLabel='Más información'
        description='Gestiona los artistas disponibles en tu catálogo (vendors de Shopify)'
        icon={Palette}
        isFetching={isFetching}
        onCreate={handleShowCreateInfo}
        onRefresh={handleRefresh}
        title='Gestión de Artistas'
      />

      <OptionSearch
        isLoading={isFetching}
        onChange={setSearchTerm}
        placeholder='Buscar por nombre...'
        value={searchTerm}
      />

      <OptionStats total={filteredVendors.length} />

      <div className='min-h-0 flex-1 overflow-auto rounded-md border'>
        <Table.Data
          table={table}
          className='min-w-[600px]'
          emptyMessage='No se encontraron artistas.'
        />
      </div>

      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sobre los Artistas</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='flex items-start gap-3'>
              <Info className='mt-1 size-5 shrink-0 text-blue-500' />
              <p className='text-sm text-muted-foreground'>
                Los artistas se extraen automáticamente de los productos de Shopify. Para agregar un
                nuevo artista, necesitas crear o editar un producto en Shopify con el nombre del
                nuevo artista como vendor.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInfoDialog(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
