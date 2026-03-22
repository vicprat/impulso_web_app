'use client'

import { ArrowLeft, PlusCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { SearchInput } from '@/components/input/search'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/src/config/routes'

import type { ComponentType } from 'react'

interface OptionPageHeaderProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  backHref?: string
  onRefresh: () => void
  isFetching: boolean
  onCreate: () => void
  createLabel: string
}

export function OptionPageHeader({
  backHref = ROUTES.INVENTORY.OPTIONS.MAIN.PATH,
  createLabel,
  description,
  icon: Icon,
  isFetching,
  onCreate,
  onRefresh,
  title,
}: OptionPageHeaderProps) {
  return (
    <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
      <div>
        <div className='mb-2 flex items-center space-x-2'>
          <Link href={backHref}>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='mr-2 size-4' />
              Volver a Catálogos
            </Button>
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <Icon className='size-6 text-blue-500' />
          <h1 className='text-2xl font-bold'>{title}</h1>
        </div>
        <p className='text-muted-foreground'>{description}</p>
      </div>
      <div className='flex items-center space-x-2'>
        <Button variant='outline' onClick={onRefresh} disabled={isFetching}>
          <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
        <Button onClick={onCreate}>
          <PlusCircle className='mr-2 size-4' />
          {createLabel}
        </Button>
      </div>
    </div>
  )
}

interface OptionStatsProps {
  total: number
  active?: number
  activeLabel?: string
}

export function OptionStats({ active, activeLabel = 'Activas', total }: OptionStatsProps) {
  return (
    <div className='grid w-full grid-cols-2 gap-2'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 py-3 pb-2'>
          <CardTitle className='text-sm font-medium'>Total</CardTitle>
          <Badge variant='outline'>{total}</Badge>
        </CardHeader>
      </Card>
      {active !== undefined && (
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 py-3 pb-2'>
            <CardTitle className='text-sm font-medium'>{activeLabel}</CardTitle>
            <Badge variant='default'>{active}</Badge>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

interface OptionSearchProps {
  value: string
  onChange: (value: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function OptionSearch({
  isLoading,
  onChange,
  placeholder = 'Buscar por nombre...',
  value,
}: OptionSearchProps) {
  return (
    <div className='w-full'>
      <SearchInput
        placeholder={placeholder}
        initialValue={value}
        onSearch={onChange}
        isLoading={isLoading}
      />
    </div>
  )
}

interface OptionLoadingSkeletonProps {
  hasCreateButton?: boolean
}

export function OptionLoadingSkeleton({ hasCreateButton }: OptionLoadingSkeletonProps) {
  return (
    <div className='space-y-4 p-4 md:p-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-48' />
          <Skeleton className='h-8 w-64' />
        </div>
        {hasCreateButton && <Skeleton className='h-10 w-32' />}
      </div>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-96 w-full' />
    </div>
  )
}

interface OptionErrorStateProps {
  title: string
  message: string
  onRetry: () => void
}

export function OptionErrorState({ message, onRetry, title }: OptionErrorStateProps) {
  return (
    <div className='flex min-h-96 items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-destructive'>Error</CardTitle>
          <CardDescription>{title}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>{message}</p>
          <Button onClick={onRetry}>
            <RefreshCw className='mr-2 size-4' />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

interface CreateOptionDialogProps {
  isOpen: boolean
  onClose?: () => void
  onSubmit: (name: string) => void
  isPending: boolean
  error: string | null
  onErrorChange: (error: string | null) => void
  title: string
  description: string
  label: string
  value: string
  onValueChange: (value: string) => void
  onClear?: () => void
}

export function CreateOptionDialog({
  description,
  error,
  isOpen,
  isPending,
  label,
  onClear,
  onClose,
  onErrorChange,
  onSubmit,
  onValueChange,
  title,
  value,
}: CreateOptionDialogProps) {
  const handleClose = () => {
    onClear?.()
    onClose?.()
  }

  const handleSubmit = () => {
    onSubmit(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='option-name'>Nombre</Label>
            <Input
              id='option-name'
              placeholder={`Nombre de la ${label.toLowerCase()}`}
              value={value}
              onChange={(e) => {
                onValueChange(e.target.value)
                onErrorChange(null)
              }}
              maxLength={100}
            />
            {error && <p className='text-sm text-red-500'>{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !value.trim()}>
            {isPending ? 'Creando...' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
