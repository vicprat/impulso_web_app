'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Minus, Plus, RefreshCw, Trash2, Users as UsersIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AddProductsModal } from './AddProductsModal'
import { AddUsersModal } from './AddUsersModal'
import { EditRoomModal } from './EditRoomModal'
import { PrivateRoomProductsTable } from './PrivateRoomProductsTable'

import type { Product } from '@/models/Product'

import { Confirm } from '@/components/Dialog/Confirm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDeletePrivateRoom,
  usePrivateRoom,
  usePrivateRoomProducts,
  useUpdatePrivateRoom,
} from '@/modules/rooms/hooks'
import { ROUTES } from '@/src/config/routes'

interface PrivateRoomDetailProps {
  roomId: string
}

export function PrivateRoomDetail({ roomId }: PrivateRoomDetailProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddProductsModalOpen, setIsAddProductsModalOpen] = useState(false)
  const [isAddUsersModalOpen, setIsAddUsersModalOpen] = useState(false)
  const [isRemoveProductsDialogOpen, setIsRemoveProductsDialogOpen] = useState(false)
  const [isRemoveUsersDialogOpen, setIsRemoveUsersDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: room, error: roomError, isLoading: isLoadingRoom } = usePrivateRoom(roomId)

  const productIds = room?.products?.map((p) => p.productId) ?? []
  const { data: productsData, isLoading: isLoadingProducts } = usePrivateRoomProducts(productIds)

  const products = productsData?.products ?? []

  const updateRoomMutation = useUpdatePrivateRoom()
  const deleteRoomMutation = useDeletePrivateRoom()

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          direction: current.direction === 'asc' ? 'desc' : 'asc',
          key,
        }
      }
      return {
        direction: 'asc',
        key,
      }
    })
  }

  // Calculate dimensions value for sorting
  const getDimensionValue = (p: Product) => {
    const h = parseFloat(p.artworkDetails.height || '0')
    const w = parseFloat(p.artworkDetails.width || '0')
    const d = parseFloat(p.artworkDetails.depth || '0')
    return h * w * (d || 1)
  }

  const sortedProducts = useMemo(() => {
    if (!sortConfig) return products

    return [...products].sort((a, b) => {
      let valueA: any = ''
      let valueB: any = ''

      switch (sortConfig.key) {
        case 'title':
          valueA = a.title.toLowerCase()
          valueB = b.title.toLowerCase()
          break
        case 'vendor':
          valueA = a.vendor.toLowerCase()
          valueB = b.vendor.toLowerCase()
          break
        case 'productType':
          valueA = a.productType.toLowerCase()
          valueB = b.productType.toLowerCase()
          break
        case 'artworkDetails.medium':
          valueA = (a.artworkDetails.medium || '').toLowerCase()
          valueB = (b.artworkDetails.medium || '').toLowerCase()
          break
        case 'artworkDetails.year':
          valueA = parseInt(a.artworkDetails.year || '0')
          valueB = parseInt(b.artworkDetails.year || '0')
          break
        case 'dimensions':
          valueA = getDimensionValue(a)
          valueB = getDimensionValue(b)
          break
        case 'artworkDetails.location':
          valueA = (a.artworkDetails.location || '').toLowerCase()
          valueB = (b.artworkDetails.location || '').toLowerCase()
          break
        case 'collections':
          valueA = (a.collections?.[0]?.title || '').toLowerCase()
          valueB = (b.collections?.[0]?.title || '').toLowerCase()
          break
        case 'price':
          valueA = parseFloat(a.variants[0]?.price.amount || '0')
          valueB = parseFloat(b.variants[0]?.price.amount || '0')
          break
        case 'status':
          valueA = a.status
          valueB = b.status
          break
        default:
          return 0
      }

      if (valueA < valueB) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [products, sortConfig])

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedProducts.slice(startIndex, endIndex)
  }, [sortedProducts, currentPage, pageSize])

  const existingProductIds = useMemo(() => {
    return new Set(productIds)
  }, [productIds])

  const existingUserIds = useMemo(() => {
    return new Set(room?.users?.map((u) => u.userId) ?? [])
  }, [room])

  const handleRemoveProducts = async () => {
    if (!room || selectedProducts.size === 0) return

    try {
      const currentProductIds = room.products.map((p) => p.productId)
      const updatedProductIds = currentProductIds.filter((id) => !selectedProducts.has(id))

      await updateRoomMutation.mutateAsync({
        data: {
          productIds: updatedProductIds,
        },
        id: roomId,
      })

      toast.success('Productos removidos exitosamente')
      setSelectedProducts(new Set())
      setIsRemoveProductsDialogOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['privateRoom', roomId] })
    } catch (error) {
      console.error('Error removing products:', error)
      toast.error(
        `Error al remover productos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  const handleRemoveUsers = async () => {
    if (!room || selectedUsers.size === 0) return

    try {
      const currentUserIds = room.users?.map((u) => u.userId) ?? []
      const updatedUserIds = currentUserIds.filter((id) => !selectedUsers.has(id))

      await updateRoomMutation.mutateAsync({
        data: {
          userIds: updatedUserIds,
        },
        id: roomId,
      })

      toast.success('Usuarios removidos exitosamente')
      setSelectedUsers(new Set())
      setIsRemoveUsersDialogOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['privateRoom', roomId] })
    } catch (error) {
      console.error('Error removing users:', error)
      toast.error(
        `Error al remover usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  const handleDelete = async () => {
    if (!room) return

    try {
      await deleteRoomMutation.mutateAsync(roomId)
      toast.success('Sala privada eliminada exitosamente')
      router.push(ROUTES.INVENTORY.PRIVATE_ROOMS.MAIN.PATH)
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error(
        `Error al eliminar sala: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  const handleRefresh = () => {
    void queryClient.refetchQueries({ queryKey: ['privateRoom', roomId] })
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setSelectedProducts(new Set())
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
    setSelectedProducts(new Set())
  }

  if (isLoadingRoom) {
    return (
      <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
        <div className='flex items-center space-x-2'>
          <Skeleton className='size-8' />
          <Skeleton className='h-8 w-64' />
        </div>
        <Skeleton className='h-96 w-full' />
      </div>
    )
  }

  if (roomError || !room) {
    return (
      <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
        <div className='flex min-h-96 items-center justify-center'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar la sala privada</h3>
            <p className='mt-2 text-muted-foreground'>
              {roomError?.message ?? 'Sala privada no encontrada'}
            </p>
            <Link href={ROUTES.INVENTORY.PRIVATE_ROOMS.MAIN.PATH}>
              <Button className='mt-4'>
                <ArrowLeft className='mr-2 size-4' />
                Volver a Salas Privadas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
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
              <h1 className='truncate text-2xl font-bold'>{room.name}</h1>
              <Badge variant='secondary'>{products.length} productos</Badge>
              <Badge variant='secondary'>{room.users?.length ?? 0} usuarios</Badge>
            </div>
            {room.description && <p className='mt-1 text-muted-foreground'>{room.description}</p>}
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button onClick={handleRefresh} variant='outline' size='sm'>
              <RefreshCw className='mr-2 size-4' />
              Actualizar
            </Button>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant='outline'
              size='sm'
              className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
            >
              <Edit className='mr-2 size-4' />
              Editar
            </Button>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant='outline'
              size='sm'
              className='text-red-600 hover:bg-red-50 hover:text-red-700'
            >
              <Trash2 className='mr-2 size-4' />
              Eliminar
            </Button>
          </div>
        </div>

        <div className='rounded-lg border bg-card'>
          <div className='border-b p-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Usuarios Asignados</h2>
              <div className='flex items-center space-x-2'>
                {selectedUsers.size > 0 && (
                  <Button
                    onClick={() => setIsRemoveUsersDialogOpen(true)}
                    disabled={updateRoomMutation.isPending}
                    variant='destructive'
                    size='sm'
                  >
                    <Minus className='mr-2 size-4' />
                    Remover ({selectedUsers.size})
                  </Button>
                )}
                <Button
                  onClick={() => setIsAddUsersModalOpen(true)}
                  size='sm'
                  className='bg-green-600 hover:bg-green-700'
                >
                  <Plus className='mr-2 size-4' />
                  Agregar Usuarios
                </Button>
              </div>
            </div>
          </div>

          <div className='p-4'>
            {isLoadingRoom ? (
              <Skeleton className='h-32 w-full' />
            ) : room.users && room.users.length > 0 ? (
              <div className='space-y-2'>
                {room.users.map((userAssignment) => {
                  const isSelected = selectedUsers.has(userAssignment.userId)
                  const userRole = 'Sin rol'

                  return (
                    <div
                      key={userAssignment.id}
                      className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedUsers((prev) => {
                          const newSet = new Set(prev)
                          if (newSet.has(userAssignment.userId)) {
                            newSet.delete(userAssignment.userId)
                          } else {
                            newSet.add(userAssignment.userId)
                          }
                          return newSet
                        })
                      }}
                    >
                      <div className='flex items-center space-x-3'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={(e) => {
                            setSelectedUsers((prev) => {
                              const newSet = new Set(prev)
                              if (e.target.checked) {
                                newSet.add(userAssignment.userId)
                              } else {
                                newSet.delete(userAssignment.userId)
                              }
                              return newSet
                            })
                          }}
                          className='size-4 rounded border-gray-300 text-primary focus:ring-primary'
                        />
                        <div className='flex size-10 items-center justify-center rounded-full bg-muted'>
                          <UsersIcon className='size-5 text-muted-foreground' />
                        </div>
                        <div>
                          <span className='text-sm font-medium'>
                            {userAssignment.user?.email ?? 'Desconocido'}
                          </span>
                          <p className='text-xs text-muted-foreground'>
                            {userAssignment.user?.firstName} {userAssignment.user?.lastName}
                          </p>
                        </div>
                      </div>
                      <Badge variant='outline' className='text-xs'>
                        {userRole}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='py-8 text-center text-muted-foreground'>
                <UsersIcon className='mx-auto mb-2 size-8' />
                <p className='text-sm'>No hay usuarios asignados a esta sala</p>
              </div>
            )}
          </div>
        </div>

        <div className='rounded-lg border bg-card'>
          <div className='border-b p-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Productos en la Sala</h2>
              <div className='flex items-center space-x-2'>
                {selectedProducts.size > 0 && (
                  <Button
                    onClick={() => setIsRemoveProductsDialogOpen(true)}
                    disabled={updateRoomMutation.isPending}
                    variant='destructive'
                    size='sm'
                  >
                    <Minus className='mr-2 size-4' />
                    Remover ({selectedProducts.size})
                  </Button>
                )}
                <Button
                  onClick={() => setIsAddProductsModalOpen(true)}
                  size='sm'
                  className='bg-green-600 hover:bg-green-700'
                >
                  <Plus className='mr-2 size-4' />
                  Agregar Productos
                </Button>
              </div>
            </div>
          </div>

          <div className='p-4'>
            <PrivateRoomProductsTable
              products={paginatedProducts}
              isLoading={isLoadingProducts}
              currentPage={currentPage}
              pageSize={pageSize}
              totalProducts={products.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              selectedProducts={selectedProducts}
              sortConfig={sortConfig}
              onSort={handleSort}
              onProductSelect={(productId, selected) => {
                setSelectedProducts((prev) => {
                  const newSet = new Set(prev)
                  if (selected) {
                    newSet.add(productId)
                  } else {
                    newSet.delete(productId)
                  }
                  return newSet
                })
              }}
              onSelectAll={(selected) => {
                if (selected) {
                  setSelectedProducts(new Set(paginatedProducts.map((p: Product) => p.id)))
                } else {
                  setSelectedProducts(new Set())
                }
              }}
            />
          </div>
        </div>

        <div className='text-center text-sm text-muted-foreground'>
          Mostrando {paginatedProducts.length} de {products.length} productos
        </div>
      </div>

      <AddProductsModal
        isOpen={isAddProductsModalOpen}
        onClose={() => setIsAddProductsModalOpen(false)}
        roomId={roomId}
        roomTitle={room.name}
        existingProductIds={existingProductIds}
        onSuccess={handleRefresh}
      />

      <AddUsersModal
        isOpen={isAddUsersModalOpen}
        onClose={() => setIsAddUsersModalOpen(false)}
        roomId={roomId}
        roomTitle={room.name}
        existingUserIds={existingUserIds}
        onSuccess={handleRefresh}
      />

      <EditRoomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        room={room}
        onSuccess={handleRefresh}
      />

      <Confirm
        isOpen={isRemoveProductsDialogOpen}
        onClose={() => setIsRemoveProductsDialogOpen(false)}
        onConfirm={handleRemoveProducts}
        title='Remover Productos'
        message={`¿Estás seguro de que quieres remover ${selectedProducts.size} producto${selectedProducts.size > 1 ? 's' : ''} de esta sala?\n\nLos productos no se eliminarán de tu inventario, solo se removerán de esta sala.`}
        confirmButtonText='Remover'
        cancelButtonText='Cancelar'
        variant='destructive'
        isLoading={updateRoomMutation.isPending}
      />

      <Confirm
        isOpen={isRemoveUsersDialogOpen}
        onClose={() => setIsRemoveUsersDialogOpen(false)}
        onConfirm={handleRemoveUsers}
        title='Remover Usuarios'
        message={`¿Estás seguro de que quieres remover ${selectedUsers.size} usuario${selectedUsers.size > 1 ? 's' : ''} de esta sala?\n\nLos usuarios perderán acceso a esta sala privada.`}
        confirmButtonText='Remover'
        cancelButtonText='Cancelar'
        variant='destructive'
        isLoading={updateRoomMutation.isPending}
      />

      <Confirm
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title='Eliminar Sala Privada'
        message='¿Estás seguro de que quieres eliminar esta sala privada? Esta acción no se puede deshacer.'
        confirmButtonText='Eliminar'
        cancelButtonText='Cancelar'
        variant='destructive'
        isLoading={deleteRoomMutation.isPending}
      />
    </>
  )
}
