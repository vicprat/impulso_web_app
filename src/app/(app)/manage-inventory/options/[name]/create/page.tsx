'use client'

import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateOption } from '@/hooks/use-options'
import { isValidOption, getOptionConfig } from '@/src/config/options'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

interface PageProps {
  params: Promise<{ name: string }>
}

const optionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
})

export default function CreateOptionPage({ params }: PageProps) {
  const router = useRouter()
  const [optionName, setOptionName] = useState<string>('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    params.then((p) => {
      if (!isValidOption(p.name)) {
        notFound()
      }
      setOptionName(p.name)
      setIsReady(true)
    })
  }, [params])

  const config = getOptionConfig(optionName)

  const createOptionMutation = useCreateOption(optionName, {
    onError: (err: Error) => {
      setError(err.message)
    },
    onSuccess: () => {
      toast.success(`${config?.singularLabel ?? 'Opción'} creada exitosamente`)
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
    void createOptionMutation.mutateAsync(result.data.name)
  }

  if (!isReady || !config) {
    return (
      <div className='flex items-center justify-center p-6'>
        <div className='text-muted-foreground'>Cargando...</div>
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
          <h1 className='text-2xl font-bold'>Crear {config.singularLabel}</h1>
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
            disabled={createOptionMutation.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createOptionMutation.isPending || !name.trim()}>
            {createOptionMutation.isPending ? 'Creando...' : 'Crear'}
          </Button>
        </div>
      </div>
    </div>
  )
}
