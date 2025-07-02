'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateExpense,
  useUpdateExpense,
  type FinancialEntry,
} from '@/services/financial-events/hooks'

const expenseFormSchema = z.object({
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

type ExpenseFormValues = z.infer<typeof expenseFormSchema>

interface ExpenseFormProps {
  eventId: string
  expense?: FinancialEntry
  onSuccess?: () => void
  onCancel?: () => void
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  eventId,
  expense,
  onCancel,
  onSuccess,
}) => {
  const createExpenseMutation = useCreateExpense()
  const updateExpenseMutation = useUpdateExpense()

  const isEditMode = !!expense
  const isLoading = createExpenseMutation.isPending || updateExpenseMutation.isPending

  const form = useForm<ExpenseFormValues>({
    defaultValues: {
      amount: undefined,
      category: '',
      description: '',
      notes: '',
      paymentMethod: '',
      relatedParty: '',
    },
    resolver: zodResolver(expenseFormSchema),
  })

  // Populate form when expense is provided (edit mode)
  useEffect(() => {
    if (expense) {
      form.reset({
        amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount,
        category: expense.category ?? '',
        description: expense.description,
        notes: expense.notes ?? '',
        paymentMethod: expense.paymentMethod ?? '',
        relatedParty: expense.relatedParty ?? '',
      })
    }
  }, [expense, form])

  const onSubmit = (values: ExpenseFormValues) => {
    if (isEditMode) {
      updateExpenseMutation.mutate(
        {
          amount: values.amount,
          category: values.category.trim(),
          description: values.description.trim(),
          id: expense.id,
          notes: values.notes?.trim() ?? undefined,
          paymentMethod: values.paymentMethod?.trim() ?? undefined,
          relatedParty: values.relatedParty?.trim() ?? undefined,
        },
        {
          onSuccess: () => {
            onSuccess?.()
          },
        }
      )
    } else {
      createExpenseMutation.mutate(
        {
          ...values,
          category: values.category.trim(),
          description: values.description.trim(),
          eventId,
          notes: values.notes?.trim() ?? undefined,
          paymentMethod: values.paymentMethod?.trim() ?? undefined,
          relatedParty: values.relatedParty?.trim() ?? undefined,
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
      <CardContent>
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
                      <Input
                        placeholder='Ej: Compra de materiales'
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
                        placeholder='Ej: Materiales, Servicios'
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
                    <FormLabel>Método de Pago</FormLabel>
                    <FormControl>
                      <Input placeholder='Ej: Efectivo, Tarjeta' disabled={isLoading} {...field} />
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
                    <Input placeholder='Ej: Proveedor, Cliente' disabled={isLoading} {...field} />
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
                      placeholder='Información adicional sobre el gasto...'
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
                    {expense.type}
                  </Badge>
                </h4>
                <div className='grid grid-cols-1 gap-3 text-sm md:grid-cols-3'>
                  <div>
                    <span className='text-muted-foreground'>Fecha:</span>
                    <p className='font-medium'>
                      {new Date(expense.date).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Monto Original:</span>
                    <p className='font-medium'>
                      {expense.amount.toLocaleString('es-MX', {
                        currency: 'MXN',
                        style: 'currency',
                      })}
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>ID:</span>
                    <p className='break-all font-mono text-xs font-medium'>{expense.id}</p>
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
                    : 'Registrar Egreso'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </div>
  )
}
