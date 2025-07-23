'use client'

import { AlertTriangle, DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGlobalSummary } from '@/modules/finance/hooks'
import { ROLES } from '@/src/config/Roles'

import { FinanceMetricCard } from './FinanceMetricCard'

interface FinanceOverviewProps {
  role: string
  userId?: string
  showDetails?: boolean
}

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({
  role,
  showDetails = false,
  userId,
}) => {
  const { data: globalSummary, error, isLoading } = useGlobalSummary()

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='pb-2'>
              <div className='h-4 w-20 animate-pulse rounded bg-muted' />
            </CardHeader>
            <CardContent>
              <div className='mb-2 h-8 w-16 animate-pulse rounded bg-muted' />
              <div className='h-3 w-12 animate-pulse rounded bg-muted' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center space-x-2 text-muted-foreground'>
            <AlertTriangle className='size-4' />
            <span>Error al cargar datos financieros</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!globalSummary) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      currency: 'MXN',
      style: 'currency',
    }).format(amount)
  }

  // Configuración específica por rol
  const getRoleSpecificMetrics = (): {
    title: string
    value: string | number
    change?: number
    icon: React.ElementType
    color: 'default' | 'success' | 'warning' | 'error'
    subtitle: string
  }[] => {
    switch (role) {
      case ROLES.ADMIN.NAME:
      case ROLES.MANAGER.NAME:
        return [
          {
            change: 5.2,
            color: globalSummary.balance >= 0 ? 'success' : 'error',
            // Esto vendría de comparación con período anterior
            icon: DollarSign,

            subtitle: 'Saldo general',

            title: 'Balance Total',
            value: formatCurrency(globalSummary.balance),
          },
          {
            change: 12.5,
            color: 'success',
            icon: TrendingUp,
            subtitle: 'Últimos 30 días',
            title: 'Ingresos',
            value: formatCurrency(globalSummary.totalIncome),
          },
          {
            change: -3.8,
            color: 'warning',
            icon: TrendingDown,
            subtitle: 'Últimos 30 días',
            title: 'Gastos',
            value: formatCurrency(globalSummary.totalExpense),
          },
          {
            color: 'default',
            icon: Wallet,
            subtitle: 'Cuentas bancarias',
            title: 'Cuentas Activas',
            value: globalSummary.accounts.length.toString(),
          },
        ]

      case ROLES.ARTIST.NAME:
        // Para artistas, mostrar sus ingresos específicos
        return [
          {
            // Ejemplo: 30% de ingresos
            change: 8.5,

            color: 'success',
            icon: DollarSign,
            subtitle: 'Comisiones por ventas',
            title: 'Ingresos Totales',
            value: formatCurrency(globalSummary.totalIncome * 0.3),
          },
          {
            color: 'warning',
            icon: AlertTriangle,
            subtitle: 'Pagos por procesar',
            title: 'Pendiente de Cobro',
            value: formatCurrency(globalSummary.totalIncome * 0.1),
          },
        ]

      case ROLES.EMPLOYEE.NAME:
        return [
          {
            color: 'warning',
            icon: TrendingDown,
            subtitle: 'Este mes',
            title: 'Gastos Autorizados',
            value: formatCurrency(globalSummary.totalExpense * 0.15),
          },
          {
            color: 'warning',
            icon: AlertTriangle,
            subtitle: 'Por procesar',
            title: 'Reembolsos Pendientes',
            value: formatCurrency(globalSummary.totalExpense * 0.05),
          },
        ]

      case ROLES.PROVIDER.NAME:
        return [
          {
            change: 15.2,
            color: 'success',
            icon: DollarSign,
            subtitle: 'Este mes',
            title: 'Pagos Recibidos',
            value: formatCurrency(globalSummary.totalExpense * 0.25),
          },
          {
            color: 'warning',
            icon: AlertTriangle,
            subtitle: 'Por recibir',
            title: 'Pagos Pendientes',
            value: formatCurrency(globalSummary.totalExpense * 0.08),
          },
        ]

      case ROLES.PARTNER.NAME:
        return [
          {
            change: 7.8,
            color: 'success',
            icon: DollarSign,
            subtitle: 'Participación en resultados',
            title: 'Participación',
            value: formatCurrency(globalSummary.balance * 0.2),
          },
          {
            color: 'success',
            icon: TrendingUp,
            subtitle: 'Este trimestre',
            title: 'Dividendos',
            value: formatCurrency(globalSummary.totalIncome * 0.1),
          },
        ]

      default:
        return []
    }
  }

  const metrics = getRoleSpecificMetrics()

  if (metrics.length === 0) {
    return null
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Resumen Financiero</h2>
        {showDetails && (
          <Badge variant='outline' className='text-xs'>
            {globalSummary.statistics.totalEntries} movimientos
          </Badge>
        )}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {metrics.map((metric, index) => (
          <FinanceMetricCard key={index} {...metric} />
        ))}
      </div>

      {showDetails && (
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Cuentas Bancarias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {globalSummary.accounts.slice(0, 3).map((account, index) => (
                  <div key={index} className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>{account.name}</span>
                    <span className='text-sm text-muted-foreground'>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
                {globalSummary.accounts.length > 3 && (
                  <div className='pt-2 text-xs text-muted-foreground'>
                    +{globalSummary.accounts.length - 3} cuentas más
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Movimientos Totales</span>
                  <Badge variant='secondary'>{globalSummary.statistics.totalEntries}</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Pendientes</span>
                  <Badge variant='outline'>{globalSummary.statistics.pendingEntries}</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Completados</span>
                  <Badge variant='default'>{globalSummary.statistics.completedEntries}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
