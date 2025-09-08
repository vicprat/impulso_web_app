'use client'

import { ArrowLeft, Calendar, Eye, MapPin, QrCode, Ticket, User } from 'lucide-react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetTicket } from '@/services/ticket/hook'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'
import { formatCurrency } from '@/src/helpers'
import { useAuth } from '@/src/modules/auth/context/useAuth'

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const { isLoading: authLoading } = useAuth()
  const { data: ticket, error, isLoading } = useGetTicket(params.id)
  const [showQr, setShowQr] = useState(false)

  if (authLoading || isLoading) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <Skeleton className='h-8 w-64' />
        <div className='space-y-4'>
          <Skeleton className='h-64 w-full' />
          <Skeleton className='h-32 w-full' />
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <div className='flex min-h-96 items-center justify-center'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar el boleto</h3>
            <p className='mt-2 text-muted-foreground'>
              {error instanceof Error ? error.message : 'Boleto no encontrado'}
            </p>
            <Button asChild className='mt-4'>
              <Link href='/manage-tickets'>Volver a Mis Boletos</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      CANCELLED: 'destructive',
      USED: 'secondary',
      VALID: 'default',
    } as const

    const labels = {
      CANCELLED: 'Cancelado',
      USED: 'Usado',
      VALID: 'Válido',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const formatEventDate = (date: string | null, startTime: string | null) => {
    if (!date) return 'Fecha no especificada'

    const eventDate = new Date(date)
    const dateStr = eventDate.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    })

    if (startTime) {
      return `${dateStr} a las ${startTime}`
    }

    return dateStr
  }

  const formatCreatedDate = (date: string) => {
    const createdDate = new Date(date)
    return createdDate.toLocaleDateString('es-MX', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className='space-y-6 p-4 md:p-6'>
        {/* Header con botón de regreso */}
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/manage-tickets'>
              <ArrowLeft className='mr-2 size-4' />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>Detalles del Boleto</h1>
            <p className='text-muted-foreground'>
              Información completa de tu entrada para el evento
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Información del evento */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Ticket className='size-5' />
                Información del Evento
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {ticket.event ? (
                <>
                  {ticket.event.primaryImage && (
                    <div className='relative aspect-video w-full overflow-hidden rounded-md'>
                      <img
                        src={ticket.event.primaryImage.url}
                        alt={ticket.event.primaryImage.altText ?? ticket.event.title}
                        className='object-cover'
                      />
                    </div>
                  )}

                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-semibold'>{ticket.event.title}</h3>
                      {getStatusBadge(ticket.status)}
                    </div>

                    <div className='flex items-center gap-2 text-sm'>
                      <User className='size-4 text-muted-foreground' />
                      <span>{ticket.event.vendor}</span>
                    </div>

                    {ticket.event.eventDetails.date && (
                      <div className='flex items-start gap-2 text-sm'>
                        <Calendar className='mt-0.5 size-4 text-muted-foreground' />
                        <div>
                          <div>
                            {formatEventDate(
                              ticket.event.eventDetails.date,
                              ticket.event.eventDetails.startTime
                            )}
                          </div>
                          {ticket.event.eventDetails.endTime && (
                            <div className='text-xs text-muted-foreground'>
                              Hasta las {ticket.event.eventDetails.endTime}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {ticket.event.eventDetails.location && (
                      <div className='flex items-center gap-2 text-sm'>
                        <MapPin className='size-4 text-muted-foreground' />
                        <span>{ticket.event.eventDetails.location}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className='space-y-3'>
                  <div className='text-sm text-muted-foreground'>
                    Información del evento no disponible
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    <p>Event ID: {ticket.eventId}</p>
                    <p>
                      Esto puede suceder si el evento fue eliminado o si hay un problema de
                      conexión.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del ticket */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <QrCode className='size-5' />
                Información del Boleto
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Código:</span>
                  <span className='font-mono text-sm'>{ticket.qrCode}</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Cantidad de entradas:</span>
                  <span className='font-semibold'>{ticket.quantity}</span>
                </div>

                {ticket.orderId && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>ID de Orden:</span>
                    <span className='font-mono text-sm'>{ticket.orderId}</span>
                  </div>
                )}

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Fecha de compra:</span>
                  <span className='text-sm'>{formatCreatedDate(ticket.createdAt)}</span>
                </div>

                {ticket.event && (
                  <div className='flex items-center justify-between border-t pt-3'>
                    <span className='text-sm text-muted-foreground'>Precio total pagado:</span>
                    <span className='font-semibold'>
                      {formatCurrency(
                        (parseFloat(ticket.event.price.amount) * ticket.quantity).toString(),
                        ticket.event.price.currencyCode
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className='flex gap-2 pt-4'>
                {ticket.event && (
                  <Button variant='outline' className='flex-1' asChild>
                    <Link
                      href={replaceRouteParams(ROUTES.STORE.PRODUCT_DETAIL.PATH, {
                        handle: ticket.event.handle,
                      })}
                      target='_blank'
                    >
                      <Eye className='mr-1 size-4' />
                      Ver Evento
                    </Link>
                  </Button>
                )}

                {/* {ticket.status === 'VALID' && (
                  <Button className='flex-1' onClick={() => setShowQr(true)}>
                    <QrCode className='mr-1 size-4' />
                    Mostrar QR
                  </Button>
                )} */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal del QR */}
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Boleto para: {ticket.event?.title ?? 'Evento'}</DialogTitle>
          </DialogHeader>

          <div className='flex flex-col items-center justify-center gap-4 p-4'>
            <QRCodeSVG value={ticket.qrCode} size={256} bgColor='#ffffff' fgColor='#000000' />

            <div className='rounded-md bg-muted p-2 font-mono text-sm'>{ticket.qrCode}</div>

            <p className='text-center text-sm text-muted-foreground'>
              Presenta este código QR en la entrada del evento.
            </p>

            <div className='text-center text-xs text-muted-foreground'>
              <p>Cantidad de entradas: {ticket.quantity}</p>
              <p>Este QR es válido para todas las entradas de esta compra.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
