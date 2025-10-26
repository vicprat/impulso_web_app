'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  XCircle,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { Guard } from '@/components/Guards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog } from '@/src/components/Dialog'
import { Invoice } from '@/src/components/Invoce'
import { CreateFulfillmentDialog } from '@/src/components/Orders/CreateFulfillmentDialog'
import { PERMISSIONS } from '@/src/config/Permissions'
import { formatCurrency, formatDate, getStatusColor } from '@/src/helpers'
import { useDialog } from '@/src/hooks/useDialog'
import { useCustomerOrderHybrid } from '@/src/modules/customer/hooks'

import type { LineItem } from '@/src/modules/customer/types'
import type React from 'react'
export const dynamic = 'force-dynamic'

interface LineItemEdge {
  node: LineItem
}

export default function Page() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const orderQuery = useCustomerOrderHybrid(orderId)
  const { data: orderDetail, error, isLoading } = orderQuery

  const invoiceDialog = useDialog()

  const order = orderDetail?.order

  const isEventOrder = order?.requiresShipping === false

  // Determine shipping method based on shipping line
  const determineShippingMethod = (): 'standard' | 'local' => {
    if (!order?.shippingLine?.title) return 'standard'

    const title = order.shippingLine.title.toLowerCase()
    return title.includes('local') ? 'local' : 'standard'
  }

  const shippingMethod = determineShippingMethod()

  const lineItemsForFulfillment =
    order?.lineItems.edges.map((edge: LineItemEdge) => ({
      id: edge.node.id,
      quantity: edge.node.quantity,
      title: edge.node.title,
    })) ?? []

  if (isLoading) {
    return (
      <div className='container mx-auto space-y-6 py-10'>
        <Skeleton className='h-10 w-48' />
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <Skeleton className='h-48 w-full' />
          <Skeleton className='h-48 w-full' />
          <Skeleton className='h-48 w-full' />
        </div>
        <Skeleton className='h-64 w-full' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto space-y-6 py-10'>
        <Card className='bg-error-container/20 border-error-container shadow-elevation-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-error-container'>
              <XCircle className='size-6' /> Error al cargar los detalles de la orden
            </CardTitle>
          </CardHeader>
          <CardContent className='text-on-error-container/80'>
            <p>{error.message}</p>
            <Button onClick={() => router.back()} className='mt-4'>
              <ArrowLeft className='mr-2 size-4' /> Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className='container mx-auto space-y-6 py-10'>
        <Card className='bg-warning-container/20 border-warning-container shadow-elevation-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-warning-container'>
              Orden no encontrada
            </CardTitle>
          </CardHeader>
          <CardContent className='text-on-warning-container/80'>
            <p>La orden con ID {orderId} no pudo ser encontrada.</p>
            <Button onClick={() => router.back()} className='mt-4'>
              <ArrowLeft className='mr-2 size-4' /> Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-6 py-10'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col items-start gap-6'>
          <Button variant='outline' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 size-4' /> Volver a Órdenes
          </Button>
          <h1 className='text-3xl font-bold text-foreground'>Detalles de la Orden: {order.name}</h1>
        </div>
        <div className='flex gap-3'>
          <Dialog.Main
            open={invoiceDialog.open}
            onOpenChange={invoiceDialog.onOpenChange}
            title='Vista Previa del Recibo'
            triggerText='Vista Previa del Recibo'
            triggerIcon={FileText}
            triggerClassName='bg-primary text-on-primary'
            maxWidth='4xl'
          >
            <Invoice.Preview order={order} />
          </Dialog.Main>

          <PDFDownloadLink
            document={<Invoice.PDF order={order} />}
            fileName={`Invoice-${order.name}-${order.confirmationNumber}.pdf`}
          >
            {({ loading }) => (
              <Button
                disabled={loading}
                className='hover:bg-success-container/90 bg-success-container text-success'
              >
                <Download className='mr-2 size-4' />
                {loading ? 'Generando...' : 'Descargar PDF'}
              </Button>
            )}
          </PDFDownloadLink>

          <Guard.Permission permission={PERMISSIONS.MANAGE_ALL_ORDERS}>
            {!isEventOrder && order?.requiresShipping && lineItemsForFulfillment.length > 0 && (
              <CreateFulfillmentDialog
                orderId={orderId}
                lineItems={lineItemsForFulfillment}
                shippingMethod={shippingMethod}
                onSuccess={() => {
                  void orderQuery.refetch()
                }}
              />
            )}
          </Guard.Permission>
        </div>
      </div>

      {!order.requiresShipping && (
        <Card className='bg-success-container/20 border-success shadow-elevation-1'>
          <CardContent className='flex items-start gap-3 pt-6'>
            <CheckCircle className='mt-0.5 size-5 text-success' />
            <div>
              <p className='font-medium text-on-success-container'>
                Orden Digital - No Requiere Envío
              </p>
              <p className='text-on-success-container/80 text-sm'>
                Esta orden contiene tickets o entradas digitales para eventos. Los tickets se han
                generado automáticamente y están disponibles en el perfil del cliente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='bg-card shadow-elevation-1'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-foreground'>
            <CheckCircle className='size-5' />
            Estado de la Orden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div className='flex flex-col items-center space-y-2 rounded-lg bg-surface-container p-4'>
              <CreditCard className='size-6 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>Pago</span>
              <Badge className={getStatusColor(order.financialStatus, 'financial')}>
                {order.financialStatus}
              </Badge>
            </div>
            <div className='flex flex-col items-center space-y-2 rounded-lg bg-surface-container p-4'>
              <Package className='size-6 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>Cumplimiento</span>
              {order.requiresShipping === false ? (
                <Badge className='bg-success-container text-on-success-container'>
                  Entrega Digital
                </Badge>
              ) : (
                <Badge className={getStatusColor(order.fulfillmentStatus, 'fulfillment')}>
                  {order.fulfillmentStatus}
                </Badge>
              )}
            </div>
            <div className='flex flex-col items-center space-y-2 rounded-lg bg-surface-container p-4'>
              <Calendar className='size-6 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>Procesado</span>
              <span className='text-sm font-medium text-foreground'>
                {formatDate(order.processedAt)}
              </span>
            </div>
            <div className='flex flex-col items-center space-y-2 rounded-lg bg-surface-container p-4'>
              <FileText className='size-6 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>Confirmación</span>
              <span className='text-sm font-medium text-foreground'>
                {order.confirmationNumber}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card className='bg-card shadow-elevation-1'>
          <CardHeader>
            <CardTitle className='text-foreground'>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-muted-foreground'>
            <div className='flex justify-between'>
              <span>Subtotal:</span>
              <span className='font-medium text-foreground'>
                {formatCurrency(order.subtotal.amount, order.subtotal.currencyCode)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Envío:</span>
              <span className='font-medium text-foreground'>
                {formatCurrency(order.totalShipping.amount, order.totalShipping.currencyCode)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Impuestos:</span>
              <span className='font-medium text-foreground'>
                {formatCurrency(order.totalTax.amount, order.totalTax.currencyCode)}
              </span>
            </div>
            <Separator />
            <div className='flex justify-between text-lg'>
              <span className='font-semibold text-foreground'>Total:</span>
              <span className='font-bold text-foreground'>
                {formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}
              </span>
            </div>
            {parseFloat(order.totalRefunded.amount) > 0 && (
              <div className='flex justify-between text-error'>
                <span>Reembolsado:</span>
                <span className='font-medium'>
                  -{formatCurrency(order.totalRefunded.amount, order.totalRefunded.currencyCode)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='bg-card shadow-elevation-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-foreground'>
              <Mail className='size-5' />
              Detalles del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-muted-foreground'>
            <div>
              <span className='block font-medium text-foreground'>Nombre:</span>
              <span>
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </span>
            </div>
            <div>
              <span className='block font-medium text-foreground'>Email:</span>
              <span>{order.email}</span>
            </div>
            <div>
              <span className='block font-medium text-foreground'>Tipo de Entrega:</span>
              {order.requiresShipping === false ? (
                <Badge className='bg-success-container text-on-success-container'>
                  Digital - Eventos/Tickets
                </Badge>
              ) : order.shippingLine?.title ? (
                (() => {
                  const title = order.shippingLine.title.toLowerCase()
                  if (title.includes('local')) {
                    return (
                      <Badge className='bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'>
                        Envío Local
                      </Badge>
                    )
                  } else if (
                    title.includes('estándar') ||
                    title.includes('standard') ||
                    title.includes('paqueteria')
                  ) {
                    return (
                      <Badge className='bg-primary-container text-on-primary-container'>
                        Envío Estándar
                      </Badge>
                    )
                  } else {
                    return <Badge variant='outline'>{order.shippingLine.title}</Badge>
                  }
                })()
              ) : (
                <Badge variant='secondary'>No especificado</Badge>
              )}
            </div>
            <div>
              <span className='block font-medium text-foreground'>Estado de Entrega:</span>
              {(() => {
                const status = order.fulfillmentStatus
                const statusMap: Record<string, React.ReactNode> = {
                  FULFILLED: (
                    <Badge className='bg-success-container text-on-success-container'>
                      Enviado
                    </Badge>
                  ),
                  PARTIALLY_FULFILLED: <Badge variant='outline'>Parcialmente Enviado</Badge>,
                  UNFULFILLED: <Badge variant='secondary'>Pendiente de Envío</Badge>,
                }
                return (
                  statusMap[status] ?? (
                    <Badge variant='secondary'>{status ?? 'No disponible'}</Badge>
                  )
                )
              })()}
            </div>
            {order.statusPageUrl && (
              <div>
                <span className='mb-1 block font-medium text-foreground'>Estado de la Orden:</span>
                <Button variant='outline' size='sm' className='text-xs'>
                  <Truck className='mr-1 size-3' />
                  Ver Estado
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {order.shippingAddress && (
          <Card className='bg-card shadow-elevation-1'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-foreground'>
                <MapPin className='size-5' />
                Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-muted-foreground'>
              <p className='font-medium text-foreground'>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress && 'phone' in order.shippingAddress ? (
                <div className='mt-2 flex items-center gap-2'>
                  <Phone className='size-4' />
                  <span>
                    {typeof order.shippingAddress.phone === 'string'
                      ? order.shippingAddress.phone
                      : ''}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      <Card className='bg-card shadow-elevation-1'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-foreground'>
            <Package className='size-5' />
            Productos de la Orden
          </CardTitle>
        </CardHeader>
        <CardContent>
          {order.lineItems.edges.length > 0 ? (
            <div className='space-y-4'>
              {order.lineItems.edges.map((item: LineItemEdge) => (
                <div
                  key={item.node.id}
                  className='flex items-center justify-between rounded-lg bg-surface-container p-4'
                >
                  <div className='flex-1'>
                    <h4 className='font-medium text-foreground'>{item.node.title}</h4>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      Cantidad: {item.node.quantity}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-semibold text-foreground'>
                      {formatCurrency(item.node.price.amount, item.node.price.currencyCode)}
                    </p>
                    <p className='text-sm text-muted-foreground'>Por unidad</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='py-8 text-center text-muted-foreground'>
              No hay productos en esta orden.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className='bg-card shadow-elevation-1'>
        <CardHeader>
          <CardTitle className='text-foreground'>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
          <div>
            <span className='block font-medium text-foreground'>Creado:</span>
            <span className='text-muted-foreground'>{formatDate(order.createdAt)}</span>
          </div>
          <div>
            <span className='block font-medium text-foreground'>Última Actualización:</span>
            <span className='text-muted-foreground'>{formatDate(order.updatedAt)}</span>
          </div>
          <div>
            <span className='block font-medium text-foreground'>Editado:</span>
            <Badge
              className={
                order.edited
                  ? 'bg-warning-container text-on-warning-container'
                  : 'bg-success-container text-success'
              }
            >
              {order.edited ? 'Sí' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
