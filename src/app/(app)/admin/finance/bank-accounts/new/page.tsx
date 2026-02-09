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
import { useCreateBankAccount } from '@/modules/finance/hooks'

export default function NewBankAccountPage() {
  const router = useRouter()
  const createBankAccount = useCreateBankAccount()

  const [formData, setFormData] = useState({
    accountNo: '',
    bankName: '',
    clabe: '',
    initialBalance: '',
    name: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la cuenta es requerido'
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'El nombre del banco es requerido'
    }

    if (!formData.initialBalance.trim()) {
      newErrors.initialBalance = 'El saldo inicial es requerido'
    } else {
      const balance = parseFloat(formData.initialBalance)
      if (isNaN(balance)) {
        newErrors.initialBalance = 'El saldo inicial debe ser un número válido'
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
      await createBankAccount.mutateAsync({
        accountNo: formData.accountNo.trim() || undefined,
        bankName: formData.bankName.trim(),
        clabe: formData.clabe.trim() || undefined,
        initialBalance: parseFloat(formData.initialBalance),
        name: formData.name.trim(),
      })

      toast.success('Cuenta bancaria creada exitosamente')
      // router.push(ROUTES.ADMIN.FINANCE.BANK_ACCOUNTS.MAIN.PATH)
    } catch (error) {
      console.error('Error creating bank account:', error)
      toast.error('Error al crear la cuenta bancaria')
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
        <Link href=''>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='mr-2 size-4' />
            Volver
          </Button>
        </Link>
        <h1 className='text-2xl font-bold'>Nueva Cuenta Bancaria</h1>
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
              <Label htmlFor='initialBalance'>Saldo Inicial *</Label>
              <Input
                id='initialBalance'
                type='number'
                step='0.01'
                value={formData.initialBalance}
                onChange={(e) => handleInputChange('initialBalance', e.target.value)}
                placeholder='0.00'
                className={errors.initialBalance ? 'border-red-500' : ''}
              />
              {errors.initialBalance && (
                <p className='text-sm text-red-500'>{errors.initialBalance}</p>
              )}
            </div>

            <div className='flex gap-4 pt-4'>
              <Button type='submit' disabled={createBankAccount.isPending} className='flex-1'>
                <Save className='mr-2 size-4' />
                {createBankAccount.isPending ? 'Creando...' : 'Crear Cuenta'}
              </Button>
              <Link href=''>
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
