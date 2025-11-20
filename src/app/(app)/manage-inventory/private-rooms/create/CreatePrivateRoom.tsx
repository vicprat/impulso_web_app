'use client'

import { ArrowLeft, Plus, Users as UsersIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePrivateRoom } from '@/modules/rooms/hooks'
import { useUsersManagement } from '@/modules/user/hooks/management'
import { type UserProfile } from '@/modules/user/types'
import { ROUTES } from '@/src/config/routes'

import { AddProductsModal } from '../[id]/AddProductsModal'
import { AddUsersModal } from '../[id]/AddUsersModal'
import { PrivateRoomProductsTable } from '../[id]/PrivateRoomProductsTable'

import type { Product } from '@/models/Product'

export function CreatePrivateRoom() {
  const [roomName, setRoomName] = useState('')
  const [roomDescription, setRoomDescription] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [isAddProductsModalOpen, setIsAddProductsModalOpen] = useState(false)
  const [isAddUsersModalOpen, setIsAddUsersModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const createRoomMutation = useCreatePrivateRoom()

  const { data: usersData } = useUsersManagement({
    limit: 1000,
    role: [
      'vip_customer',
      'artist',
      'employee',
      'provider',
      'partner',
      'support',
      'manager',
      'admin',
      'finance_manager',
      'inventory_and_content_editor',
      'content_editor',
    ],
  })
  const users = usersData?.users ?? []

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return selectedProducts.slice(startIndex, endIndex)
  }, [selectedProducts, currentPage, pageSize])

  const existingProductIds = useMemo(() => {
    return new Set(selectedProducts.map((p) => p.id))
  }, [selectedProducts])

  const existingUserIds = useMemo(() => {
    return new Set(selectedUsers)
  }, [selectedUsers])

  const handleAddProducts = (newProducts: Product[]) => {
    const newProductIds = new Set(selectedProducts.map((p) => p.id))
    const uniqueProducts = newProducts.filter((p) => !newProductIds.has(p.id))
    setSelectedProducts([...selectedProducts, ...uniqueProducts])
  }

  const handleRemoveProducts = (productIds: Set<string>) => {
    setSelectedProducts(selectedProducts.filter((p) => !productIds.has(p.id)))
    setCurrentPage(1)
  }

  const handleRemoveUsers = (userIds: Set<string>) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev)
      userIds.forEach((id) => newSet.delete(id))
      return newSet
    })
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomName.trim()) {
      toast.error('El nombre de la sala es requerido')
      return
    }

    if (selectedUsers.size === 0) {
      toast.error('Debes seleccionar al menos un usuario')
      return
    }

    setIsSubmitting(true)
    try {
      await createRoomMutation.mutateAsync({
        description: roomDescription.trim() || undefined,
        name: roomName.trim(),
        productIds: selectedProducts.map((p) => p.id),
        userIds: Array.from(selectedUsers),
      })

      toast.success('Sala privada creada exitosamente')
      router.push(ROUTES.INVENTORY.PRIVATE_ROOMS.MAIN.PATH)
    } catch (error) {
      console.error('Error creating room:', error)
      toast.error(
        `Error al crear sala: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
        <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <div className='min-w-0 flex-1'>
            <div className='mb-2 flex items-center space-x-2'>
              <Link href={ROUTES.INVENTORY.PRIVATE_ROOMS.MAIN.PATH}>
                <Button variant='ghost' size='sm'>
                  <ArrowLeft className='mr-2 size-4' />
                  Volver a Salas Privadas
                </Button>
              </Link>
            </div>
            <div className='flex items-center space-x-2'>
              <h1 className='truncate text-2xl font-bold'>Crear Nueva Sala Privada</h1>
            </div>
            <p className='mt-1 text-sm text-muted-foreground'>
              Configura una experiencia de compra personalizada para usuarios seleccionados
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='rounded-lg border bg-card p-4'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='roomName'>Nombre de la Sala *</Label>
                <Input
                  id='roomName'
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder='Ingresa un nombre descriptivo para la sala...'
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='roomDescription'>Descripción (Opcional)</Label>
                <Textarea
                  id='roomDescription'
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder='Agrega una descripción para esta sala privada...'
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className='rounded-lg border bg-card'>
            <div className='border-b p-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold'>Usuarios Asignados *</h2>
                <div className='flex items-center space-x-2'>
                  {selectedUsers.size > 0 && (
                    <Badge variant='secondary'>
                      {selectedUsers.size} seleccionado{selectedUsers.size > 1 ? 's' : ''}
                    </Badge>
                  )}
                  <Button
                    type='button'
                    onClick={() => setIsAddUsersModalOpen(true)}
                    size='sm'
                    className='bg-green-600 hover:bg-green-700'
                    disabled={isSubmitting}
                  >
                    <Plus className='mr-2 size-4' />
                    Agregar Usuarios
                  </Button>
                </div>
              </div>
            </div>

            <div className='p-4'>
              {selectedUsers.size === 0 ? (
                <div className='py-8 text-center text-muted-foreground'>
                  <UsersIcon className='mx-auto mb-2 size-8' />
                  <p className='text-sm'>
                    No hay usuarios asignados. Haz clic en "Agregar Usuarios" para comenzar.
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  <p className='mb-2 text-sm text-muted-foreground'>
                    {selectedUsers.size} usuario{selectedUsers.size > 1 ? 's' : ''} seleccionado
                    {selectedUsers.size > 1 ? 's' : ''}
                  </p>
                  <div className='space-y-2'>
                    {Array.from(selectedUsers).map((userId) => {
                      const user = users.find((u: UserProfile) => u.id === userId)
                      const userRole = user?.roles?.[0] ?? 'Sin rol'
                      return (
                        <div
                          key={userId}
                          className='flex items-center justify-between gap-2 rounded-md border p-2'
                        >
                          <div className='flex items-center gap-2'>
                            <div className='flex size-8 items-center justify-center rounded-full bg-muted'>
                              <UsersIcon className='size-4 text-muted-foreground' />
                            </div>
                            <div>
                              <span className='text-sm font-medium'>
                                {user?.email ?? 'Desconocido'}
                              </span>
                              <p className='text-xs text-muted-foreground'>
                                {user?.firstName} {user?.lastName}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline' className='text-xs'>
                              {userRole}
                            </Badge>
                            <button
                              type='button'
                              onClick={() => handleRemoveUsers(new Set([userId]))}
                              className='hover:bg-destructive/20 rounded-full p-1 text-destructive'
                              disabled={isSubmitting}
                            >
                              <span className='text-xs'>×</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='rounded-lg border bg-card'>
            <div className='border-b p-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold'>Productos en la Sala</h2>
                <div className='flex items-center space-x-2'>
                  {selectedProducts.length > 0 && (
                    <Badge variant='secondary'>{selectedProducts.length} productos</Badge>
                  )}
                  <Button
                    type='button'
                    onClick={() => setIsAddProductsModalOpen(true)}
                    size='sm'
                    className='bg-green-600 hover:bg-green-700'
                    disabled={isSubmitting}
                  >
                    <Plus className='mr-2 size-4' />
                    Agregar Productos
                  </Button>
                </div>
              </div>
            </div>

            <div className='p-4'>
              {selectedProducts.length === 0 ? (
                <div className='py-8 text-center text-muted-foreground'>
                  <p className='text-sm'>
                    No hay productos agregados. Los productos son opcionales.
                  </p>
                </div>
              ) : (
                <>
                  <PrivateRoomProductsTable
                    products={paginatedProducts}
                    isLoading={false}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalProducts={selectedProducts.length}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    selectedProducts={new Set()}
                    onProductSelect={(productId, selected) => {
                      if (!selected) {
                        handleRemoveProducts(new Set([productId]))
                      }
                    }}
                    onSelectAll={() => {
                      // No-op: no necesitamos selección múltiple en modo creación
                    }}
                  />
                </>
              )}
            </div>
          </div>

          <div className='flex justify-end space-x-2'>
            <Link href={ROUTES.INVENTORY.PRIVATE_ROOMS.MAIN.PATH}>
              <Button type='button' variant='outline' disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
            <Button
              type='submit'
              disabled={isSubmitting || !roomName.trim() || selectedUsers.size === 0}
            >
              {isSubmitting ? 'Creando...' : 'Crear Sala Privada'}
            </Button>
          </div>
        </form>
      </div>

      <AddUsersModal
        isOpen={isAddUsersModalOpen}
        onClose={() => setIsAddUsersModalOpen(false)}
        roomId=''
        roomTitle={roomName || 'Nueva Sala'}
        existingUserIds={existingUserIds}
        onSuccess={() => {
          // No-op: en modo creación manejamos la selección con onUsersSelected
        }}
        onUsersSelected={(userIds) => {
          setSelectedUsers((prev) => {
            const newSet = new Set(prev)
            userIds.forEach((id) => newSet.add(id))
            return newSet
          })
          setIsAddUsersModalOpen(false)
        }}
      />

      <AddProductsModal
        isOpen={isAddProductsModalOpen}
        onClose={() => setIsAddProductsModalOpen(false)}
        roomId=''
        roomTitle={roomName || 'Nueva Sala'}
        existingProductIds={existingProductIds}
        onSuccess={() => {
          // No-op: en modo creación manejamos la selección con onProductsSelected
        }}
        onProductsSelected={(products) => {
          handleAddProducts(products)
          setIsAddProductsModalOpen(false)
        }}
      />
    </>
  )
}
