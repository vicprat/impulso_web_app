import { AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react'
import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useCustomerDashboard } from '@/src/modules/dashboard/hooks/useCustomerDashboard'
import { useUserPrivateRoom } from '@/src/modules/rooms/hooks'

// Reusing components from Admin.tsx for consistency
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

interface CustomerDashboardProps {
  userId?: string
  role: string
}

export const Customer: React.FC<CustomerDashboardProps> = ({ role, userId }) => {
  const { data, error, isLoading } = useCustomerDashboard()
  const isVipCustomer = role === 'vip_customer'
  const {
    data: privateRoomData,
    error: privateRoomError,
    isLoading: isLoadingPrivateRoom,
  } = useUserPrivateRoom(userId || '')

  if (isLoading || (isVipCustomer && isLoadingPrivateRoom)) return <LoadingDashboard />
  if (error) return <ErrorDashboard error={error} />
  if (isVipCustomer && privateRoomError) return <ErrorDashboard error={privateRoomError} />
  if (!data?.customer)
    return <div className='p-8 text-center'>No hay datos de cliente disponibles.</div>

  const { customer } = data
  const totalOrdersDisplayed = customer.orders.edges.length
  const totalSpent = customer.orders.edges.reduce((sum, order) => {
    const amount = parseFloat(order.node.totalPrice.amount)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  // Prepare data for monthly spending chart (example, you might need to aggregate from orders)
  const monthlySpendingData = customer.orders.edges.reduce(
    (acc, order) => {
      const date = new Date(order.node.processedAt)
      const month = date.toLocaleString('default', { month: 'short' })
      const year = date.getFullYear()
      const key = `${month}-${year}`

      const amount = parseFloat(order.node.totalPrice.amount)

      if (!acc[key]) {
        acc[key] = { amount: 0, month: `${month} ${year}` }
      }
      acc[key].amount += isNaN(amount) ? 0 : amount
      return acc
    },
    {} as Record<string, { month: string; amount: number }>
  )

  const sortedMonthlySpending = Object.values(monthlySpendingData).sort((a, b) => {
    // Simple sorting by month-year, might need more robust date parsing for accurate sorting
    const dateA = new Date(a.month)
    const dateB = new Date(b.month)
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <div className='min-h-screen space-y-8 bg-surface-container-low p-8'>
      <h1 className='text-3xl font-bold text-foreground'>
        Bienvenido, {customer.firstName} {customer.lastName}!
      </h1>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'>
        <MetricCard
          title='Órdenes Recientes'
          value={totalOrdersDisplayed.toLocaleString()}
          icon={ShoppingCart}
          color='blue'
        />
        <MetricCard
          title='Gasto Total'
          value={`${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color='green'
        />
      </div>

      {isVipCustomer && (
        <ChartCard title='Tu Sala Privada'>
          {isLoadingPrivateRoom ? (
            <p>Cargando información de la sala privada...</p>
          ) : privateRoomData ? (
            <div className='space-y-2'>
              <p>
                Nombre de la Sala: <span className='font-semibold'>{privateRoomData.name}</span>
              </p>
              <p>Descripción: {privateRoomData.description}</p>
              <p>Estado: {privateRoomData.name}</p>
              {/* Add more private room details as needed */}
            </div>
          ) : (
            <p>No tienes una sala privada asignada.</p>
          )}
        </ChartCard>
      )}

      <ChartCard title='Historial de Gasto Mensual'>
        <ResponsiveContainer width='100%' height={300}>
          <AreaChart data={sortedMonthlySpending}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' />
            <YAxis />
            <Tooltip
              formatter={(value) => [
                `${parseFloat(value.toString()).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
                'Gasto',
              ]}
            />
            <Area
              type='monotone'
              dataKey='amount'
              stroke='#8884d8'
              fill='#8884d8'
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title='Tus Últimas Órdenes'>
        <div className='space-y-4'>
          {customer.orders.edges.length > 0 ? (
            customer.orders.edges.map((order) => (
              <div
                key={order.node.id}
                className='flex items-center justify-between rounded-lg bg-surface-container-low p-3'
              >
                <div className='flex-1'>
                  <h4 className='font-semibold text-foreground'>Orden {order.node.name}</h4>
                  <p className='text-sm text-muted-foreground'>
                    {new Date(order.node.processedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-bold text-success'>
                    {order.node.totalPrice.currencyCode}{' '}
                    {parseFloat(order.node.totalPrice.amount).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className='text-center text-muted-foreground'>No tienes órdenes recientes.</p>
          )}
        </div>
      </ChartCard>
    </div>
  )
}
