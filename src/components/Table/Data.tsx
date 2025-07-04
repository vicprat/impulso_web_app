'use client'

import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Props<TData extends { id: string | number }> {
  table: TanstackTable<TData>
  emptyMessage?: string
  editingRowClassName?: string
  className?: string
}

export const Data = <TData extends { id: string | number }>({
  className,
  editingRowClassName = 'bg-yellow-50/50',
  emptyMessage = 'No se encontraron resultados.',
  table,
}: Props<TData>) => {
  return (
    <Table className={className}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              className={
                table.options.meta?.editingRowId === row.original.id ? editingRowClassName : ''
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
