'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, DollarSign, Package, Percent, Tag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useCreateDiscount } from '@/services/product/queries'
import { type CreateDiscountInput } from '@/services/product/types'
import { ROUTES } from '@/src/config/routes'

const couponSchema = z.object({
  appliesOncePerCustomer: z.boolean().default(false),
  appliesTo: z.enum(['ALL_PRODUCTS', 'SPECIFIC_PRODUCTS', 'COLLECTIONS']),
  code: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(50, 'El código no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9]+$/, 'El código solo puede contener letras mayúsculas y números'),
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

export function CouponCreateForm() {
  const router = useRouter()
  const [valueInputState, setValueInputState] = useState<string>('')

  const createDiscountMutation = useCreateDiscount()

  const form = useForm<CouponFormData>({
    defaultValues: {
      appliesOncePerCustomer: false,
      appliesTo: 'ALL_PRODUCTS',
      code: '',
      endsAt: undefined,
      startsAt: new Date(),
      title: '',
      type: 'PERCENTAGE',
      usageLimit: undefined,
      value: undefined,
    },
    resolver: zodResolver(couponSchema),
  })

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    form.setValue('code', result)
  }

  const onSubmit = async (data: CouponFormData) => {
    try {
      if (data.type === 'PERCENTAGE' && (data.value ?? 0) > 100) {
        toast.error('El porcentaje no puede ser mayor al 100%')
        return
      }

      const couponData: CreateDiscountInput = {
        appliesOncePerCustomer: data.appliesOncePerCustomer,
        appliesTo: data.appliesTo,
        code: data.code,
        endsAt: data.endsAt?.toISOString(),
        productIds: data.appliesTo === 'SPECIFIC_PRODUCTS' ? [] : undefined,
        startsAt: data.startsAt.toISOString(),
        title: data.title,
        type: data.type,
        usageLimit: data.usageLimit,
        value: data.value ?? 0,
      }

      await createDiscountMutation.mutateAsync(couponData)
    } catch (error) {
      console.error('Error al crear cupón:', error)
    }
  }

  const watchedAppliesTo = form.watch('appliesTo')
  const watchedType = form.watch('type')
  const watchedValue = form.watch('value')
  const watchedCode = form.watch('code')

  const calculateDiscountPreview = () => {
    if (!watchedValue) return null
    if (watchedType === 'PERCENTAGE') {
      return `${watchedValue}% OFF`
    } else {
      return `$${watchedValue.toFixed(2)} OFF`
    }
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

  const isLoading = createDiscountMutation.isPending

  return (
    <div className='container mx-auto max-w-4xl space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Link href={ROUTES.INVENTORY.COUPONS.MAIN.PATH}>
            <Button variant='ghost' size='sm'>
              ← Volver a Cupones
            </Button>
          </Link>
          <h1 className='mt-2 text-3xl font-bold'>Crear Cupón de Descuento</h1>
          <p className='text-muted-foreground'>Crea un nuevo cupón de descuento para tu tienda.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Tag className='size-5 text-blue-500' />
            Información del Cupón
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código del Cupón *</FormLabel>
                      <div className='flex gap-2'>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='SUMMER25'
                            className='flex-1 uppercase'
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={generateRandomCode}
                          className='px-3'
                        >
                          Generar
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Descuento *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              </div>

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
                      <FormDescription>Si no se especifica, el cupón no expirará</FormDescription>
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
                            onCheckedChange={() => field.onChange('SPECIFIC_PRODUCTS')}
                            disabled={true}
                          />
                          <Label htmlFor='specific-products' className='flex items-center gap-2'>
                            <Tag className='size-4' />
                            Productos específicos (funcionalidad próximamente)
                          </Label>
                        </div>
                      </div>
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

              {watchedCode && watchedValue && (
                <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-950'>
                  <h4 className='mb-2 text-sm font-medium text-blue-800 dark:text-blue-200'>
                    Vista Previa del Cupón
                  </h4>
                  <div className='space-y-2 text-sm text-blue-700 dark:text-blue-300'>
                    <div className='flex justify-between'>
                      <span>Código:</span>
                      <Badge variant='default' className='text-xs'>
                        {watchedCode}
                      </Badge>
                    </div>
                    <div className='flex justify-between'>
                      <span>Descuento:</span>
                      <Badge variant='destructive' className='text-xs'>
                        {calculateDiscountPreview()}
                      </Badge>
                    </div>
                    <div className='flex justify-between'>
                      <span>Productos:</span>
                      <span>{watchedAppliesTo === 'ALL_PRODUCTS' ? 'Todos' : 'Específicos'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex gap-2'>
                <Button type='submit' disabled={isLoading} className='flex-1'>
                  {isLoading ? 'Creando...' : 'Crear Cupón'}
                </Button>
                <Link href={ROUTES.INVENTORY.COUPONS.MAIN.PATH}>
                  <Button type='button' variant='outline' disabled={isLoading}>
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
