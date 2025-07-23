'use client'

import { BarChart3, Download, Filter } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinancialReport } from '@/modules/finance/hooks'
import { formatCurrency } from '@/src/helpers'

import type { ReportType } from '@/modules/finance/types'

export default function FinancialReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('global-summary')
  const [filters, setFilters] = useState({
    endDate: '',
    startDate: '',
  })

  const {
    data: report,
    error,
    isLoading,
  } = useFinancialReport(reportType, {
    endDate: filters.endDate || undefined,
    startDate: filters.startDate || undefined,
  })

  const reportTypes = [
    { icon: BarChart3, id: 'global-summary', label: 'Resumen Global' },
    { icon: BarChart3, id: 'income-statement', label: 'Estado de Resultados' },
    { icon: BarChart3, id: 'cash-flow', label: 'Flujo de Efectivo' },
    { icon: BarChart3, id: 'balance-sheet', label: 'Balance General' },
  ] as const

  const handleExport = () => {
    // TODO: Implementar exportación a PDF/Excel
    toast.info('Función de exportación próximamente disponible')
  }

  const renderReportContent = () => {
    if (!report) return null

    switch (reportType) {
      case 'global-summary': {
        const globalData = report as any
        return (
          <div className='space-y-6'>
            {/* KPIs principales */}
            <div className='grid gap-4 md:grid-cols-4'>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-2xl font-bold text-green-600'>
                    {formatCurrency(globalData.balance.toString(), 'MXN')}
                  </div>
                  <p className='text-sm text-muted-foreground'>Balance Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-2xl font-bold text-green-600'>
                    {formatCurrency(globalData.totalIncome.toString(), 'MXN')}
                  </div>
                  <p className='text-sm text-muted-foreground'>Ingresos Totales</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-2xl font-bold text-red-600'>
                    {formatCurrency(globalData.totalExpense.toString(), 'MXN')}
                  </div>
                  <p className='text-sm text-muted-foreground'>Gastos Totales</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-2xl font-bold'>{globalData.statistics.totalEntries}</div>
                  <p className='text-sm text-muted-foreground'>Movimientos</p>
                </CardContent>
              </Card>
            </div>

            {/* Cuentas bancarias */}
            <Card>
              <CardHeader>
                <CardTitle>Cuentas Bancarias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {globalData.accounts.map(
                    (
                      account: { name: string; balance: number; initialBalance: number },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className='flex items-center justify-between rounded-lg border p-3'
                      >
                        <div>
                          <p className='font-medium'>{account.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            Saldo inicial:{' '}
                            {formatCurrency(account.initialBalance.toString(), 'MXN')}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-lg font-bold'>
                            {formatCurrency(account.balance.toString(), 'MXN')}
                          </p>
                          <p className='text-sm text-muted-foreground'>Saldo actual</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 md:grid-cols-3'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>{globalData.statistics.totalEntries}</div>
                    <p className='text-sm text-muted-foreground'>Movimientos Totales</p>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>{globalData.statistics.pendingEntries}</div>
                    <p className='text-sm text-muted-foreground'>Pendientes</p>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>
                      {globalData.statistics.completedEntries}
                    </div>
                    <p className='text-sm text-muted-foreground'>Completados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
      case 'income-statement': {
        const incomeData = report as any
        return (
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Estado de Resultados</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Período: {filters.startDate} - {filters.endDate || 'Actual'}
                </p>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between rounded-lg bg-green-50 p-3'>
                    <span className='font-medium'>Ingresos Totales</span>
                    <span className='text-lg font-bold text-green-600'>
                      {formatCurrency(incomeData.totalIncome.toString(), 'MXN')}
                    </span>
                  </div>
                  <div className='flex items-center justify-between rounded-lg bg-red-50 p-3'>
                    <span className='font-medium'>Gastos Totales</span>
                    <span className='text-lg font-bold text-red-600'>
                      {formatCurrency(incomeData.totalExpense.toString(), 'MXN')}
                    </span>
                  </div>
                  <div className='flex items-center justify-between border-y-2 p-4'>
                    <span className='text-lg font-bold'>Resultado Neto</span>
                    <span
                      className={`text-xl font-bold ${incomeData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(incomeData.netIncome.toString(), 'MXN')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
      case 'cash-flow': {
        const cashFlowData = report as any
        return (
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Flujo de Efectivo</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Período: {filters.startDate} - {filters.endDate || 'Actual'}
                </p>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between rounded-lg bg-green-50 p-3'>
                    <span className='font-medium'>Entradas de Efectivo</span>
                    <span className='text-lg font-bold text-green-600'>
                      {formatCurrency(cashFlowData.inflows.toString(), 'MXN')}
                    </span>
                  </div>
                  <div className='flex items-center justify-between rounded-lg bg-red-50 p-3'>
                    <span className='font-medium'>Salidas de Efectivo</span>
                    <span className='text-lg font-bold text-red-600'>
                      {formatCurrency(cashFlowData.outflows.toString(), 'MXN')}
                    </span>
                  </div>
                  <div className='flex items-center justify-between border-y-2 p-4'>
                    <span className='text-lg font-bold'>Flujo Neto</span>
                    <span
                      className={`text-xl font-bold ${cashFlowData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(cashFlowData.netCashFlow.toString(), 'MXN')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
      case 'balance-sheet': {
        const balanceData = report as any
        return (
          <div className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2'>
              {/* Activos */}
              <Card>
                <CardHeader>
                  <CardTitle>Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {balanceData.bankAccounts.map(
                      (account: { name: string; balance: number }, index: number) => (
                        <div key={index} className='flex items-center justify-between'>
                          <span>{account.name}</span>
                          <span className='font-medium'>
                            {formatCurrency(account.balance.toString(), 'MXN')}
                          </span>
                        </div>
                      )
                    )}
                    <div className='border-t pt-2'>
                      <div className='flex items-center justify-between font-bold'>
                        <span>Total Activos</span>
                        <span>
                          {formatCurrency(
                            balanceData.bankAccounts
                              .reduce(
                                (sum: number, acc: { balance: number }) => sum + acc.balance,
                                0
                              )
                              .toString(),
                            'MXN'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pasivos y Patrimonio */}
              <Card>
                <CardHeader>
                  <CardTitle>Pasivos y Patrimonio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span>Resultados Acumulados</span>
                      <span className='font-medium'>
                        {formatCurrency(balanceData.equity.toString(), 'MXN')}
                      </span>
                    </div>
                    <div className='border-t pt-2'>
                      <div className='flex items-center justify-between font-bold'>
                        <span>Total Pasivos y Patrimonio</span>
                        <span>{formatCurrency(balanceData.equity.toString(), 'MXN')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      }
      default:
        return <div>Reporte no disponible</div>
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Reportes Financieros</h1>
          <div className='h-10 w-32 animate-pulse rounded bg-muted' />
        </div>
        <Card>
          <CardContent className='p-6'>
            <div className='h-64 animate-pulse rounded bg-muted' />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center text-muted-foreground'>
              Error al cargar el reporte: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Reportes Financieros</h1>
        <Button onClick={handleExport}>
          <Download className='mr-2 size-4' />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className='p-4'>
          <div className='mb-4 flex items-center gap-4'>
            <Filter className='size-4 text-muted-foreground' />
            <span className='font-medium'>Filtros</span>
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            <div>
              <label className='text-sm font-medium'>Fecha Desde</label>
              <input
                type='date'
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2'
              />
            </div>
            <div>
              <label className='text-sm font-medium'>Fecha Hasta</label>
              <input
                type='date'
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2'
              />
            </div>
            <div className='flex items-end'>
              <Button
                variant='outline'
                onClick={() => setFilters({ endDate: '', startDate: '' })}
                className='w-full'
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selector de tipo de reporte */}
      <div className='grid gap-2 md:grid-cols-4'>
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <Button
              key={type.id}
              variant={reportType === type.id ? 'default' : 'outline'}
              onClick={() => setReportType(type.id)}
              className='flex h-auto flex-col items-center gap-2 p-4'
            >
              <Icon className='size-5' />
              <span className='text-sm'>{type.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Contenido del reporte */}
      <Card>
        <CardHeader>
          <CardTitle>{reportTypes.find((t) => t.id === reportType)?.label}</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Generado el {new Date().toLocaleDateString('es-MX')} a las{' '}
            {new Date().toLocaleTimeString('es-MX')}
          </p>
        </CardHeader>
        <CardContent>{renderReportContent()}</CardContent>
      </Card>
    </div>
  )
}
