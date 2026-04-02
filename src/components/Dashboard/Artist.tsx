'use client'
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  MapPin,
  Palette,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import React, { useState } from 'react'
import {
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

import { useArtistDashboard } from '@/src/modules/dashboard/hooks'

import { Badge } from '../ui/badge'

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

export const Artist = () => {
  const { data, error, isLoading } = useArtistDashboard()

  const [expandedArtists, setExpandedArtists] = useState(false)
  const [expandedEvents, setExpandedEvents] = useState(false)

  if (isLoading) return <LoadingDashboard />
  if (error) return <ErrorDashboard error={error as Error} />
  if (!data) return <div className='p-8 text-center'>No hay datos disponibles</div>

  const {
    artistEvents,
    artistMetrics,
    artistProducts,
    artistProductsByCategory,
    artistProductsByLocation,
    artistProductsByMedium,
    artistProductsBySerie,
    artistProductsByYear,
    user,
  } = data

  const currentArtist = user?.name || 'Artista'

  return (
    <div className='min-h-screen space-y-8 bg-surface-container-low p-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-foreground'>Dashboard de {currentArtist}</h1>
        <p className='text-muted-foreground'>Bienvenido a tu panel de control personal</p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          title='Mis Obras'
          value={artistMetrics.totalProducts}
          icon={Palette}
          color='purple'
          subtitle={`${artistMetrics.activeProducts} activas`}
        />
        <MetricCard
          title='Valor Total'
          value={`$${artistMetrics.totalValue.toLocaleString()}`}
          icon={DollarSign}
          color='green'
          subtitle={`$${artistMetrics.averagePrice.toFixed(2)} promedio`}
        />
        <MetricCard
          title='Obras con Detalles'
          value={artistMetrics.productsWithArtworkDetails}
          icon={BookOpen}
          color='blue'
          subtitle={`${Object.keys(artistProductsByMedium).length - 1} medios`}
        />
        <MetricCard
          title='Mis Eventos'
          value={artistEvents.length}
          icon={Calendar}
          color='orange'
          subtitle={`${artistEvents.filter((e: any) => e.status === 'ACTIVE').length} activos`}
        />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <ChartCard title='Mis Obras por Categoría'>
          {Object.keys(artistProductsByCategory).length > 0 ? (
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(artistProductsByCategory)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([category, count], index) => ({
                      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                      name: category,
                      value: count,
                    }))}
                  cx='50%'
                  cy='50%'
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {Object.entries(artistProductsByCategory)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([category, count], index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                      />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Obras']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className='text-center text-muted-foreground'>
              No hay datos de categorías disponibles
            </p>
          )}
        </ChartCard>

        <ChartCard title='Mis Obras por Medio Artístico'>
          {Object.keys(artistProductsByMedium).length > 0 ? (
            <ResponsiveContainer width='100%' height={300}>
              <BarChart
                data={Object.entries(artistProductsByMedium)
                  .filter(([medium]) => medium !== 'Sin medio especificado')
                  .map(([medium, count]) => ({
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                    name: medium,
                    value: count,
                  }))}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' angle={-45} textAnchor='end' height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Obras']} />
                <Bar dataKey='value' fill='#8884d8' />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className='text-center text-muted-foreground'>No hay datos de medios disponibles</p>
          )}
        </ChartCard>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <ChartCard title='Mis Obras por Año'>
          {Object.keys(artistProductsByYear).length > 0 ? (
            <ResponsiveContainer width='100%' height={300}>
              <BarChart
                data={Object.entries(artistProductsByYear)
                  .filter(([year]) => year !== 'Sin año especificado')
                  .sort(([a], [b]) => parseInt(a as string) - parseInt(b as string))
                  .map(([year, count]) => ({
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                    name: year,
                    value: count,
                  }))}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Obras']} />
                <Bar dataKey='value' fill='#82ca9d' />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className='text-center text-muted-foreground'>No hay datos de años disponibles</p>
          )}
        </ChartCard>

        <ChartCard title='Mis Obras por Ubicación'>
          {Object.keys(artistProductsByLocation).length > 0 ? (
            <div className='space-y-4'>
              {Object.entries(artistProductsByLocation)
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
          ) : (
            <p className='text-center text-muted-foreground'>
              No hay datos de ubicaciones disponibles
            </p>
          )}
        </ChartCard>
      </div>

      <AccordionCard
        title='Mis Obras'
        isExpanded={expandedArtists}
        onToggle={() => setExpandedArtists(!expandedArtists)}
        totalItems={artistProducts.length}
        visibleItems={5}
      >
        {artistProducts.length > 0 ? (
          <>
            {artistProducts
              .slice(0, expandedArtists ? undefined : 5)
              .map((product: any, index: number) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded-lg bg-surface-container-low p-4'
                >
                  <div className='flex-1'>
                    <div className='flex items-center'>
                      <Palette className='mr-2 size-4 text-primary' />
                      <h4 className='font-semibold text-foreground'>{product.title}</h4>
                    </div>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      <Badge variant='secondary'>{product.productType}</Badge>
                      <Badge variant='outline'>{product.status}</Badge>
                      <Badge variant='secondary-container'>{product.price}</Badge>
                    </div>
                    {product.artworkDetails && (
                      <div className='mt-2 text-sm text-muted-foreground'>
                        {product.artworkDetails.medium && `🎨 ${product.artworkDetails.medium}`}
                        {product.artworkDetails.year && ` | 📅 ${product.artworkDetails.year}`}
                        {product.artworkDetails.location &&
                          ` | 📍 ${product.artworkDetails.location}`}
                        {product.artworkDetails.serie && ` | 📚 ${product.artworkDetails.serie}`}
                      </div>
                    )}
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>Estado</p>
                    <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {product.status === 'ACTIVE' ? 'Activo' : 'Borrador'}
                    </Badge>
                  </div>
                </div>
              ))}
          </>
        ) : (
          <p className='text-center text-muted-foreground'>No tienes obras registradas</p>
        )}
      </AccordionCard>

      <AccordionCard
        title='Mis Eventos'
        isExpanded={expandedEvents}
        onToggle={() => setExpandedEvents(!expandedEvents)}
        totalItems={artistEvents.length}
        visibleItems={5}
      >
        {artistEvents.length > 0 ? (
          <>
            {artistEvents
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
          </>
        ) : (
          <p className='text-center text-muted-foreground'>No tienes eventos registrados</p>
        )}
      </AccordionCard>
    </div>
  )
}
