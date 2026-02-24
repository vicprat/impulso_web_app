import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  MapPin,
  Package,
  ShoppingCart,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import React, { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  useAdminDashboard,
  useAdvancedAnalytics,
  useProductMetrics,
} from '@/src/modules/dashboard/hooks'

import { Badge } from '../ui/badge'

interface TopProduct {
  name: string
  artist: string
  sales: number
  units: number
}

interface ArtworkDetails {
  medium: string | null
  year: string | null
  location: string | null
  artist: string | null
  serie: string | null
  height: string | null
  width: string | null
  depth: string | null
}

interface EventDetails {
  date: string | null
  location: string | null
  startTime: string | null
  endTime: string | null
  organizer: string | null
}

interface EnrichedProduct {
  id: string
  title: string
  vendor: string
  productType: string
  status: string
  formattedPrice: string
  isAvailable: boolean
  artworkDetails: ArtworkDetails
  manualTags: string[]
  autoTags: string[]
}

interface EnrichedEvent {
  id: string
  title: string
  vendor: string
  productType: string
  status: string
  formattedPrice: string
  isAvailable: boolean
  availableForSale: boolean
  eventDetails: EventDetails
  formattedEventDetails: string
  isPastEvent: boolean
  daysUntilEvent: number | null
}

const AccordionCard = ({
  children,
  isExpanded,
  onToggle,
  title,
  totalItems,
  visibleItems,
}: {
  title: string
  children: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  totalItems: number
  visibleItems: number
}) => (
  <ChartCard title={title}>
    <div className='space-y-4'>
      {children}
      {totalItems > visibleItems && (
        <button
          onClick={onToggle}
          className='flex w-full items-center justify-center gap-2 rounded-lg border border-outline bg-surface-container-low px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-container'
        >
          {isExpanded ? (
            <>
              <ChevronUp className='size-4' />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className='size-4' />
              Mostrar {totalItems - visibleItems} más
            </>
          )}
        </button>
      )}
    </div>
  </ChartCard>
)

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
export const Admin = () => {
  const { data, error, isLoading } = useAdminDashboard()
  const productMetrics = useProductMetrics()
  const advancedAnalytics = useAdvancedAnalytics()

  // Estado para los accordions
  const [expandedArtists, setExpandedArtists] = useState(false)
  const [expandedEvents, setExpandedEvents] = useState(false)

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
        <MetricCard
          title='Usuarios'
          value={overview.totalUsers}
          change={0}
          icon={Users}
          color='orange'
        />
      </div>

      {/* Métricas adicionales */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='rounded-lg border-outline bg-card p-6 shadow-elevation-1'>
          <h3 className='mb-2 text-sm font-medium text-muted-foreground'>Valor del Inventario</h3>
          <div className='flex items-center'>
            <span className='text-2xl font-bold text-foreground'>
              ${inventory.totalValue.toLocaleString()}
            </span>
            <Package className='ml-2 size-5 text-primary' />
          </div>
        </div>

        <div className='rounded-lg border-outline bg-card p-6 shadow-elevation-1'>
          <h3 className='mb-2 text-sm font-medium text-muted-foreground'>Orden Promedio</h3>
          <div className='flex items-center'>
            <span className='text-2xl font-bold text-foreground'>
              ${data.averageOrderValue.toLocaleString() ?? '0'}
            </span>
            <DollarSign className='ml-2 size-5 text-success' />
          </div>
        </div>

        <div className='rounded-lg border-outline bg-card p-6 shadow-elevation-1'>
          <h3 className='mb-2 text-sm font-medium text-muted-foreground'>Tasa de Conversión</h3>
          <div className='flex items-center'>
            <span className='text-2xl font-bold text-foreground'>{overview.conversionRate}%</span>
            <TrendingUp className='ml-2 size-5 text-primary' />
          </div>
        </div>
      </div>

      {/* Resumen financiero */}
      {/* <ChartCard title='Resumen Financiero'>
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
      </ChartCard> */}

      {/* Estado del inventario y productos destacados */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
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

        <ChartCard title='Productos Más Vendidos'>
          <div className='space-y-4'>
            {topProducts.slice(0, 3).map((product: TopProduct, index: number) => (
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
                <span className='text-muted-foreground'>Productos en borrador:</span>
                <span className='font-semibold text-foreground'>
                  {productMetrics.data.draftProducts}
                </span>
              </div>

              <div className='flex items-center justify-between border-b border-border py-2 last:border-b-0'>
                <span className='text-muted-foreground'>Precio promedio por obra:</span>
                <span className='font-semibold text-foreground'>
                  ${parseFloat(productMetrics.data.averagePrice).toFixed(2)}
                </span>
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

      {/* Gráficos principales */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <ChartCard title='Tendencia de Ventas'>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `${(value as number | undefined)?.toLocaleString() ?? '0'}`,
                  'Ventas',
                ]}
              />
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

      {/* Distribución por Artista */}
      <ChartCard title='Distribución por Artista'>
        {productMetrics.data?.productsByArtist && (
          <ResponsiveContainer width='100%' height={400}>
            <BarChart
              data={Object.entries(productMetrics.data.productsByArtist)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10) // Top 10 artistas
                .map(([artist, count], index) => ({
                  color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                  name: artist,
                  value: count as number,
                }))}
              margin={{ bottom: 5, left: 20, right: 30, top: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='name'
                angle={-45}
                textAnchor='end'
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Obras']} />
              <Bar dataKey='value' fill='#8884d8' />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Eventos en el Sistema */}
      <AccordionCard
        title='Eventos en el Sistema'
        isExpanded={expandedEvents}
        onToggle={() => setExpandedEvents(!expandedEvents)}
        totalItems={
          productMetrics.data?.productsDetails?.filter(
            (product: any) => product.productType === 'Evento'
          ).length || 0
        }
        visibleItems={5}
      >
        {productMetrics.data?.productsDetails ? (
          <>
            {productMetrics.data.productsDetails
              .filter((product: any) => product.productType === 'Evento')
              .slice(0, expandedEvents ? undefined : 5)
              .map((event: any, index: number) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded-lg bg-surface-container-low p-4'
                >
                  <div className='flex-1'>
                    <div className='flex items-center'>
                      <Calendar className='mr-2 size-4 text-primary' />
                      <h4 className='font-semibold text-foreground'>{event.title}</h4>
                    </div>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      <Badge variant='secondary'>{event.vendor}</Badge>
                      <Badge variant='outline'>{event.status}</Badge>
                      <Badge variant='secondary-container'>{event.price}</Badge>
                    </div>
                    {event.artworkDetails && (
                      <div className='mt-2 text-sm text-muted-foreground'>
                        {event.artworkDetails.location && `📍 ${event.artworkDetails.location}`}
                        {event.artworkDetails.artist && ` | 👤 ${event.artworkDetails.artist}`}
                      </div>
                    )}
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>Estado</p>
                    <Badge variant={event.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {event.status === 'ACTIVE' ? 'Activo' : 'Borrador'}
                    </Badge>
                  </div>
                </div>
              ))}
            {productMetrics.data.productsDetails.filter(
              (product: any) => product.productType === 'Evento'
            ).length === 0 && (
              <p className='text-center text-muted-foreground'>
                No hay eventos registrados en el sistema
              </p>
            )}
          </>
        ) : (
          <p className='text-center text-muted-foreground'>No hay datos de eventos disponibles</p>
        )}
      </AccordionCard>

      {/* Análisis de Ubicaciones y Series */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <ChartCard title='Distribución por Ubicación'>
          {productMetrics.data?.productsByLocation && (
            <div className='space-y-4'>
              {Object.entries(productMetrics.data.productsByLocation)
                .filter(([location]) => location !== 'Sin ubicación especificada')
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([location, count]) => (
                  <div key={location} className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <MapPin className='mr-2 size-4 text-primary' />
                      <span className='text-sm text-muted-foreground'>{location}</span>
                    </div>
                    <Badge variant='secondary'>{count as number} obras</Badge>
                  </div>
                ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title='Series y Colecciones'>
          {productMetrics.data?.productsBySerie && (
            <div className='space-y-4'>
              {Object.entries(productMetrics.data.productsBySerie)
                .filter(([serie]) => serie !== 'Sin serie especificada')
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([serie, count]) => (
                  <div key={serie} className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <BookOpen className='mr-2 size-4 text-primary' />
                      <span className='text-sm text-muted-foreground'>{serie}</span>
                    </div>
                    <Badge variant='secondary'>{count as number} obras</Badge>
                  </div>
                ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Análisis por Artista */}
      <AccordionCard
        title='Análisis por Artista'
        isExpanded={expandedArtists}
        onToggle={() => setExpandedArtists(!expandedArtists)}
        totalItems={
          productMetrics.data?.productsByArtist
            ? Object.keys(productMetrics.data.productsByArtist).length
            : 0
        }
        visibleItems={5}
      >
        {productMetrics.data?.productsByArtist &&
        Object.keys(productMetrics.data.productsByArtist).length > 0 ? (
          <>
            {Object.entries(productMetrics.data.productsByArtist)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, expandedArtists ? undefined : 5)
              .map(([artist, count]) => (
                <div
                  key={artist}
                  className='flex items-center justify-between rounded-lg bg-surface-container-low p-4'
                >
                  <div className='flex-1'>
                    <div className='flex items-center'>
                      <Star className='mr-2 size-4 text-warning' />
                      <h4 className='font-semibold text-foreground'>{artist}</h4>
                    </div>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      <Badge variant='secondary'>{count as number} obras</Badge>
                      {productMetrics.data?.averagePrice && (
                        <Badge variant='outline'>
                          ${parseFloat(productMetrics.data.averagePrice).toFixed(2)} promedio
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>Valor estimado</p>
                    <p className='font-bold text-success'>
                      $
                      {productMetrics.data?.averagePrice
                        ? (
                            parseFloat(productMetrics.data.averagePrice) * (count as number)
                          ).toLocaleString()
                        : '0'}
                    </p>
                  </div>
                </div>
              ))}
          </>
        ) : (
          <p className='text-center text-muted-foreground'>No hay datos de artistas disponibles</p>
        )}
      </AccordionCard>

      {/* <FinanceOverview role={ROLES.ADMIN.NAME} /> */}
    </div>
  )
}
