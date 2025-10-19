'use client'

import { useQueryClient } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Check, CheckCircle, Filter, PlusCircle, RefreshCw, Search, Tag } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBulkUpdateQueue } from '@/hooks/useBulkUpdateQueue'
import { useAuth } from '@/modules/auth/context/useAuth'
import {
  useGetArtworkTypes,
  useGetProductsPaginated,
  useGetTechniques,
  useGetVendors,
  useProductStats,
  useUpdateProduct,
} from '@/services/product/hook'
import {
  useCreateDiscount,
  useDeleteDiscount,
  useGetDiscounts,
  useUpdateDiscount,
} from '@/services/product/queries'
import {
  type CreateDiscountInput,
  type UpdateDiscountInput,
  type UpdateProductPayload,
} from '@/services/product/types'
import { BulkUpdateProgress } from '@/src/components/BulkUpdateProgress'
import { CouponCreatorModal } from '@/src/components/Modals/CouponCreatorModal'
import { CouponManagerModal } from '@/src/components/Modals/CouponManagerModal'
import { ProductAutomaticDiscountModal } from '@/src/components/Modals/ProductAutomaticDiscountModal'
import { Table } from '@/src/components/Table'
import { Skeleton } from '@/src/components/ui/skeleton'
import { ROUTES } from '@/src/config/routes'

import { columns } from './columns'

export const dynamic = 'force-dynamic'

interface InventoryTableMeta {
  editingRowId: string | null
  setEditingRowId: (id: string | null) => void
  updateProduct: (payload: {
    id: string
    title?: string
    vendor?: string
    productType?: string
    price?: string
    inventoryQuantity?: number
    status?: 'ACTIVE' | 'DRAFT'
    artworkDetails?: {
      medium?: string
      year?: string
      serie?: string
      location?: string
      height?: string
      width?: string
      depth?: string
    }
  }) => void
  isUpdating: boolean
  handleSorting: (columnId: string) => void
  currentSortBy: string
  currentSortOrder: 'asc' | 'desc'
  editingChanges?: Record<string, any>
  updateEditingChanges?: (changes: Record<string, any>) => void
  saveAllChanges?: () => void
  user?: any
  isAdmin?: boolean
  isArtist?: boolean
  onOpenAutomaticDiscountModal?: (product: { id: string; title: string }) => void
  getProductDiscounts?: (productId: string) => any[]
  getDiscountProductCount?: (discount: any) => number
  onDeleteDiscount?: (discountId: string) => Promise<void>
}

const defaultPageSize = 50

export function Client() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const pageInUrl = parseInt(searchParams.get('page') ?? '1', 10)
  const afterCursorInUrl = searchParams.get('after') ?? null
  const pageSizeInUrl = parseInt(searchParams.get('pageSize') ?? defaultPageSize.toString(), 10)
  const searchInUrl = searchParams.get('search') ?? ''
  const statusFilterInUrl = searchParams.get('status') ?? 'all'
  const dimensionsFilterInUrl = searchParams.get('dimensions') ?? 'all'
  const techniqueFilterInUrl = searchParams.get('technique') ?? 'all'
  const artworkTypeFilterInUrl = searchParams.get('artworkType') ?? 'all'
  const sortByInUrl = searchParams.get('sortBy') ?? 'title'
  const sortOrderInUrl = (searchParams.get('sortOrder') ?? 'asc') as 'asc' | 'desc'

  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editingChanges, setEditingChanges] = useState<Record<string, any>>({})
  const [searchInput, setSearchInput] = useState(searchInUrl)
  const [historyCursors, setHistoryCursors] = useState<Record<number, string | null>>({})
  const [previousPageSize, setPreviousPageSize] = useState(pageSizeInUrl)
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [bulkChanges, setBulkChanges] = useState<Record<string, any>>({})
  const [hasInvalidatedCache, setHasInvalidatedCache] = useState(false)
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [isCouponManagerModalOpen, setIsCouponManagerModalOpen] = useState(false)
  const [isAutomaticDiscountModalOpen, setIsAutomaticDiscountModalOpen] = useState(false)
  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState<{
    id: string
    title: string
  } | null>(null)

  const queryClient = useQueryClient()
  const { hasPermission, user } = useAuth()

  const isAdmin = hasPermission('manage_products')
  const isArtist = hasPermission('manage_own_products') && !isAdmin

  const { data: vendors = [], isLoading: vendorsLoading } = useGetVendors()
  const { data: techniques = [], isLoading: techniquesLoading } = useGetTechniques()
  const { data: artworkTypes = [], isLoading: artworkTypesLoading } = useGetArtworkTypes()
  // const { data: locations = [], isLoading: locationsLoading } = useGetLocations()

  // Obtener cupones reales desde la API
  const { data: coupons = [], isLoading: couponsLoading } = useGetDiscounts()

  // Función para verificar si un producto tiene descuentos aplicados
  const getProductDiscounts = useCallback(
    (productId: string) => {
      return coupons.filter((coupon: any) => {
        // Verificar si el cupón aplica a productos específicos
        if (coupon.appliesTo === 'SPECIFIC_PRODUCTS' && coupon.productIds) {
          return coupon.productIds.includes(productId)
        }
        // Verificar si aplica a todos los productos
        if (coupon.appliesTo === 'ALL_PRODUCTS') {
          return true
        }
        return false
      })
    },
    [coupons]
  )

  const [shouldUpdateStats, setShouldUpdateStats] = useState(true)

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ['managementProducts'] })
  }, [queryClient])

  useEffect(() => {
    setEditingRowId(null)
    setEditingChanges({})
  }, [
    searchInUrl,
    statusFilterInUrl,
    dimensionsFilterInUrl,
    techniqueFilterInUrl,
    artworkTypeFilterInUrl,
    sortByInUrl,
    sortOrderInUrl,
    pageInUrl,
  ])

  const {
    data: paginatedData,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useGetProductsPaginated({
    artworkType: artworkTypeFilterInUrl !== 'all' ? artworkTypeFilterInUrl : undefined,
    cursor: afterCursorInUrl || undefined,
    dimensions: dimensionsFilterInUrl !== 'all' ? dimensionsFilterInUrl : undefined,
    limit: pageSizeInUrl,
    search: searchInUrl,
    sortBy: sortByInUrl,
    sortOrder: sortOrderInUrl,
    status: statusFilterInUrl !== 'all' ? statusFilterInUrl : undefined,
    technique: techniqueFilterInUrl !== 'all' ? techniqueFilterInUrl : undefined,
  })

  const {
    data: statsData,
    isFetching: isFetchingStats,
    isLoading: isLoadingStats,
  } = useProductStats(
    {
      search: searchInUrl,
      status: statusFilterInUrl !== 'all' ? statusFilterInUrl : undefined,
    },
    {
      enabled: shouldUpdateStats,
    }
  )

  const updateMutation = useUpdateProduct()

  const bulkUpdateQueue = useBulkUpdateQueue(
    async (payload: UpdateProductPayload) => {
      const productId = payload.id.split('/').pop()
      if (!productId) throw new Error('Invalid Product ID for update')

      const response = await fetch(`/api/management/products/${productId}`, {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    {
      delayBetweenUpdates: 200,
      maxConcurrent: 3,
      onComplete: (queue) => {
        const successCount = queue.progress.success
        const errorCount = queue.progress.error
        const totalCount = queue.progress.total

        if (errorCount === 0) {
          toast.success(
            `✅ Actualización en lote completada: ${successCount} de ${totalCount} productos actualizados exitosamente`
          )
        } else {
          toast.warning(
            `⚠️ Actualización en lote completada: ${successCount} exitosos, ${errorCount} errores de ${totalCount} productos`
          )
        }

        setIsBulkMode(false)
        setSelectedRows(new Set())
        setBulkChanges({})

        setTimeout(() => {
          bulkUpdateQueue.clearQueue()
          setHasInvalidatedCache(false)

          setIsRefreshingAfterBulk(true)

          void Promise.all([
            queryClient.refetchQueries({ queryKey: ['managementProducts', 'paginated'] }),
            queryClient.refetchQueries({ queryKey: ['managementProducts', 'stats'] }),
          ]).finally(() => {
            setTimeout(() => setIsRefreshingAfterBulk(false), 1000)
          })
        }, 3000)

        if (!hasInvalidatedCache) {
          setHasInvalidatedCache(true)

          setTimeout(() => {
            void queryClient.invalidateQueries({ queryKey: ['managementProducts', 'paginated'] })
          }, 100)

          setTimeout(() => {
            void queryClient.invalidateQueries({ queryKey: ['managementProducts', 'stats'] })
          }, 200)

          setTimeout(() => {
            void queryClient.invalidateQueries({ queryKey: ['vendors'] })
            void queryClient.invalidateQueries({ queryKey: ['techniques'] })
            void queryClient.invalidateQueries({ queryKey: ['artworkTypes'] })
          }, 300)
        }
      },
    }
  )

  useEffect(() => {
    setShouldUpdateStats(!isBulkMode && !bulkUpdateQueue.queue.isProcessing)
  }, [isBulkMode, bulkUpdateQueue.queue.isProcessing])

  const [isRefreshingAfterBulk, setIsRefreshingAfterBulk] = useState(false)

  useEffect(() => {
    if (updateMutation.isSuccess) {
      setEditingRowId(null)
      setEditingChanges({})
    }
  }, [updateMutation.isSuccess])

  useEffect(() => {
    setSearchInput(searchInUrl)
  }, [searchInUrl])

  const products = paginatedData?.products ?? []
  const pageInfo = paginatedData?.pageInfo

  // Función para contar cuántos productos tienen un descuento específico
  const getDiscountProductCount = useCallback(
    (discount: any) => {
      if (discount.appliesTo === 'ALL_PRODUCTS') {
        // Si aplica a todos los productos, contar todos los productos en la tabla
        return products.length
      }
      if (discount.appliesTo === 'SPECIFIC_PRODUCTS' && discount.productIds) {
        // Si aplica a productos específicos, contar esos productos
        return discount.productIds.length
      }
      return 1
    },
    [products]
  )

  const filteredProducts = products

  const stats = {
    active: statsData?.active ?? (isLoadingStats ? '...' : 0),
    draft: statsData?.draft ?? (isLoadingStats ? '...' : 0),
    outOfStock: statsData?.outOfStock ?? (isLoadingStats ? '...' : 0),
    total: statsData?.total ?? (isLoadingStats ? '...' : 0),
  }

  const updateEditingChanges = useCallback((changes: Record<string, any>) => {
    setEditingChanges((prev) => {
      let newChanges = { ...prev }

      if (changes.artworkDetails) {
        newChanges = {
          ...newChanges,
          artworkDetails: {
            ...(newChanges.artworkDetails || {}),
            ...changes.artworkDetails,
          },
        }
      } else {
        newChanges = { ...newChanges, ...changes }
      }

      return newChanges
    })
  }, [])

  const saveAllChanges = useCallback(() => {
    if (!editingRowId || Object.keys(editingChanges).length === 0) return

    toast.info('Guardando cambios...')

    const updatePayload: UpdateProductPayload = {
      details: editingChanges.artworkDetails
        ? {
            artist: editingChanges.vendor ?? editingChanges.artworkDetails.artist,
            depth: editingChanges.artworkDetails.depth,
            height: editingChanges.artworkDetails.height,
            location: editingChanges.artworkDetails.location,
            medium: editingChanges.artworkDetails.medium,
            serie: editingChanges.artworkDetails.serie,
            width: editingChanges.artworkDetails.width,
            year: editingChanges.artworkDetails.year,
          }
        : undefined,
      id: editingRowId,
      images: editingChanges.images,
      inventoryQuantity: editingChanges.inventoryQuantity,
      price: editingChanges.price,
      productType: editingChanges.productType,
      status: editingChanges.status,
      title: editingChanges.title,
      vendor: editingChanges.vendor,
    }

    updateMutation.mutate(updatePayload, {
      onError: (err) => {
        toast.error(`Error al actualizar: ${err.message}`)
      },
      onSuccess: (updatedProduct) => {
        toast.success('Producto actualizado con éxito.')
        setEditingRowId(null)
        setEditingChanges({})
      },
    })
  }, [editingRowId, editingChanges, updateMutation])

  const handleUpdateProduct = useCallback(
    (payload: {
      id: string
      title?: string
      vendor?: string
      productType?: string
      price?: string
      inventoryQuantity?: number
      status?: 'ACTIVE' | 'DRAFT'
      images?: { mediaContentType: 'IMAGE'; originalSource: string }[]
      artworkDetails?: {
        medium?: string
        year?: string
        serie?: string
        location?: string
        height?: string
        width?: string
        depth?: string
      }
    }) => {
      toast.info('Guardando cambios...')

      const updatePayload: UpdateProductPayload = {
        details: payload.artworkDetails
          ? {
              artist: payload.vendor ?? undefined,
              depth: payload.artworkDetails.depth,
              height: payload.artworkDetails.height,
              location: payload.artworkDetails.location,
              medium: payload.artworkDetails.medium,
              serie: payload.artworkDetails.serie,
              width: payload.artworkDetails.width,
              year: payload.artworkDetails.year,
            }
          : undefined,
        id: payload.id,
        images: payload.images,
        inventoryQuantity: payload.inventoryQuantity,
        price: payload.price,
        productType: payload.productType,
        status: payload.status,
        title: payload.title,
        vendor: payload.vendor,
      }

      updateMutation.mutate(updatePayload, {
        onError: (err) => {
          toast.error(`Error al actualizar: ${err.message}`)
        },
        onSuccess: () => {
          toast.success('Producto actualizado con éxito.')
          setEditingRowId(null)
          // No invalidar caché aquí - useUpdateProduct ya lo maneja
        },
      })
    },
    [updateMutation, refetch, queryClient]
  )

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['managementProducts'] })
    void queryClient.invalidateQueries({ queryKey: ['productStats'] })
    setEditingRowId(null)
    void refetch()
    toast.info('Actualizando datos...')
  }, [refetch, queryClient])

  const handleSorting = useCallback(
    (columnId: string) => {
      const sortMapping: Record<string, string> = {
        dimensions: 'dimensions',
        inventory: 'inventoryQuantity',
        location: 'location',
        medium: 'medium',
        price: 'price',
        productType: 'productType',
        serie: 'serie',
        status: 'status',
        title: 'title',
        vendor: 'vendor',
        year: 'year',
      }

      const newSortBy = sortMapping[columnId] || 'title'
      const newSortOrder = sortByInUrl === newSortBy && sortOrderInUrl === 'asc' ? 'desc' : 'asc'

      const newUrlParams = new URLSearchParams(searchParams.toString())
      newUrlParams.set('sortBy', newSortBy)
      newUrlParams.set('sortOrder', newSortOrder)
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
    },
    [sortByInUrl, sortOrderInUrl, router, searchParams]
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      let targetCursor: string | null | undefined = undefined

      if (newPage === 1) {
        targetCursor = null
      } else {
        targetCursor = historyCursors[newPage]
      }

      if (newPage > pageInUrl && newPage === pageInUrl + 1) {
        if (pageInfo?.hasNextPage && pageInfo.endCursor) {
          targetCursor = pageInfo.endCursor
        }
      }

      newUrlParams.set('page', newPage.toString())
      if (targetCursor === null) {
        newUrlParams.delete('after')
      } else if (targetCursor) {
        newUrlParams.set('after', targetCursor)
      } else {
        newUrlParams.delete('after')
      }

      router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
    },
    [pageInUrl, historyCursors, pageInfo, router, searchParams]
  )

  const handlePageSizeChange = useCallback(
    (size: number) => {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      newUrlParams.set('pageSize', size.toString())
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleStatusFilterChange = useCallback(
    (status: string) => {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      if (status === 'all') {
        newUrlParams.delete('status')
      } else {
        newUrlParams.set('status', status)
      }
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleDimensionsFilterChange = useCallback(
    (dimensions: string) => {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      if (dimensions === 'all') {
        newUrlParams.delete('dimensions')
      } else {
        newUrlParams.set('dimensions', dimensions)
      }
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleTechniqueFilterChange = useCallback(
    (technique: string) => {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      if (technique === 'all') {
        newUrlParams.delete('technique')
      } else {
        newUrlParams.set('technique', technique)
      }
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleArtworkTypeFilterChange = useCallback(
    (artworkType: string) => {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      if (artworkType === 'all') {
        newUrlParams.delete('artworkType')
      } else {
        newUrlParams.set('artworkType', artworkType)
      }
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleSearchSubmit = useCallback(() => {
    if (!isFetching) {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      if (searchInput) {
        newUrlParams.set('search', searchInput)
      } else {
        newUrlParams.delete('search')
      }
      router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
    }
  }, [isFetching, searchInput, router, searchParams])

  const handleClearSearch = useCallback(() => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    newUrlParams.delete('search')
    newUrlParams.set('page', '1')
    newUrlParams.delete('after')
    router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
  }, [router, searchParams])

  const handleClearAllFilters = useCallback(() => {
    setEditingRowId(null)
    setEditingChanges({})
    setHistoryCursors({})

    router.replace('/manage-inventory', { scroll: false })
  }, [router])

  const handleBulkModeToggle = useCallback(() => {
    setIsBulkMode(!isBulkMode)
    if (isBulkMode) {
      setSelectedRows(new Set())
      setBulkChanges({})
      setHasInvalidatedCache(false)
      if (bulkUpdateQueue.queue.items.length > 0) {
        bulkUpdateQueue.clearQueue()
      }
      toast.info('Modo bulk desactivado. Selección y cambios limpiados.')
    } else {
      setHasInvalidatedCache(false)
      toast.info('Modo bulk activado. Selecciona productos para editar en lote.')
    }
  }, [isBulkMode, bulkUpdateQueue])

  const handleRowSelectionChange = useCallback((id: string, selected: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }, [])

  const handleSelectAllChange = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedRows(new Set(filteredProducts.map((p) => p.id)))
      } else {
        setSelectedRows(new Set())
      }
    },
    [filteredProducts]
  )

  const handleBulkChange = useCallback((field: string, value: any) => {
    setBulkChanges((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleOpenCouponModal = useCallback(() => {
    setIsCouponModalOpen(true)
  }, [])

  const handleOpenCouponManagerModal = useCallback(() => {
    setIsCouponManagerModalOpen(true)
  }, [])

  const handleOpenAutomaticDiscountModal = useCallback(() => {
    setSelectedProductForDiscount(null)
    setIsAutomaticDiscountModalOpen(true)
  }, [])

  const handleOpenAutomaticDiscountModalForProduct = useCallback(
    (product: { id: string; title: string }) => {
      setSelectedProductForDiscount(product)
      setIsAutomaticDiscountModalOpen(true)
    },
    []
  )

  const handleDeleteDiscount = useCallback(
    async (discountId: string) => {
      try {
        const response = await fetch(`/api/shopify/discounts/${encodeURIComponent(discountId)}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al eliminar descuento')
        }

        // Invalidar caché para refrescar la lista de cupones
        void queryClient.invalidateQueries({ queryKey: ['discounts'] })
      } catch (error) {
        console.error('Error al eliminar descuento:', error)
        throw error
      }
    },
    [queryClient]
  )

  // Mutations para cupones
  const createDiscountMutation = useCreateDiscount()
  const updateDiscountMutation = useUpdateDiscount()
  const deleteDiscountMutation = useDeleteDiscount()

  const handleCouponCreated = useCallback(
    (coupon: CreateDiscountInput) => {
      createDiscountMutation.mutate(coupon, {
        onError: (error) => {
          toast.error(`Error al crear cupón: ${error.message}`)
        },
        onSuccess: () => {
          toast.success('Cupón creado exitosamente')
        },
      })
    },
    [createDiscountMutation]
  )

  const handleCouponUpdated = useCallback(
    (coupon: UpdateDiscountInput) => {
      updateDiscountMutation.mutate(coupon, {
        onError: (error) => {
          toast.error(`Error al actualizar cupón: ${error.message}`)
        },
        onSuccess: () => {
          toast.success('Cupón actualizado exitosamente')
        },
      })
    },
    [updateDiscountMutation]
  )

  const handleCouponDeleted = useCallback(
    (couponId: string) => {
      deleteDiscountMutation.mutate(couponId, {
        onError: (error) => {
          toast.error(`Error al eliminar cupón: ${error.message}`)
        },
        onSuccess: () => {
          toast.success('Cupón eliminado exitosamente')
        },
      })
    },
    [deleteDiscountMutation]
  )

  const handleApplyBulkChanges = useCallback(() => {
    if (selectedRows.size === 0) {
      toast.warning('Selecciona productos antes de aplicar cambios')
      return
    }

    if (Object.keys(bulkChanges).length === 0) {
      toast.warning('Haz cambios en los campos antes de aplicar')
      return
    }

    const selectedProducts = filteredProducts.filter((p) => selectedRows.has(p.id))
    const updatePayloads: UpdateProductPayload[] = selectedProducts.map((product) => ({
      id: product.id,
      title: product.title,
      ...bulkChanges,
      details: bulkChanges.artworkDetails
        ? {
            ...product.artworkDetails,
            ...bulkChanges.artworkDetails,
          }
        : undefined,
    }))

    bulkUpdateQueue.addItems(updatePayloads)

    const changesSummary = Object.entries(bulkChanges)
      .filter(([key]) => key !== 'artworkDetails')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    toast.success(`✅ ${updatePayloads.length} productos agregados a la cola de actualizaciones`, {
      description: `Cambios: ${changesSummary}`,
      duration: 4000,
    })

    setTimeout(() => {
      void bulkUpdateQueue.processQueue()
    }, 500)
  }, [selectedRows, bulkChanges, filteredProducts, bulkUpdateQueue])

  useEffect(() => {
    if (pageSizeInUrl !== previousPageSize) {
      setPreviousPageSize(pageSizeInUrl)
      if (pageInUrl > 1 || afterCursorInUrl) {
        const newUrlParams = new URLSearchParams(searchParams.toString())
        newUrlParams.set('page', '1')
        newUrlParams.delete('after')
        router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
        setHistoryCursors({})
      }
    }
  }, [pageSizeInUrl, previousPageSize, pageInUrl, afterCursorInUrl, router, searchParams])

  useEffect(() => {
    setHistoryCursors((prev) => {
      const newCursors = { ...prev }
      let changed = false
      if (newCursors[pageInUrl] !== afterCursorInUrl) {
        newCursors[pageInUrl] = afterCursorInUrl
        changed = true
      }
      if (pageInfo?.hasNextPage && pageInfo.endCursor) {
        const nextPageNumber = pageInUrl + 1
        if (newCursors[nextPageNumber] !== pageInfo.endCursor) {
          newCursors[nextPageNumber] = pageInfo.endCursor
          changed = true
        }
      } else if (pageInfo && !pageInfo.hasNextPage) {
        const nextPageNumber = pageInUrl + 1
        if (nextPageNumber in newCursors) {
          delete newCursors[nextPageNumber]
          changed = true
        }
      }
      return changed ? newCursors : prev
    })
  }, [pageInUrl, afterCursorInUrl, pageInfo])

  const table = useReactTable({
    columns,
    data: products,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      bulkChanges,
      currentSortBy: sortByInUrl,
      currentSortOrder: sortOrderInUrl,
      editingChanges,
      editingRowId,
      getDiscountProductCount,
      getProductDiscounts,
      handleSorting,
      isAdmin,
      isArtist,
      isBulkMode,
      isUpdating: updateMutation.isPending,
      onApplyBulkChanges: handleApplyBulkChanges,
      onBulkChange: handleBulkChange,
      onDeleteDiscount: handleDeleteDiscount,
      onOpenAutomaticDiscountModal: handleOpenAutomaticDiscountModalForProduct,
      onRowSelectionChange: handleRowSelectionChange,
      onSelectAllChange: handleSelectAllChange,
      saveAllChanges,
      selectedRows,
      setEditingRowId,
      updateEditingChanges,
      updateProduct: handleUpdateProduct,
      user,
    } as InventoryTableMeta,
  })

  if ((isLoading || isLoadingStats) && !products.length) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-10 w-32' />
        </div>
        <Skeleton className='h-96 w-full' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <div className='flex min-h-96 items-center justify-center'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar productos</h3>
            <p className='mt-2 text-muted-foreground'>{error.message}</p>
            <Button onClick={handleRefresh} className='mt-4'>
              <RefreshCw className='mr-2 size-4' />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
      <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
        <div>
          <h1 className='text-2xl font-bold'>Gestión de Inventario</h1>
          <p className='text-muted-foreground'>Administra tu catálogo de obras de arte</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant={isBulkMode ? 'default' : 'outline'}
            onClick={handleBulkModeToggle}
            disabled={isFetching}
          >
            {isBulkMode ? (
              <>
                Salir del Modo Bulk
                {selectedRows.size > 0 && (
                  <Badge variant='secondary' className='ml-2'>
                    {selectedRows.size} seleccionados
                  </Badge>
                )}
              </>
            ) : (
              'Modo Bulk'
            )}
          </Button>
          {selectedRows.size > 0 && (
            <>
              <Button
                variant='outline'
                onClick={handleOpenCouponModal}
                className='bg-blue-50 text-blue-700 hover:bg-blue-100'
              >
                <Tag className='mr-2 size-4' />
                Crear Cupón ({selectedRows.size})
              </Button>
              <Button
                variant='outline'
                onClick={handleOpenAutomaticDiscountModal}
                className='bg-purple-50 text-purple-700 hover:bg-purple-100'
              >
                <Tag className='mr-2 size-4' />
                Descuento Automático ({selectedRows.size})
              </Button>
            </>
          )}
          <Button
            variant='outline'
            onClick={handleOpenCouponManagerModal}
            className='bg-green-50 text-green-700 hover:bg-green-100'
          >
            <Tag className='mr-2 size-4' />
            Gestionar Cupones
          </Button>
          <Link href='/manage-inventory/collections'>
            <Button variant='outline' className='bg-orange-50 text-orange-700 hover:bg-orange-100'>
              <Tag className='mr-2 size-4' />
              Gestionar Colecciones
            </Button>
          </Link>
          <Link href='/manage-inventory/create-bulk'>
            <Button variant='outline' className='bg-indigo-50 text-indigo-700 hover:bg-indigo-100'>
              <PlusCircle className='mr-2 size-4' />
              Creación en Lote
            </Button>
          </Link>
          <Link href={ROUTES.INVENTORY.CREATE.PATH}>
            <Button>
              <PlusCircle className='mr-2 size-4' />
              Crear Nueva Obra
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Total</p>
            <div className='flex items-center space-x-2'>
              {isFetchingStats && <RefreshCw className='size-3 animate-spin' />}
              <Badge variant='outline'>{stats.total}</Badge>
            </div>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Activos</p>
            <div className='flex items-center space-x-2'>
              {isFetchingStats && <RefreshCw className='size-3 animate-spin' />}
              <Badge variant='default'>{stats.active}</Badge>
            </div>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Borradores</p>
            <div className='flex items-center space-x-2'>
              {isFetchingStats && <RefreshCw className='size-3 animate-spin' />}
              <Badge variant='secondary'>{stats.draft}</Badge>
            </div>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Sin Stock</p>
            <div className='flex items-center space-x-2'>
              {isFetchingStats && <RefreshCw className='size-3 animate-spin' />}
              <Badge variant='destructive'>{stats.outOfStock}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0'>
        <div className='relative flex max-w-sm flex-1'>
          <Input
            placeholder='Buscar por título, artista, tipo, técnica, localización...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit()
              }
            }}
            className='rounded-r-none'
            disabled={isFetching}
          />
          <Button
            onClick={handleSearchSubmit}
            className='rounded-l-none px-3'
            variant='default'
            disabled={isFetching}
          >
            {isFetching ? (
              <RefreshCw className='size-4 animate-spin' />
            ) : (
              <Search className='size-4' />
            )}
          </Button>
          {searchInUrl && (
            <Button
              onClick={handleClearSearch}
              className='ml-2 px-3'
              variant='outline'
              size='sm'
              disabled={isFetching}
            >
              Limpiar
            </Button>
          )}
        </div>

        {searchInUrl && (
          <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
            <Search className='size-4' />
            <span>Buscando: "{searchInUrl}"</span>
          </div>
        )}

        <div className='flex items-center space-x-1'>
          <Select value={statusFilterInUrl} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className='w-44'>
              <Filter className='mr-2 size-4' />
              <SelectValue placeholder='Filtrar por estado' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos los estados</SelectItem>
              <SelectItem value='ACTIVE'>Activos</SelectItem>
              <SelectItem value='DRAFT'>Borradores</SelectItem>
              <SelectItem value='ARCHIVED'>Archivados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-1'>
          <Select value={artworkTypeFilterInUrl} onValueChange={handleArtworkTypeFilterChange}>
            <SelectTrigger className='w-44'>
              <Filter className='mr-2 size-4' />
              <SelectValue placeholder='Filtrar por tipo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos los tipos</SelectItem>
              {artworkTypes && artworkTypes.length > 0 ? (
                artworkTypes.map((type: { id: string; name: string }) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value='all' disabled>
                  Cargando...
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-1'>
          <Select value={techniqueFilterInUrl} onValueChange={handleTechniqueFilterChange}>
            <SelectTrigger className='w-44'>
              <Filter className='mr-2 size-4' />
              <SelectValue placeholder='Filtrar por técnica' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas las técnicas</SelectItem>
              {techniques && techniques.length > 0 ? (
                techniques.map((technique: { id: string; name: string }) => (
                  <SelectItem key={technique.id} value={technique.name}>
                    {technique.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value='all' disabled>
                  Cargando...
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-1'>
          <Select value={dimensionsFilterInUrl} onValueChange={handleDimensionsFilterChange}>
            <SelectTrigger className='w-44'>
              <Filter className='mr-2 size-4' />
              <SelectValue placeholder='Filtrar por dimensiones' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas las dimensiones</SelectItem>
              {/* Las opciones de dimensiones se cargarán dinámicamente desde la API */}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-1'>
          <Select
            value={sortByInUrl}
            onValueChange={(value) => {
              const newUrlParams = new URLSearchParams(searchParams.toString())
              newUrlParams.set('sortBy', value)
              newUrlParams.set('page', '1')
              newUrlParams.delete('after')
              router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
            }}
          >
            <SelectTrigger className='w-36'>
              <SelectValue placeholder='Ordenar por' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='title'>Título</SelectItem>
              <SelectItem value='vendor'>Artista</SelectItem>
              <SelectItem value='productType'>Tipo de obra</SelectItem>
              <SelectItem value='medium'>Técnica</SelectItem>
              <SelectItem value='year'>Año</SelectItem>
              <SelectItem value='serie'>Serie</SelectItem>
              <SelectItem value='location'>Localización</SelectItem>
              <SelectItem value='price'>Precio</SelectItem>
              <SelectItem value='createdAt'>Fecha de creación</SelectItem>
              <SelectItem value='updatedAt'>Fecha de actualización</SelectItem>
              <SelectItem value='inventoryQuantity'>Cantidad en inventario</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-1'>
          <Select
            value={sortOrderInUrl}
            onValueChange={(value) => {
              const newUrlParams = new URLSearchParams(searchParams.toString())
              newUrlParams.set('sortOrder', value)
              newUrlParams.set('page', '1')
              newUrlParams.delete('after')
              router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
            }}
          >
            <SelectTrigger className='w-28'>
              <SelectValue placeholder='Orden' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>Ascendente</SelectItem>
              <SelectItem value='desc'>Descendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isBulkMode && (
        <div className='bg-muted/50 rounded-lg border p-4'>
          {selectedRows.size === 0 && (
            <div className='mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-center'>
              <p className='text-sm text-amber-800'>
                💡 Selecciona productos de la tabla para comenzar la edición en lote
              </p>
            </div>
          )}
          {bulkUpdateQueue.queue.isProcessing && (
            <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <RefreshCw className='size-4 animate-spin text-blue-600' />
                  <span className='text-sm font-medium text-blue-800'>Operaciones en curso</span>
                </div>
                <Badge variant='outline' className='text-blue-600'>
                  {bulkUpdateQueue.queue.progress.completed} de{' '}
                  {bulkUpdateQueue.queue.progress.total}
                </Badge>
              </div>
              <p className='mt-1 text-xs text-blue-600'>
                Procesando actualizaciones en lote. No cierres esta página.
              </p>
            </div>
          )}
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <h3 className='text-lg font-semibold'>Edición en Lote</h3>
              {(vendorsLoading || techniquesLoading || artworkTypesLoading) && (
                <Badge variant='outline' className='animate-pulse bg-blue-50 text-blue-700'>
                  <RefreshCw className='mr-1 size-3 animate-spin' />
                  Cargando opciones...
                </Badge>
              )}
              {!(vendorsLoading || techniquesLoading || artworkTypesLoading) && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    void queryClient.invalidateQueries({ queryKey: ['vendors'] })
                    void queryClient.invalidateQueries({ queryKey: ['techniques'] })
                    void queryClient.invalidateQueries({ queryKey: ['artwork_types'] })
                  }}
                  className='h-6 px-2 text-xs'
                >
                  <RefreshCw className='mr-1 size-3' />
                  Refrescar
                </Button>
              )}
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-muted-foreground'>
                {selectedRows.size} productos seleccionados
              </span>
              {selectedRows.size > 0 && Object.keys(bulkChanges).length > 0 && (
                <Button
                  onClick={handleApplyBulkChanges}
                  size='sm'
                  disabled={bulkUpdateQueue.queue.isProcessing}
                  className='min-w-[140px]'
                >
                  {bulkUpdateQueue.queue.isProcessing ? (
                    <>
                      <RefreshCw className='mr-2 size-4 animate-spin' />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Check className='mr-2 size-4' />
                      Aplicar Cambios
                    </>
                  )}
                </Button>
              )}
              {Object.keys(bulkChanges).length > 0 && (
                <Button
                  onClick={() => setBulkChanges({})}
                  variant='outline'
                  size='sm'
                  disabled={bulkUpdateQueue.queue.isProcessing}
                >
                  Limpiar Cambios
                </Button>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div>
              <label className='text-sm font-medium'>Estado</label>
              <Select
                value={bulkChanges.status || ''}
                onValueChange={(value) => handleBulkChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar estado' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ACTIVE'>Activo</SelectItem>
                  <SelectItem value='DRAFT'>Borrador</SelectItem>
                  <SelectItem value='ARCHIVED'>Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium'>Precio</label>
              <Input
                placeholder='Nuevo precio'
                value={bulkChanges.price || ''}
                onChange={(e) => handleBulkChange('price', e.target.value)}
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Cantidad en Inventario</label>
              <Input
                type='number'
                placeholder='Nueva cantidad'
                value={bulkChanges.inventoryQuantity || ''}
                onChange={(e) =>
                  handleBulkChange('inventoryQuantity', parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Año</label>
              <Input
                placeholder='Nuevo año'
                value={bulkChanges.artworkDetails?.year || ''}
                onChange={(e) =>
                  handleBulkChange('artworkDetails', {
                    ...bulkChanges.artworkDetails,
                    year: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div>
              <label className='text-sm font-medium'>Artista</label>
              <Select
                value={bulkChanges.vendor || ''}
                onValueChange={(value) => handleBulkChange('vendor', value)}
                disabled={vendorsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={vendorsLoading ? 'Cargando...' : 'Seleccionar artista'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {vendorsLoading ? (
                    <div className='p-2 text-center text-sm text-muted-foreground'>
                      <RefreshCw className='mx-auto size-4 animate-spin' />
                      Cargando artistas...
                    </div>
                  ) : vendors && vendors.length > 0 ? (
                    vendors.map((vendor: string) => (
                      <SelectItem key={vendor} value={vendor}>
                        {vendor}
                      </SelectItem>
                    ))
                  ) : (
                    <div className='p-2 text-center text-sm text-muted-foreground'>
                      No hay artistas disponibles
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium'>Tipo de Obra</label>
              <Select
                value={bulkChanges.productType || ''}
                onValueChange={(value) => handleBulkChange('productType', value)}
                disabled={artworkTypesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={artworkTypesLoading ? 'Cargando...' : 'Seleccionar tipo'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {artworkTypesLoading ? (
                    <div className='p-2 text-center text-sm text-muted-foreground'>
                      <RefreshCw className='mx-auto size-4 animate-spin' />
                      Cargando tipos...
                    </div>
                  ) : artworkTypes && artworkTypes.length > 0 ? (
                    artworkTypes.map((type: { id: string; name: string }) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className='p-2 text-center text-sm text-muted-foreground'>
                      No hay tipos disponibles
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium'>Técnica</label>
              <Select
                value={bulkChanges.artworkDetails?.medium || ''}
                onValueChange={(value) =>
                  handleBulkChange('artworkDetails', {
                    ...bulkChanges.artworkDetails,
                    medium: value,
                  })
                }
                disabled={techniquesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={techniquesLoading ? 'Cargando...' : 'Seleccionar técnica'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {techniquesLoading ? (
                    <div className='p-2 text-center text-sm text-muted-foreground'>
                      <RefreshCw className='mx-auto size-4 animate-spin' />
                      Cargando técnicas...
                    </div>
                  ) : techniques && techniques.length > 0 ? (
                    techniques.map((technique: { id: string; name: string }) => (
                      <SelectItem key={technique.id} value={technique.name}>
                        {technique.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className='p-2 text-center text-sm text-muted-foreground'>
                      No hay técnicas disponibles
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium'>Localización</label>
              <Input
                placeholder='Nueva localización'
                value={bulkChanges.artworkDetails?.location || ''}
                onChange={(e) =>
                  handleBulkChange('artworkDetails', {
                    ...bulkChanges.artworkDetails,
                    location: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div>
              <label className='text-sm font-medium'>Serie</label>
              <Input
                placeholder='Nueva serie'
                value={bulkChanges.artworkDetails?.serie || ''}
                onChange={(e) =>
                  handleBulkChange('artworkDetails', {
                    ...bulkChanges.artworkDetails,
                    serie: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Alto (cm)</label>
              <Input
                type='number'
                step='0.1'
                placeholder='Alto'
                value={bulkChanges.artworkDetails?.height || ''}
                onChange={(e) =>
                  handleBulkChange('artworkDetails', {
                    ...bulkChanges.artworkDetails,
                    height: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Ancho (cm)</label>
              <Input
                type='number'
                step='0.1'
                placeholder='Ancho'
                value={bulkChanges.artworkDetails?.width || ''}
                onChange={(e) =>
                  handleBulkChange('artworkDetails', {
                    ...bulkChanges.artworkDetails,
                    width: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Profundidad (cm)</label>
              <Input
                type='number'
                step='0.1'
                placeholder='Profundidad'
                value={bulkChanges.artworkDetails?.depth || ''}
                onChange={(e) =>
                  handleBulkChange('artworkDetails', {
                    ...bulkChanges.artworkDetails,
                    depth: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {(searchInUrl ||
        statusFilterInUrl !== 'all' ||
        dimensionsFilterInUrl !== 'all' ||
        techniqueFilterInUrl !== 'all' ||
        artworkTypeFilterInUrl !== 'all' ||
        sortByInUrl !== 'title' ||
        sortOrderInUrl !== 'asc') && (
        <div className='flex justify-end'>
          <Button
            onClick={handleClearAllFilters}
            variant='container-destructive'
            disabled={isFetching}
          >
            Limpiar todos los filtros
          </Button>
        </div>
      )}

      {bulkUpdateQueue.queue.items.length > 0 && !bulkUpdateQueue.queue.isProcessing && (
        <BulkUpdateProgress
          queue={bulkUpdateQueue.queue}
          onRetryFailed={bulkUpdateQueue.retryFailedItems}
          onClear={bulkUpdateQueue.clearQueue}
          onProcess={bulkUpdateQueue.processQueue}
        />
      )}

      {isRefreshingAfterBulk && (
        <div className='mb-4 flex items-center space-x-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
          <RefreshCw className='size-4 animate-spin' />
          <span>Actualizando inventario después de las operaciones en lote...</span>
        </div>
      )}

      {!isRefreshingAfterBulk &&
        bulkUpdateQueue.queue.items.length === 0 &&
        hasInvalidatedCache && (
          <div className='mb-4 flex items-center justify-between rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300'>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='size-4' />
              <span>
                Operaciones en lote completadas. Los datos se han actualizado automáticamente.
              </span>
            </div>
            <Button
              onClick={() => {
                void queryClient.refetchQueries({ queryKey: ['managementProducts', 'paginated'] })
                void queryClient.refetchQueries({ queryKey: ['managementProducts', 'stats'] })
                toast.info('Refrescando inventario...')
              }}
              variant='outline'
              size='sm'
            >
              <RefreshCw className='mr-2 size-4' />
              Refrescar Inventario
            </Button>
          </div>
        )}

      {isLoading ? (
        <Table.Loader />
      ) : (
        <>
          {isFetching && (
            <div className='mb-4 flex items-center space-x-2 text-sm text-muted-foreground'>
              <RefreshCw className='size-4 animate-spin' />
              <span>
                {searchInUrl
                  ? `Buscando productos que coincidan con "${searchInUrl}"...`
                  : 'Actualizando productos...'}
              </span>
            </div>
          )}
          <div className='w-full min-w-0 max-w-full'>
            <Table.Data
              table={table}
              emptyMessage={
                searchInUrl
                  ? `No se encontraron productos que coincidan con "${searchInUrl}"`
                  : statusFilterInUrl !== 'all'
                    ? `No hay productos con estado "${statusFilterInUrl}"`
                    : 'No se encontraron productos.'
              }
            />
          </div>
        </>
      )}

      <Table.Pagination
        table={table}
        isServerSide={true}
        hasNextPage={pageInfo?.hasNextPage}
        hasPreviousPage={pageInUrl > 1}
        currentPage={pageInUrl}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {filteredProducts.length > 0 && (
        <div className='text-center text-sm text-muted-foreground'>
          Mostrando {filteredProducts.length} de {stats.total} productos
          {(statusFilterInUrl !== 'all' ||
            dimensionsFilterInUrl !== 'all' ||
            techniqueFilterInUrl !== 'all' ||
            artworkTypeFilterInUrl !== 'all') &&
            ' (con filtros aplicados)'}
        </div>
      )}

      {/* Modales */}

      <CouponCreatorModal
        isOpen={isCouponModalOpen}
        onClose={() => {
          setIsCouponModalOpen(false)
        }}
        selectedProducts={filteredProducts
          .filter((p) => selectedRows.has(p.id))
          .map((p) => ({ id: p.id, title: p.title }))}
        onCouponCreated={handleCouponCreated}
      />

      <CouponManagerModal
        isOpen={isCouponManagerModalOpen}
        onClose={() => setIsCouponManagerModalOpen(false)}
        selectedProducts={filteredProducts
          .filter((p) => selectedRows.has(p.id))
          .map((p) => ({ id: p.id, title: p.title }))}
        coupons={coupons}
        isLoading={couponsLoading}
        onCouponCreated={handleCouponCreated}
        onCouponUpdated={handleCouponUpdated}
        onCouponDeleted={handleCouponDeleted}
      />

      <ProductAutomaticDiscountModal
        isOpen={isAutomaticDiscountModalOpen}
        onClose={() => {
          setIsAutomaticDiscountModalOpen(false)
          setSelectedProductForDiscount(null)
        }}
        selectedProducts={
          selectedProductForDiscount
            ? undefined
            : filteredProducts
                .filter((p) => selectedRows.has(p.id))
                .map((p) => ({ id: p.id, title: p.title }))
        }
        singleProduct={selectedProductForDiscount ?? undefined}
        onDiscountCreated={() => {
          void queryClient.invalidateQueries({ queryKey: ['discounts'] })
        }}
      />
    </div>
  )
}
