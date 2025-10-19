import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

export interface BulkUpdateItem<T = any> {
  id: string
  data: T
  status: 'pending' | 'processing' | 'success' | 'error'
  error?: string
  retryCount: number
}

export interface BulkUpdateQueue<T = any> {
  items: BulkUpdateItem<T>[]
  isProcessing: boolean
  progress: {
    total: number
    completed: number
    success: number
    error: number
  }
}

export interface UseBulkUpdateQueueOptions<T = any> {
  onItemSuccess?: (item: BulkUpdateItem<T>) => void
  onItemError?: (item: BulkUpdateItem<T>, error: Error) => void
  onComplete?: (queue: BulkUpdateQueue<T>) => void
  maxRetries?: number
  maxConcurrent?: number
  delayBetweenUpdates?: number
}

export function useBulkUpdateQueue<T = any>(
  updateFunction: (item: T) => Promise<any>,
  options: UseBulkUpdateQueueOptions<T> = {}
) {
  const {
    delayBetweenUpdates = 100,
    maxConcurrent = 2,
    maxRetries = 3,
    onComplete,
    onItemError,
    onItemSuccess,
  } = options

  // Flag para evitar múltiples llamadas a onComplete
  const hasCompletedRef = useRef(false)

  // Flag para evitar iniciar procesamiento múltiples veces
  const isStartingRef = useRef(false)

  const [queue, setQueue] = useState<BulkUpdateQueue<T>>({
    isProcessing: false,
    items: [],
    progress: {
      completed: 0,
      error: 0,
      success: 0,
      total: 0,
    },
  })

  const addItems = useCallback((items: T[]) => {
    // Resetear los flags cuando se agregan nuevos items
    hasCompletedRef.current = false
    isStartingRef.current = false

    const bulkItems: BulkUpdateItem<T>[] = items.map((item, index) => {
      // Extraer el ID numérico de Shopify si existe, o usar el ID original
      let itemId = (item as any).id
      if (typeof itemId === 'string' && itemId.includes('gid://shopify/Product/')) {
        itemId = itemId.split('/').pop() || itemId
      }

      return {
        data: item,
        id: String(itemId) || `bulk-${index}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        retryCount: 0,
        status: 'pending' as const,
      }
    })

    setQueue((prev) => ({
      ...prev,
      items: [...prev.items, ...bulkItems],
      progress: {
        ...prev.progress,
        total: prev.progress.total + bulkItems.length,
      },
    }))
  }, [])

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
      progress: {
        ...prev.progress,
        total: Math.max(0, prev.progress.total - 1),
      },
    }))
  }, [])

  const clearQueue = useCallback(() => {
    // Resetear flags
    isStartingRef.current = false
    hasCompletedRef.current = false

    // Detener cualquier procesamiento en curso
    setQueue((prev) => ({
      ...prev,
      isProcessing: false,
      items: [],
      progress: {
        completed: 0,
        error: 0,
        success: 0,
        total: 0,
      },
    }))
  }, [])

  const startProcessing = useCallback(() => {
    const processingItems = new Set<string>()

    const processItem = async (item: BulkUpdateItem<T>) => {
      if (processingItems.has(item.id)) {
        return
      }

      processingItems.add(item.id)

      // Marcar como procesando
      setQueue((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === item.id ? { ...i, status: 'processing' as const } : i
        ),
      }))

      try {
        await updateFunction(item.data)

        // Marcar como exitoso
        setQueue((prev) => ({
          ...prev,
          items: prev.items.map((i) =>
            i.id === item.id ? { ...i, status: 'success' as const } : i
          ),
          progress: {
            ...prev.progress,
            completed: prev.progress.completed + 1,
            success: prev.progress.success + 1,
          },
        }))

        onItemSuccess?.(item)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

        if (item.retryCount < maxRetries) {
          // Reintentar - NO incrementar contadores
          setQueue((prev) => ({
            ...prev,
            items: prev.items.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    error: errorMessage,
                    retryCount: i.retryCount + 1,
                    status: 'pending' as const,
                  }
                : i
            ),
          }))

          const productTitle = (item.data as any).title || item.id
          toast.warning(`Reintentando "${productTitle}" (${item.retryCount + 1}/${maxRetries})`)
        } else {
          // Marcar como error definitivo - SOLO aquí incrementar contadores
          setQueue((prev) => ({
            ...prev,
            items: prev.items.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    error: errorMessage,
                    status: 'error' as const,
                  }
                : i
            ),
            progress: {
              ...prev.progress,
              completed: prev.progress.completed + 1,
              error: prev.progress.error + 1,
            },
          }))

          onItemError?.(item, error as Error)
          const productTitle = (item.data as any).title || item.id
          toast.error(`Error al actualizar "${productTitle}": ${errorMessage}`)
        }
      } finally {
        processingItems.delete(item.id)

        // Verificar si este item quedó en estado "processing" por más de 30 segundos
        setTimeout(() => {
          setQueue((prev) => {
            const currentItem = prev.items.find((i) => i.id === item.id)
            if (currentItem && currentItem.status === 'processing') {
              // Marcar como error si quedó colgado
              return {
                ...prev,
                items: prev.items.map((i) =>
                  i.id === item.id
                    ? {
                        ...i,
                        error: 'Timeout - Item colgado en procesamiento',
                        status: 'error' as const,
                      }
                    : i
                ),
                progress: {
                  ...prev.progress,
                  completed: prev.progress.completed + 1,
                  error: prev.progress.error + 1,
                },
              }
            }
            return prev
          })
        }, 30000)
      }
    }

    // Procesar items en lotes concurrentes de forma recursiva
    const processBatch = async () => {
      // Obtener items pendientes del estado actual usando setQueue para acceder al estado
      setQueue((currentQueue) => {
        const pending = currentQueue.items.filter((item) => item.status === 'pending')

        if (pending.length === 0) {
          // No hay items pendientes, marcar como completado
          setTimeout(() => {
            setQueue((prev) => ({ ...prev, isProcessing: false }))
            // Solo llamar onComplete si realmente se completó todo y no se ha llamado antes
            if (
              currentQueue.progress.completed === currentQueue.progress.total &&
              !hasCompletedRef.current
            ) {
              hasCompletedRef.current = true
              onComplete?.(currentQueue)
            }
          }, 100)
          return currentQueue
        }

        const batch = pending.slice(0, maxConcurrent)

        // Procesar este lote
        void Promise.all(batch.map(processItem)).then(() => {
          // Después de procesar este lote, verificar si hay más
          setTimeout(() => {
            // Solo continuar si aún hay items pendientes y no se ha detenido el procesamiento
            setQueue((currentState) => {
              if (!currentState.isProcessing) {
                return currentState
              }

              const stillPending = currentState.items.filter((item) => item.status === 'pending')

              if (stillPending.length > 0) {
                void processBatch()
              } else {
                setQueue((prev) => ({ ...prev, isProcessing: false }))
                // Solo llamar onComplete si no se ha llamado antes
                if (!hasCompletedRef.current) {
                  hasCompletedRef.current = true
                  onComplete?.(currentState)
                }
              }
              return currentState
            })
          }, delayBetweenUpdates)
        })

        return currentQueue
      })
    }

    // Iniciar el procesamiento
    void processBatch()
  }, [
    updateFunction,
    maxRetries,
    maxConcurrent,
    delayBetweenUpdates,
    onItemSuccess,
    onItemError,
    onComplete,
  ])

  const processQueue = useCallback(() => {
    // Verificar y establecer el flag de inicio ANTES de cualquier otra cosa
    if (isStartingRef.current) {
      return
    }

    // Marcar inmediatamente que se está iniciando
    isStartingRef.current = true

    // Programar el setTimeout UNA SOLA VEZ aquí, FUERA de setQueue
    setTimeout(() => {
      isStartingRef.current = false
      startProcessing()
    }, 10)

    // Actualizar el estado
    setQueue((prev) => {
      if (prev.isProcessing) {
        return prev
      }

      if (prev.items.length === 0) {
        return prev
      }

      return { ...prev, isProcessing: true }
    })
  }, [startProcessing])

  const retryItem = useCallback((id: string) => {
    setQueue((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, error: undefined, status: 'pending' as const } : item
      ),
    }))
  }, [])

  const retryFailedItems = useCallback(() => {
    setQueue((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.status === 'error'
          ? { ...item, error: undefined, retryCount: 0, status: 'pending' as const }
          : item
      ),
    }))
  }, [])

  return {
    addItems,
    clearQueue,
    processQueue,
    queue,
    removeItem,
    retryFailedItems,
    retryItem,
  }
}
