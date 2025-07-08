'use client'

import { Calendar, Eye, MapPin, QrCode, Ticket, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetTicketsByUserId } from '@/services/ticket/hook'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'
import { formatCurrency } from '@/src/helpers'
import { useAuth } from '@/src/modules/auth/context/useAuth'

interface TicketWithEvent {
  id: string
  userId: string
  eventId: string
  qrCode: string
  status: string
  createdAt: string
  updatedAt: string
  event: {
    id: string
    title: string
    handle: string
    vendor: string
    eventDetails: {
      date: string | null
      location: string | null
      startTime: string | null
      endTime: string | null
      organizer: string | null
    }
    status: string
    primaryImage: {
      url: string
      altText: string | null
    } | null
    price: {
      amount: string
      currencyCode: string
    }
  } | null
}

export default function ManageTicketsPage() {
  const { isLoading: authLoading } = useAuth()
  const { data: tickets, error, isLoading } = useGetTicketsByUserId()

  const [ticketToShowQr, setTicketToShowQr] = useState<TicketWithEvent | null>(null)

  if (authLoading || isLoading) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <Skeleton className='h-8 w-64' />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-64 w-full' />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <div className='flex min-h-96 items-center justify-center'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar boletos</h3>

            <p className='mt-2 text-muted-foreground'>
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
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

  return (
    <>
      <div className='space-y-6 p-4 md:p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Mis Boletos</h1>
            <p className='text-muted-foreground'>
              Aquí puedes ver y gestionar tus boletos para eventos.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Ticket className='size-5' />
            <span className='text-sm text-muted-foreground'>
              {tickets?.length ?? 0} boleto{tickets?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {tickets && tickets.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {tickets.map((ticket: TicketWithEvent) => (
              <Card key={ticket.id} className='overflow-hidden'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                      <QrCode className='size-5' />
                      {ticket.event?.title ?? 'Evento sin título'}
                    </CardTitle>
                    {getStatusBadge(ticket.status)}
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {ticket.event?.primaryImage && (
                    <div className='relative aspect-video w-full overflow-hidden rounded-md'>
                      <Image
                        src={ticket.event.primaryImage.url}
                        alt={ticket.event.primaryImage.altText ?? ticket.event.title}
                        fill
                        className='object-cover'
                      />
                    </div>
                  )}
                  {ticket.event ? (
                    <div className='space-y-3'>
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
                                Hasta las
                                {ticket.event.eventDetails.endTime}
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
                      <div className='flex items-center justify-between border-t pt-2'>
                        <span className='text-sm text-muted-foreground'>Precio pagado:</span>

                        <span className='font-semibold'>
                          {formatCurrency(
                            ticket.event.price.amount,
                            ticket.event.price.currencyCode
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className='text-sm text-muted-foreground'>
                      Información del evento no disponible
                    </div>
                  )}
                  <div className='border-t pt-2'>
                    <div className='mb-1 text-xs text-muted-foreground'>Código QR:</div>

                    <div className='rounded bg-muted p-2 font-mono text-xs'>{ticket.qrCode}</div>
                  </div>
                  <div className='flex gap-2 pt-2'>
                    {ticket.event && (
                      <Button variant='outline' size='sm' className='flex-1' asChild>
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

                    {ticket.status === 'VALID' && (
                      <Button
                        size='sm'
                        className='flex-1'
                        onClick={() => setTicketToShowQr(ticket)}
                      >
                        <QrCode className='mr-1 size-4' />
                        Mostrar QR
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className='flex min-h-96 items-center justify-center'>
            <div className='text-center'>
              <Ticket className='mx-auto mb-4 size-16 text-muted-foreground' />
              <h3 className='mb-2 text-lg font-semibold'>No tienes boletos</h3>
              <p className='mb-4 text-muted-foreground'>
                Cuando compres boletos para eventos, aparecerán aquí.
              </p>

              <Button asChild>
                <Link href={ROUTES.STORE.MAIN.PATH}>Explorar Eventos</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
      <Dialog
        open={!!ticketToShowQr}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setTicketToShowQr(null)
          }
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Boleto para: {ticketToShowQr?.event?.title ?? 'Evento'}</DialogTitle>
          </DialogHeader>

          {ticketToShowQr && (
            <div className='flex flex-col items-center justify-center gap-4 p-4'>
              <QRCodeSVG
                value={ticketToShowQr.qrCode}
                size={256}
                bgColor='#ffffff'
                fgColor='#000000'
              />

              <div className='rounded-md bg-muted p-2 font-mono text-sm'>
                {ticketToShowQr.qrCode}
              </div>

              <p className='text-center text-sm text-muted-foreground'>
                Presenta este código QR en la entrada del evento.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
