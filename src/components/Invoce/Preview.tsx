'use client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CheckCircle, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { PDF } from './Pdf'

import type { CustomerOrder, LineItem } from '@/src/modules/customer/types'

interface Props {
  order: CustomerOrder
}

interface LineItemEdge {
  node: LineItem
}

export const Preview: React.FC<Props> = ({ order }) => {
  const formatPrice = (amount: string, currency: string) => {
    const numericAmount = parseFloat(amount)
    return `$${numericAmount.toLocaleString('es-MX')} ${currency}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className='max-h-[70vh] overflow-y-auto'>
      <div className='mb-6 flex w-full flex-wrap justify-end p-2'>
        <PDFDownloadLink
          document={<PDF order={order} />}
          fileName={`Invoice-${order.name}-${order.confirmationNumber}.pdf`}
        >
          {({ loading }) => (
            <Button disabled={loading} className='bg-primary text-on-primary'>
              <Download className='mr-2 size-4' />
              {loading ? 'Generando...' : 'Descargar PDF'}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      <div className='rounded-lg border bg-white p-8 text-black' id='invoice-content'>
        <div className='mb-8 flex items-start justify-between'>
          <div>
            <img
              src="/assets/logo.png"
              alt="Impulso Galería"
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className='text-right'>
            <h2 className='text-2xl font-semibold text-gray-800'>Invoice {order.name}</h2>
            <p className='mt-1 text-sm text-gray-600'>Fecha: {formatDate(order.processedAt)}</p>
            <p className='text-sm text-gray-600'>Confirmación: {order.confirmationNumber}</p>
          </div>
        </div>

        <div className='mb-8 grid grid-cols-2 gap-8'>
          <div>
            <h3 className='mb-3 font-semibold text-gray-800'>FROM:</h3>
            <div className='space-y-1 text-sm text-gray-600'>
              <p className='font-medium'>Impulso Galería</p>
              <p>Hacienda Escolásticas 107</p>
              <p>Jardines de la Hacienda</p>
              <p>Querétaro, Querétaro 76180</p>
              <p>México</p>
              <p>+52 442 157 0443</p>
              <p>info@impulsogaleria.com</p>
            </div>
          </div>

          <div>
            <h3 className='mb-3 font-semibold text-gray-800'>TO:</h3>
            <div className='space-y-1 text-sm text-gray-600'>
              <p className='font-medium'>
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </p>
              <p>{order.email}</p>
              {order.shippingAddress && (
                <>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.zip}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                </>
              )}
            </div>
          </div>
        </div>

        <div className='mb-8'>
          <h3 className='mb-4 font-semibold text-gray-800'>INVOICE ITEMS</h3>
          <div className='border border-gray-300'>
            <div className='grid grid-cols-12 gap-4 border-b border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-700'>
              <div className='col-span-6'>Producto</div>
              <div className='col-span-2 text-center'>Cantidad</div>
              <div className='col-span-2 text-right'>Precio Original</div>
              <div className='col-span-2 text-right'>Precio Factura</div>
            </div>

            {order.lineItems.edges.map((item: LineItemEdge) => (
              <div
                key={item.node.id}
                className='grid grid-cols-12 gap-4 border-b border-gray-200 p-4 last:border-b-0'
              >
                <div className='col-span-6'>
                  <p className='font-medium text-gray-800'>{item.node.title}</p>
                </div>
                <div className='col-span-2 text-center text-gray-600'>{item.node.quantity}</div>
                <div className='col-span-2 text-right text-gray-600'>
                  {formatPrice(item.node.price.amount, item.node.price.currencyCode)}
                </div>
                <div className='col-span-2 text-right font-medium text-gray-800'>
                  {formatPrice(item.node.price.amount, item.node.price.currencyCode)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex justify-end'>
          <div className='w-80'>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Subtotal:</span>
                <span className='text-gray-800'>
                  {formatPrice(order.subtotal.amount, order.subtotal.currencyCode)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Envío:</span>
                <span className='text-gray-800'>
                  {formatPrice(order.totalShipping.amount, order.totalShipping.currencyCode)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Impuestos:</span>
                <span className='text-gray-800'>
                  {formatPrice(order.totalTax.amount, order.totalTax.currencyCode)}
                </span>
              </div>
              <div className='mt-2 border-t border-gray-300 pt-2'>
                <div className='flex justify-between text-lg font-semibold'>
                  <span className='text-gray-800'>Total:</span>
                  <span className='text-gray-800'>
                    {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
                  </span>
                </div>
              </div>

              {order.financialStatus === 'PAID' && (
                <div className='mt-4 flex justify-end'>
                  <div className='flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800'>
                    <CheckCircle className='mr-1 size-4' />
                    Paid
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
