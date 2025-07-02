'use client'
import { DollarSign, Receipt, RefreshCw } from 'lucide-react'
import { use, useState } from 'react'

import { FinancialEntriesTable } from '@/components/FinancialManagement/FinancialEntriesTable'
import { TableSkeleton } from '@/components/FinancialManagement/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useGetFinancialEntriesByEvent,
  useGetFinancialEvent,
  useGetPendingIncomeEntries,
  type FinancialEntry,
} from '@/services/financial-events/hooks'
import { Dialog, useDialogForm } from '@/src/components/Dialog'
import { Form } from '@/src/components/Forms'

interface Props {
  params: Promise<{ eventId: string }>
}

export default function FinancialEventDetailPage({ params }: Props) {
  const { eventId } = use(params)

  const {
    data: event,
    error: eventError,
    isError: isEventError,
    isLoading: isEventLoading,
  } = useGetFinancialEvent(eventId)
  const {
    data: financialEntries,
    error: entriesError,
    isFetching: isEntriesFetching,
    isLoading: isEntriesLoading,
    refetch: refetchEntries,
  } = useGetFinancialEntriesByEvent(eventId)
  const {
    data: pendingIncomes,
    error: errorPendingIncomes,
    isError: isErrorPendingIncomes,
    isLoading: isLoadingPendingIncomes,
  } = useGetPendingIncomeEntries()

  const incomeDialog = useDialogForm()
  const expenseDialog = useDialogForm()
  const entryEditDialog = useDialogForm()

  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null)

  const handleEditEntry = (entry: FinancialEntry) => {
    setEditingEntry(entry)
    entryEditDialog.openDialog()
  }

  const handleEntryEditSuccess = () => {
    setEditingEntry(null)
    entryEditDialog.closeDialog()
  }

  const handleEntryEditCancel = () => {
    setEditingEntry(null)
    entryEditDialog.closeDialog()
  }

  const handleRefresh = () => {
    void refetchEntries()
  }

  const isLoading = isEventLoading || isEntriesLoading
  const hasError = isEventError || !!entriesError
  const error = eventError ?? entriesError

  if (isLoading) {
    return (
      <div className='container mx-auto space-y-6 p-4'>
        <div className='space-y-2'>
          <div className='h-8 w-64 animate-pulse rounded bg-muted' />
          <div className='h-4 w-32 animate-pulse rounded bg-muted' />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className='container mx-auto p-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold'>Error</h1>
        </div>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex min-h-96 items-center justify-center'>
              <div className='text-center'>
                <h3 className='text-lg font-semibold text-destructive'>
                  Error al cargar los datos
                </h3>
                <p className='mt-2 text-muted-foreground'>
                  {error?.message ?? 'Ha ocurrido un error inesperado'}
                </p>
                <Button onClick={handleRefresh} className='mt-4'>
                  <RefreshCw className='mr-2 size-4' />
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) {
    return (
      <div className='container mx-auto p-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold'>Evento no encontrado</h1>
        </div>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex min-h-96 items-center justify-center'>
              <div className='text-center'>
                <h3 className='text-lg font-semibold'>No se encontró el evento</h3>
                <p className='mt-2 text-muted-foreground'>
                  El evento con ID "{eventId}" no existe o no tienes permisos para verlo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-6 p-4'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold'>{event.name}</h1>
        <p className='text-sm text-muted-foreground'>ID: {event.id}</p>
      </div>

      <FinancialEntriesTable
        eventId={eventId}
        financialEntries={financialEntries ?? []}
        onEditEntry={handleEditEntry} // Cambiado de onEditExpense a onEditEntry
        onRefresh={handleRefresh}
        isFetching={isEntriesFetching}
        actionButtons={
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              onClick={handleRefresh}
              disabled={isEntriesFetching}
              size='sm'
            >
              <RefreshCw className={`mr-2 size-4 ${isEntriesFetching ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            <Dialog.Form
              {...incomeDialog}
              title='Registrar Nuevo Ingreso'
              description={`Agrega un nuevo ingreso para el evento ${event.name}`}
              triggerText='Registrar Ingreso'
              triggerIcon={DollarSign}
              triggerVariant='default'
            >
              <Form.Income
                eventId={eventId}
                pendingIncomes={pendingIncomes ?? []}
                isLoading={isLoadingPendingIncomes}
                error={isErrorPendingIncomes ? errorPendingIncomes : null}
                onSuccess={incomeDialog.closeDialog}
              />
            </Dialog.Form>

            <Dialog.Form
              {...expenseDialog}
              title='Registrar Nuevo Gasto'
              description={`Agrega un nuevo gasto para el evento ${event.name}`}
              triggerText='Registrar Gasto'
              triggerIcon={Receipt}
              triggerVariant='outline'
            >
              <Form.Expense eventId={eventId} onSuccess={expenseDialog.closeDialog} />
            </Dialog.Form>
          </div>
        }
      />

      {editingEntry && (
        <Dialog.Form
          {...entryEditDialog}
          title={`Editar ${editingEntry.type === 'INCOME' ? 'Ingreso' : 'Gasto'}`}
          description={`Modifica los detalles de: ${editingEntry.description}`}
          triggerText='Editar'
        >
          {editingEntry.type === 'INCOME' ? (
            <Form.Income
              eventId={eventId}
              income={editingEntry}
              pendingIncomes={[]}
              isLoading={false}
              onSuccess={handleEntryEditSuccess}
              onCancel={handleEntryEditCancel}
            />
          ) : (
            <Form.Expense
              eventId={eventId}
              expense={editingEntry}
              onSuccess={handleEntryEditSuccess}
              onCancel={handleEntryEditCancel}
            />
          )}
        </Dialog.Form>
      )}
    </div>
  )
}
