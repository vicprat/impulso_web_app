'use client'

import { Filter, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import type { FinancialEntryFilters } from '@/src/modules/finance'
import type { FinancialEntryStatus, FinancialEntryType } from '@prisma/client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDeleteFinancialEntry, useFinancialEntries } from '@/modules/finance/hooks'
import { formatCurrency } from '@/src/helpers'

export default function FinancialEntriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FinancialEntryFilters>({
    bankAccountId: '',
    category: '',
    endDate: '',
    startDate: '',
    status: '' as FinancialEntryStatus,
    type: '' as FinancialEntryType,
  })

  const { data: entries, error, isLoading } = useFinancialEntries(filters)
  const deleteEntry = useDeleteFinancialEntry()

  const filteredEntries =
    entries?.filter((entry) => {
      const matchesSearch =
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.relatedParty?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    }) || []

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este movimiento?')) {
      try {
        await deleteEntry.mutateAsync(id)
        toast.success('Movimiento eliminado exitosamente')
      } catch (error) {
        console.error('Error deleting entry:', error)
        toast.error('Error al eliminar el movimiento')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CANCELLED: { label: 'Cancelado', variant: 'destructive' as const },
      COMPLETED: { label: 'Completado', variant: 'default' as const },
      PARTIALLY_PAID: { label: 'Parcialmente Pagado', variant: 'secondary' as const },
      PENDING: { label: 'Pendiente', variant: 'outline' as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'INCOME' ? 'default' : 'secondary'}>
        {type === 'INCOME' ? 'Ingreso' : 'Gasto'}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Movimientos Financieros</h1>
          <div className='h-10 w-32 animate-pulse rounded bg-muted' />
        </div>
        <div className='grid gap-4'>
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='mb-2 h-6 w-48 animate-pulse rounded bg-muted' />
                <div className='h-4 w-32 animate-pulse rounded bg-muted' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center text-muted-foreground'>
              Error al cargar los movimientos: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Movimientos Financieros</h1>
        <Link href=''>
          <Button>
            <Plus className='mr-2 size-4' />
            Nuevo Movimiento
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className='p-4'>
          <div className='space-y-4'>
            {/* Búsqueda */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar por descripción, categoría o parte relacionada...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            {/* Filtros avanzados */}
            <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-6'>
              <div>
                <label className='text-sm font-medium'>Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value as FinancialEntryType }))
                  }
                  className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2'
                >
                  <option value=''>Todos</option>
                  <option value='INCOME'>Ingresos</option>
                  <option value='EXPENSE'>Gastos</option>
                </select>
              </div>

              <div>
                <label className='text-sm font-medium'>Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.value as FinancialEntryStatus,
                    }))
                  }
                  className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2'
                >
                  <option value=''>Todos</option>
                  <option value='PENDING'>Pendiente</option>
                  <option value='PARTIALLY_PAID'>Parcialmente Pagado</option>
                  <option value='COMPLETED'>Completado</option>
                  <option value='CANCELLED'>Cancelado</option>
                </select>
              </div>

              <div>
                <label className='text-sm font-medium'>Categoría</label>
                <Input
                  value={filters.category}
                  onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder='Categoría'
                  className='mt-1'
                />
              </div>

              <div>
                <label className='text-sm font-medium'>Fecha Desde</label>
                <Input
                  type='date'
                  value={filters.startDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  className='mt-1'
                />
              </div>

              <div>
                <label className='text-sm font-medium'>Fecha Hasta</label>
                <Input
                  type='date'
                  value={filters.endDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  className='mt-1'
                />
              </div>

              <div className='flex items-end'>
                <Button
                  variant='outline'
                  onClick={() =>
                    setFilters({
                      bankAccountId: '',
                      category: '',
                      endDate: '',
                      startDate: '',
                      status: '' as FinancialEntryStatus,
                      type: '' as FinancialEntryType,
                    })
                  }
                  className='w-full'
                >
                  <Filter className='mr-2 size-4' />
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de movimientos */}
      <div className='space-y-4'>
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className='p-6 text-center text-muted-foreground'>
              {searchTerm || Object.values(filters).some((f) => f)
                ? 'No se encontraron movimientos con los filtros aplicados'
                : 'No hay movimientos financieros registrados'}
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id} className='transition-shadow hover:shadow-md'>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-2'>
                      {getTypeBadge(entry.type)}
                      {getStatusBadge(entry.status)}
                      <h3 className='text-lg font-semibold'>{entry.description}</h3>
                    </div>
                    <div className='space-y-1 text-sm text-muted-foreground'>
                      <p>Fecha: {new Date(entry.date).toLocaleDateString('es-MX')}</p>
                      {entry.category && <p>Categoría: {entry.category}</p>}
                      {entry.relatedParty && <p>Parte relacionada: {entry.relatedParty}</p>}
                      {entry.paymentMethod && <p>Método de pago: {entry.paymentMethod}</p>}
                      {entry.user && (
                        <p>
                          Usuario: {entry.user.firstName} {entry.user.lastName} ({entry.user.email})
                          {entry.user.UserRole && entry.user.UserRole.length > 0 && (
                            <span className='ml-2'>
                              - {entry.user.UserRole.map((ur) => ur.role.name).join(', ')}
                            </span>
                          )}
                        </p>
                      )}
                      {entry.bankAccount && (
                        <p>
                          Cuenta: {entry.bankAccount.name} ({entry.bankAccount.bankName})
                        </p>
                      )}
                      {entry.amountPaid > 0 && (
                        <p>
                          Pagado: {formatCurrency(entry.amountPaid.toString(), 'MXN')} /{' '}
                          {formatCurrency(entry.amount.toString(), 'MXN')}
                        </p>
                      )}
                      {entry.notes && <p>Notas: {entry.notes}</p>}
                    </div>
                  </div>
                  <div className='flex flex-col items-end gap-2'>
                    <div className='text-right'>
                      <p
                        className={`text-xl font-bold ${entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {entry.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(entry.amount.toString(), 'MXN')}
                      </p>
                      <p className='text-sm text-muted-foreground'>{entry.currency}</p>
                    </div>
                    <div className='flex gap-2'>
                      <Link href=''>
                        <Button variant='outline' size='sm'>
                          Ver
                        </Button>
                      </Link>
                      <Link href=''>
                        <Button variant='outline' size='sm'>
                          Ver/Editar
                        </Button>
                      </Link>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleteEntry.isPending}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resumen */}
      {entries && entries.length > 0 && (
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              <span>
                {filteredEntries.length} de {entries.length} movimientos mostrados
              </span>
              <div className='flex gap-4'>
                <span>
                  Total Ingresos:{' '}
                  {formatCurrency(
                    filteredEntries
                      .filter((e) => e.type === 'INCOME')
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toString(),
                    'MXN'
                  )}
                </span>
                <span>
                  Total Gastos:{' '}
                  {formatCurrency(
                    filteredEntries
                      .filter((e) => e.type === 'EXPENSE')
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toString(),
                    'MXN'
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
