'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@radix-ui/react-label'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarIcon,
  CheckCircle,
  DollarSign,
  Edit,
  Package,
  Percent,
  Search as SearchIcon,
  Tag,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Confirm } from '@/components/Dialog/Confirm'
import { ProductSelectorModal } from '@/components/Modals/ProductSelectorModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useDeleteDiscount, useDiscount, useUpdateDiscount } from '@/services/product/queries'
import { type UpdateDiscountInput } from '@/services/product/types'
import { ROUTES } from '@/src/config/routes'

const couponSchema = z.object({
  appliesOncePerCustomer: z.boolean().default(false),
  appliesTo: z.enum(['ALL_PRODUCTS', 'SPECIFIC_PRODUCTS', 'COLLECTIONS']).optional(),
  endsAt: z.date().optional(),
  startsAt: z.date({
    required_error: 'La fecha de inicio es requerida',
  }),
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'El título no puede exceder 100 caracteres'),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  usageLimit: z.number().min(1).optional(),
  value: z
    .union([z.number().min(1, 'El valor debe ser mayor a 0'), z.undefined()])
    .refine((val) => val !== undefined, {
      message: 'El valor es requerido',
    }),
})

type CouponFormData = z.infer<typeof couponSchema>

interface CouponDetailProps {
  couponId: string
}

export function CouponDetail({ couponId }: CouponDetailProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [valueInputState, setValueInputState] = useState<string>('')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)

  const router = useRouter()
  const queryClient = useQueryClient()
  const lastInitializedCouponId = useRef<string | null>(null)

  const encodedId = encodeURIComponent(couponId)
  const { data: coupon, error: couponError, isLoading: isLoadingCoupon } = useDiscount(encodedId)

  const updateDiscountMutation = useUpdateDiscount({
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el cupón')
    },
    onSuccess: () => {
      toast.success('Cupón actualizado exitosamente')
      setIsEditMode(false)
      void queryClient.invalidateQueries({ queryKey: ['discounts', 'detail', encodedId] })
    },
  })

  const deleteDiscountMutation = useDeleteDiscount({
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el cupón')
    },
    onSuccess: () => {
      toast.success('Cupón eliminado exitosamente')
      router.push(ROUTES.INVENTORY.COUPONS.MAIN.PATH)
    },
  })

  const form = useForm<CouponFormData>({
    defaultValues: {
      appliesOncePerCustomer: false,
      appliesTo: 'ALL_PRODUCTS',
      endsAt: undefined,
      startsAt: new Date(),
      title: '',
      type: 'PERCENTAGE',
      usageLimit: undefined,
      value: undefined,
    },
    resolver: zodResolver(couponSchema),
  })

  useEffect(() => {
    if (coupon && lastInitializedCouponId.current !== coupon.id) {
      const newValues = {
        appliesOncePerCustomer: coupon.appliesOncePerCustomer ?? false,
        appliesTo: coupon.appliesTo ?? 'ALL_PRODUCTS',
        endsAt: coupon.endsAt ? new Date(coupon.endsAt) : undefined,
        startsAt: coupon.startsAt ? new Date(coupon.startsAt) : new Date(),
        title: coupon.title ?? '',
        type: coupon.type ?? 'PERCENTAGE',
        usageLimit: coupon.usageLimit ?? undefined,
        value: coupon.value ?? undefined,
      }

      form.reset(newValues)
      setValueInputState(coupon.value ? coupon.value.toString() : '')
      setSelectedProductIds(coupon.productIds ?? [])
      lastInitializedCouponId.current = coupon.id
    }
  }, [coupon, form])

  const handleSubmit = async (data: CouponFormData) => {
    if (!coupon) return

    try {
      if (data.type === 'PERCENTAGE' && data.value && data.value > 100) {
        toast.error('El porcentaje no puede ser mayor al 100%')
        return
      }

      if (data.appliesTo === 'SPECIFIC_PRODUCTS' && selectedProductIds.length === 0) {
        toast.error('Debes seleccionar al menos un producto')
        return
      }

      const updateData: UpdateDiscountInput = {
        appliesOncePerCustomer: data.appliesOncePerCustomer,
        endsAt: data.endsAt?.toISOString(),
        id: coupon.id,
        title: data.title,
        usageLimit: data.usageLimit,
        ...(data.type !== coupon.type && { type: data.type }),
        ...(data.value !== coupon.value && { value: data.value }),
        ...(data.appliesTo && { appliesTo: data.appliesTo }),
      }

      if (data.appliesTo === 'SPECIFIC_PRODUCTS') {
        updateData.productIds = selectedProductIds
      }

      await updateDiscountMutation.mutateAsync(updateData)
    } catch (error) {
      console.error('Error updating coupon:', error)
    }
  }

  const handleDelete = async () => {
    if (!coupon) return
    await deleteDiscountMutation.mutateAsync(coupon.id)
  }

  const handleCancelEdit = () => {
    if (coupon) {
      const resetValues = {
        appliesOncePerCustomer: coupon.appliesOncePerCustomer ?? false,
        appliesTo: coupon.appliesTo ?? 'ALL_PRODUCTS',
        endsAt: coupon.endsAt ? new Date(coupon.endsAt) : undefined,
        startsAt: coupon.startsAt ? new Date(coupon.startsAt) : new Date(),
        title: coupon.title ?? '',
        type: coupon.type ?? 'PERCENTAGE',
        usageLimit: coupon.usageLimit ?? undefined,
        value: coupon.value ?? undefined,
      }
      form.reset(resetValues)
      setValueInputState(coupon.value ? coupon.value.toString() : '')
      setSelectedProductIds(coupon.productIds ?? [])
    }
    setIsEditMode(false)
  }

  const handleValueChange = (value: string, onChange: (value: number | undefined) => void) => {
    setValueInputState(value)

    if (value === '') {
      onChange(undefined)
    } else {
      const numericValue = parseInt(value)
      if (!isNaN(numericValue) && numericValue > 0) {
        onChange(numericValue)
      }
    }
  }

  const getDiscountLabel = (coupon: any) => {
    if (coupon.type === 'PERCENTAGE') {
      return `${coupon.value}% OFF`
    } else {
      return `$${coupon.value?.toFixed(2) ?? 0} OFF`
    }
  }

  const getAppliesToLabel = (coupon: any) => {
    switch (coupon.appliesTo) {
      case 'ALL_PRODUCTS':
        return 'Todos los productos'
      case 'SPECIFIC_PRODUCTS':
        return `${coupon.productIds?.length ?? 0} productos específicos`
      case 'COLLECTIONS':
        return `${coupon.collectionIds?.length ?? 0} colecciones`
      default:
        return 'Desconocido'
    }
  }

  const getStatusBadge = (coupon: any) => {
    const now = new Date()
    const startsAt = new Date(coupon.startsAt)
    const endsAt = coupon.endsAt ? new Date(coupon.endsAt) : null

    if (!coupon.isActive) {
      return <Badge variant='secondary'>Inactivo</Badge>
    }

    if (now < startsAt) {
      return <Badge variant='outline'>Pendiente</Badge>
    }

    if (endsAt && now > endsAt) {
      return <Badge variant='destructive'>Expirado</Badge>
    }

    return <Badge variant='default'>Activo</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const watchedType = form.watch('type')
  const watchedValue = form.watch('value')

  if (isLoadingCoupon) {
    return (
      <div className='container mx-auto max-w-4xl space-y-6 p-6'>
        <Skeleton className='h-10 w-64' />
        <Skeleton className='h-96 w-full' />
      </div>
    )
  }

  if (couponError || !coupon) {
    return (
      <div className='container mx-auto max-w-4xl space-y-6 p-6'>
        <div className='flex min-h-96 items-center justify-center'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar el cupón</h3>
            <p className='mt-2 text-muted-foreground'>
              {couponError?.message ?? 'Cupón no encontrado'}
            </p>
            <Link href={ROUTES.INVENTORY.COUPONS.MAIN.PATH}>
              <Button className='mt-4'>
                <ArrowLeft className='mr-2 size-4' />
                Volver a Cupones
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto max-w-4xl space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Link href={ROUTES.INVENTORY.COUPONS.MAIN.PATH}>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='mr-2 size-4' />
              Volver a Cupones
            </Button>
          </Link>
          <h1 className='mt-2 text-3xl font-bold'>
            {isEditMode ? 'Editar Cupón' : `Cupón: ${coupon.code}`}
          </h1>
        </div>
        <div className='flex gap-2'>
          {!isEditMode && (
            <>
              <Button variant='outline' onClick={() => setIsEditMode(true)}>
                <Edit className='mr-2 size-4' />
                Editar
              </Button>
              <Button variant='destructive' onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className='mr-2 size-4' />
                Eliminar
              </Button>
            </>
          )}
          {isEditMode && (
            <Button variant='outline' onClick={handleCancelEdit}>
              <X className='mr-2 size-4' />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {isEditMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Editar Información del Cupón</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Cupón *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Descuento de Verano' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Descuento *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='PERCENTAGE'>
                              <div className='flex items-center gap-2'>
                                <Percent className='size-4' />
                                Porcentaje
                              </div>
                            </SelectItem>
                            <SelectItem value='FIXED_AMOUNT'>
                              <div className='flex items-center gap-2'>
                                <DollarSign className='size-4' />
                                Monto Fijo
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Valor del Descuento * {watchedType === 'PERCENTAGE' ? '(%)' : '($)'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='1'
                          min='1'
                          max={watchedType === 'PERCENTAGE' ? '100' : undefined}
                          placeholder={watchedType === 'PERCENTAGE' ? '25' : '50'}
                          value={valueInputState}
                          onChange={(e) => handleValueChange(e.target.value, field.onChange)}
                          onBlur={() => {
                            if (valueInputState === '' && field.value) {
                              setValueInputState(field.value.toString())
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='startsAt'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Fecha de Inicio *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                className={cn(
                                  'pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  field.value.toLocaleDateString()
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className='ml-auto size-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='endsAt'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Fecha de Fin (Opcional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                className={cn(
                                  'pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  field.value.toLocaleDateString()
                                ) : (
                                  <span>Sin fecha de fin</span>
                                )}
                                <CalendarIcon className='ml-auto size-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < form.getValues('startsAt')}
                              initialFocus
                            />
                            {field.value && (
                              <div className='border-t p-3'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => field.onChange(undefined)}
                                  className='w-full'
                                >
                                  Quitar fecha de fin
                                </Button>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name='appliesTo'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aplicar a:</FormLabel>
                        <div className='mt-2 space-y-2'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='all-products'
                              checked={field.value === 'ALL_PRODUCTS'}
                              onCheckedChange={() => field.onChange('ALL_PRODUCTS')}
                            />
                            <Label htmlFor='all-products' className='flex items-center gap-2'>
                              <Package className='size-4' />
                              Todos los productos
                            </Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='specific-products'
                              checked={field.value === 'SPECIFIC_PRODUCTS'}
                              onCheckedChange={() => {
                                field.onChange('SPECIFIC_PRODUCTS')
                                if (selectedProductIds.length === 0) {
                                  setIsProductSelectorOpen(true)
                                }
                              }}
                            />
                            <Label htmlFor='specific-products' className='flex items-center gap-2'>
                              <Tag className='size-4' />
                              Productos específicos
                            </Label>
                          </div>
                        </div>

                        {field.value === 'SPECIFIC_PRODUCTS' && (
                          <div className='mt-4 rounded-md border p-4'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <p className='text-sm font-medium'>Productos seleccionados</p>
                                <p className='text-sm text-muted-foreground'>
                                  {selectedProductIds.length} producto(s) seleccionado(s)
                                </p>
                              </div>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => setIsProductSelectorOpen(true)}
                              >
                                <SearchIcon className='mr-2 size-4' />
                                Seleccionar Productos
                              </Button>
                            </div>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='usageLimit'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Límite de Usos</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min='1'
                            placeholder='Sin límite'
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                            }
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Número máximo de veces que se puede usar</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='appliesOncePerCustomer'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel>Una vez por cliente</FormLabel>
                        <FormDescription>
                          Cada cliente solo puede usar este cupón una vez
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className='flex gap-2'>
                  <Button
                    type='submit'
                    disabled={updateDiscountMutation.isPending}
                    className='flex-1'
                  >
                    {updateDiscountMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleCancelEdit}
                    disabled={updateDiscountMutation.isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <Tag className='size-5 text-blue-500' />
                Información del Cupón
              </CardTitle>
              {getStatusBadge(coupon)}
            </div>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Código</p>
                <p className='text-lg font-semibold'>{coupon.code}</p>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Título</p>
                <p className='text-lg font-semibold'>{coupon.title ?? 'Sin título'}</p>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Descuento</p>
                <Badge variant='destructive' className='text-lg'>
                  {getDiscountLabel(coupon)}
                </Badge>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Aplicable a</p>
                <p className='text-lg font-semibold'>{getAppliesToLabel(coupon)}</p>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Fecha de Inicio</p>
                <p className='text-lg font-semibold'>{formatDate(coupon.startsAt)}</p>
              </div>
              {coupon.endsAt && (
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Fecha de Fin</p>
                  <p className='text-lg font-semibold'>{formatDate(coupon.endsAt)}</p>
                </div>
              )}
              {coupon.usageLimit && (
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Límite de Usos</p>
                  <p className='text-lg font-semibold'>{coupon.usageLimit}</p>
                </div>
              )}
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Estado</p>
                <div className='flex items-center gap-2'>
                  {coupon.isActive ? (
                    <CheckCircle className='size-5 text-green-500' />
                  ) : (
                    <XCircle className='size-5 text-red-500' />
                  )}
                  <span className='text-lg font-semibold'>
                    {coupon.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Una vez por cliente</p>
                <p className='text-lg font-semibold'>
                  {coupon.appliesOncePerCustomer ? 'Sí' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Confirm
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title='Confirmar Eliminación'
        message={`¿Estás seguro de que quieres eliminar el cupón ${coupon.code}? Esta acción no se puede deshacer.`}
        confirmButtonText='Eliminar'
        cancelButtonText='Cancelar'
        variant='destructive'
        isLoading={deleteDiscountMutation.isPending}
      />

      <ProductSelectorModal
        isOpen={isProductSelectorOpen}
        onClose={() => setIsProductSelectorOpen(false)}
        initialSelectedIds={selectedProductIds}
        onConfirm={setSelectedProductIds}
        title='Seleccionar Productos para el Cupón'
        description='Busca y selecciona los productos a los que se aplicará este cupón.'
      />
    </div>
  )
}
