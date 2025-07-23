'use client'

import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBankAccount, useUpdateBankAccount } from '@/modules/finance/hooks'
import { ROUTES } from '@/src/config/routes'

export default function EditBankAccountPage() {
  const params = useParams()
  const router = useRouter()
  const accountId = params.id as string

  const { data: account, error, isLoading } = useBankAccount(accountId)
  const updateBankAccount = useUpdateBankAccount()

  const [formData, setFormData] = useState({
    accountNo: '',
    bankName: '',
    clabe: '',
    currentBalance: '',
    name: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-llenar el formulario cuando se cargan los datos
  useEffect(() => {
    if (account) {
      setFormData({
        accountNo: account.accountNo || '',
        bankName: account.bankName || '',
        clabe: account.clabe || '',
        currentBalance: account.currentBalance.toString(),
        name: account.name,
      })
    }
  }, [account])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la cuenta es requerido'
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'El nombre del banco es requerido'
    }

    if (!formData.currentBalance.trim()) {
      newErrors.currentBalance = 'El saldo actual es requerido'
    } else {
      const balance = parseFloat(formData.currentBalance)
      if (isNaN(balance)) {
        newErrors.currentBalance = 'El saldo actual debe ser un número válido'
      }
    }

    if (formData.accountNo && formData.accountNo.length < 10) {
      newErrors.accountNo = 'El número de cuenta debe tener al menos 10 dígitos'
    }

    if (formData.clabe && formData.clabe.length !== 18) {
      newErrors.clabe = 'La CLABE debe tener exactamente 18 dígitos'
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
      await updateBankAccount.mutateAsync({
        data: {
          accountNo: formData.accountNo.trim() || undefined,
          bankName: formData.bankName.trim(),
          clabe: formData.clabe.trim() || undefined,
          currentBalance: parseFloat(formData.currentBalance),
          name: formData.name.trim(),
        },
        id: accountId,
      })

      toast.success('Cuenta bancaria actualizada exitosamente')
      router.push(ROUTES.FINANCE.BANK_ACCOUNTS.DETAIL.PATH.replace(':id', accountId))
    } catch (error) {
      console.error('Error updating bank account:', error)
      toast.error('Error al actualizar la cuenta bancaria')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <div className='flex items-center gap-4'>
          <div className='h-10 w-24 animate-pulse rounded bg-muted' />
          <div className='h-8 w-48 animate-pulse rounded bg-muted' />
        </div>
        <Card className='max-w-2xl'>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              {[...Array(5)].map((_, i) => (
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
              Error al cargar la cuenta bancaria: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!account) {
    return (
      <div className='p-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center text-muted-foreground'>Cuenta bancaria no encontrada</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center gap-4'>
        <Link href={ROUTES.FINANCE.BANK_ACCOUNTS.DETAIL.PATH.replace(':id', accountId)}>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='mr-2 size-4' />
            Volver
          </Button>
        </Link>
        <h1 className='text-2xl font-bold'>Editar Cuenta Bancaria</h1>
      </div>

      <Card className='max-w-2xl'>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nombre de la Cuenta *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder='Ej: Cuenta Principal'
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='bankName'>Nombre del Banco *</Label>
                <Input
                  id='bankName'
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder='Ej: Banco de México'
                  className={errors.bankName ? 'border-red-500' : ''}
                />
                {errors.bankName && <p className='text-sm text-red-500'>{errors.bankName}</p>}
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='accountNo'>Número de Cuenta</Label>
                <Input
                  id='accountNo'
                  value={formData.accountNo}
                  onChange={(e) => handleInputChange('accountNo', e.target.value)}
                  placeholder='Ej: 1234567890'
                  className={errors.accountNo ? 'border-red-500' : ''}
                />
                {errors.accountNo && <p className='text-sm text-red-500'>{errors.accountNo}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='clabe'>CLABE</Label>
                <Input
                  id='clabe'
                  value={formData.clabe}
                  onChange={(e) => handleInputChange('clabe', e.target.value)}
                  placeholder='Ej: 012345678901234567'
                  maxLength={18}
                  className={errors.clabe ? 'border-red-500' : ''}
                />
                {errors.clabe && <p className='text-sm text-red-500'>{errors.clabe}</p>}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='currentBalance'>Saldo Actual *</Label>
              <Input
                id='currentBalance'
                type='number'
                step='0.01'
                value={formData.currentBalance}
                onChange={(e) => handleInputChange('currentBalance', e.target.value)}
                placeholder='0.00'
                className={errors.currentBalance ? 'border-red-500' : ''}
              />
              {errors.currentBalance && (
                <p className='text-sm text-red-500'>{errors.currentBalance}</p>
              )}
            </div>

            <div className='flex gap-4 pt-4'>
              <Button type='submit' disabled={updateBankAccount.isPending} className='flex-1'>
                <Save className='mr-2 size-4' />
                {updateBankAccount.isPending ? 'Actualizando...' : 'Actualizar Cuenta'}
              </Button>
              <Link
                href={ROUTES.FINANCE.BANK_ACCOUNTS.DETAIL.PATH.replace(':id', accountId)}
                className='flex-1'
              >
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
