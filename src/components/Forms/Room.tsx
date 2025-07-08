'use client'

import { Edit3, Eye, Plus, Search, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card as ShadcnCard } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useProducts } from '@/modules/shopify/hooks'
import { type Product } from '@/modules/shopify/types'
import { useUsersManagement } from '@/modules/user/hooks/management'

import type { User } from '@/src/types/user'

export type PrivateRoomMode = 'create' | 'edit' | 'view' | 'delete'

export interface PrivateRoomData {
  id?: string
  name: string
  description?: string | null
  userId: string
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
  const [selectedUser, setSelectedUser] = useState<string | null>(initialData?.userId ?? null)
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

  const { data: usersData, isLoading: isLoadingUsers } = useUsersManagement({
    role: 'vip_customer',
  })
  const users = usersData?.users ?? []

  const {
    data: productsData,
    isError: isProductSearchError,
    isLoading: isLoadingProducts,
  } = useProducts(
    {
      filters: {
        query: `(title:*${debouncedProductSearchQuery}*) OR (product_type:*${debouncedProductSearchQuery}*) OR (tag:*${debouncedProductSearchQuery}*)`,
      },
      first: 20,
      sortKey: 'RELEVANCE',
    },
    {
      enabled: !!debouncedProductSearchQuery && !isReadOnly,
    }
  )
  const products = productsData?.products ?? []

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

    if (!selectedUser || !roomName) {
      alert('Please select a user and provide a room name.')
      return
    }

    const formData: PrivateRoomData = {
      description: roomDescription || null,
      id: initialData?.id,
      name: roomName,
      products: selectedProducts,

      userId: selectedUser,
    }

    await onSubmit(formData)
  }

  const getConfig = () => {
    switch (mode) {
      case 'create':
        return {
          alertVariant: null,
          icon: <Plus className='size-5' />,
          submitText: submitButtonText ?? 'Create Private Room',
          subtitle: 'Set up a personalized shopping experience for your VIP customers',
          title: 'Create New Private Room',
        }
      case 'edit':
        return {
          alertVariant: null,
          icon: <Edit3 className='size-5' />,
          submitText: submitButtonText ?? 'Update Private Room',
          subtitle: 'Update the private room details and products',
          title: 'Edit Private Room',
        }
      case 'view':
        return {
          alertVariant: null,
          icon: <Eye className='size-5' />,
          submitText: null,
          subtitle: 'View the private room configuration',
          title: 'Private Room Details',
        }
      case 'delete':
        return {
          alertVariant: 'destructive' as const,
          icon: <Trash2 className='size-5' />,
          submitText: submitButtonText ?? 'Delete Private Room',
          subtitle: 'This action cannot be undone',
          title: 'Delete Private Room',
        }
      default:
        return {
          alertVariant: null,
          icon: null,
          submitText: 'Submit',
          subtitle: '',
          title: 'Private Room',
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
              You are about to permanently delete this private room. This action cannot be undone.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='roomName'>Room Name</Label>
            <Input
              id='roomName'
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder='Enter a descriptive room name...'
              required={!isDeleteMode}
              disabled={isReadOnly}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='roomDescription'>Description (Optional)</Label>
            <Input
              id='roomDescription'
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              placeholder='Add a description for this private room...'
              disabled={isReadOnly}
            />
          </div>

          {showUserSelection && (
            <div className='space-y-2'>
              <Label htmlFor='userSelect'>VIP User</Label>
              {isReadOnly ? (
                <Input
                  value={
                    users.find((user: User) => user.id === selectedUser)?.email ?? 'Loading...'
                  }
                  disabled
                />
              ) : (
                <Select value={selectedUser ?? undefined} onValueChange={setSelectedUser} required>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingUsers
                          ? 'Loading users...'
                          : users.length === 0
                            ? 'No VIP users available'
                            : 'Choose a VIP customer'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {!isLoadingUsers &&
                      users.length > 0 &&
                      users.map((user: User) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email} ({user.firstName} {user.lastName})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {!isDeleteMode && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Products</Label>
                {!isReadOnly && (
                  <div className='relative' ref={dropdownRef}>
                    <div className='relative'>
                      <Search className='absolute left-3 top-3 size-4 text-muted-foreground' />
                      <Input
                        ref={inputRef}
                        type='text'
                        placeholder='Search products by title, type, or tag...'
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
                              No products found for &quot;{debouncedProductSearchQuery}&quot;
                            </div>
                          )}

                        {isProductSearchError && (
                          <div className='p-4 text-center text-destructive'>
                            Error searching for products
                          </div>
                        )}

                        {products.length > 0 && !isLoadingProducts && (
                          <div className='py-2'>
                            <div className='bg-muted/50 border-b px-3 py-2 text-xs font-semibold text-muted-foreground'>
                              Products ({products.length} found)
                            </div>
                            {products.map((product) => (
                              <button
                                key={product.id}
                                type='button'
                                onClick={() => handleAddProduct(product)}
                                className='border-border/50 hover:bg-muted/50 flex w-full items-center gap-4 border-b p-3 text-left transition-colors last:border-b-0'
                              >
                                <div className='relative size-12 shrink-0 overflow-hidden rounded-md bg-muted'>
                                  <Image
                                    src={product.images[0]?.url ?? '/placeholder.svg'}
                                    alt={product.title}
                                    fill
                                    sizes='48px'
                                    className='object-cover'
                                  />
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
                    {isReadOnly ? 'Products in this room' : 'Selected Products'}
                  </Label>
                  {selectedProducts.length > 0 && (
                    <Badge variant='outline'>
                      {selectedProducts.length} {isReadOnly ? 'products' : 'selected'}
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
                        {isReadOnly ? 'No products in this room' : 'No products added yet'}
                      </p>
                      {!isReadOnly && (
                        <p className='text-xs'>
                          Search and select products to add them to this room
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
                              <Image
                                src={product.images[0]?.url || '/placeholder.svg'}
                                alt={product.title}
                                fill
                                sizes='40px'
                                className='object-cover'
                              />
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
                disabled={((!selectedUser || !roomName) && !isDeleteMode) || isLoading}
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
