import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { Table } from '@tanstack/react-table'

interface Props<TData> {
  table: Table<TData>
  isServerSide?: boolean
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  currentPage?: number
  totalItems?: number
  isLoading?: boolean
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export const Pagination = <TData,>({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  isLoading = false,
  isServerSide = false,
  onPageChange,
  onPageSizeChange,
  table,
  totalItems,
}: Props<TData>) => {
  if (isServerSide) {
    const handlePageSizeChange = (value: string) => {
      const newSize = Number(value)
      table.setPageSize(newSize)
      onPageSizeChange?.(newSize)
    }

    const handlePreviousPage = () => {
      if (currentPage && currentPage > 1) {
        onPageChange?.(currentPage - 1)
      }
    }

    const handleNextPage = () => {
      if (currentPage && hasNextPage) {
        onPageChange?.(currentPage + 1)
      }
    }

    const handleFirstPage = () => {
      if (currentPage && currentPage > 1) {
        onPageChange?.(1)
      }
    }

    return (
      <div className='flex items-center justify-between px-2'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span>
              {table.getFilteredSelectedRowModel().rows.length} de{' '}
              {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
            </span>
          )}
          {totalItems && (
            <span className={table.getFilteredSelectedRowModel().rows.length > 0 ? 'ml-4' : ''}>
              {totalItems}+ productos encontrados
            </span>
          )}
        </div>

        <div className='flex items-center space-x-6 lg:space-x-8'>
          <div className='flex items-center space-x-2'>
            <p className='text-sm font-medium'>Filas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={handlePageSizeChange}
              disabled={isLoading}
            >
              <SelectTrigger className='h-8 w-[70px]'>
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side='top'>
                {[5, 10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
            Página {currentPage ?? 1}
            {!hasNextPage && ' (última)'}
          </div>

          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              className='hidden size-8 p-0 lg:flex'
              onClick={handleFirstPage}
              disabled={!hasPreviousPage || currentPage === 1 || isLoading}
            >
              <ChevronsLeft className='size-4' />
            </Button>
            <Button
              variant='outline'
              className='size-8 p-0'
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage || currentPage === 1 || isLoading}
            >
              <ChevronLeft className='size-4' />
            </Button>
            <Button
              variant='outline'
              className='size-8 p-0'
              onClick={handleNextPage}
              disabled={!hasNextPage || isLoading}
            >
              <ChevronRight className='size-4' />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-between px-2'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {table.getFilteredSelectedRowModel().rows.length} de{' '}
        {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
      </div>
      <div className='flex items-center space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>Filas por página</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='hidden size-8 p-0 lg:flex'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className='size-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className='size-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className='size-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden size-8 p-0 lg:flex'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className='size-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
