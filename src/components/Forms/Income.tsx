'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, DollarSign } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  useAssignIncomeEntry,
  useCreateIncome,
  useUpdateIncome,
  type FinancialEntry,
  type PendingIncomeEntry,
} from '@/services/financial-events/hooks'

const incomeFormSchema = z.object({
  amount: z
    .number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .max(999999.99, 'El monto no puede exceder $999,999.99'),
  category: z
    .string()
    .min(1, 'La categoría es obligatoria')
    .max(100, 'La categoría no puede exceder 100 caracteres'),
  description: z
    .string()
    .min(1, 'La descripción es obligatoria')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
  paymentMethod: z.string().max(50, 'El método de pago no puede exceder 50 caracteres').optional(),
  relatedParty: z
    .string()
    .max(100, 'La parte relacionada no puede exceder 100 caracteres')
    .optional(),
})

type IncomeFormValues = z.infer<typeof incomeFormSchema>

interface IncomeFormProps {
  eventId: string
  income?: FinancialEntry
  pendingIncomes: PendingIncomeEntry[]
  isLoading: boolean
  error?: Error | null
  onSuccess?: () => void
  onCancel?: () => void
}

export const Income: React.FC<IncomeFormProps> = ({
  error,
  eventId,
  income,
  isLoading,
  onCancel,
  onSuccess,
  pendingIncomes,
}) => {
  const [activeTab, setActiveTab] = useState(income ? 'manual' : 'assign')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='assign' disabled={!!income}>
          Asignar Ingreso Pendiente
        </TabsTrigger>
        <TabsTrigger value='manual'>
          {income ? 'Editar Ingreso' : 'Registrar Manualmente'}
        </TabsTrigger>
      </TabsList>
      <TabsContent value='assign'>
        <AssignIncomeComponent
          eventId={eventId}
          pendingIncomes={pendingIncomes}
          isLoading={isLoading}
          error={error}
          onSuccess={onSuccess}
        />
      </TabsContent>
      <TabsContent value='manual'>
        <ManualIncomeFormComponent
          eventId={eventId}
          income={income}
          onSuccess={onSuccess}
          onCancel={onCancel}
          isLoading={false}
        />
      </TabsContent>
    </Tabs>
  )
}

// Componente para asignar ingresos pendientes (funcionalidad original)
const AssignIncomeComponent: React.FC<Omit<IncomeFormProps, 'income' | 'onCancel'>> = ({
  error,
  eventId,
  isLoading,
  onSuccess,
  pendingIncomes,
}) => {
  const [selectedIncomeId, setSelectedIncomeId] = useState<string>('')
  const assignIncomeMutation = useAssignIncomeEntry()

  const handleAssignIncome = () => {
    if (!selectedIncomeId) return

    assignIncomeMutation.mutate(
      { eventId, incomeEntryId: selectedIncomeId },
      {
        onSuccess: () => {
          setSelectedIncomeId('')
          onSuccess?.()
        },
      }
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asignar Ingresos Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <p>Cargando ingresos pendientes...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asignar Ingresos Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <p className='text-destructive'>Error al cargar ingresos pendientes: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const selectedIncome = pendingIncomes.find((income) => income.id === selectedIncomeId)

  return (
    <div>
      <CardContent className='pt-6'>
        {pendingIncomes.length > 0 ? (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Seleccionar Ingreso</label>
              <Select
                value={selectedIncomeId}
                onValueChange={setSelectedIncomeId}
                disabled={assignIncomeMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona un ingreso pendiente...' />
                </SelectTrigger>
                <SelectContent>
                  {pendingIncomes.map((income) => (
                    <SelectItem key={income.id} value={income.id}>
                      <div className='flex w-full items-center justify-between'>
                        <div className='flex flex-col items-start'>
                          <span className='font-medium'>{income.description}</span>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <CalendarDays className='size-3' />
                            {new Date(income.date).toLocaleDateString('es-MX')}
                            <span>•</span>
                            <span className='font-medium'>
                              {income.amount.toLocaleString('es-MX', {
                                currency: income.currency,
                                style: 'currency',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedIncome && (
              <div className='bg-muted/50 rounded-lg border p-4'>
                <h4 className='mb-2 font-medium'>Detalle del Ingreso Seleccionado</h4>
                <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
                  <div>
                    <span className='text-muted-foreground'>Descripción:</span>
                    <p className='font-medium'>{selectedIncome.description}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Monto:</span>
                    <p className='font-medium'>
                      {selectedIncome.amount.toLocaleString('es-MX', {
                        currency: selectedIncome.currency,
                        style: 'currency',
                      })}
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Fecha:</span>
                    <p className='font-medium'>
                      {new Date(selectedIncome.date).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Fuente:</span>
                    <Badge variant='outline'>{selectedIncome.source}</Badge>
                  </div>
                  {selectedIncome.relatedParty && (
                    <div className='md:col-span-2'>
                      <span className='text-muted-foreground'>Parte Relacionada:</span>
                      <p className='font-medium'>{selectedIncome.relatedParty}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className='flex justify-end'>
              <Button
                onClick={handleAssignIncome}
                disabled={!selectedIncomeId || assignIncomeMutation.isPending}
                className='min-w-[160px]'
              >
                {assignIncomeMutation.isPending ? 'Asignando...' : 'Asignar a este Evento'}
              </Button>
            </div>
          </div>
        ) : (
          <div className='py-8 text-center'>
            <DollarSign className='mx-auto mb-4 size-12 text-muted-foreground' />
            <h3 className='mb-2 text-lg font-medium'>No hay ingresos pendientes</h3>
            <p className='text-muted-foreground'>
              Todos los ingresos han sido asignados a eventos o no hay ingresos registrados.
            </p>
          </div>
        )}
      </CardContent>
    </div>
  )
}

// Componente para el formulario de registro/edición manual
const ManualIncomeFormComponent: React.FC<Omit<IncomeFormProps, 'pendingIncomes'>> = ({
  eventId,
  income,
  onCancel,
  onSuccess,
}) => {
  const createIncomeMutation = useCreateIncome()
  const updateIncomeMutation = useUpdateIncome()

  const isEditMode = !!income
  const isLoading = createIncomeMutation.isPending || updateIncomeMutation.isPending

  const form = useForm<IncomeFormValues>({
    defaultValues: {
      amount: undefined,
      category: '',
      description: '',
      notes: '',
      paymentMethod: '',
      relatedParty: '',
    },
    resolver: zodResolver(incomeFormSchema),
  })

  useEffect(() => {
    if (income) {
      form.reset({
        amount: typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount,
        category: income.category ?? '',
        description: income.description,
        notes: income.notes ?? '',
        paymentMethod: income.paymentMethod ?? '',
        relatedParty: income.relatedParty ?? '',
      })
    }
  }, [income, form])

  const onSubmit = (values: IncomeFormValues) => {
    if (isEditMode) {
      updateIncomeMutation.mutate(
        {
          ...values,
          id: income.id,
        },
        {
          onSuccess: () => {
            onSuccess?.()
          },
        }
      )
    } else {
      createIncomeMutation.mutate(
        {
          ...values,
          eventId,
        },
        {
          onSuccess: () => {
            form.reset()
            onSuccess?.()
          },
        }
      )
    }
  }

  return (
    <div>
      <CardContent className='pt-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción *</FormLabel>
                    <FormControl>
                      <Input placeholder='Ej: Venta de boletos' disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto *</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        min='0.01'
                        placeholder='0.00'
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ej: Taquilla, Patrocinios'
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='paymentMethod'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Recepción</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ej: Efectivo, Transferencia'
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='relatedParty'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parte Relacionada</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ej: Patrocinador, Cliente'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Información adicional sobre el ingreso...'
                      className='resize-none'
                      rows={3}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditMode && (
              <div className='bg-muted/50 rounded-lg border p-4'>
                <h4 className='mb-3 flex items-center gap-2 font-medium'>
                  Información Original
                  <Badge variant='outline' className='text-xs'>
                    {income.type}
                  </Badge>
                </h4>
                <div className='grid grid-cols-1 gap-3 text-sm md:grid-cols-3'>
                  <div>
                    <span className='text-muted-foreground'>Fecha:</span>
                    <p className='font-medium'>
                      {new Date(income.date).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Monto Original:</span>
                    <p className='font-medium'>
                      {income.amount.toLocaleString('es-MX', {
                        currency: 'MXN',
                        style: 'currency',
                      })}
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>ID:</span>
                    <p className='break-all font-mono text-xs font-medium'>{income.id}</p>
                  </div>
                </div>
              </div>
            )}

            <div className='flex justify-end gap-3 border-t pt-4'>
              {isEditMode && onCancel && (
                <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
                  Cancelar
                </Button>
              )}

              <Button type='submit' disabled={isLoading} className='min-w-[140px]'>
                {isLoading
                  ? isEditMode
                    ? 'Guardando...'
                    : 'Registrando...'
                  : isEditMode
                    ? 'Guardar Cambios'
                    : 'Registrar Ingreso'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </div>
  )
}
