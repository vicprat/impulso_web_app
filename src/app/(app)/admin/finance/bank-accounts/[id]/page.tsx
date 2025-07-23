'use client'

import { ArrowLeft, Edit, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBankAccount, useDeleteBankAccount, useFinancialEntries } from '@/modules/finance/hooks'
import { ROUTES } from '@/src/config/routes'
import { formatCurrency } from '@/src/helpers'

export default function BankAccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const accountId = params.id as string

  const { data: account, error, isLoading } = useBankAccount(accountId)
  const { data: movements } = useFinancialEntries({ bankAccountId: accountId })
  const deleteBankAccount = useDeleteBankAccount()

  const handleDelete = async () => {
    if (!account) return

    if (confirm(`¿Estás seguro de que quieres eliminar la cuenta "${account.name}"?`)) {
      try {
        await deleteBankAccount.mutateAsync(accountId)
        toast.success('Cuenta bancaria eliminada exitosamente')
        router.push(ROUTES.FINANCE.BANK_ACCOUNTS.MAIN.PATH)
      } catch (error) {
        console.error('Error deleting bank account:', error)
        toast.error('Error al eliminar la cuenta bancaria')
      }
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <div className='flex items-center gap-4'>
          <div className='h-10 w-24 animate-pulse rounded bg-muted' />
          <div className='h-8 w-48 animate-pulse rounded bg-muted' />
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardContent className='p-6'>
              <div className='mb-4 h-6 w-32 animate-pulse rounded bg-muted' />
              <div className='space-y-2'>
                <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                <div className='h-4 w-32 animate-pulse rounded bg-muted' />
                <div className='h-4 w-28 animate-pulse rounded bg-muted' />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6'>
              <div className='mb-4 h-6 w-32 animate-pulse rounded bg-muted' />
              <div className='space-y-2'>
                <div className='h-4 w-20 animate-pulse rounded bg-muted' />
                <div className='h-4 w-24 animate-pulse rounded bg-muted' />
              </div>
            </CardContent>
          </Card>
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

  const recentMovements = movements?.slice(0, 10) || []
  const totalIncome = recentMovements
    .filter((m) => m.type === 'INCOME')
    .reduce((sum, m) => sum + m.amount, 0)
  const totalExpense = recentMovements
    .filter((m) => m.type === 'EXPENSE')
    .reduce((sum, m) => sum + m.amount, 0)

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href={ROUTES.FINANCE.BANK_ACCOUNTS.MAIN.PATH}>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='mr-2 size-4' />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>{account.name}</h1>
            <p className='text-muted-foreground'>{account.bankName}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Link href={ROUTES.FINANCE.BANK_ACCOUNTS.EDIT.PATH.replace(':id', accountId)}>
            <Button variant='outline'>
              <Edit className='mr-2 size-4' />
              Editar
            </Button>
          </Link>
          <Button variant='outline' onClick={handleDelete} disabled={deleteBankAccount.isPending}>
            <Trash2 className='mr-2 size-4' />
            Eliminar
          </Button>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Información de la cuenta */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Saldo Inicial</p>
                <p className='text-lg font-semibold'>
                  {formatCurrency(account.initialBalance.toString(), 'MXN')}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Saldo Actual</p>
                <p className='text-lg font-semibold'>
                  {formatCurrency(account.currentBalance.toString(), 'MXN')}
                </p>
              </div>
            </div>

            {account.accountNo && (
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Número de Cuenta</p>
                <p className='font-mono'>{account.accountNo}</p>
              </div>
            )}

            {account.clabe && (
              <div>
                <p className='text-sm font-medium text-muted-foreground'>CLABE</p>
                <p className='font-mono'>{account.clabe}</p>
              </div>
            )}

            <div>
              <p className='text-sm font-medium text-muted-foreground'>Fecha de Creación</p>
              <p>{new Date(account.createdAt).toLocaleDateString('es-MX')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de movimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Movimientos</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='rounded-lg bg-green-50 p-4 text-center'>
                <TrendingUp className='mx-auto mb-2 size-8 text-green-600' />
                <p className='text-sm font-medium text-muted-foreground'>Ingresos</p>
                <p className='text-lg font-semibold text-green-600'>
                  {formatCurrency(totalIncome.toString(), 'MXN')}
                </p>
              </div>
              <div className='rounded-lg bg-red-50 p-4 text-center'>
                <TrendingDown className='mx-auto mb-2 size-8 text-red-600' />
                <p className='text-sm font-medium text-muted-foreground'>Gastos</p>
                <p className='text-lg font-semibold text-red-600'>
                  {formatCurrency(totalExpense.toString(), 'MXN')}
                </p>
              </div>
            </div>

            <div className='rounded-lg bg-blue-50 p-4 text-center'>
              <p className='text-sm font-medium text-muted-foreground'>Balance Neto</p>
              <p
                className={`text-lg font-semibold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatCurrency((totalIncome - totalExpense).toString(), 'MXN')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movimientos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMovements.length === 0 ? (
            <div className='py-8 text-center text-muted-foreground'>
              No hay movimientos registrados para esta cuenta
            </div>
          ) : (
            <div className='space-y-4'>
              {recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className='flex items-center justify-between rounded-lg border p-4'
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <Badge variant={movement.type === 'INCOME' ? 'default' : 'secondary'}>
                        {movement.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                      </Badge>
                      <span className='font-medium'>{movement.description}</span>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {new Date(movement.date).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p
                      className={`font-semibold ${movement.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {movement.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(movement.amount.toString(), 'MXN')}
                    </p>
                    <p className='text-sm text-muted-foreground'>Estado: {movement.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {movements && movements.length > 10 && (
            <div className='mt-4 text-center'>
              <Link href={`${ROUTES.FINANCE.ENTRIES.MAIN.PATH}?bankAccountId=${accountId}`}>
                <Button variant='outline'>Ver todos los movimientos</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
