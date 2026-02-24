'use client'

import { ArrowLeft, MapPin, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateArrendamiento } from '@/services/product/hook'
import { ROUTES } from '@/src/config/routes'

export default function CreateArrendamientoPage() {
  const [name, setName] = useState('')
  const router = useRouter()

  const createArrendamientoMutation = useCreateArrendamiento({
    onError: (error: any) => {
      toast.error(`Error al crear arrendamiento: ${error.response?.data?.error || error.message}`)
    },
    onSuccess: () => {
      toast.success('Arrendamiento creado exitosamente')
      router.push(ROUTES.INVENTORY.ARRENDAMIENTOS.MAIN.PATH)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('El nombre del arrendamiento es requerido')
      return
    }

    await createArrendamientoMutation.mutateAsync(name.trim())
  }

  return (
    <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
      <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
        <div>
          <div className='mb-2 flex items-center space-x-2'>
            <Link href={ROUTES.INVENTORY.ARRENDAMIENTOS.MAIN.PATH}>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='mr-2 size-4' />
                Volver a Arrendamientos
              </Button>
            </Link>
          </div>
          <h1 className='text-2xl font-bold'>Nuevo Arrendamiento</h1>
          <p className='text-muted-foreground'>
            Crea un nuevo tipo de arrendamiento para tus productos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MapPin className='size-5 text-blue-500' />
            Información del Arrendamiento
          </CardTitle>
          <CardDescription>Ingresa los detalles del nuevo arrendamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Nombre *</Label>
              <Input
                id='name'
                type='text'
                placeholder='Ej: Arrendamiento Estándar, Exposición Temporal'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={createArrendamientoMutation.isPending}
              />
              <p className='text-sm text-muted-foreground'>
                El nombre debe ser único y descriptivo
              </p>
            </div>

            <div className='flex justify-end gap-2'>
              <Link href={ROUTES.INVENTORY.ARRENDAMIENTOS.MAIN.PATH}>
                <Button
                  type='button'
                  variant='outline'
                  disabled={createArrendamientoMutation.isPending}
                >
                  Cancelar
                </Button>
              </Link>
              <Button
                type='submit'
                disabled={createArrendamientoMutation.isPending || !name.trim()}
              >
                <Save className='mr-2 size-4' />
                {createArrendamientoMutation.isPending ? 'Guardando...' : 'Crear Arrendamiento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
