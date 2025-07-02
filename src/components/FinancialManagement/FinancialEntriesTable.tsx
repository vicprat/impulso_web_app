'use client'

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { DollarSign, Filter, RefreshCw, Search, TrendingDown, TrendingUp } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type FinancialEntry,
  useDeleteExpense,
  useDeleteManyExpenses,
  useRevertIncomeAssignment,
} from '@/services/financial-events/hooks'

import { financialEntriesColumns } from './columns'
import { GenericTableSelectionToolbar } from './Toolbar'

import type { TableMeta } from '@tanstack/react-table'

interface FinancialEntriesTableProps {
  eventId: string
  financialEntries: FinancialEntry[]
  onEditEntry: (expense: FinancialEntry) => void
  onRefresh: () => void
  isFetching: boolean
  actionButtons: React.ReactNode
}

interface FinancialEntryTableMeta extends TableMeta<FinancialEntry> {
  onEditEntry: (expense: FinancialEntry) => void
  onDeleteExpense: (expenseId: string) => void
  onRevertIncome: (incomeId: string) => void
  isDeletingExpense: boolean
  isRevertingIncome: boolean
}

export const FinancialEntriesTable: React.FC<FinancialEntriesTableProps> = ({
  actionButtons,
  financialEntries,
  isFetching,
  onEditEntry,
}) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const deleteExpenseMutation = useDeleteExpense()
  const revertIncomeMutation = useRevertIncomeAssignment()
  const deleteManyExpensesMutation = useDeleteManyExpenses()

  const data = financialEntries

  const filteredData =
    typeFilter === 'all' ? data : data.filter((entry) => entry.type === typeFilter)

  const stats = {
    expenseCount: data.filter((entry) => entry.type === 'EXPENSE').length,
    incomeCount: data.filter((entry) => entry.type === 'INCOME').length,
    total: data.length,
    totalExpense: data
      .filter((entry) => entry.type === 'EXPENSE')
      .reduce((sum, entry) => {
        const amount = typeof entry.amount === 'string' ? parseFloat(entry.amount) : entry.amount
        return sum + amount
      }, 0),
    totalIncome: data
      .filter((entry) => entry.type === 'INCOME')
      .reduce((sum, entry) => {
        const amount = typeof entry.amount === 'string' ? parseFloat(entry.amount) : entry.amount
        return sum + amount
      }, 0),
  }

  const netProfit = stats.totalIncome - stats.totalExpense

  useEffect(() => {
    setRowSelection({})
  }, [globalFilter, typeFilter, deleteManyExpensesMutation.isSuccess])

  const handleDeleteExpense = useCallback(
    (expenseId: string) => {
      deleteExpenseMutation.mutate(expenseId)
    },
    [deleteExpenseMutation]
  )

  const handleRevertIncome = useCallback(
    (incomeId: string) => {
      revertIncomeMutation.mutate(incomeId)
    },
    [revertIncomeMutation]
  )

  const table = useReactTable({
    columns: financialEntriesColumns,
    data: filteredData,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      isDeletingExpense: deleteExpenseMutation.isPending,
      isRevertingIncome: revertIncomeMutation.isPending,
      onDeleteExpense: handleDeleteExpense,
      onEditEntry,
      onRevertIncome: handleRevertIncome,
    } as FinancialEntryTableMeta,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
      rowSelection,
      sorting,
    },
  })

  const handleBulkDeleteExpenses = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows

    const selectedExpenseIds = selectedRows
      .map((row) => row.original)
      .filter((entry) => entry.type === 'EXPENSE')
      .map((entry) => entry.id)

    if (selectedExpenseIds.length === 0) {
      toast.error(
        'No se han seleccionado gastos válidos para eliminar. Solo se pueden eliminar egresos.'
      )
      return
    }

    if (selectedExpenseIds.length !== selectedRows.length) {
      toast.info(
        `Se eliminarán solo ${selectedExpenseIds.length} egresos de ${selectedRows.length} entradas seleccionadas.`
      )
    }

    deleteManyExpensesMutation.mutate(selectedExpenseIds, {
      onSuccess: () => {
        setRowSelection({})
      },
    })
  }, [table, deleteManyExpensesMutation])

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedExpenseCount = selectedRows
    .map((row) => row.original)
    .filter((entry) => entry.type === 'EXPENSE').length

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='size-5' />
            Resumen Financiero
          </CardTitle>
          <CardDescription>Vista general de ingresos, egresos y utilidad neta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div className='rounded-lg border p-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-muted-foreground'>Ingresos</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {stats.totalIncome.toLocaleString('es-MX', {
                      currency: 'MXN',
                      style: 'currency',
                    })}
                  </p>
                </div>
                <div className='flex items-center'>
                  <TrendingUp className='size-4 text-green-600' />
                  <Badge variant='outline' className='ml-2'>
                    {stats.incomeCount}
                  </Badge>
                </div>
              </div>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-muted-foreground'>Egresos</p>
                  <p className='text-2xl font-bold text-red-600'>
                    {stats.totalExpense.toLocaleString('es-MX', {
                      currency: 'MXN',
                      style: 'currency',
                    })}
                  </p>
                </div>
                <div className='flex items-center'>
                  <TrendingDown className='size-4 text-red-600' />
                  <Badge variant='outline' className='ml-2'>
                    {stats.expenseCount}
                  </Badge>
                </div>
              </div>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-muted-foreground'>Utilidad Neta</p>
                  <p
                    className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {netProfit.toLocaleString('es-MX', { currency: 'MXN', style: 'currency' })}
                  </p>
                </div>
                <Badge variant={netProfit >= 0 ? 'default' : 'destructive'}>
                  {netProfit >= 0 ? 'Ganancia' : 'Pérdida'}
                </Badge>
              </div>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-muted-foreground'>Total Entradas</p>
                  <p className='text-2xl font-bold'>{stats.total}</p>
                </div>
                <Badge variant='outline'>Movimientos</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
            <div>
              <CardTitle>Detalle de Entradas Financieras</CardTitle>
              <CardDescription>Lista completa de ingresos y egresos del evento</CardDescription>
            </div>
            {actionButtons}
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0'>
            <div className='relative max-w-sm flex-1'>
              <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar por descripción, categoría...'
                value={globalFilter}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className='pl-10'
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className='w-48'>
                <Filter className='mr-2 size-4' />
                <SelectValue placeholder='Filtrar por tipo' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos los tipos</SelectItem>
                <SelectItem value='INCOME'>Solo Ingresos</SelectItem>
                <SelectItem value='EXPENSE'>Solo Egresos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isFetching && (
            <div className='mb-4 flex items-center space-x-2 text-sm text-muted-foreground'>
              <RefreshCw className='size-4 animate-spin' />
              <span>Actualizando datos...</span>
            </div>
          )}

          <GenericTableSelectionToolbar
            table={table}
            onBulkDeleteConfirm={handleBulkDeleteExpenses}
            isDeleting={deleteManyExpensesMutation.isPending}
            deleteButtonText={`Eliminar ${selectedExpenseCount} egreso${selectedExpenseCount !== 1 ? 's' : ''}`}
            deleteConfirmText={
              selectedExpenseCount > 0
                ? `¿Estás seguro de que quieres eliminar ${selectedExpenseCount} egreso${selectedExpenseCount !== 1 ? 's' : ''}?${
                    selectedRows.length > selectedExpenseCount
                      ? ` (${selectedRows.length - selectedExpenseCount} entrada${selectedRows.length - selectedExpenseCount !== 1 ? 's' : ''} de ingreso ${selectedRows.length - selectedExpenseCount !== 1 ? 'serán ignoradas' : 'será ignorada'})`
                      : ''
                  }`
                : 'No hay egresos seleccionados para eliminar. Solo se pueden eliminar egresos.'
            }
            customActions={
              <Button
                variant='outline'
                size='sm'
                onClick={() => setRowSelection({})}
                disabled={deleteManyExpensesMutation.isPending}
              >
                Limpiar selección
              </Button>
            }
          />

          <div className='rounded-md border'>
            <DataTable
              table={table}
              emptyMessage={
                globalFilter
                  ? `No se encontraron entradas que coincidan con "${globalFilter}"`
                  : typeFilter !== 'all'
                    ? `No hay entradas de tipo "${typeFilter === 'INCOME' ? 'Ingreso' : 'Egreso'}"`
                    : 'No hay entradas financieras registradas para este evento.'
              }
            />
          </div>

          {filteredData.length > 0 && (
            <div className='flex items-center justify-between space-x-2 py-4'>
              <div className='text-sm text-muted-foreground'>
                Mostrando {table.getFilteredRowModel().rows.length} de {stats.total} entradas
                {typeFilter !== 'all' &&
                  ` (filtrado por: ${typeFilter === 'INCOME' ? 'Ingresos' : 'Egresos'})`}
              </div>
              {Object.keys(rowSelection).length > 0 && (
                <div className='text-sm text-muted-foreground'>
                  {Object.keys(rowSelection).length} entrada
                  {Object.keys(rowSelection).length > 1 ? 's' : ''} seleccionada
                  {Object.keys(rowSelection).length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
