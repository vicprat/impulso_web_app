'use client'

import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useBankAccounts, useDeleteBankAccount } from '@/modules/finance/hooks'
import { ROUTES } from '@/src/config/routes'
import { formatCurrency } from '@/src/helpers'

export default function BankAccountsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBank, setFilterBank] = useState('')

  const { data: bankAccounts, error, isLoading } = useBankAccounts()
  const deleteBankAccount = useDeleteBankAccount()

  const filteredAccounts =
    bankAccounts?.filter((account) => {
      const matchesSearch =
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountNo?.includes(searchTerm)
      const matchesBank = !filterBank || account.bankName === filterBank
      return matchesSearch && matchesBank
    }) || []

  const banks = [...new Set(bankAccounts?.map((account) => account.bankName).filter(Boolean))]

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta cuenta bancaria?')) {
      try {
        await deleteBankAccount.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting bank account:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Cuentas Bancarias</h1>
          <div className='h-10 w-32 animate-pulse rounded bg-muted' />
        </div>
        <div className='grid gap-4'>
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='mb-2 h-6 w-48 animate-pulse rounded bg-muted' />
                <div className='h-4 w-32 animate-pulse rounded bg-muted' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center text-muted-foreground'>
              Error al cargar las cuentas bancarias: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Cuentas Bancarias</h1>
        <Link href={ROUTES.FINANCE.BANK_ACCOUNTS.CREATE.PATH}>
          <Button>
            <Plus className='mr-2 size-4' />
            Nueva Cuenta
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Buscar por nombre, banco o número de cuenta...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='w-48'>
              <select
                value={filterBank}
                onChange={(e) => setFilterBank(e.target.value)}
                className='w-full rounded-md border border-input bg-background px-3 py-2'
              >
                <option value=''>Todos los bancos</option>
                {banks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cuentas */}
      <div className='grid gap-4'>
        {filteredAccounts.length === 0 ? (
          <Card>
            <CardContent className='p-6 text-center text-muted-foreground'>
              {searchTerm || filterBank
                ? 'No se encontraron cuentas con los filtros aplicados'
                : 'No hay cuentas bancarias registradas'}
            </CardContent>
          </Card>
        ) : (
          filteredAccounts.map((account) => (
            <Card key={account.id} className='transition-shadow hover:shadow-md'>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-2'>
                      <h3 className='text-lg font-semibold'>{account.name}</h3>
                      <Badge variant='outline'>{account.bankName}</Badge>
                    </div>
                    <div className='space-y-1 text-sm text-muted-foreground'>
                      {account.accountNo && <p>Número de cuenta: {account.accountNo}</p>}
                      {account.clabe && <p>CLABE: {account.clabe}</p>}
                      <p>
                        Saldo inicial: {formatCurrency(account.initialBalance.toString(), 'MXN')}
                      </p>
                      <p>
                        Saldo actual: {formatCurrency(account.currentBalance.toString(), 'MXN')}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Link
                      href={ROUTES.FINANCE.BANK_ACCOUNTS.DETAIL.PATH.replace(':id', account.id)}
                    >
                      <Button variant='outline' size='sm'>
                        Ver
                      </Button>
                    </Link>
                    <Link href={ROUTES.FINANCE.BANK_ACCOUNTS.EDIT.PATH.replace(':id', account.id)}>
                      <Button variant='outline' size='sm'>
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDelete(account.id)}
                      disabled={deleteBankAccount.isPending}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resumen */}
      {bankAccounts && bankAccounts.length > 0 && (
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              <span>
                {filteredAccounts.length} de {bankAccounts.length} cuentas mostradas
              </span>
              <span>
                Saldo total:{' '}
                {formatCurrency(
                  filteredAccounts
                    .reduce((sum, account) => sum + account.currentBalance, 0)
                    .toString(),
                  'MXN'
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
