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

  const hasCompletedRef = useRef(false)

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
    hasCompletedRef.current = false
    isStartingRef.current = false

    const bulkItems: BulkUpdateItem<T>[] = items.map((item, index) => {
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
    isStartingRef.current = false
    hasCompletedRef.current = false

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

      setQueue((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === item.id ? { ...i, status: 'processing' as const } : i
        ),
      }))

      try {
        await updateFunction(item.data)

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

        setTimeout(() => {
          setQueue((prev) => {
            const currentItem = prev.items.find((i) => i.id === item.id)
            if (currentItem?.status === 'processing') {
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

    const processBatch = async () => {
      setQueue((currentQueue) => {
        const pending = currentQueue.items.filter((item) => item.status === 'pending')

        if (pending.length === 0) {
          setTimeout(() => {
            setQueue((prev) => ({ ...prev, isProcessing: false }))

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

        void Promise.all(batch.map(processItem)).then(() => {
          setTimeout(() => {
            setQueue((currentState) => {
              if (!currentState.isProcessing) {
                return currentState
              }

              const stillPending = currentState.items.filter((item) => item.status === 'pending')

              if (stillPending.length > 0) {
                void processBatch()
              } else {
                setQueue((prev) => ({ ...prev, isProcessing: false }))

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
    if (isStartingRef.current) {
      return
    }

    isStartingRef.current = true

    setTimeout(() => {
      isStartingRef.current = false
      startProcessing()
    }, 10)

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
