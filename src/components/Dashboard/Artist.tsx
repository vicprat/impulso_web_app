import {
  AlertTriangle,
  DollarSign,
  Package,
  PlusCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import React, { useState } from 'react'

import { useArtistProducts } from '@/src/modules/dashboard/hooks/useArtistProducts'

// Reusing components from Admin.tsx for consistency
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

interface ArtistDashboardProps {
  userId: string
}

export const Artist: React.FC<ArtistDashboardProps> = ({ userId }) => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined)

  const { artistDetails, error, isLoading, productsData } = useArtistProducts(
    userId,
    page,
    limit,
    statusFilter,
    sortBy,
    sortOrder
  )

  if (isLoading) return <LoadingDashboard />
  if (error) return <ErrorDashboard error={error} />
  if (!productsData || !artistDetails)
    return <div className='p-8 text-center'>No hay datos disponibles para el artista.</div>

  const totalProducts = productsData.products.length // This will only be the count of products on the current page
  const totalSalesValue = productsData.products.reduce(
    (sum, product) => sum + parseFloat(product.price),
    0
  )
  const activeProducts = productsData.products.filter((p) => p.status === 'ACTIVE').length

  return (
    <div className='min-h-screen space-y-8 bg-surface-container-low p-8'>
      <h1 className='text-3xl font-bold text-foreground'>
        Bienvenido, {artistDetails.firstName} {artistDetails.lastName}!
      </h1>
      {artistDetails.artist?.name && (
        <p className='text-lg text-muted-foreground'>
          Gestionando productos para:{' '}
          <span className='font-semibold'>{artistDetails.artist.name}</span>
        </p>
      )}

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <MetricCard
          title='Total de Productos'
          value={totalProducts.toLocaleString()}
          icon={Package}
          color='blue'
        />
        <MetricCard
          title='Productos Activos'
          value={activeProducts.toLocaleString()}
          icon={Package}
          color='green'
        />
        <MetricCard
          title='Valor Total de Ventas (Estimado)'
          value={`${totalSalesValue.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color='purple'
        />
      </div>

      <ChartCard title='Tus Productos'>
        <div className='mb-4 flex flex-col items-center justify-between space-y-4 md:flex-row md:space-x-4 md:space-y-0'>
          <button className='hover:bg-primary/90 flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground'>
            <PlusCircle className='mr-2 size-5' />
            Agregar Nuevo Producto
          </button>

          <div className='flex items-center space-x-2'>
            <label htmlFor='statusFilter' className='text-sm text-muted-foreground'>
              Estado:
            </label>
            <select
              id='statusFilter'
              className='rounded-md border bg-background p-2 text-foreground'
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || undefined)}
            >
              <option value=''>Todos</option>
              <option value='ACTIVE'>Activo</option>
              <option value='DRAFT'>Borrador</option>
              <option value='ARCHIVED'>Archivado</option>
            </select>

            <label htmlFor='sortBy' className='text-sm text-muted-foreground'>
              Ordenar por:
            </label>
            <select
              id='sortBy'
              className='rounded-md border bg-background p-2 text-foreground'
              value={sortBy || ''}
              onChange={(e) => setSortBy(e.target.value || undefined)}
            >
              <option value=''>Defecto</option>
              <option value='title'>Título</option>
              <option value='price'>Precio</option>
              <option value='createdAt'>Fecha de Creación</option>
              <option value='updatedAt'>Última Actualización</option>
              <option value='inventoryQuantity'>Inventario</option>
            </select>

            <label htmlFor='sortOrder' className='text-sm text-muted-foreground'>
              Orden:
            </label>
            <select
              id='sortOrder'
              className='rounded-md border bg-background p-2 text-foreground'
              value={sortOrder || ''}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc' | undefined)}
            >
              <option value=''>Defecto</option>
              <option value='asc'>Ascendente</option>
              <option value='desc'>Descendente</option>
            </select>
          </div>
        </div>

        <div className='space-y-4'>
          {productsData.products.length > 0 ? (
            productsData.products.map((product) => (
              <div
                key={product.id}
                className='flex items-center justify-between rounded-lg bg-surface-container-low p-3'
              >
                <div className='flex-1'>
                  <h4 className='font-semibold text-foreground'>{product.title}</h4>
                  <p className='text-sm text-muted-foreground'>
                    Estado: {product.status} | Inventario: {product.inventoryQuantity}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Precio: $
                    {parseFloat(product.price).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className='flex space-x-2 text-right'>
                  <button className='text-sm text-primary hover:underline'>Editar</button>
                  <button className='text-sm text-error hover:underline'>Eliminar</button>
                </div>
              </div>
            ))
          ) : (
            <p className='text-center text-muted-foreground'>
              No tienes productos para gestionar con los filtros actuales.
            </p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className='mt-4 flex items-center justify-center space-x-2'>
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className='rounded-md border bg-background px-4 py-2 text-foreground disabled:opacity-50'
          >
            Anterior
          </button>
          <span className='text-foreground'>Página {page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!productsData.pageInfo.hasNextPage}
            className='rounded-md border bg-background px-4 py-2 text-foreground disabled:opacity-50'
          >
            Siguiente
          </button>
        </div>
      </ChartCard>
    </div>
  )
}
