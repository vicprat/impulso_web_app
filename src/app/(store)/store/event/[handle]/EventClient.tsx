/* eslint-disable @next/next/no-img-element */
'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Gift,
  MapPin,
  Share2,
  Ticket,
  User,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { AddToCartButton } from '@/components/Cart/AddToCartButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { type Event } from '@/models/Event'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

import type { User as UserType } from '@/src/modules/auth/types'

interface EventClientProps {
  event: Event
  relatedEvents: Event[]
  session: UserType | null
}

// Estado de carga específico para eventos
const EventLoadingSkeleton = () => {
  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8'>
        {/* Breadcrumb skeleton */}
        <div className='mb-6 flex items-center gap-2'>
          <div className='h-4 w-12 animate-pulse rounded bg-muted' />
          <div className='h-4 w-1 animate-pulse rounded bg-muted' />
          <div className='h-4 w-16 animate-pulse rounded bg-muted' />
          <div className='h-4 w-1 animate-pulse rounded bg-muted' />
          <div className='h-4 w-32 animate-pulse rounded bg-muted' />
        </div>

        <div className='lg:grid lg:grid-cols-12 lg:gap-8'>
          {/* Hero image skeleton */}
          <div className='lg:col-span-8'>
            <div className='mb-6 aspect-[16/9] animate-pulse rounded-2xl bg-muted' />

            {/* Thumbnails skeleton */}
            <div className='mb-6 grid grid-cols-4 gap-3'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='aspect-square animate-pulse rounded-lg bg-muted' />
              ))}
            </div>

            {/* Description skeleton */}
            <Card className='bg-card shadow-elevation-1'>
              <CardHeader>
                <div className='h-7 w-48 animate-pulse rounded bg-muted' />
              </CardHeader>
              <CardContent className='space-y-3'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='h-4 w-full animate-pulse rounded bg-muted' />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Registration card skeleton */}
          <div className='mt-8 lg:col-span-4 lg:mt-0'>
            <Card className='bg-card shadow-elevation-3'>
              <CardHeader className='space-y-4 text-center'>
                <div className='mx-auto size-16 animate-pulse rounded-full bg-muted' />
                <div className='mx-auto h-8 w-32 animate-pulse rounded bg-muted' />
                <div className='mx-auto h-6 w-24 animate-pulse rounded-full bg-muted' />
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='h-12 w-full animate-pulse rounded bg-muted' />
                <div className='space-y-4 rounded-lg bg-surface-container p-4'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className='flex gap-3'>
                      <div className='size-5 animate-pulse rounded bg-muted' />
                      <div className='flex-1 space-y-2'>
                        <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                        <div className='h-3 w-32 animate-pulse rounded bg-muted' />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating loading indicator */}
        <div className='fixed bottom-6 right-6 z-50'>
          <Card className='bg-card/90 border-primary/20 shadow-elevation-3 backdrop-blur-sm'>
            <CardContent className='flex items-center gap-3 p-4'>
              <div className='size-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              <span className='text-sm font-medium text-foreground'>Cargando evento...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
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

const isEventFree = (event: Event): boolean => {
  return (
    event.primaryVariant?.price?.amount === '0.0' || event.primaryVariant?.price?.amount === '0'
  )
}

export const EventClient: React.FC<EventClientProps> = ({ event, relatedEvents, session }) => {
  const [ currentImageIndex, setCurrentImageIndex ] = useState(0)
  const [ lightboxOpen, setLightboxOpen ] = useState(false)
  const [ lightboxImageIndex, setLightboxImageIndex ] = useState(0)
  const [ shareMenuOpen, setShareMenuOpen ] = useState(false)

  const eventDetails = extractEventDetails(event)
  const eventDate = eventDetails.date ? new Date(eventDetails.date) : null
  const daysUntilEvent = calculateDaysUntilEvent(eventDetails.date)
  const isPastEvent = eventDate ? eventDate < new Date() : false
  const isFreeEvent = isEventFree(event)

  const primaryVariant = event.primaryVariant
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
          text: `¡Únete a este evento! ${eventDetails.date ? formatEventDate(new Date(eventDetails.date)) : ''}`,
          title: event.title,
          url: window.location.href,
        })
      } catch {
        // Fallback to copy
        await navigator.clipboard.writeText(window.location.href)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setShareMenuOpen(false)
    }
  }

  const getEventPrice = () => {
    return isFreeEvent ? 'Entrada gratuita' : event.formattedPrice
  }

  const getEventStatus = () => {
    if (isPastEvent) return { text: 'Evento Terminado', variant: 'destructive' as const }
    if (!isAvailable) return { text: 'Agotado', variant: 'destructive' as const }
    if (isFreeEvent) return { text: 'Entrada Gratuita', variant: 'default' as const }
    return { text: 'Entradas Disponibles', variant: 'default' as const }
  }

  const eventStatus = getEventStatus()

  return (
    <div className='min-h-screen'>
      <div className='mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8'>


        {/* Hero Section - Completamente rediseñado para móvil */}
        <div className='mb-8'>
          <div className='lg:grid lg:grid-cols-12 lg:gap-8'>
            {/* Hero Image */}
            <div className='lg:col-span-8'>
              {/* Mobile: Image sin overlay de información */}
              <div className='group relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-elevation-2'>
                {event.images.length > 0 ? (
                  <img
                    src={event.images[ currentImageIndex ]?.url}
                    alt={event.images[ currentImageIndex ]?.altText ?? event.title}
                    className='size-full object-cover transition-transform duration-700 group-hover:scale-105'
                    onClick={() => openLightbox(currentImageIndex)}
                  />
                ) : (
                  <div className='flex h-full items-center justify-center bg-surface-container'>
                    <Calendar className='size-32 text-muted-foreground' />
                  </div>
                )}

                {/* Solo gradient sutil - sin texto superpuesto */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent' />

                {/* Botones flotantes mejorados */}
                <div className='absolute right-4 top-4 flex gap-2'>
                  {/* Status badge */}
                  {isPastEvent ? (
                    <Badge variant='destructive' className='bg-error-container text-on-error shadow-elevation-2'>
                      Evento Pasado
                    </Badge>
                  ) : daysUntilEvent !== null && daysUntilEvent <= 7 ? (
                    <Badge className='bg-primary text-on-primary shadow-elevation-2'>
                      {daysUntilEvent === 0 ? '¡Hoy!' : `En ${daysUntilEvent} días`}
                    </Badge>
                  ) : null}

                  {/* Share button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShareMenuOpen(true)}
                    className='border-white/20 bg-white/10 text-white shadow-elevation-2 backdrop-blur-sm hover:bg-white/20'
                  >
                    <Share2 className='size-4' />
                  </Button>
                </div>
              </div>

              {/* Mobile: Info del evento DEBAJO de la imagen */}
              <div className='mb-6'>
                <div className='space-y-4'>
                  <div>
                    <h1 className='mb-2 text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl'>
                      {event.title}
                    </h1>

                  </div>

                  {/* Quick Info Cards para móvil */}
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    {eventDate && (
                      <Card className='bg-card p-3 shadow-elevation-1'>
                        <div className='flex items-center gap-3'>
                          <div className='flex size-10 items-center justify-center rounded-lg bg-primary-container'>
                            <Calendar className='size-5 text-primary' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='text-xs text-muted-foreground'>Fecha</p>
                            <p className='truncate text-sm font-medium text-foreground'>
                              {format(eventDate, 'd MMM yyyy', { locale: es })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}

                    {eventDetails.startTime && (
                      <Card className='bg-card p-3 shadow-elevation-1'>
                        <div className='flex items-center gap-3'>
                          <div className='flex size-10 items-center justify-center rounded-lg bg-primary-container'>
                            <Clock className='size-5 text-primary' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='text-xs text-muted-foreground'>Hora</p>
                            <p className='text-sm font-medium text-foreground'>
                              {formatEventTime(eventDetails.startTime)}
                              {eventDetails.endTime && ` - ${formatEventTime(eventDetails.endTime)}`}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}

                    {eventDetails.location && (
                      <Card className='bg-card p-3 shadow-elevation-1 sm:col-span-2'>
                        <div className='flex items-center gap-3'>
                          <div className='flex size-10 items-center justify-center rounded-lg bg-primary-container'>
                            <MapPin className='size-5 text-primary' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='text-xs text-muted-foreground'>Ubicación</p>
                            <p className='truncate text-sm font-medium text-foreground'>
                              {eventDetails.location}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {event.images.length > 1 && (
                <div className='mb-6 grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8'>
                  {event.images.map((image, index) => (
                    <button
                      key={image.id ?? index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${currentImageIndex === index
                        ? 'ring-primary/20 border-primary ring-2'
                        : 'border-border hover:border-muted-foreground'
                        }`}
                    >
                      <img
                        src={image.url}
                        alt={image.altText ?? `${event.title} ${index + 1}`}
                        className='size-full object-cover'
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Event Description */}
              {event.descriptionHtml && (
                <Card className='mb-6 bg-card shadow-elevation-1'>
                  <CardHeader>
                    <CardTitle className='text-xl text-foreground sm:text-2xl'>Sobre este Evento</CardTitle>
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

            {/* Registration Card - Optimizado para móvil */}
            <div className='lg:col-span-4'>
              <Card className='sticky top-4 bg-card shadow-elevation-3'>
                <CardHeader className='text-center'>
                  <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary-container'>
                    {isFreeEvent ? (
                      <Gift className='size-8 text-on-primary-container' />
                    ) : (
                      <Ticket className='size-8 text-on-primary-container' />
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className='text-2xl font-bold text-foreground sm:text-3xl'>{getEventPrice()}</div>
                    {!isFreeEvent && <p className='text-sm text-muted-foreground'>por entrada</p>}

                    <Badge
                      variant={eventStatus.variant}
                      className={`${eventStatus.variant === 'default' ? 'bg-success-container text-success' : ''
                        }`}
                    >
                      {eventStatus.text}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className='space-y-6'>
                  {/* Registration Button */}
                  <div className='space-y-3'>
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
                      selectedVariant={primaryVariant || undefined}
                      size='lg'
                      className={`w-full shadow-elevation-2 ${isFreeEvent
                        ? 'hover:bg-success/90 bg-success text-on-primary'
                        : 'hover:bg-primary/90 bg-primary text-on-primary'
                        }`}
                      disabled={!isAvailable}
                      showQuantitySelector={true}
                      title={{
                        addMore: 'Registrar más entradas',
                        adding: 'Registrando...',
                        alreadyInCart: 'Ya tienes {quantity} entradas registradas',
                        loginPrompt: 'Iniciar sesión para registrarse',
                        primary: isFreeEvent ? 'Registrarse gratis' : 'Registrarse al evento',
                        unavailable: 'Este evento no está disponible',
                      }}
                    />

                    {isPastEvent && (
                      <p className='text-center text-sm text-muted-foreground'>
                        Este evento ya ha terminado
                      </p>
                    )}

                    {primaryVariant?.inventoryQuantity && (
                      <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                        <Users className='size-4' />
                        <span>{primaryVariant.inventoryQuantity} espacios disponibles</span>
                      </div>
                    )}
                  </div>

                  {/* Event Details Quick View */}
                  <div className='space-y-4 rounded-lg bg-surface-container p-4'>
                    <h3 className='font-semibold text-foreground'>Detalles del evento</h3>

                    {eventDate && (
                      <div className='flex items-start gap-3'>
                        <Calendar className='mt-0.5 size-5 text-muted-foreground' />
                        <div>
                          <p className='font-medium text-foreground'>
                            {formatEventDate(eventDate)}
                          </p>
                          {eventDetails.startTime && (
                            <p className='text-sm text-muted-foreground'>
                              {formatEventTime(eventDetails.startTime)}
                              {eventDetails.endTime &&
                                ` - ${formatEventTime(eventDetails.endTime)}`}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {eventDetails.location && (
                      <div className='flex items-start gap-3'>
                        <MapPin className='mt-0.5 size-5 text-muted-foreground' />
                        <div>
                          <p className='font-medium text-foreground'>{eventDetails.location}</p>
                        </div>
                      </div>
                    )}

                    {eventDetails.organizer && (
                      <div className='flex items-start gap-3'>
                        <User className='mt-0.5 size-5 text-muted-foreground' />
                        <div>
                          <p className='text-sm text-muted-foreground'>Organizado por</p>
                          <p className='font-medium text-foreground'>{eventDetails.organizer}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Digital Ticket Info */}
                  {session && (
                    <div className='rounded-lg bg-primary-container p-4'>
                      <div className='mb-2 flex items-center gap-2'>
                        <Ticket className='size-5 text-on-primary-container' />
                        <h3 className='font-semibold text-on-primary-container'>Entrada Digital</h3>
                      </div>
                      <p className='text-on-primary-container/80 mb-3 text-sm'>
                        Tu entrada digital será enviada automáticamente después del registro
                      </p>
                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full border-outline bg-transparent text-on-primary-container hover:bg-surface-container-low'
                        onClick={() => (window.location.href = '/manage-tickets')}
                      >
                        Ver Mis Entradas
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div>
            <div className='mb-8 text-center'>
              <h2 className='mb-2 text-2xl font-bold text-foreground sm:text-3xl'>
                Otros Eventos que te Podrían Interesar
              </h2>
              <p className='text-muted-foreground'>Descubre más experiencias únicas</p>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {relatedEvents.slice(0, 6).map((relatedEvent) => {
                const relatedEventDetails = extractEventDetails(relatedEvent)
                const isRelatedFree = isEventFree(relatedEvent)

                return (
                  <Card
                    key={relatedEvent.id}
                    className='group overflow-hidden bg-card shadow-elevation-1 transition-all duration-300 hover:shadow-elevation-3'
                  >
                    <Link
                      href={replaceRouteParams(ROUTES.STORE.EVENT_DETAIL.PATH, {
                        handle: relatedEvent.handle,
                      })}
                    >
                      <div className='relative aspect-[4/3] overflow-hidden'>
                        {relatedEvent.images[ 0 ] ? (
                          <img
                            src={relatedEvent.images[ 0 ].url}
                            alt={relatedEvent.title}
                            className='size-full object-cover transition-transform duration-300 group-hover:scale-105'
                          />
                        ) : (
                          <div className='flex h-full items-center justify-center bg-muted'>
                            <Calendar className='size-12 text-muted-foreground' />
                          </div>
                        )}

                        {/* Overlay with price */}
                        <div className='absolute right-3 top-3'>
                          <Badge
                            className={`${isRelatedFree
                              ? 'bg-success-container text-success'
                              : 'bg-surface-container text-on-surface'
                              } shadow-elevation-1`}
                          >
                            {isRelatedFree ? 'Gratuito' : relatedEvent.formattedPrice}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className='p-4'>
                        <h3 className='mb-2 line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary'>
                          {relatedEvent.title}
                        </h3>
                        <p className='mb-2 text-sm text-muted-foreground'>{relatedEvent.vendor}</p>

                        <div className='space-y-1'>
                          {relatedEventDetails.date && (
                            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                              <Calendar className='size-3' />
                              {format(new Date(relatedEventDetails.date), 'd MMM yyyy', {
                                locale: es,
                              })}
                            </div>
                          )}

                          {relatedEventDetails.location && (
                            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                              <MapPin className='size-3' />
                              <span className='truncate'>{relatedEventDetails.location}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Share Menu Dialog */}
      <Dialog open={shareMenuOpen} onOpenChange={setShareMenuOpen}>
        <DialogContent className='sm:max-w-md'>
          <div className='space-y-4'>
            <div className='text-center'>
              <h3 className='mb-2 text-lg font-semibold text-foreground'>Compartir Evento</h3>
              <p className='text-sm text-muted-foreground'>Comparte este evento con tus amigos</p>
            </div>

            <div className='space-y-3'>
              <Button
                onClick={shareEvent}
                className='hover:bg-primary/90 w-full justify-start gap-3 bg-primary text-on-primary'
              >
                <Share2 className='size-4' />
                Compartir enlace
              </Button>

              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href)
                  setShareMenuOpen(false)
                }}
                variant='outline'
                className='w-full justify-start gap-3'
              >
                <Copy className='size-4' />
                Copiar enlace
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className='max-w-screen-xl border-none bg-black/95 p-0'>
          <div className='relative flex h-[90vh] items-center justify-center'>
            {event.images.length > 0 && (
              <img
                src={event.images[ lightboxImageIndex ]?.url}
                alt={event.images[ lightboxImageIndex ]?.altText ?? event.title}
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