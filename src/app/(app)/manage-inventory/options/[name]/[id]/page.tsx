'use client'

import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetOption, useUpdateOption } from '@/hooks/use-options'
import { isValidOption, getOptionConfig } from '@/src/config/options'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

interface PageProps {
  params: Promise<{ name: string; id: string }>
}

const optionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
})

export default function EditOptionPage({ params }: PageProps) {
  const router = useRouter()
  const [optionName, setOptionName] = useState<string>('')
  const [optionId, setOptionId] = useState<string>('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    params.then((p) => {
      if (!isValidOption(p.name)) {
        notFound()
      }
      setOptionName(p.name)
      setOptionId(p.id)
      setIsReady(true)
    })
  }, [params])

  const config = getOptionConfig(optionName)
  const { data: option, isLoading } = useGetOption(optionName, optionId || null)

  useEffect(() => {
    if (option) {
      setName(option.name)
    }
  }, [option])

  const updateOptionMutation = useUpdateOption(optionName, {
    onError: (err: Error) => {
      setError(err.message)
    },
    onSuccess: () => {
      toast.success(`${config?.singularLabel ?? 'Opción'} actualizada exitosamente`)
      router.push(replaceRouteParams(ROUTES.INVENTORY.OPTIONS.LIST.PATH, { name: optionName }))
    },
  })

  const handleSubmit = () => {
    const result = optionSchema.safeParse({ name })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }
    setError(null)
    void updateOptionMutation.mutateAsync({ id: optionId, name: result.data.name })
  }

  if (!isReady || !config) {
    return (
      <div className='mx-auto max-w-2xl space-y-6 p-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-32 w-full' />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='mx-auto max-w-2xl space-y-6 p-6'>
        <Skeleton className='h-8 w-48' />
        <div className='space-y-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-32' />
        </div>
      </div>
    )
  }

  const Icon = config.icon

  return (
    <div className='mx-auto max-w-2xl space-y-6 p-6'>
      <div>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          ← Volver
        </Button>
        <div className='flex items-center gap-2'>
          <Icon className='size-6 text-blue-500' />
          <h1 className='text-2xl font-bold'>Editar {config.singularLabel}</h1>
        </div>
        <p className='text-muted-foreground'>{config.description}</p>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Nombre</Label>
          <Input
            id='name'
            placeholder={`Nombre de la ${config.singularLabel.toLowerCase()}`}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            maxLength={100}
          />
          {error && <p className='text-sm text-red-500'>{error}</p>}
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => router.back()}
            disabled={updateOptionMutation.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={updateOptionMutation.isPending || !name.trim()}>
            {updateOptionMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
