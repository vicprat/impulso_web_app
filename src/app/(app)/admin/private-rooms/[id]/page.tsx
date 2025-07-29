'use client'

import { ArrowLeft, Edit3, Eye, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Form } from '@/components/Forms'
import { type PrivateRoomData, type PrivateRoomMode } from '@/components/Forms/Room'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { privateRoomsApi } from '@/modules/rooms/api'
import { useProductsByIds } from '@/modules/shopify/hooks'
import { ROUTES } from '@/src/config/routes'

interface PrivateRoomPageProps {
  params: Promise<{ id: string }>
}

export default function PrivateRoomPage({ params }: PrivateRoomPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentMode, setCurrentMode] = useState<PrivateRoomMode>(
    searchParams.get('mode') as PrivateRoomMode
  )

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRoom, setIsLoadingRoom] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [roomData, setRoomData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const productIds = roomData?.products?.map((p: { productId: string }) => p.productId) ?? []
  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
  } = useProductsByIds(productIds, {
    enabled: productIds.length > 0,
  })

  const products = productsData?.products ?? []

  useEffect(() => {
    void loadRoomData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const mode = searchParams.get('mode') as PrivateRoomMode
    setCurrentMode(mode)
  }, [searchParams])

  const loadRoomData = async () => {
    try {
      setIsLoadingRoom(true)
      setError(null)

      const response = await fetch(`/api/private-rooms/${id}`)
      if (!response.ok) {
        throw new Error('Error al cargar la sala privada')
      }

      const privateRoom = await response.json()
      setRoomData(privateRoom)
    } catch (error) {
      console.error('Error loading room data:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar la sala privada')
    } finally {
      setIsLoadingRoom(false)
    }
  }

  const handleSubmit = async (data: PrivateRoomData) => {
    setIsLoading(true)
    try {
      await privateRoomsApi.updatePrivateRoom(id, {
        description: data.description ?? undefined,
        name: data.name,
        productIds: data.products.map((p) => p.id),
        userId: data.userId,
      })

      toast.success('¡Sala privada actualizada exitosamente!')
      setCurrentMode('view')
      router.replace(`/admin/private-rooms/${id}?mode=view`)
      await loadRoomData()
    } catch (error) {
      console.error('Error updating private room:', error)
      toast.error('Error al actualizar la sala privada.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (
      !window.confirm(
        '¿Estás seguro de que quieres eliminar esta sala privada? Esta acción no se puede deshacer.'
      )
    ) {
      return
    }

    setIsLoading(true)
    try {
      await privateRoomsApi.deletePrivateRoom(id)

      toast.success('¡Sala privada eliminada exitosamente!')
      router.push('/admin/private-rooms')
    } catch (error) {
      console.error('Error deleting private room:', error)
      toast.error('Error al eliminar la sala privada.')
    } finally {
      setIsLoading(false)
    }
  }

  const changeMode = (newMode: PrivateRoomMode) => {
    setCurrentMode(newMode)
    router.replace(`/admin/private-rooms/${id}?mode=${newMode}`)
  }

  const cancelEdit = () => {
    setCurrentMode('view')
    router.replace(`/admin/private-rooms/${id}?mode=view`)
  }

  const isLoadingAll = isLoadingRoom || (productIds.length > 0 && isLoadingProducts)

  if (isLoadingAll) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='space-y-6'>
          <div className='flex items-center gap-4'>
            <Skeleton className='size-10' />
            <Skeleton className='h-8 w-80' />
          </div>
          <div className='space-y-4'>
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-32 w-full' />
          </div>
        </div>
      </div>
    )
  }
  if (error || !roomData || productsError) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='space-y-4'>
          <Button variant='ghost' asChild>
            <Link href={ROUTES.ADMIN.PRIVATE_ROOMS.CREATE.PATH}>
              <ArrowLeft className='mr-2 size-4' />
              Volver a Salas Privadas
            </Link>
          </Button>

          <Alert variant='destructive'>
            <AlertDescription>
              {error ?? productsError?.message ?? 'Sala privada no encontrada'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const initialData: PrivateRoomData = {
    description: roomData.description,
    id: roomData.id,
    name: roomData.name,
    products: products.length > 0 ? products : [],

    userId: roomData.userId,
  }

  const getModeConfig = () => {
    switch (currentMode) {
      case 'view':
        return {
          headerColor: 'bg-blue-50 border-blue-200',
          headerIcon: <Eye className='size-5 text-blue-600' />,
          showActions: true,
          title: 'Detalles de la Sala Privada',
        }
      case 'edit':
        return {
          headerColor: 'bg-orange-50 border-orange-200',
          headerIcon: <Edit3 className='size-5 text-orange-600' />,
          showActions: false,
          title: 'Editar Sala Privada',
        }
      case 'delete':
        return {
          headerColor: 'bg-red-50 border-red-200',
          headerIcon: <Trash2 className='size-5 text-red-600' />,
          showActions: false,
          title: 'Eliminar Sala Privada',
        }
      default:
        return {
          headerColor: 'bg-gray-50 border-gray-200',
          headerIcon: <Eye className='size-5' />,
          showActions: true,
          title: 'Sala Privada',
        }
    }
  }

  const config = getModeConfig()

  return (
    <div className='container mx-auto max-w-4xl p-6'>
      <div className='space-y-6'>
        <div className='space-y-4'>
          <Button variant='ghost' asChild>
            <Link href={ROUTES.ADMIN.PRIVATE_ROOMS.CREATE.PATH}>
              <ArrowLeft className='mr-2 size-4' />
              Volver a Salas Privadas
            </Link>
          </Button>

          <div className='flex w-full justify-end'>
            {config.showActions && currentMode === 'view' && (
              <div className='flex gap-2'>
                <Button onClick={() => changeMode('edit')} variant='outline'>
                  <Edit3 className='mr-2 size-4' />
                  Editar Sala
                </Button>

                <Button onClick={() => changeMode('delete')} variant='destructive'>
                  <Trash2 className='mr-2 size-4' />
                  Eliminar Sala
                </Button>
              </div>
            )}

            {currentMode === 'edit' && (
              <div className='flex gap-2'>
                <Button onClick={cancelEdit} variant='outline'>
                  <X className='mr-2 size-4' />
                  Cancelar Edición
                </Button>
              </div>
            )}

            {currentMode === 'delete' && (
              <div className='flex gap-2'>
                <Button onClick={() => changeMode('view')} variant='outline'>
                  <X className='mr-2 size-4' />
                  Cancelar Eliminación
                </Button>
              </div>
            )}
          </div>
        </div>

        <Form.Room
          mode={currentMode}
          initialData={initialData}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isLoading={isLoading}
          showUserSelection={currentMode !== 'view'}
          submitButtonText={
            currentMode === 'edit'
              ? 'Guardar Cambios'
              : currentMode === 'delete'
                ? 'Eliminar Sala Privada'
                : undefined
          }
        />
      </div>
    </div>
  )
}
