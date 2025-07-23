'use client'

import { ArrowLeft, Edit, Save, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useBankAccounts,
  useDeleteFinancialEntry,
  useFinancialEntry,
  useUpdateFinancialEntry,
} from '@/modules/finance/hooks'
import { ROUTES } from '@/src/config/routes'
import { formatCurrency } from '@/src/helpers'

export default function FinancialEntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const entryId = params.id as string

  const { data: entry, error, isLoading } = useFinancialEntry(entryId)
  const { data: bankAccounts } = useBankAccounts()
  const updateEntry = useUpdateFinancialEntry()
  const deleteEntry = useDeleteFinancialEntry()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    amountPaid: '',
    bankAccountId: '',
    category: '',
    date: '',
    description: '',
    dueDate: '',
    notes: '',
    paymentMethod: '',
    relatedParty: '',
    status: 'PENDING',
    type: 'EXPENSE',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-llenar el formulario cuando se cargan los datos
  useEffect(() => {
    if (entry) {
      setFormData({
        amount: entry.amount.toString(),
        amountPaid: entry.amountPaid.toString(),
        bankAccountId: entry.bankAccountId || '',
        category: entry.category || '',
        date: new Date(entry.date).toISOString().split('T')[0],
        description: entry.description,
        dueDate: entry.dueDate ? new Date(entry.dueDate).toISOString().split('T')[0] : '',
        notes: entry.notes || '',
        paymentMethod: entry.paymentMethod || '',
        relatedParty: entry.relatedParty || '',
        status: entry.status,
        type: entry.type,
      })
    }
  }, [entry])

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

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await updateEntry.mutateAsync({
        data: {
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
        },
        id: entryId,
      })

      toast.success('Movimiento financiero actualizado exitosamente')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating entry:', error)
      toast.error('Error al actualizar el movimiento financiero')
    }
  }

  const handleCancel = () => {
    // Restaurar datos originales
    if (entry) {
      setFormData({
        amount: entry.amount.toString(),
        amountPaid: entry.amountPaid.toString(),
        bankAccountId: entry.bankAccountId || '',
        category: entry.category || '',
        date: new Date(entry.date).toISOString().split('T')[0],
        description: entry.description,
        dueDate: entry.dueDate ? new Date(entry.dueDate).toISOString().split('T')[0] : '',
        notes: entry.notes || '',
        paymentMethod: entry.paymentMethod || '',
        relatedParty: entry.relatedParty || '',
        status: entry.status,
        type: entry.type,
      })
    }
    setErrors({})
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!entry) return

    if (confirm(`¿Estás seguro de que quieres eliminar el movimiento "${entry.description}"?`)) {
      try {
        await deleteEntry.mutateAsync(entryId)
        toast.success('Movimiento eliminado exitosamente')
        router.push(ROUTES.FINANCE.ENTRIES.MAIN.PATH)
      } catch (error) {
        console.error('Error deleting entry:', error)
        toast.error('Error al eliminar el movimiento')
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CANCELLED: { label: 'Cancelado', variant: 'destructive' as const },
      COMPLETED: { label: 'Completado', variant: 'default' as const },
      PARTIALLY_PAID: { label: 'Parcialmente Pagado', variant: 'secondary' as const },
      PENDING: { label: 'Pendiente', variant: 'outline' as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'INCOME' ? 'default' : 'secondary'}>
        {type === 'INCOME' ? 'Ingreso' : 'Gasto'}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <div className='flex items-center gap-4'>
          <div className='h-10 w-24 animate-pulse rounded bg-muted' />
          <div className='h-8 w-48 animate-pulse rounded bg-muted' />
        </div>
        <Card className='max-w-4xl'>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div className='mb-2 h-4 w-20 animate-pulse rounded bg-muted' />
                  <div className='h-10 w-full animate-pulse rounded bg-muted' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center text-muted-foreground'>
              Error al cargar el movimiento: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className='p-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center text-muted-foreground'>
              Movimiento financiero no encontrado
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href={ROUTES.FINANCE.ENTRIES.MAIN.PATH}>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='mr-2 size-4' />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>
              {isEditing ? 'Editar Movimiento' : 'Detalle del Movimiento'}
            </h1>
            <p className='text-muted-foreground'>{entry.description}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          {!isEditing ? (
            <>
              <Button variant='outline' onClick={() => setIsEditing(true)}>
                <Edit className='mr-2 size-4' />
                Editar
              </Button>
              <Button variant='outline' onClick={handleDelete} disabled={deleteEntry.isPending}>
                <Trash2 className='mr-2 size-4' />
                Eliminar
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSave} disabled={updateEntry.isPending}>
                <Save className='mr-2 size-4' />
                {updateEntry.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button variant='outline' onClick={handleCancel}>
                <X className='mr-2 size-4' />
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className='max-w-4xl'>
        <CardHeader>
          <CardTitle>Información del Movimiento</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            // Formulario de edición
            <form className='space-y-6'>
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
                  {errors.description && (
                    <p className='text-sm text-red-500'>{errors.description}</p>
                  )}
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
            </form>
          ) : (
            // Vista de solo lectura
            <div className='space-y-6'>
              {/* Header con badges */}
              <div className='mb-6 flex items-center gap-4'>
                {getTypeBadge(entry.type)}
                {getStatusBadge(entry.status)}
                <div className='ml-auto text-right'>
                  <p
                    className={`text-3xl font-bold ${entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {entry.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(entry.amount.toString(), 'MXN')}
                  </p>
                  <p className='text-sm text-muted-foreground'>{entry.currency}</p>
                </div>
              </div>

              {/* Información principal */}
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div>
                    <h3 className='mb-2 text-lg font-semibold'>Información General</h3>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Descripción:</span>
                        <span className='font-medium'>{entry.description}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Fecha:</span>
                        <span>{new Date(entry.date).toLocaleDateString('es-MX')}</span>
                      </div>
                      {entry.category && (
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Categoría:</span>
                          <span>{entry.category}</span>
                        </div>
                      )}
                      {entry.relatedParty && (
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Parte relacionada:</span>
                          <span>{entry.relatedParty}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <h3 className='mb-2 text-lg font-semibold'>Detalles de Pago</h3>
                    <div className='space-y-2 text-sm'>
                      {entry.amountPaid > 0 && (
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Monto pagado:</span>
                          <span className='font-medium'>
                            {formatCurrency(entry.amountPaid.toString(), 'MXN')}
                          </span>
                        </div>
                      )}
                      {entry.paymentMethod && (
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Método de pago:</span>
                          <span>{entry.paymentMethod}</span>
                        </div>
                      )}
                      {entry.dueDate && (
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Fecha de vencimiento:</span>
                          <span>{new Date(entry.dueDate).toLocaleDateString('es-MX')}</span>
                        </div>
                      )}
                      {entry.bankAccount && (
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Cuenta bancaria:</span>
                          <span>{entry.bankAccount.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {entry.notes && (
                <div>
                  <h3 className='mb-2 text-lg font-semibold'>Notas</h3>
                  <p className='rounded-md bg-muted p-3 text-sm text-muted-foreground'>
                    {entry.notes}
                  </p>
                </div>
              )}

              {/* Información del sistema */}
              <div className='border-t pt-4'>
                <h3 className='mb-2 text-sm font-medium text-muted-foreground'>
                  Información del Sistema
                </h3>
                <div className='grid gap-2 text-xs text-muted-foreground md:grid-cols-3'>
                  <div>ID: {entry.id}</div>
                  <div>Creado: {new Date(entry.createdAt).toLocaleDateString('es-MX')}</div>
                  <div>Actualizado: {new Date(entry.updatedAt).toLocaleDateString('es-MX')}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
