'use client'

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useBankAccounts,
  useCreateFinancialEntry,
  useFinancialEntries,
} from '@/modules/finance/hooks'
import { ROUTES } from '@/src/config/routes'
import { formatCurrency } from '@/src/helpers'

export default function EventFinancePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'pending'>(
    'overview'
  )

  const { data: entries, isLoading } = useFinancialEntries({ eventId })
  const { data: bankAccounts } = useBankAccounts()
  const createEntry = useCreateFinancialEntry()

  // Filtrar movimientos por tipo y estado
  const incomeEntries = entries?.filter((entry) => entry.type === 'INCOME') || []
  const expenseEntries = entries?.filter((entry) => entry.type === 'EXPENSE') || []
  const pendingEntries = entries?.filter((entry) => entry.status !== 'COMPLETED') || []

  // Calcular totales
  const totalIncome = incomeEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.amount.toString()),
    0
  )
  const totalExpense = expenseEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.amount.toString()),
    0
  )
  const totalPaidIncome = incomeEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.amountPaid.toString()),
    0
  )
  const totalPaidExpense = expenseEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.amountPaid.toString()),
    0
  )
  const pendingIncome = totalIncome - totalPaidIncome
  const pendingExpense = totalExpense - totalPaidExpense
  const netBalance = totalIncome - totalExpense

  const getStatusBadge = (status: string, amount: number | string, amountPaid: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    const numAmountPaid = typeof amountPaid === 'string' ? parseFloat(amountPaid) : amountPaid
    if (status === 'COMPLETED') {
      return (
        <Badge variant='default' className='bg-green-100 text-green-800'>
          Completado
        </Badge>
      )
    } else if (status === 'PARTIALLY_PAID') {
      return (
        <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
          Parcial
        </Badge>
      )
    } else if (numAmountPaid > 0) {
      return (
        <Badge variant='outline' className='bg-blue-100 text-blue-800'>
          Parcial
        </Badge>
      )
    } else {
      return (
        <Badge variant='outline' className='bg-gray-100 text-gray-800'>
          Pendiente
        </Badge>
      )
    }
  }

  const getProgressPercentage = (amount: number | string, amountPaid: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    const numAmountPaid = typeof amountPaid === 'string' ? parseFloat(amountPaid) : amountPaid
    if (numAmount === 0) return 0
    return Math.min((numAmountPaid / numAmount) * 100, 100)
  }

  const handleQuickCreate = (type: 'INCOME' | 'EXPENSE') => {
    // TODO: Implementar modal de creación rápida
    toast.info(
      `Función de creación rápida de ${type === 'INCOME' ? 'ingreso' : 'gasto'} próximamente disponible`
    )
  }

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <div className='flex items-center gap-4'>
          <div className='h-10 w-24 animate-pulse rounded bg-muted' />
          <div className='h-8 w-48 animate-pulse rounded bg-muted' />
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='mb-4 h-6 w-32 animate-pulse rounded bg-muted' />
                <div className='h-8 w-24 animate-pulse rounded bg-muted' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href={ROUTES.ADMIN.EVENTS.MAIN.PATH}>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='mr-2 size-4' />
              Volver a eventos
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>Finanzas del Evento</h1>
            <p className='text-muted-foreground'>Gestión financiera específica del evento</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => handleQuickCreate('INCOME')}>
            <Plus className='mr-2 size-4' />
            Nuevo Ingreso
          </Button>
          <Button variant='outline' onClick={() => handleQuickCreate('EXPENSE')}>
            <Plus className='mr-2 size-4' />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex space-x-1 rounded-lg bg-muted p-1'>
        {[
          { icon: TrendingUp, id: 'overview', label: 'Resumen' },
          { icon: TrendingUp, id: 'income', label: 'Ingresos' },
          { icon: TrendingDown, id: 'expenses', label: 'Gastos' },
          { icon: AlertTriangle, id: 'pending', label: 'Pendientes' },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className='flex items-center gap-2'
            >
              <Icon className='size-4' />
              {tab.label}
            </Button>
          )
        })}
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'overview' && (
        <div className='space-y-6'>
          {/* KPIs principales */}
          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <TrendingUp className='size-4 text-green-600' />
                  <span className='text-sm font-medium text-muted-foreground'>
                    Ingresos Totales
                  </span>
                </div>
                <div className='text-2xl font-bold text-green-600'>
                  {formatCurrency(totalIncome.toString(), 'MXN')}
                </div>
                <div className='mt-1 text-xs text-muted-foreground'>
                  Cobrado: {formatCurrency(totalPaidIncome.toString(), 'MXN')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <TrendingDown className='size-4 text-red-600' />
                  <span className='text-sm font-medium text-muted-foreground'>Gastos Totales</span>
                </div>
                <div className='text-2xl font-bold text-red-600'>
                  {formatCurrency(totalExpense.toString(), 'MXN')}
                </div>
                <div className='mt-1 text-xs text-muted-foreground'>
                  Pagado: {formatCurrency(totalPaidExpense.toString(), 'MXN')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <AlertTriangle className='size-4 text-yellow-600' />
                  <span className='text-sm font-medium text-muted-foreground'>Pendiente</span>
                </div>
                <div className='text-2xl font-bold text-yellow-600'>
                  {formatCurrency((pendingIncome + pendingExpense).toString(), 'MXN')}
                </div>
                <div className='mt-1 text-xs text-muted-foreground'>
                  {pendingEntries.length} movimientos
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <CheckCircle className='size-4 text-blue-600' />
                  <span className='text-sm font-medium text-muted-foreground'>Balance Neto</span>
                </div>
                <div
                  className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(netBalance.toString(), 'MXN')}
                </div>
                <div className='mt-1 text-xs text-muted-foreground'>
                  {entries?.length || 0} movimientos
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalle de pendientes */}
          <Card>
            <CardHeader>
              <CardTitle>Cuentas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-2'>
                {/* Ingresos pendientes */}
                <div>
                  <h3 className='mb-3 font-semibold text-green-700'>Ingresos Pendientes</h3>
                  <div className='space-y-3'>
                    {incomeEntries
                      .filter(
                        (entry) =>
                          parseFloat(entry.amountPaid.toString()) <
                          parseFloat(entry.amount.toString())
                      )
                      .map((entry) => (
                        <div key={entry.id} className='rounded-lg border p-3'>
                          <div className='mb-2 flex items-start justify-between'>
                            <div>
                              <p className='font-medium'>{entry.description}</p>
                              <p className='text-sm text-muted-foreground'>
                                {new Date(entry.date).toLocaleDateString('es-MX')}
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='font-semibold text-green-600'>
                                {formatCurrency(entry.amount.toString(), 'MXN')}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                Pendiente:{' '}
                                {formatCurrency(
                                  (entry.amount - entry.amountPaid).toString(),
                                  'MXN'
                                )}
                              </p>
                            </div>
                          </div>
                          <div className='h-2 w-full rounded-full bg-gray-200'>
                            <div
                              className='h-2 rounded-full bg-green-600'
                              style={{
                                width: `${getProgressPercentage(entry.amount, entry.amountPaid)}%`,
                              }}
                            />
                          </div>
                          {getStatusBadge(entry.status, entry.amount, entry.amountPaid)}
                        </div>
                      ))}
                    {incomeEntries.filter(
                      (entry) =>
                        parseFloat(entry.amountPaid.toString()) <
                        parseFloat(entry.amount.toString())
                    ).length === 0 && (
                      <p className='py-4 text-center text-muted-foreground'>
                        No hay ingresos pendientes
                      </p>
                    )}
                  </div>
                </div>

                {/* Gastos pendientes */}
                <div>
                  <h3 className='mb-3 font-semibold text-red-700'>Gastos Pendientes</h3>
                  <div className='space-y-3'>
                    {expenseEntries
                      .filter(
                        (entry) =>
                          parseFloat(entry.amountPaid.toString()) <
                          parseFloat(entry.amount.toString())
                      )
                      .map((entry) => (
                        <div key={entry.id} className='rounded-lg border p-3'>
                          <div className='mb-2 flex items-start justify-between'>
                            <div>
                              <p className='font-medium'>{entry.description}</p>
                              <p className='text-sm text-muted-foreground'>
                                {new Date(entry.date).toLocaleDateString('es-MX')}
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='font-semibold text-red-600'>
                                {formatCurrency(entry.amount.toString(), 'MXN')}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                Pendiente:{' '}
                                {formatCurrency(
                                  (entry.amount - entry.amountPaid).toString(),
                                  'MXN'
                                )}
                              </p>
                            </div>
                          </div>
                          <div className='h-2 w-full rounded-full bg-gray-200'>
                            <div
                              className='h-2 rounded-full bg-red-600'
                              style={{
                                width: `${getProgressPercentage(entry.amount, entry.amountPaid)}%`,
                              }}
                            />
                          </div>
                          {getStatusBadge(entry.status, entry.amount, entry.amountPaid)}
                        </div>
                      ))}
                    {expenseEntries.filter(
                      (entry) =>
                        parseFloat(entry.amountPaid.toString()) <
                        parseFloat(entry.amount.toString())
                    ).length === 0 && (
                      <p className='py-4 text-center text-muted-foreground'>
                        No hay gastos pendientes
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'income' && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Ingresos del Evento</CardTitle>
              <p className='text-sm text-muted-foreground'>
                Total: {formatCurrency(totalIncome.toString(), 'MXN')} | Cobrado:{' '}
                {formatCurrency(totalPaidIncome.toString(), 'MXN')} | Pendiente:{' '}
                {formatCurrency(pendingIncome.toString(), 'MXN')}
              </p>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {incomeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className='flex items-center justify-between rounded-lg border p-4'
                  >
                    <div className='flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <h3 className='font-medium'>{entry.description}</h3>
                        {getStatusBadge(entry.status, entry.amount, entry.amountPaid)}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(entry.date).toLocaleDateString('es-MX')} •{' '}
                        {entry.category || 'Sin categoría'}
                      </p>
                      {entry.relatedParty && (
                        <p className='text-sm text-muted-foreground'>Parte: {entry.relatedParty}</p>
                      )}
                    </div>
                    <div className='text-right'>
                      <p className='text-lg font-bold text-green-600'>
                        {formatCurrency(entry.amount.toString(), 'MXN')}
                      </p>
                      {parseFloat(entry.amountPaid.toString()) > 0 && (
                        <p className='text-sm text-muted-foreground'>
                          Cobrado: {formatCurrency(entry.amountPaid.toString(), 'MXN')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {incomeEntries.length === 0 && (
                  <div className='py-8 text-center text-muted-foreground'>
                    No hay ingresos registrados para este evento
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Gastos del Evento</CardTitle>
              <p className='text-sm text-muted-foreground'>
                Total: {formatCurrency(totalExpense.toString(), 'MXN')} | Pagado:{' '}
                {formatCurrency(totalPaidExpense.toString(), 'MXN')} | Pendiente:{' '}
                {formatCurrency(pendingExpense.toString(), 'MXN')}
              </p>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {expenseEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className='flex items-center justify-between rounded-lg border p-4'
                  >
                    <div className='flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <h3 className='font-medium'>{entry.description}</h3>
                        {getStatusBadge(entry.status, entry.amount, entry.amountPaid)}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(entry.date).toLocaleDateString('es-MX')} •{' '}
                        {entry.category || 'Sin categoría'}
                      </p>
                      {entry.relatedParty && (
                        <p className='text-sm text-muted-foreground'>Parte: {entry.relatedParty}</p>
                      )}
                    </div>
                    <div className='text-right'>
                      <p className='text-lg font-bold text-red-600'>
                        {formatCurrency(entry.amount.toString(), 'MXN')}
                      </p>
                      {parseFloat(entry.amountPaid.toString()) > 0 && (
                        <p className='text-sm text-muted-foreground'>
                          Pagado: {formatCurrency(entry.amountPaid.toString(), 'MXN')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {expenseEntries.length === 0 && (
                  <div className='py-8 text-center text-muted-foreground'>
                    No hay gastos registrados para este evento
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Movimientos Pendientes</CardTitle>
              <p className='text-sm text-muted-foreground'>
                {pendingEntries.length} movimientos pendientes por un total de{' '}
                {formatCurrency((pendingIncome + pendingExpense).toString(), 'MXN')}
              </p>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {pendingEntries.map((entry) => (
                  <div key={entry.id} className='rounded-lg border p-4'>
                    <div className='mb-3 flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-1 flex items-center gap-2'>
                          <Badge variant={entry.type === 'INCOME' ? 'default' : 'secondary'}>
                            {entry.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                          </Badge>
                          <h3 className='font-medium'>{entry.description}</h3>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {new Date(entry.date).toLocaleDateString('es-MX')} •{' '}
                          {entry.category || 'Sin categoría'}
                        </p>
                        {entry.relatedParty && (
                          <p className='text-sm text-muted-foreground'>
                            Parte: {entry.relatedParty}
                          </p>
                        )}
                      </div>
                      <div className='text-right'>
                        <p
                          className={`text-lg font-bold ${entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(entry.amount.toString(), 'MXN')}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Pendiente:{' '}
                          {formatCurrency((entry.amount - entry.amountPaid).toString(), 'MXN')}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className='mb-2 h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className={`h-2 rounded-full ${entry.type === 'INCOME' ? 'bg-green-600' : 'bg-red-600'}`}
                        style={{
                          width: `${getProgressPercentage(entry.amount, entry.amountPaid)}%`,
                        }}
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex gap-2'>
                        {getStatusBadge(entry.status, entry.amount, entry.amountPaid)}
                        {entry.dueDate && (
                          <Badge variant='outline' className='text-xs'>
                            <Clock className='mr-1 size-3' />
                            Vence: {new Date(entry.dueDate).toLocaleDateString('es-MX')}
                          </Badge>
                        )}
                      </div>
                      {/* <Link href=''>
                        <Button variant='outline' size='sm'>
                          Ver Detalle
                        </Button>
                      </Link> */}
                    </div>
                  </div>
                ))}
                {pendingEntries.length === 0 && (
                  <div className='py-8 text-center text-muted-foreground'>
                    No hay movimientos pendientes para este evento
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
