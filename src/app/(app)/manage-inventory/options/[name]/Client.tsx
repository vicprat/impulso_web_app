'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  CreateOptionDialog,
  OptionErrorState,
  OptionLoadingSkeleton,
  OptionPageHeader,
  OptionSearch,
  OptionStats,
} from '@/components/Options/OptionPageComponents'
import { useCreateOption, useGetOptions } from '@/hooks/use-options'
import { normalizeSearch } from '@/lib/utils'
import { Table } from '@/src/components/Table'
import { getOptionConfig } from '@/src/config/options'

import { columns } from './columns'

import type { SortingState } from '@tanstack/react-table'

const optionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
})

interface ClientProps {
  optionName: string
}

export function Client({ optionName }: ClientProps) {
  const config = getOptionConfig(optionName)

  const [searchTerm, setSearchTerm] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newOptionName, setNewOptionName] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const { data: options = [], error, isFetching, isLoading } = useGetOptions(optionName)
  const createOptionMutation = useCreateOption(optionName, {
    onError: (error: Error) => {
      setCreateError(error.message)
    },
    onSuccess: () => {
      toast.success(`${config?.singularLabel ?? 'Opción'} creado exitosamente`)
      setIsCreateDialogOpen(false)
      setNewOptionName('')
      setCreateError(null)
    },
  })

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['options', optionName] })
  }

  const filteredOptions = useMemo(() => {
    const normalizedSearch = normalizeSearch(searchTerm)
    return options.filter((opt: any) => normalizeSearch(opt.name).includes(normalizedSearch))
  }, [options, searchTerm])

  const activeOptions = filteredOptions.filter((opt: any) => opt.isActive !== false)

  const table = useReactTable({
    columns: columns(optionName, config),
    data: filteredOptions,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      config,
      onRefresh: handleRefresh,
      optionName,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  })

  const handleCreateSubmit = () => {
    const result = optionSchema.safeParse({ name: newOptionName })
    if (!result.success) {
      setCreateError(result.error.errors[0].message)
      return
    }
    setCreateError(null)
    void createOptionMutation.mutateAsync(result.data.name)
  }

  if (!config) {
    return (
      <div className='p-6'>
        <p className='text-red-500'>Tipo de opción no válido: {optionName}</p>
      </div>
    )
  }

  if (isLoading) {
    return <OptionLoadingSkeleton hasCreateButton />
  }

  if (error) {
    return (
      <OptionErrorState
        message={error.message}
        onRetry={handleRefresh}
        title={`Error al cargar ${config.label.toLowerCase()}`}
      />
    )
  }

  const Icon = config.icon

  return (
    <div className='min-w-0 max-w-full space-y-4 p-4'>
      <OptionPageHeader
        createLabel={`Nueva ${config.singularLabel}`}
        description={config.description}
        icon={Icon}
        isFetching={isFetching}
        onCreate={() => setIsCreateDialogOpen(true)}
        onRefresh={handleRefresh}
        title={`Gestión de ${config.label}`}
      />

      <OptionSearch
        isLoading={isFetching}
        onChange={setSearchTerm}
        placeholder={`Buscar por nombre...`}
        value={searchTerm}
      />

      <OptionStats
        active={activeOptions.length}
        activeLabel='Activas'
        total={filteredOptions.length}
      />

      <div className='w-full min-w-0 max-w-full overflow-x-auto pb-2'>
        <Table.Data
          table={table}
          className='min-w-[600px]'
          emptyMessage={`No se encontraron ${config.label.toLowerCase()}.`}
        />
      </div>

      <CreateOptionDialog
        description={`Ingresa el nombre para la nueva ${config.singularLabel.toLowerCase()}.`}
        error={createError}
        isOpen={isCreateDialogOpen}
        isPending={createOptionMutation.isPending}
        label={config.singularLabel}
        onClear={() => {
          setNewOptionName('')
          setCreateError(null)
        }}
        onClose={() => setIsCreateDialogOpen(false)}
        onErrorChange={setCreateError}
        onSubmit={handleCreateSubmit}
        onValueChange={setNewOptionName}
        title={`Crear ${config.singularLabel}`}
        value={newOptionName}
      />
    </div>
  )
}
