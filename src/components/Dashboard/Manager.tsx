import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { PERMISSIONS } from '@/config/Permissions'
import {
  useAdminDashboard,
  useAdvancedAnalytics,
  useProductMetrics,
} from '@/src/modules/dashboard/hooks'

import { Guard } from '../Guards'
import { Badge } from '../ui/badge'

interface TopProduct {
  name: string
  artist: string
  sales: number
  units: number
}

const MetricCard = ({
  change,
  color = 'blue',
  icon: Icon,
  subtitle = null,
  title,
  value,
}: {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  subtitle?: string | null
}) => {
  const isPositive = change !== undefined ? change >= 0 : null
  const colorClasses = {
    blue: 'bg-primary-container border-outline',
    green: 'bg-success-container border-outline',
    orange: 'bg-warning-container border-outline',
    purple: 'bg-primary-container border-outline',
    red: 'bg-error-container border-outline',
  }

  return (
    <div
      className={`rounded-lg border-outline p-6 ${colorClasses[color]} transition-all hover:shadow-md`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <p className='text-2xl font-bold text-foreground'>{value}</p>
          {subtitle && <p className='mt-1 text-sm text-muted-foreground'>{subtitle}</p>}
          {change !== undefined && (
            <div className='mt-1 flex items-center'>
              {isPositive ? (
                <TrendingUp className='mr-1 size-4 text-success' />
              ) : (
                <TrendingDown className='mr-1 size-4 text-error' />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <Icon className='size-8 text-muted-foreground' />
      </div>
    </div>
  )
}

const ChartCard = ({
  children,
  className = '',
  title,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) => (
  <div className={`rounded-lg border-outline bg-card p-6 shadow-elevation-1 ${className}`}>
    <h3 className='mb-4 text-lg font-semibold text-foreground'>{title}</h3>
    {children}
  </div>
)

const LoadingDashboard = () => (
  <div className='p-8'>
    <div className='animate-pulse space-y-6'>
      <div className='h-8 w-1/3 rounded bg-gray-200'></div>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='h-32 rounded-lg bg-gray-200'></div>
        ))}
      </div>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='h-64 rounded-lg bg-gray-200'></div>
        ))}
      </div>
    </div>
  </div>
)

const ErrorDashboard = ({ error }: { error: Error }) => (
  <div className='p-8'>
    <div className='rounded-lg border border-red-200 bg-red-50 p-6'>
      <div className='flex items-center'>
        <AlertTriangle className='mr-2 size-5 text-red-400' />
        <span className='text-red-800'>Error al cargar el dashboard: {error.message}</span>
      </div>
    </div>
  </div>
)
export const Manager = () => {
  const { data, error, isLoading } = useAdminDashboard()
  const productMetrics = useProductMetrics()
  const advancedAnalytics = useAdvancedAnalytics()

  if (isLoading || productMetrics.isLoading || advancedAnalytics.isLoading)
    return <LoadingDashboard />
  if (error) return <ErrorDashboard error={error as Error} />
  if (productMetrics.error) return <ErrorDashboard error={productMetrics.error as Error} />
  if (advancedAnalytics.error) return <ErrorDashboard error={advancedAnalytics.error as Error} />
  if (!data) return <div className='p-8 text-center'>No hay datos disponibles</div>

  const { financialSummary, inventory, overview, productCategories, salesData, topProducts } = data

  return (
    <div className='min-h-screen space-y-8 bg-surface-container-low p-8'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          title='Ventas Totales'
          value={`${overview.totalSales.toLocaleString()}`}
          change={overview.monthlyGrowth}
          icon={DollarSign}
          color='green'
        />
        <MetricCard
          title='Órdenes'
          value={overview.totalOrders.toLocaleString()}
          change={0}
          icon={ShoppingCart}
          color='blue'
        />
        <MetricCard
          title='Productos'
          value={overview.totalProducts}
          change={0}
          icon={Package}
          color='purple'
          subtitle={data.activeProducts ? `${data.activeProducts} activos` : undefined}
        />
        <Guard.Permission permission={PERMISSIONS.MANAGE_USERS}>
          <MetricCard
            title='Usuarios'
            value={overview.totalUsers}
            change={0}
            icon={Users}
            color='orange'
          />
        </Guard.Permission>
      </div>

      {/* Resumen financiero */}
      <Guard.Permission permission={PERMISSIONS.VIEW_ANALYTICS}>
        <ChartCard title='Resumen Financiero'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-success'>
                ${financialSummary.revenue.toLocaleString()}
              </p>
              <p className='text-sm text-muted-foreground'>Ingresos</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-error'>
                ${financialSummary.expenses.toLocaleString()}
              </p>
              <p className='text-sm text-muted-foreground'>Gastos</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-primary'>
                ${financialSummary.profit.toLocaleString()}
              </p>
              <p className='text-sm text-muted-foreground'>Ganancia</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-warning'>
                ${financialSummary.pendingPayments.toLocaleString()}
              </p>
              <p className='text-sm text-muted-foreground'>Pendientes</p>
            </div>
          </div>
        </ChartCard>
      </Guard.Permission>

      {/* Métricas adicionales */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <Guard.Permission permission={PERMISSIONS.MANAGE_INVENTORY}>
          <div className='rounded-lg border-outline bg-card p-6 shadow-elevation-1'>
            <h3 className='mb-2 text-sm font-medium text-muted-foreground'>Valor del Inventario</h3>
            <div className='flex items-center'>
              <span className='text-2xl font-bold text-foreground'>
                ${inventory.totalValue.toLocaleString()}
              </span>
              <Package className='ml-2 size-5 text-primary' />
            </div>
          </div>
        </Guard.Permission>

        <ChartCard title='Orden Promedio'>
          <div className='flex items-center'>
            <span className='text-2xl font-bold text-foreground'>
              ${data.averageOrderValue.toLocaleString() ?? '0'}
            </span>
            <DollarSign className='ml-2 size-5 text-success' />
          </div>
        </ChartCard>

        <ChartCard title='Tasa de Conversión'>
          <div className='flex items-center'>
            <span className='text-2xl font-bold text-foreground'>{overview.conversionRate}%</span>
            <TrendingUp className='ml-2 size-5 text-primary' />
          </div>
        </ChartCard>
      </div>

      {/* Gráficos principales */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <ChartCard title='Tendencia de Ventas'>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Ventas']} />
              <Area
                type='monotone'
                dataKey='sales'
                stroke='#8884d8'
                fill='#8884d8'
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title='Distribución por Categorías'>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={productCategories}
                cx='50%'
                cy='50%'
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {productCategories.map(
                  (entry: { name: string; value: number; color: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  )
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Estado del inventario y productos destacados */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Guard.Permission permission={PERMISSIONS.MANAGE_INVENTORY}>
          <ChartCard title='Estado del Inventario'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <AlertTriangle className='mr-2 size-5 text-warning' />
                  <span className='text-sm text-muted-foreground'>Stock Bajo</span>
                </div>
                <span className='font-bold text-warning'>{inventory.lowStock}</span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <XCircle className='mr-2 size-5 text-error' />
                  <span className='text-sm text-muted-foreground'>Sin Stock</span>
                </div>
                <span className='font-bold text-error'>{inventory.outOfStock}</span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <CheckCircle className='mr-2 size-5 text-success' />
                  <span className='text-sm text-muted-foreground'>En Stock</span>
                </div>
                <span className='font-bold text-success'>
                  {overview.totalProducts - inventory.lowStock - inventory.outOfStock}
                </span>
              </div>
            </div>
          </ChartCard>
        </Guard.Permission>

        <ChartCard title='Productos Más Vendidos'>
          <div className='space-y-4'>
            {topProducts.map((product: TopProduct, index: number) => (
              <div
                key={index}
                className='flex items-center justify-between rounded-lg bg-surface-container-low p-3'
              >
                <div className='flex-1'>
                  <h4 className='font-semibold text-foreground'>{product.name}</h4>
                  <p className='text-sm text-muted-foreground'>por {product.artist}</p>
                </div>
                <div className='text-right'>
                  <p className='font-bold text-success'>${product.sales.toLocaleString()}</p>
                  <p className='text-xs text-muted-foreground'>{product.units} unidades</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Product Metrics */}
      <Guard.Permission permission={PERMISSIONS.VIEW_ANALYTICS}>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <ChartCard title='Métricas de Producto'>
            {productMetrics.data && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Total de productos:</span>
                  <span className='font-semibold text-foreground'>
                    {productMetrics.data.totalProducts}
                  </span>
                </div>
                <div className='flex items-center justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Productos activos:</span>
                  <span className='font-semibold text-foreground'>
                    {productMetrics.data.activeProducts}
                  </span>
                </div>
                <div className='flex items-center justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Valor total del inventario:</span>
                  <span className='font-semibold text-foreground'>
                    ${productMetrics.data.totalInventoryValue.toLocaleString()}
                  </span>
                </div>
                <div className='flex items-start justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Productos por artista:</span>
                  <div className='flex flex-wrap gap-1'>
                    {Object.entries(productMetrics.data.productsByArtist).map(([artist, count]) => (
                      <Badge key={artist} variant='secondary-container'>
                        {artist} ({count as number})
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className='flex items-start justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Productos por categoría:</span>
                  <div className='flex flex-wrap gap-1'>
                    {Object.entries(productMetrics.data.productsByCategory).map(
                      ([category, count]) => (
                        <Badge key={category} variant='secondary'>
                          {category} ({count as number})
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </ChartCard>

          {/* Advanced Analytics */}
          <ChartCard title='Analíticas Avanzadas'>
            {advancedAnalytics.data && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Órdenes este mes:</span>
                  <span className='font-semibold text-foreground'>
                    {advancedAnalytics.data.orderAnalytics.ordersThisMonth}
                  </span>
                </div>
                <div className='flex items-center justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Órdenes esta semana:</span>
                  <span className='font-semibold text-foreground'>
                    {advancedAnalytics.data.orderAnalytics.ordersThisWeek}
                  </span>
                </div>
                <div className='flex items-center justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Valor promedio de orden:</span>
                  <span className='font-semibold text-foreground'>
                    ${advancedAnalytics.data.orderAnalytics.averageOrderValue.toLocaleString()}
                  </span>
                </div>
                <div className='flex items-center justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Hora pico de órdenes:</span>
                  <span className='font-semibold text-foreground'>
                    {advancedAnalytics.data.orderAnalytics.peakHour.hour}h (
                    {advancedAnalytics.data.orderAnalytics.peakHour.orders} órdenes)
                  </span>
                </div>
                <div className='flex items-center justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Ingresos este mes:</span>
                  <span className='font-semibold text-foreground'>
                    ${advancedAnalytics.data.revenueGrowth.thisMonth.toLocaleString()}
                  </span>
                </div>
                <div className='flex items-center justify-between border-b border-border py-2 last:border-b-0'>
                  <span className='text-muted-foreground'>Ingresos esta semana:</span>
                  <span className='font-semibold text-foreground'>
                    ${advancedAnalytics.data.revenueGrowth.thisWeek.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      </Guard.Permission>

      <Guard.Permission permission={PERMISSIONS.VIEW_LOGS}>
        <ChartCard title='Registros del Sistema'>
          <div className='p-4 text-center text-muted-foreground'>
            Contenido de los registros del sistema aquí...
          </div>
        </ChartCard>
      </Guard.Permission>

      <Guard.Permission permission={PERMISSIONS.EXPORT_DATA}>
        <ChartCard title='Exportar Datos'>
          <div className='p-4 text-center text-muted-foreground'>
            Opciones para exportar datos aquí...
          </div>
        </ChartCard>
      </Guard.Permission>
    </div>
  )
}
