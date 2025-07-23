'use client'

import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useBankAccounts, useCreateFinancialEntry } from '@/modules/finance/hooks'
import { ROUTES } from '@/src/config/routes'

export default function NewFinancialEntryPage() {
  const router = useRouter()
  const createEntry = useCreateFinancialEntry()
  const { data: bankAccounts } = useBankAccounts()

  const [formData, setFormData] = useState({
    amount: '',
    amountPaid: '',
    bankAccountId: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    dueDate: '',
    notes: '',
    paymentMethod: '',
    relatedParty: '',
    status: 'PENDING',
    type: 'EXPENSE',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'El monto es requerido'
    } else {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'El monto debe ser un número válido mayor a 0'
      }
    }

    if (formData.amountPaid.trim()) {
      const amountPaid = parseFloat(formData.amountPaid)
      const amount = parseFloat(formData.amount)
      if (isNaN(amountPaid) || amountPaid < 0) {
        newErrors.amountPaid = 'El monto pagado debe ser un número válido'
      } else if (amountPaid > amount) {
        newErrors.amountPaid = 'El monto pagado no puede ser mayor al monto total'
      }
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida'
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date(formData.date)) {
      newErrors.dueDate = 'La fecha de vencimiento no puede ser anterior a la fecha del movimiento'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await createEntry.mutateAsync({
        amount: parseFloat(formData.amount),
        amountPaid: formData.amountPaid ? parseFloat(formData.amountPaid) : 0,
        bankAccountId: formData.bankAccountId || undefined,
        category: formData.category.trim() || undefined,
        date: new Date(formData.date).toISOString(),
        description: formData.description.trim(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        notes: formData.notes.trim() || undefined,
        paymentMethod: formData.paymentMethod.trim() || undefined,
        relatedParty: formData.relatedParty.trim() || undefined,
        status: formData.status as 'PENDING' | 'PARTIALLY_PAID' | 'COMPLETED' | 'CANCELLED',
        type: formData.type as 'INCOME' | 'EXPENSE',
      })

      toast.success('Movimiento financiero creado exitosamente')
      router.push(ROUTES.FINANCE.ENTRIES.MAIN.PATH)
    } catch (error) {
      console.error('Error creating financial entry:', error)
      toast.error('Error al crear el movimiento financiero')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center gap-4'>
        <Link href={ROUTES.FINANCE.ENTRIES.MAIN.PATH}>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='mr-2 size-4' />
            Volver
          </Button>
        </Link>
        <h1 className='text-2xl font-bold'>Nuevo Movimiento Financiero</h1>
      </div>

      <Card className='max-w-4xl'>
        <CardHeader>
          <CardTitle>Información del Movimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Tipo y Montos */}
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='space-y-2'>
                <Label htmlFor='type'>Tipo de Movimiento *</Label>
                <select
                  id='type'
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                >
                  <option value='EXPENSE'>Gasto</option>
                  <option value='INCOME'>Ingreso</option>
                </select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='amount'>Monto Total *</Label>
                <Input
                  id='amount'
                  type='number'
                  step='0.01'
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder='0.00'
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && <p className='text-sm text-red-500'>{errors.amount}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='amountPaid'>Monto Pagado</Label>
                <Input
                  id='amountPaid'
                  type='number'
                  step='0.01'
                  value={formData.amountPaid}
                  onChange={(e) => handleInputChange('amountPaid', e.target.value)}
                  placeholder='0.00'
                  className={errors.amountPaid ? 'border-red-500' : ''}
                />
                {errors.amountPaid && <p className='text-sm text-red-500'>{errors.amountPaid}</p>}
              </div>
            </div>

            {/* Descripción y Fecha */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='description'>Descripción *</Label>
                <Input
                  id='description'
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder='Descripción del movimiento'
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className='text-sm text-red-500'>{errors.description}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='date'>Fecha *</Label>
                <Input
                  id='date'
                  type='date'
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && <p className='text-sm text-red-500'>{errors.date}</p>}
              </div>
            </div>

            {/* Cuenta Bancaria y Categoría */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='bankAccountId'>Cuenta Bancaria</Label>
                <select
                  id='bankAccountId'
                  value={formData.bankAccountId}
                  onChange={(e) => handleInputChange('bankAccountId', e.target.value)}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                >
                  <option value=''>Seleccionar cuenta</option>
                  {bankAccounts?.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.bankName}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='category'>Categoría</Label>
                <Input
                  id='category'
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder='Ej: Servicios, Materiales, etc.'
                />
              </div>
            </div>

            {/* Método de Pago y Parte Relacionada */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='paymentMethod'>Método de Pago</Label>
                <Input
                  id='paymentMethod'
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  placeholder='Ej: Transferencia, Efectivo, Tarjeta'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='relatedParty'>Parte Relacionada</Label>
                <Input
                  id='relatedParty'
                  value={formData.relatedParty}
                  onChange={(e) => handleInputChange('relatedParty', e.target.value)}
                  placeholder='Cliente, proveedor, empleado, etc.'
                />
              </div>
            </div>

            {/* Estado y Fecha de Vencimiento */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='status'>Estado</Label>
                <select
                  id='status'
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                >
                  <option value='PENDING'>Pendiente</option>
                  <option value='PARTIALLY_PAID'>Parcialmente Pagado</option>
                  <option value='COMPLETED'>Completado</option>
                  <option value='CANCELLED'>Cancelado</option>
                </select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='dueDate'>Fecha de Vencimiento</Label>
                <Input
                  id='dueDate'
                  type='date'
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={errors.dueDate ? 'border-red-500' : ''}
                />
                {errors.dueDate && <p className='text-sm text-red-500'>{errors.dueDate}</p>}
              </div>
            </div>

            {/* Notas */}
            <div className='space-y-2'>
              <Label htmlFor='notes'>Notas</Label>
              <Textarea
                id='notes'
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder='Notas adicionales sobre el movimiento'
                rows={3}
              />
            </div>

            <div className='flex gap-4 pt-4'>
              <Button type='submit' disabled={createEntry.isPending} className='flex-1'>
                <Save className='mr-2 size-4' />
                {createEntry.isPending ? 'Creando...' : 'Crear Movimiento'}
              </Button>
              <Link href={ROUTES.FINANCE.ENTRIES.MAIN.PATH} className='flex-1'>
                <Button type='button' variant='outline' className='w-full'>
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
