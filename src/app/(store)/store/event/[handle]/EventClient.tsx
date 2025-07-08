'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Share2,
  Ticket,
  User,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { AddToCartButton } from '@/components/Cart/AddToCartButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { type Event } from '@/models/Event'
import { type AuthSession } from '@/modules/auth/service'

interface EventClientProps {
  event: Event
  relatedEvents: Event[]
  session: AuthSession | null
}

const extractEventDetails = (event: Event) => {
  return {
    date: event.eventDetails?.date,
    endTime: event.eventDetails?.endTime,
    location: event.eventDetails?.location,
    organizer: event.eventDetails?.organizer,
    startTime: event.eventDetails?.startTime,
  }
}

const calculateDaysUntilEvent = (eventDate: string | null): number | null => {
  if (!eventDate) return null

  const event = new Date(eventDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  event.setHours(0, 0, 0, 0)

  const diffTime = event.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export const EventClient: React.FC<EventClientProps> = ({ event, relatedEvents, session }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)

  const eventDetails = extractEventDetails(event)
  const eventDate = eventDetails.date ? new Date(eventDetails.date) : null
  const daysUntilEvent = calculateDaysUntilEvent(eventDetails.date)
  const isPastEvent = eventDate ? eventDate < new Date() : false

  const primaryVariant = event.variants[0]
  const isAvailable = event.isAvailable && !isPastEvent

  const formatEventDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  }

  const formatEventTime = (time: string) => {
    return time
  }

  const openLightbox = (index: number) => {
    setLightboxImageIndex(index)
    setLightboxOpen(true)
  }

  const shareEvent = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          text: `¡Mira este evento! ${eventDetails.date ? formatEventDate(new Date(eventDetails.date)) : ''}`,
          title: event.title,
          url: window.location.href,
        })
      } catch {
        // You could show a toast here
      }
    } else {
      void navigator.clipboard.writeText(window.location.href)
    }
  }

  const formatPrice = () => {
    return event.formattedPrice
  }

  return (
    <div className='min-h-screen '>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <nav className='mb-6 text-sm text-muted-foreground'>
          <Link href='/store' className='hover:text-foreground'>
            Tienda
          </Link>
          <span className='mx-2'>/</span>
          <Link href='/store/events' className='hover:text-foreground'>
            Eventos
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-foreground'>{event.title}</span>
        </nav>

        <div className='lg:grid lg:grid-cols-12 lg:gap-8'>
          <div className='lg:col-span-7'>
            <div className='space-y-4'>
              <div className='group relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-lg'>
                {event.images.length > 0 ? (
                  <Image
                    src={event.images[currentImageIndex]?.url}
                    alt={event.images[currentImageIndex]?.altText ?? event.title}
                    fill
                    className='object-cover transition-transform duration-500 hover:scale-105'
                    onClick={() => openLightbox(currentImageIndex)}
                    priority
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <Calendar className='size-24 text-muted-foreground' />
                  </div>
                )}

                <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                <div className='absolute bottom-4 left-4 text-white'>
                  {eventDate && (
                    <div className='flex items-center gap-2 text-sm'>
                      <CalendarIcon className='size-4' />
                      {formatEventDate(eventDate)}
                    </div>
                  )}
                  {eventDetails.location && (
                    <div className='mt-1 flex items-center gap-2 text-sm'>
                      <MapPin className='size-4' />
                      {eventDetails.location}
                    </div>
                  )}
                </div>

                <div className='absolute right-4 top-4'>
                  {isPastEvent ? (
                    <Badge variant='secondary'>Evento Pasado</Badge>
                  ) : daysUntilEvent !== null && daysUntilEvent <= 7 ? (
                    <Badge variant='default'>
                      {daysUntilEvent === 0 ? '¡Hoy!' : `En ${daysUntilEvent} días`}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {event.images.length > 1 && (
                <div className='grid grid-cols-4 gap-2 sm:grid-cols-6'>
                  {event.images.map((image, index) => (
                    <button
                      key={image.id ?? index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        currentImageIndex === index
                          ? 'ring-primary/20 border-primary ring-2'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.altText ?? `${event.title} ${index + 1}`}
                        width={120}
                        height={120}
                        className='size-full object-cover'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='mt-8 lg:col-span-5 lg:mt-0'>
            <div className='space-y-6'>
              <div>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h1 className='text-3xl font-bold leading-tight text-foreground lg:text-4xl'>
                      {event.title}
                    </h1>
                    {event.vendor && (
                      <p className='mt-2 text-lg font-medium text-muted-foreground'>
                        por {event.vendor}
                      </p>
                    )}
                  </div>
                  <Button variant='outline' size='sm' onClick={shareEvent}>
                    <Share2 className='size-4' />
                  </Button>
                </div>

                <div className='mt-4'>
                  <div className='text-3xl font-bold text-foreground'>{formatPrice()}</div>
                  <p className='text-sm text-muted-foreground'>por entrada</p>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Ticket className='size-5' />
                    Detalles del Evento
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {eventDate && (
                    <div className='flex items-center gap-3'>
                      <Calendar className='size-5 text-muted-foreground' />
                      <div>
                        <p className='font-medium'>{formatEventDate(eventDate)}</p>
                        {eventDetails.startTime && (
                          <p className='text-sm text-muted-foreground'>
                            {formatEventTime(eventDetails.startTime)}
                            {eventDetails.endTime && ` - ${formatEventTime(eventDetails.endTime)}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {eventDetails.location && (
                    <div className='flex items-center gap-3'>
                      <MapPin className='size-5 text-muted-foreground' />
                      <div>
                        <p className='font-medium'>{eventDetails.location}</p>
                      </div>
                    </div>
                  )}

                  {eventDetails.organizer && (
                    <div className='flex items-center gap-3'>
                      <User className='size-5 text-muted-foreground' />
                      <div>
                        <p className='font-medium'>Organizado por</p>
                        <p className='text-sm text-muted-foreground'>{eventDetails.organizer}</p>
                      </div>
                    </div>
                  )}

                  <div className='flex items-center gap-3'>
                    <Ticket className='size-5 text-muted-foreground' />
                    <div>
                      <p className='font-medium'>Disponibilidad</p>
                      <div className='flex items-center gap-2'>
                        <Badge variant={isAvailable ? 'default' : 'destructive'}>
                          {isPastEvent
                            ? 'Evento Terminado'
                            : isAvailable
                              ? 'Entradas Disponibles'
                              : 'Agotado'}
                        </Badge>
                        {primaryVariant.inventoryQuantity && (
                          <span className='text-sm text-muted-foreground'>
                            {primaryVariant.inventoryQuantity} restantes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add to Cart Button */}
              <div className='space-y-4'>
                <AddToCartButton
                  product={{
                    ...event,
                    availableForSale: event.isAvailable,
                    images: event.images.map((img) => ({
                      ...img,
                      height: img.height ?? 0,
                      width: img.width ?? 0,
                    })),
                  }}
                  selectedVariant={primaryVariant}
                  size='lg'
                  className='w-full'
                  disabled={!isAvailable}
                  showQuantitySelector={true}
                />

                {isPastEvent && (
                  <p className='text-center text-sm text-muted-foreground'>
                    Este evento ya ha terminado
                  </p>
                )}

                {session && (
                  <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
                    <div className='flex items-center gap-2'>
                      <Ticket className='size-5 text-blue-600 dark:text-blue-400' />
                      <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
                        Entrada Digital
                      </h3>
                    </div>
                    <p className='mt-2 text-sm text-blue-700 dark:text-blue-300'>
                      Tu entrada digital será enviada automáticamente después de la compra
                    </p>
                    <Button
                      variant='outline'
                      size='sm'
                      className='mt-3 border-blue-300 text-blue-700 hover:bg-blue-100'
                      onClick={() => (window.location.href = '/manage-tickets')}
                    >
                      Ver Mis Entradas
                    </Button>
                  </div>
                )}
              </div>

              {event.descriptionHtml && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre este Evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className='prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground'
                      dangerouslySetInnerHTML={{ __html: event.descriptionHtml }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {relatedEvents.length > 0 && (
          <div className='mt-16'>
            <div className='mb-8'>
              <h2 className='text-2xl font-bold text-foreground'>
                Otros Eventos que te Podrían Interesar
              </h2>
              <p className='mt-2 text-muted-foreground'>Descubre más eventos emocionantes</p>
            </div>

            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {relatedEvents.slice(0, 6).map((relatedEvent) => {
                const relatedEventDetails = extractEventDetails(relatedEvent)
                return (
                  <Card key={relatedEvent.id} className='group overflow-hidden'>
                    <Link href={`/store/event/${relatedEvent.handle}`}>
                      <div className='aspect-[4/3] overflow-hidden'>
                        {relatedEvent.images[0] ? (
                          <Image
                            src={relatedEvent.images[0].url}
                            alt={relatedEvent.title}
                            width={400}
                            height={300}
                            className='size-full object-cover transition-transform duration-300 group-hover:scale-105'
                          />
                        ) : (
                          <div className='flex h-full items-center justify-center bg-muted'>
                            <Calendar className='size-12 text-muted-foreground' />
                          </div>
                        )}
                      </div>
                      <CardContent className='p-4'>
                        <h3 className='font-semibold group-hover:text-primary'>
                          {relatedEvent.title}
                        </h3>
                        <p className='text-sm text-muted-foreground'>{relatedEvent.vendor}</p>
                        {relatedEventDetails.date && (
                          <p className='mt-1 text-xs text-muted-foreground'>
                            📅{' '}
                            {format(new Date(relatedEventDetails.date), 'd MMM yyyy', {
                              locale: es,
                            })}
                          </p>
                        )}
                        <div className='mt-2 text-lg font-bold'>{relatedEvent.formattedPrice}</div>
                      </CardContent>
                    </Link>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className='max-w-screen-xl border-none bg-black/95 p-0'>
          <div className='relative flex h-[90vh] items-center justify-center'>
            {event.images.length > 0 && (
              <Image
                src={event.images[lightboxImageIndex]?.url}
                alt={event.images[lightboxImageIndex]?.altText ?? event.title}
                width={1200}
                height={800}
                className='max-h-full max-w-full object-contain'
              />
            )}

            {event.images.length > 1 && (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() =>
                    setLightboxImageIndex(
                      lightboxImageIndex === 0 ? event.images!.length - 1 : lightboxImageIndex - 1
                    )
                  }
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20'
                >
                  <ChevronLeft className='size-8' />
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() =>
                    setLightboxImageIndex((lightboxImageIndex + 1) % event.images!.length)
                  }
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20'
                >
                  <ChevronRight className='size-8' />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
