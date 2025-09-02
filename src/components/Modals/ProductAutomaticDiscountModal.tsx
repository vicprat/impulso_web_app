'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const automaticDiscountSchema = z.object({
  endsAt: z.date().optional(),
  startsAt: z.date({
    required_error: 'La fecha de inicio es requerida',
  }),
  title: z.string().min(1, 'El título es requerido'),
  type: z.enum([ 'PERCENTAGE', 'FIXED_AMOUNT' ], {
    required_error: 'Selecciona el tipo de descuento',
  }),
  value: z.union([ z.number().min(1, 'El valor debe ser mayor a 0'), z.undefined() ]).refine((val) => val !== undefined, {
    message: 'El valor es requerido',
  }),
})

type AutomaticDiscountFormData = z.infer<typeof automaticDiscountSchema>

interface ProductAutomaticDiscountModalProps {
  isOpen: boolean
  onClose: () => void
  onDiscountCreated?: (discount: unknown) => void
  selectedProducts?: { id: string; title: string }[]
  singleProduct?: { id: string; title: string }
}

export function ProductAutomaticDiscountModal({
  isOpen,
  onClose,
  onDiscountCreated,
  selectedProducts,
  singleProduct,
}: ProductAutomaticDiscountModalProps) {
  const [ isSubmitting, setIsSubmitting ] = useState(false)

  // Determinar qué productos usar: singleProduct o selectedProducts
  const productsToUse = useMemo(() => {
    return singleProduct ? [ singleProduct ] : (selectedProducts ?? [])
  }, [ singleProduct, selectedProducts ])

  const form = useForm<AutomaticDiscountFormData>({
    defaultValues: {
      endsAt: undefined,
      startsAt: new Date(),
      title: '',
      type: 'PERCENTAGE',
      value: undefined,
    },
    resolver: zodResolver(automaticDiscountSchema),
  })

  const watchedType = form.watch('type')
  const watchedValue = form.watch('value')

  const calculateDiscountPreview = () => {
    if (!watchedValue) return null
    if (watchedType === 'PERCENTAGE') {
      return `${watchedValue}% OFF`
    } else {
      return `$${watchedValue} OFF`
    }
  }

  const onSubmit = useCallback(
    async (data: AutomaticDiscountFormData) => {
      if (productsToUse.length === 0) {
        toast.error('No hay productos seleccionados')
        return
      }

      setIsSubmitting(true)

      try {
        const response = await fetch('/api/shopify/discounts/automatic', {
          body: JSON.stringify({
            endsAt: data.endsAt?.toISOString(),
            productIds: productsToUse.map(p => p.id),
            startsAt: data.startsAt.toISOString(),
            title: data.title,
            type: data.type,
            value: data.value,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error ?? 'Error al crear descuento automático')
        }

        const discount = await response.json()
        toast.success('Descuento automático creado exitosamente')
        onDiscountCreated?.(discount)
        onClose()
        form.reset()
      } catch (error) {
        console.error('Error al crear descuento automático:', error)
        toast.error(error instanceof Error ? error.message : 'Error al crear descuento automático')
      } finally {
        setIsSubmitting(false)
      }
    },
    [ productsToUse, onDiscountCreated, onClose, form ]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Descuento Automático por Producto</DialogTitle>
          <DialogDescription>
            Crea un descuento que se aplicará automáticamente a los productos seleccionados. Se genera un código único internamente, pero el descuento se activa automáticamente.
            {productsToUse.length > 0 && (
              <div className="mt-2">
                <strong>Productos seleccionados ({productsToUse.length}):</strong>
                <ul className="mt-1 text-sm text-muted-foreground">
                  {productsToUse.slice(0, 3).map((product) => (
                    <li key={product.id}>• {product.title}</li>
                  ))}
                  {productsToUse.length > 3 && (
                    <li>• ... y {productsToUse.length - 3} más</li>
                  )}
                </ul>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Descuento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Descuento especial de temporada" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre descriptivo para identificar este descuento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Descuento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Monto Fijo ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor del Descuento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="1"
                        placeholder={watchedType === 'PERCENTAGE' ? '25' : '100'}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchedType === 'PERCENTAGE' ? 'Porcentaje de descuento (ej: 25 para 25%)' : 'Monto fijo en pesos'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {calculateDiscountPreview() && (
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-sm font-medium text-blue-900">
                  Vista previa: {calculateDiscountPreview()}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto size-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date('1900-01-01')}
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
                name="endsAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Fin (Opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto size-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !productsToUse.length}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Descuento Automático'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
