'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  Package,
  Save,
  Settings,
  Tag,
  Users,
  X,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Event } from '@/models/Event'
import { type CreateEventPayload, type UpdateEventPayload } from '@/services/event/types'

import { Tiptap } from '../TipTap'

interface EventFormProps<T extends 'create' | 'edit'> {
  mode: T
  event?: T extends 'edit' ? Event : never
  onSave: T extends 'create'
    ? (payload: CreateEventPayload) => void | Promise<void>
    : (payload: UpdateEventPayload) => void | Promise<void>
  onCancel: () => void
  isLoading: boolean
}

type Props = EventFormProps<'create'> | EventFormProps<'edit'>

const eventFormSchema = z.object({
  description: z.string().optional(),
  eventDetails: z.object({
    date: z.string().min(1, 'La fecha del evento es requerida'),
    endTime: z.string().optional(),
    location: z.string().min(1, 'La ubicación es requerida'),
    organizer: z.string().optional(),
    startTime: z.string().optional(),
  }),

  inventoryQuantity: z.coerce.number().int().min(0, 'La cantidad de boletos no puede ser negativa'),

  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'El precio debe ser un número válido'),

  status: z.enum(['ACTIVE', 'DRAFT']),

  tags: z.string().optional(),

  title: z.string().min(1, 'El título es requerido'),
})

type EventFormValues = z.infer<typeof eventFormSchema>

export const EventForm: React.FC<Props> = ({ event, isLoading, mode, onCancel, onSave }) => {
  const defaultValues: Partial<EventFormValues> =
    mode === 'edit' && event
      ? {
          description: event.descriptionHtml.replace(/<p>|<\/p>/g, ''),
          eventDetails: {
            date: event.eventDetails.date ?? '',
            endTime: event.eventDetails.endTime ?? '',
            location: event.eventDetails.location ?? '',
            organizer: event.eventDetails.organizer ?? '',
            startTime: event.eventDetails.startTime ?? '',
          },
          inventoryQuantity: event.primaryVariant?.inventoryQuantity ?? 0,
          price: event.primaryVariant?.price.amount ?? '0',
          status: event.status === 'ARCHIVED' ? 'DRAFT' : event.status,
          tags: event.tags.join(', '),
          title: event.title,
        }
      : {
          description: '',
          eventDetails: {
            date: '',
            endTime: '',
            location: '',
            organizer: '',
            startTime: '',
          },
          inventoryQuantity: 0,
          price: '0',
          status: 'DRAFT',
          tags: '',
          title: '',
        }

  const form = useForm<EventFormValues>({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(eventFormSchema),
  })

  async function onSubmit(data: EventFormValues) {
    const basePayload = {
      description: data.description ?? '',
      details: {
        date: data.eventDetails.date,
        endTime: data.eventDetails.endTime ?? null,
        location: data.eventDetails.location,
        organizer: data.eventDetails.organizer ?? null,
        startTime: data.eventDetails.startTime ?? null,
      },
      inventoryQuantity: data.inventoryQuantity,
      price: data.price,
      status: data.status,
      tags: data.tags
        ? data.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      title: data.title,
      vendor: 'Evento',
    }

    if (mode === 'edit' && event) {
      const updatePayload: UpdateEventPayload = {
        ...basePayload,
        id: event.id,
      }
      await (onSave as (payload: UpdateEventPayload) => void | Promise<void>)(updatePayload)
    } else {
      const createPayload: CreateEventPayload = basePayload
      await (onSave as (payload: CreateEventPayload) => void | Promise<void>)(createPayload)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='min-h-screen'>
          <div className='container mx-auto'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h1 className='mb-1 text-2xl font-bold text-on-surface'>
                  {mode === 'create' ? 'Crear Nuevo Evento' : 'Editar Evento'}
                </h1>
                <p className='text-sm text-on-surface-variant'>
                  {mode === 'create'
                    ? 'Complete la información para crear un nuevo evento'
                    : 'Modifique los detalles del evento existente'}
                </p>
              </div>
              <div>
                <div className='flex justify-end space-x-4'>
                  <Button
                    variant='outline'
                    onClick={onCancel}
                    type='button'
                    disabled={isLoading}
                    className='hover: border-outline-variant'
                  >
                    <X className='mr-2 size-4' />
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    disabled={isLoading}
                    variant='default'
                    size='lg'
                    className='min-w-[140px]'
                  >
                    {isLoading ? (
                      <Loader2 className='mr-2 size-4 animate-spin' />
                    ) : (
                      <Save className='mr-2 size-4' />
                    )}
                    {isLoading
                      ? 'Guardando...'
                      : `Guardar ${mode === 'create' ? 'Evento' : 'Cambios'}`}
                  </Button>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
              <div className='space-y-8 lg:col-span-2'>
                <Card className='border-outline-variant/20  shadow-elevation-1'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-surface'>
                      <FileText className='size-5 text-primary' />
                      Información Básica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <FormField
                      control={form.control}
                      name='title'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm font-medium uppercase tracking-wide text-on-surface-variant'>
                            Título del Evento
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Ej: Concierto de Jazz en Vivo'
                              className='focus:ring-primary/20 border-outline-variant focus:border-primary'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='text-error' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm font-medium uppercase tracking-wide text-on-surface-variant'>
                            Descripción
                          </FormLabel>
                          <FormControl>
                            <Tiptap.Editor
                              content={field.value ?? ''}
                              onChange={(content) => field.onChange(content)}
                            />
                          </FormControl>
                          <FormMessage className='text-error' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='tags'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-on-surface-variant'>
                            <Tag className='size-3' />
                            Tags (separados por comas)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='música, concierto, jazz, en vivo, entretenimiento'
                              className='focus:ring-primary/20 border-outline-variant focus:border-primary'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className='text-on-surface-variant/70'>
                            Palabras clave que ayudarán a los usuarios a encontrar tu evento en las
                            búsquedas.
                          </FormDescription>
                          <FormMessage className='text-error' />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className='border-outline-variant/20  shadow-elevation-1'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-surface'>
                      <Calendar className='size-5 text-success' />
                      Detalles del Evento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='eventDetails.date'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-on-surface-variant'>
                              <Calendar className='size-3' />
                              Fecha del Evento
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='date'
                                className='focus:ring-primary/20 border-outline-variant focus:border-primary'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='text-error' />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='eventDetails.location'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-on-surface-variant'>
                              <MapPin className='size-3' />
                              Ubicación
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Ej: Teatro Metropólitan, CDMX'
                                className='focus:ring-primary/20 border-outline-variant focus:border-primary'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='text-error' />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='eventDetails.startTime'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-on-surface-variant'>
                              <Clock className='size-3' />
                              Hora de Inicio
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='time'
                                className='focus:ring-primary/20 border-outline-variant focus:border-primary'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='text-error' />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='eventDetails.endTime'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-on-surface-variant'>
                              <Clock className='size-3' />
                              Hora de Fin
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='time'
                                className='focus:ring-primary/20 border-outline-variant focus:border-primary'
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className='text-on-surface-variant/70'>
                              Opcional. Ayuda a los asistentes a planificar mejor.
                            </FormDescription>
                            <FormMessage className='text-error' />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className='space-y-8'>
                <Card className='border-outline-variant/20  shadow-elevation-1'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-surface'>
                      <Settings className=' size-5' />
                      Estado y Publicación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <FormField
                      control={form.control}
                      name='status'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm font-medium uppercase tracking-wide text-on-surface-variant'>
                            Estado del Evento
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className='focus:ring-primary/20 border-outline-variant focus:border-primary'>
                                <SelectValue placeholder='Selecciona el estado' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className='border-outline-variant'>
                              <SelectItem
                                value='ACTIVE'
                                className='hover:bg-success-container focus:bg-success-container'
                              >
                                <div className='flex items-center gap-2'>
                                  <div className='size-2 rounded-full bg-success' />
                                  Activo
                                </div>
                              </SelectItem>
                              <SelectItem
                                value='DRAFT'
                                className='hover:bg-warning-container focus:bg-warning-container'
                              >
                                <div className='flex items-center gap-2'>
                                  <div className='size-2 rounded-full bg-warning' />
                                  Borrador
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className='text-on-surface-variant/70'>
                            <strong>Activo:</strong> Visible y disponible para compra.
                            <br />
                            <strong>Borrador:</strong> Solo visible para administradores.
                          </FormDescription>
                          <FormMessage className='text-error' />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className='border-primary/20  shadow-elevation-2'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-primary-container'>
                      <DollarSign className='size-5' />
                      Precio y Ventas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <FormField
                      control={form.control}
                      name='price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-on-primary-container/80 text-sm font-medium uppercase tracking-wide'>
                            Precio del Boleto (MXN)
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <DollarSign className='text-on-primary-container/60 absolute left-3 top-1/2 size-4 -translate-y-1/2' />
                              <Input
                                type='number'
                                placeholder='150.00'
                                step='0.01'
                                className='focus:ring-primary/20 border-outline-variant pl-10 focus:border-primary'
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className='text-on-primary-container/70'>
                            Precio por boleto individual en pesos mexicanos.
                          </FormDescription>
                          <FormMessage className='text-error' />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className='border-outline-variant/20  shadow-elevation-1'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-surface'>
                      <Package className='size-5 text-warning' />
                      Inventario
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name='inventoryQuantity'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-on-surface-variant'>
                            <Users className='size-3' />
                            Cantidad de Boletos
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Users className='text-on-surface-variant/60 absolute left-3 top-1/2 size-4 -translate-y-1/2' />
                              <Input
                                type='number'
                                placeholder='100'
                                className='focus:ring-primary/20 border-outline-variant pl-10 focus:border-primary'
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className='text-on-surface-variant/70'>
                            Número total de boletos disponibles para este evento. Puedes modificarlo
                            más tarde.
                          </FormDescription>
                          <FormMessage className='text-error' />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
