'use client'

import { ArrowLeft, MapPin, Save } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetArrendamiento, useUpdateArrendamiento } from '@/services/product/hook'
import { ROUTES } from '@/src/config/routes'

export default function EditArrendamientoPage() {
  const params = useParams()
  const arrendamientoId = params.id as string
  const [name, setName] = useState('')
  const router = useRouter()

  const { data: arrendamiento, error, isLoading } = useGetArrendamiento(arrendamientoId)

  const updateArrendamientoMutation = useUpdateArrendamiento({
    onError: (error: any) => {
      toast.error(
        `Error al actualizar arrendamiento: ${error.response?.data?.error || error.message}`
      )
    },
    onSuccess: () => {
      toast.success('Arrendamiento actualizado exitosamente')
      router.push(ROUTES.INVENTORY.ARRENDAMIENTOS.MAIN.PATH)
    },
  })

  useEffect(() => {
    if (arrendamiento) {
      setName(arrendamiento.name)
    }
  }, [arrendamiento])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('El nombre del arrendamiento es requerido')
      return
    }

    await updateArrendamientoMutation.mutateAsync({ id: arrendamientoId, name: name.trim() })
  }

  if (isLoading) {
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
            <Skeleton className='h-8 w-64' />
            <Skeleton className='mt-2 h-4 w-48' />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-64' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-10 w-full' />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
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
            <h1 className='text-2xl font-bold'>Error</h1>
          </div>
        </div>
        <Card>
          <CardContent className='py-8 text-center'>
            <p className='text-red-600'>No se pudo cargar el arrendamiento</p>
            <Link href={ROUTES.INVENTORY.ARRENDAMIENTOS.MAIN.PATH}>
              <Button variant='outline' className='mt-4'>
                Volver a Arrendamientos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
          <h1 className='text-2xl font-bold'>Editar Arrendamiento</h1>
          <p className='text-muted-foreground'>Modifica los detalles del arrendamiento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MapPin className='size-5 text-blue-500' />
            Información del Arrendamiento
          </CardTitle>
          <CardDescription>Actualiza los detalles del arrendamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Nombre *</Label>
              <Input
                id='name'
                type='text'
                placeholder='Ej: Arrendamiento Estándar...'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={updateArrendamientoMutation.isPending}
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
                  disabled={updateArrendamientoMutation.isPending}
                >
                  Cancelar
                </Button>
              </Link>
              <Button
                type='submit'
                disabled={updateArrendamientoMutation.isPending || !name.trim()}
              >
                <Save className='mr-2 size-4' />
                {updateArrendamientoMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
