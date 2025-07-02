'use client'

import { type ColumnDef, type TableMeta } from '@tanstack/react-table'
import { ArrowUpDown, Edit, Trash2, Undo2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type FinancialEntry } from '@/services/financial-events/hooks'

interface FinancialEntryTableMeta extends TableMeta<FinancialEntry> {
  onEditEntry: (entry: FinancialEntry) => void
  onDeleteExpense: (expenseId: string) => void
  onRevertIncome: (incomeId: string) => void
  isDeletingExpense: boolean
  isRevertingIncome: boolean
}

const ActionsCell = ({
  entry,
  isDeletingExpense,
  isRevertingIncome,
  onDeleteExpense,
  onEditEntry,
  onRevertIncome,
}: {
  entry: FinancialEntry
  onEditEntry: (entry: FinancialEntry) => void
  onDeleteExpense: (expenseId: string) => void
  onRevertIncome: (incomeId: string) => void
  isDeletingExpense: boolean
  isRevertingIncome: boolean
}) => {
  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => onEditEntry(entry)}
        className='size-8 p-0'
        title={`Editar ${entry.type === 'INCOME' ? 'ingreso' : 'egreso'}`}
      >
        <Edit className='size-4' />
      </Button>

      {entry.type === 'EXPENSE' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='size-8 p-0 text-destructive hover:text-destructive'
              disabled={isDeletingExpense}
              title='Eliminar egreso'
            >
              <Trash2 className='size-4' />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar egreso?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el egreso "
                {entry.description}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDeleteExpense(entry.id)}
                className='hover:bg-destructive/90 bg-destructive text-destructive-foreground'
              >
                {isDeletingExpense ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {entry.type === 'INCOME' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='size-8 p-0 text-amber-600 hover:text-amber-700'
              disabled={isRevertingIncome}
              title='Revertir asignación'
            >
              <Undo2 className='size-4' />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Revertir asignación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción revertirá la asignación del ingreso "{entry.description}" y volverá a
                estar pendiente de asignación.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onRevertIncome(entry.id)}
                className='bg-amber-600 text-white hover:bg-amber-700'
              >
                {isRevertingIncome ? 'Revirtiendo...' : 'Revertir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

export const financialEntriesColumns: ColumnDef<FinancialEntry>[] = [
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
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todos'
      />
    ),
    id: 'select',
  },
  {
    accessorKey: 'date',
    cell: ({ getValue }) => (
      <div className='font-medium'>
        {new Date(getValue() as string).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='h-8 px-2'
      >
        Fecha
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'type',
    cell: ({ getValue }) => {
      const type = getValue() as string
      return (
        <Badge variant={type === 'INCOME' ? 'default' : 'destructive'} className='font-medium'>
          {type === 'INCOME' ? 'Ingreso' : 'Egreso'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    header: 'Tipo',
  },
  {
    accessorKey: 'description',
    cell: ({ getValue }) => (
      <div className='max-w-[250px] truncate font-medium' title={getValue() as string}>
        {getValue() as string}
      </div>
    ),
    header: 'Descripción',
  },
  {
    accessorKey: 'amount',
    cell: ({ getValue, row }) => {
      const amount =
        typeof getValue() === 'string' ? parseFloat(getValue() as string) : (getValue() as number)
      const type = row.getValue('type') as string
      return (
        <div className={`font-bold ${type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
          {amount.toLocaleString('es-MX', { currency: 'MXN', style: 'currency' })}
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='h-8 px-2'
      >
        Monto
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'category',
    cell: ({ getValue }) => {
      const category = getValue() as string | null
      return (
        <div className='text-sm'>
          {category ? (
            <Badge variant='outline' className='text-xs'>
              {category}
            </Badge>
          ) : (
            <span className='text-muted-foreground'>N/A</span>
          )}
        </div>
      )
    },
    header: 'Categoría',
  },
  {
    accessorKey: 'paymentMethod',
    cell: ({ getValue }) => <div className='text-sm'>{getValue() as string}</div>,
    header: 'Método de Pago',
  },
  {
    accessorKey: 'relatedParty',
    cell: ({ getValue }) => (
      <div className='max-w-[150px] truncate text-sm' title={getValue() as string}>
        {getValue() as string}
      </div>
    ),
    header: 'Parte Relacionada',
  },
  {
    accessorKey: 'status',
    cell: ({ getValue }) => {
      const status = getValue() as string
      const statusConfig = {
        CANCELLED: { label: 'Cancelado', variant: 'destructive' as const },
        COMPLETED: { label: 'Completado', variant: 'default' as const },
        PENDING: { label: 'Pendiente', variant: 'secondary' as const },
      }
      const config = statusConfig[status as keyof typeof statusConfig]

      return <Badge variant={config.variant}>{config.label}</Badge>
    },
    header: 'Estado',
  },
  {
    cell: ({ row, table }) => {
      const entry = row.original
      const meta = table.options.meta as FinancialEntryTableMeta

      return (
        <ActionsCell
          entry={entry}
          onEditEntry={meta.onEditEntry}
          onDeleteExpense={meta.onDeleteExpense}
          onRevertIncome={meta.onRevertIncome}
          isDeletingExpense={meta.isDeletingExpense}
          isRevertingIncome={meta.isRevertingIncome}
        />
      )
    },
    enableSorting: false,
    header: 'Acciones',
    id: 'actions',
  },
]
