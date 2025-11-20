'use client'

import { Edit3, Eye, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card as ShadcnCard } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { type Product } from '@/modules/shopify/types'
import { useUsersManagement } from '@/modules/user/hooks/management'
import { type UserProfile } from '@/modules/user/types'
import { useGetProductsPaginated } from '@/services/product/hook'

export type PrivateRoomMode = 'create' | 'edit' | 'view' | 'delete'

export interface PrivateRoomData {
  id?: string
  name: string
  description?: string | null
  userIds: string[]
  products: Product[]
}

export interface Props {
  mode: PrivateRoomMode
  initialData?: PrivateRoomData
  onSubmit: (data: PrivateRoomData) => Promise<void>
  onDelete?: () => Promise<void>
  isLoading?: boolean
  submitButtonText?: string
  showUserSelection?: boolean
}

export const Room: React.FC<Props> = ({
  initialData,
  isLoading = false,
  mode,
  onDelete,
  onSubmit,
  showUserSelection = true,
  submitButtonText,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(initialData?.userIds ?? [])
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [roomName, setRoomName] = useState<string>(initialData?.name ?? '')
  const [roomDescription, setRoomDescription] = useState<string>(initialData?.description ?? '')

  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const debouncedProductSearchQuery = useDebounce(productSearchQuery, 300)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isReadOnly = mode === 'view' || mode === 'delete'
  const isDeleteMode = mode === 'delete'

  // Obtener usuarios con roles que tengan permiso view_private_rooms (todos excepto 'customer')
  const { data: usersData, isLoading: isLoadingUsers } = useUsersManagement({
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

  const {
    data: productsData,
    isError: isProductSearchError,
    isLoading: isLoadingProducts,
  } = useGetProductsPaginated({
    limit: 20,
    search: debouncedProductSearchQuery,
  })

  const products =
    productsData?.products?.map((p: any) => ({
      availableForSale: p.status === 'ACTIVE',
      createdAt: p.createdAt ?? new Date().toISOString(),
      description: p.descriptionHtml ?? '',
      descriptionHtml: p.descriptionHtml ?? '',
      handle: p.handle,
      id: p.id,
      images:
        p.images?.edges?.map((edge: any) => ({
          altText: edge.node.altText,
          height: edge.node.height,
          id: edge.node.id,
          url: edge.node.url,
          width: edge.node.width,
        })) ?? [],
      priceRange: {
        maxVariantPrice: {
          amount: p.variants?.edges?.[0]?.node?.price ?? '0',
          currencyCode: 'MXN',
        },
        minVariantPrice: {
          amount: p.variants?.edges?.[0]?.node?.price ?? '0',
          currencyCode: 'MXN',
        },
      },
      productType: p.productType ?? '',
      status: p.status,
      title: p.title,
      updatedAt: p.updatedAt ?? new Date().toISOString(),
      variants:
        p.variants?.edges?.map((edge: any) => ({
          availableForSale: edge.node.inventoryQuantity > 0,
          compareAtPrice: edge.node.compareAtPrice
            ? {
                amount: edge.node.compareAtPrice,
                currencyCode: 'MXN',
              }
            : null,
          id: edge.node.id,
          price: {
            amount: edge.node.price ?? '0',
            currencyCode: 'MXN',
          },
          selectedOptions: edge.node.selectedOptions ?? [],
          title: edge.node.title,
        })) ?? [],
      vendor: p.vendor ?? '',
    })) ?? []

  useEffect(() => {
    if (initialData?.products && initialData.products.length > 0) {
      setSelectedProducts(initialData.products)
    }
  }, [initialData])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (debouncedProductSearchQuery && (products.length > 0 || isLoadingProducts) && !isReadOnly) {
      setIsDropdownOpen(true)
    } else if (!debouncedProductSearchQuery) {
      setIsDropdownOpen(false)
    }
  }, [debouncedProductSearchQuery, products.length, isLoadingProducts, isReadOnly])

  const handleAddProduct = (product: Product) => {
    if (!selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product])
    }
    setProductSearchQuery('')
    setIsDropdownOpen(false)
    inputRef.current?.blur()
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId))
  }

  const handleInputFocus = () => {
    if (debouncedProductSearchQuery && (products.length > 0 || isLoadingProducts) && !isReadOnly) {
      setIsDropdownOpen(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isDeleteMode && onDelete) {
      await onDelete()
      return
    }

    if (selectedUsers.length === 0 || !roomName) {
      alert('Please select at least one user and provide a room name.')
      return
    }

    const formData: PrivateRoomData = {
      description: roomDescription || null,
      id: initialData?.id,
      name: roomName,
      products: selectedProducts,
      userIds: selectedUsers,
    }

    await onSubmit(formData)
  }

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId))
  }

  const getConfig = () => {
    switch (mode) {
      case 'create':
        return {
          alertVariant: null,
          icon: <Plus className='size-5' />,
          submitText: submitButtonText ?? 'Crear Sala Privada',
          subtitle: 'Configura una experiencia de compra personalizada para usuarios seleccionados',
          title: 'Crear Nueva Sala Privada',
        }
      case 'edit':
        return {
          alertVariant: null,
          icon: <Edit3 className='size-5' />,
          submitText: submitButtonText ?? 'Actualizar Sala Privada',
          subtitle: 'Actualizar los detalles y productos de la sala privada',
          title: 'Editar Sala Privada',
        }
      case 'view':
        return {
          alertVariant: null,
          icon: <Eye className='size-5' />,
          submitText: null,
          subtitle: 'Ver la configuración de la sala privada',
          title: 'Detalles de Sala Privada',
        }
      case 'delete':
        return {
          alertVariant: 'destructive' as const,
          icon: <Trash2 className='size-5' />,
          submitText: submitButtonText ?? 'Eliminar Sala Privada',
          subtitle: 'Esta acción no se puede deshacer',
          title: 'Eliminar Sala Privada',
        }
      default:
        return {
          alertVariant: null,
          icon: null,
          submitText: 'Enviar',
          subtitle: '',
          title: 'Sala Privada',
        }
    }
  }

  const config = getConfig()

  return (
    <div className='container mx-auto max-w-4xl p-6'>
      <div className='space-y-6'>
        {isDeleteMode && (
          <Alert variant='destructive'>
            <Trash2 className='size-4' />
            <AlertDescription>
              Estás a punto de eliminar permanentemente esta sala privada. Esta acción no se puede
              deshacer.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='roomName'>Nombre de la Sala</Label>
            <Input
              id='roomName'
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder='Ingresa un nombre descriptivo para la sala...'
              required={!isDeleteMode}
              disabled={isReadOnly}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='roomDescription'>Descripción (Opcional)</Label>
            <Input
              id='roomDescription'
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              placeholder='Agrega una descripción para esta sala privada...'
              disabled={isReadOnly}
            />
          </div>

          {showUserSelection && (
            <div className='space-y-2'>
              <Label htmlFor='userSelect'>Usuarios Asignados</Label>
              {isReadOnly ? (
                <div className='space-y-2'>
                  {selectedUsers.map((userId) => {
                    const user = users.find((u: UserProfile) => u.id === userId)
                    const userRole = user?.roles?.[0] ?? 'Sin rol'
                    return (
                      <div
                        key={userId}
                        className='flex items-center justify-between gap-2 rounded-md border p-2'
                      >
                        <span className='text-sm'>
                          {user?.email ?? 'Desconocido'} ({user?.firstName} {user?.lastName})
                        </span>
                        <Badge variant='outline' className='text-xs'>
                          {userRole}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='space-y-3'>
                  <ShadcnCard className='max-h-48 overflow-y-auto p-3'>
                    {isLoadingUsers ? (
                      <div className='space-y-2'>
                        <Skeleton className='h-8 w-full' />
                        <Skeleton className='h-8 w-full' />
                      </div>
                    ) : users.length === 0 ? (
                      <p className='text-center text-sm text-muted-foreground'>
                        No hay usuarios disponibles
                      </p>
                    ) : (
                      <div className='space-y-2'>
                        {users.map((user: UserProfile) => {
                          const userRole = user.roles?.[0] ?? 'Sin rol'
                          return (
                            <div
                              key={user.id}
                              className='flex items-center gap-2 rounded-md border p-2 transition-colors hover:bg-muted'
                            >
                              <input
                                type='checkbox'
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleUserToggle(user.id)}
                                className='size-4 cursor-pointer'
                              />
                              <label
                                className='flex-1 cursor-pointer text-sm'
                                onClick={() => handleUserToggle(user.id)}
                              >
                                {user.email} ({user.firstName} {user.lastName})
                              </label>
                              <Badge variant='outline' className='text-xs'>
                                {userRole}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </ShadcnCard>

                  {selectedUsers.length > 0 && (
                    <div className='space-y-2'>
                      <Label className='text-sm'>
                        Usuarios Seleccionados ({selectedUsers.length})
                      </Label>
                      <div className='flex flex-wrap gap-2'>
                        {selectedUsers.map((userId) => {
                          const user = users.find((u: UserProfile) => u.id === userId)
                          const userRole = user?.roles?.[0] ?? 'Sin rol'
                          return (
                            <Badge
                              key={userId}
                              variant='secondary'
                              className='flex items-center gap-1'
                            >
                              <span className='text-xs'>
                                {user?.email ?? 'Desconocido'} ({userRole})
                              </span>
                              <button
                                type='button'
                                onClick={() => handleRemoveUser(userId)}
                                className='hover:bg-destructive/20 ml-1 rounded-full p-0.5'
                              >
                                <X className='size-3' />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!isDeleteMode && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Productos</Label>
                {!isReadOnly && (
                  <div className='relative' ref={dropdownRef}>
                    <div className='relative'>
                      <Search className='absolute left-3 top-3 size-4 text-muted-foreground' />
                      <Input
                        ref={inputRef}
                        type='text'
                        placeholder='Buscar productos por título, tipo o etiqueta...'
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        onFocus={handleInputFocus}
                        className='pl-10'
                      />
                    </div>

                    {isDropdownOpen && (
                      <div className='absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-background shadow-lg'>
                        {isLoadingProducts && (
                          <div className='space-y-2 p-4'>
                            <Skeleton className='h-8 w-full' />
                            <Skeleton className='h-8 w-full' />
                            <Skeleton className='h-8 w-full' />
                          </div>
                        )}

                        {!isLoadingProducts &&
                          !isProductSearchError &&
                          products.length === 0 &&
                          debouncedProductSearchQuery && (
                            <div className='p-4 text-center text-muted-foreground'>
                              No se encontraron productos para &quot;{debouncedProductSearchQuery}
                              &quot;
                            </div>
                          )}

                        {isProductSearchError && (
                          <div className='p-4 text-center text-destructive'>
                            Error al buscar productos
                          </div>
                        )}

                        {products.length > 0 && !isLoadingProducts && (
                          <div className='py-2'>
                            <div className='bg-muted/50 border-b px-3 py-2 text-xs font-semibold text-muted-foreground'>
                              Productos ({products.length} encontrados)
                            </div>
                            {products.map((product) => (
                              <button
                                key={product.id}
                                type='button'
                                onClick={() => handleAddProduct(product)}
                                className='border-border/50 hover:bg-muted/50 flex w-full items-center gap-4 border-b p-3 text-left transition-colors last:border-b-0'
                              >
                                <div className='relative size-12 shrink-0 overflow-hidden rounded-md bg-muted'>
                                  {product.images[0]?.url ? (
                                    <img
                                      src={product.images[0].url}
                                      alt={product.title}
                                      className='size-full object-cover'
                                    />
                                  ) : (
                                    <div className='flex size-full items-center justify-center bg-muted text-xs text-muted-foreground'>
                                      Sin imagen
                                    </div>
                                  )}
                                </div>
                                <div className='flex min-w-0 flex-1 flex-col space-y-1'>
                                  <span className='truncate text-sm font-medium'>
                                    {product.title}
                                  </span>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-xs text-muted-foreground'>
                                      ${product.priceRange.minVariantPrice.amount}{' '}
                                      {product.priceRange.minVariantPrice.currencyCode}
                                    </span>
                                    {product.productType && (
                                      <Badge variant='secondary' className='text-xs'>
                                        {product.productType}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Plus className='size-4 text-muted-foreground' />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    {isReadOnly ? 'Productos en esta sala' : 'Productos Seleccionados'}
                  </Label>
                  {selectedProducts.length > 0 && (
                    <Badge variant='outline'>
                      {selectedProducts.length} {isReadOnly ? 'productos' : 'seleccionados'}
                    </Badge>
                  )}
                </div>

                <ShadcnCard className='min-h-[200px] p-4'>
                  {selectedProducts.length === 0 ? (
                    <div className='flex h-full flex-col items-center justify-center space-y-2 text-center text-muted-foreground'>
                      <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
                        <Search className='size-6' />
                      </div>
                      <p className='text-sm'>
                        {isReadOnly
                          ? 'No hay productos en esta sala'
                          : 'No se han agregado productos'}
                      </p>
                      {!isReadOnly && (
                        <p className='text-xs'>
                          Busca y selecciona productos para agregarlos a esta sala
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className='bg-muted/30 flex items-center justify-between rounded-lg border p-3'
                        >
                          <div className='flex min-w-0 flex-1 items-center gap-3'>
                            <div className='relative size-10 shrink-0 overflow-hidden rounded-md bg-muted'>
                              {product.images[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.title}
                                  className='size-full object-cover'
                                />
                              ) : (
                                <div className='flex size-full items-center justify-center bg-muted text-xs text-muted-foreground'>
                                  No
                                </div>
                              )}
                            </div>
                            <div className='flex min-w-0 flex-1 flex-col'>
                              <span className='truncate text-sm font-medium'>{product.title}</span>
                              <span className='text-xs text-muted-foreground'>
                                ${product.priceRange.minVariantPrice.amount}{' '}
                                {product.priceRange.minVariantPrice.currencyCode}
                              </span>
                            </div>
                          </div>
                          {!isReadOnly && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => handleRemoveProduct(product.id)}
                              className='hover:bg-destructive/10 ml-2 text-destructive hover:text-destructive'
                            >
                              <X className='size-4' />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ShadcnCard>
              </div>
            </div>
          )}

          {config.submitText && (
            <div className='pt-4'>
              <Button
                type='submit'
                className='w-full'
                disabled={((selectedUsers.length === 0 || !roomName) && !isDeleteMode) || isLoading}
                variant={isDeleteMode ? 'destructive' : 'default'}
              >
                {isLoading ? 'Processing...' : config.submitText}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
