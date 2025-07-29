'use client'

import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit2,
  ExternalLink,
  Eye,
  Hash,
  MapPin,
  Package,
  Settings,
  Tag,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import { Dialog } from '@/components/Dialog'
import { Form } from '@/components/Forms'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeleteEvent, useGetEvent, useUpdateEvent } from '@/services/event/hook'
import { type UpdateEventPayload } from '@/services/event/types'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'
import { formatCurrency } from '@/src/helpers'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const eventId = params.eventId as string

  const { data: event, error, isLoading, refetch } = useGetEvent(eventId)

  const updateMutation = useUpdateEvent()
  const deleteMutation = useDeleteEvent()

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = async (updatePayload: UpdateEventPayload) => {
    await updateMutation.mutateAsync(updatePayload)
    setIsEditing(false)
    void refetch()
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!event) return

    await deleteMutation.mutateAsync(event.id)
    router.push('/admin/events')
  }

  const getAvailabilityVariant = (available: boolean) => {
    return available ? 'available' : 'unavailable'
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-surface'>
        <div className='container mx-auto space-y-8 py-8'>
          {/* Header Skeleton */}
          <div className='rounded-xl  p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Skeleton className='size-10' />
                <Skeleton className='h-8 w-64' />
              </div>
              <div className='flex space-x-2'>
                <Skeleton className='h-10 w-20' />
                <Skeleton className='h-10 w-24' />
                <Skeleton className='h-10 w-20' />
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            <div className='space-y-6 lg:col-span-2'>
              <Skeleton className='h-96 w-full rounded-xl' />
              <Skeleton className='h-48 w-full rounded-xl' />
            </div>
            <div className='space-y-6'>
              <Skeleton className='h-32 w-full rounded-xl' />
              <Skeleton className='h-48 w-full rounded-xl' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-surface'>
        <Card className='border-error/20 w-full max-w-md bg-error-container'>
          <CardContent className='p-8 text-center'>
            <div className='bg-error/10 mb-4 inline-flex size-16 items-center justify-center rounded-full'>
              <Activity className='size-8 text-error' />
            </div>
            <h3 className='mb-2 text-lg font-semibold text-on-error-container'>
              Error al cargar evento
            </h3>
            <p className='text-on-error-container/70 mb-6 text-sm'>
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <div className='flex justify-center gap-3'>
              <Button onClick={() => refetch()} variant='outline-success'>
                Reintentar
              </Button>
              <Button variant='container-warning' onClick={() => router.push('/admin/events')}>
                Volver al listado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-surface'>
        <Card className='border-warning/20 w-full max-w-md bg-warning-container'>
          <CardContent className='p-8 text-center'>
            <div className='bg-warning/10 mb-4 inline-flex size-16 items-center justify-center rounded-full'>
              <Package className='size-8 text-warning' />
            </div>
            <h3 className='mb-2 text-lg font-semibold text-on-warning-container'>
              Evento no encontrado
            </h3>
            <p className='text-on-warning-container/70 mb-6 text-sm'>
              El evento que buscas no existe o no tienes permisos para verlo.
            </p>
            <Button variant='container-warning' onClick={() => router.push('/admin/events')}>
              Volver al listado
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className='min-h-screen bg-surface'>
        <div className='container mx-auto py-8'>
          <Form.Event
            mode='edit'
            event={event}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            isLoading={updateMutation.isPending}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-surface'>
      <div className='container mx-auto space-y-8 py-8'>
        <Card className='border-outline-variant/20  bg-card shadow-elevation-1'>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => router.push('/admin/events')}
                  className='bg-surface-container-low hover:bg-surface-container'
                >
                  <ArrowLeft className='mr-2 size-4' />
                  Volver
                </Button>
                <div className='h-8 w-px bg-outline-variant' />
                <div>
                  <div className='mb-1 flex items-center gap-3'>
                    <h1 className='text-2xl font-bold text-on-surface'>{event.title}</h1>
                  </div>
                  <p className='text-sm text-on-surface-variant'>ID: {event.id.split('/').pop()}</p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <Button variant='outline' asChild>
                  <Link
                    href={replaceRouteParams(ROUTES.STORE.EVENT_DETAIL.PATH, {
                      handle: event.handle,
                    })}
                    target='_blank'
                    className='flex items-center'
                  >
                    <ExternalLink className='mr-2 size-4' />
                    Ver en tienda
                  </Link>
                </Button>
                <Button variant='container-success' onClick={handleEdit}>
                  <Edit2 className='mr-2 size-4' />
                  Editar
                </Button>
                <Button
                  variant='container-destructive'
                  onClick={handleDeleteClick}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className='mr-2 size-4' />
                  Eliminar
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className=' p-4'>
                <div className='mb-1 flex items-center gap-2'>
                  <DollarSign className='size-4 text-primary' />
                  <span className='text-xs font-medium text-on-surface-variant'>Precio</span>
                </div>
                <p className='text-lg font-bold text-on-surface'>
                  {formatCurrency(
                    event.variants[0].price.amount,
                    event.variants[0].price.currencyCode
                  )}
                </p>
              </div>

              <div className=' p-4'>
                <div className='mb-1 flex items-center gap-2'>
                  <Users className='size-4 text-success' />
                  <span className='text-xs font-medium text-on-surface-variant'>Disponibles</span>
                </div>
                <p className='text-lg font-bold text-on-surface'>
                  {event.variants[0]?.inventoryQuantity ?? 0}
                </p>
              </div>

              <div className=' p-4'>
                <div className='mb-1 flex items-center gap-2'>
                  <Calendar className='size-4' />
                  <span className='text-xs font-medium text-on-surface-variant'>Fecha</span>
                </div>
                <p className='text-sm font-semibold text-on-surface'>
                  {event.eventDetails.date
                    ? new Date(event.eventDetails.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Fecha no disponible'}
                </p>
              </div>

              <div className='  p-4'>
                <div className='mb-1 flex items-center gap-2'>
                  <Activity className='size-4 text-warning' />
                  <span className='text-xs font-medium text-on-surface-variant'>Estado</span>
                </div>
                <Badge
                  variant={getAvailabilityVariant(event.variants[0].availableForSale)}
                  className='text-xs'
                >
                  {event.variants[0].availableForSale ? 'Disponible' : 'Agotado'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          <div className='space-y-6 lg:col-span-2'>
            <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-on-surface'>
                  <Calendar className='size-5 text-primary' />
                  Información del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-4'>
                    <div>
                      <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                        Título
                      </Label>
                      <p className='mt-1 text-sm font-medium text-on-surface'>{event.title}</p>
                    </div>

                    <div>
                      <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                        Organizador
                      </Label>
                      <div className='mt-1 flex items-center gap-2'>
                        <User className='size-3 text-on-surface-variant' />
                        <p className='text-sm font-medium text-on-surface'>{event.vendor}</p>
                      </div>
                    </div>

                    <div>
                      <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                        Handle
                      </Label>
                      <div className='mt-1 flex items-center gap-2'>
                        <Hash className='size-3 text-on-surface-variant' />
                        <p className='font-mono text-sm text-on-surface'>{event.handle}</p>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                        Ubicación
                      </Label>
                      <div className='mt-1 flex items-center gap-2'>
                        <MapPin className='size-3 text-error' />
                        <p className='text-sm font-medium text-on-surface'>
                          {event.eventDetails.location}
                        </p>
                      </div>
                    </div>

                    {(event.eventDetails.startTime ?? event.eventDetails.endTime) && (
                      <div>
                        <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                          Horario
                        </Label>
                        <div className='mt-1 flex items-center gap-2'>
                          <Clock className='size-3 text-warning' />
                          <p className='text-sm font-medium text-on-surface'>
                            {event.eventDetails.startTime && `${event.eventDetails.startTime}`}
                            {event.eventDetails.startTime && event.eventDetails.endTime && ' - '}
                            {event.eventDetails.endTime && `${event.eventDetails.endTime}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {event.eventDetails.organizer && (
                      <div>
                        <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                          Organizador Específico
                        </Label>
                        <p className='mt-1 text-sm font-medium text-on-surface'>
                          {event.eventDetails.organizer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {event.descriptionHtml && (
                  <>
                    <Separator className='bg-outline-variant' />
                    <div>
                      <Label className='mb-3 block text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                        Descripción
                      </Label>
                      <div
                        className='prose prose-sm max-w-none text-sm text-on-surface prose-headings:text-on-surface prose-p:text-on-surface-variant'
                        dangerouslySetInnerHTML={{ __html: event.descriptionHtml }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {event.tags.length > 0 && (
              <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-on-surface'>
                    <Tag className=' size-5' />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant='tertiary-container' className='font-medium'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {event.images.length > 0 && (
              <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-on-surface'>
                    <Eye className='size-5 text-success' />
                    Imágenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                    {event.images.map((image, index) => (
                      <div key={index} className='group relative aspect-square'>
                        <img 
                          src={image.url}
                          alt={image.altText ?? event.title}
                          className='rounded-lg object-cover shadow-elevation-2 transition-shadow group-hover:shadow-elevation-3'
                        />
                        {index === 0 && (
                          <Badge className='absolute left-2 top-2 bg-primary-container text-on-primary-container'>
                            Principal
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className='space-y-6'>
            <Card className='border-primary/20 bg-primary-container shadow-elevation-2'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-on-primary-container'>
                  <DollarSign className='size-5' />
                  Precio y Ventas
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-center'>
                  <div className='mb-1 text-3xl font-bold text-on-primary-container'>
                    {formatCurrency(
                      event.variants[0].price.amount,
                      event.variants[0].price.currencyCode
                    )}
                  </div>
                  <p className='text-on-primary-container/70 text-sm'>Precio por boleto</p>
                </div>

                {event.variants[0]?.sku && (
                  <div className='bg-card p-3'>
                    <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                      SKU
                    </Label>
                    <p className='mt-1 font-mono text-sm text-on-surface'>
                      {event.variants[0].sku}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className='border-outline-variant/20  shadow-elevation-1'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-on-surface'>
                  <Settings className='size-5 text-on-surface-variant' />
                  Detalles Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className=' p-3'>
                  <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                    ID del Evento
                  </Label>
                  <p className='mt-1 break-all font-mono text-xs text-on-surface'>
                    {event.id.split('/').pop()}
                  </p>
                </div>

                {event.variants[0] && (
                  <div className=' p-3'>
                    <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                      ID de Variante
                    </Label>
                    <p className='mt-1 break-all font-mono text-xs text-on-surface'>
                      {event.variants[0].id.split('/').pop()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog.Confirm
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title='Eliminar Evento'
        message='¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer y eliminará permanentemente toda la información asociada.'
        confirmButtonText='Eliminar Evento'
        cancelButtonText='Cancelar'
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
