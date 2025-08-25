'use client'

import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react'
import { useCallback } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

import type { BulkUpdateQueue } from '@/hooks/useBulkUpdateQueue'

interface BulkUpdateProgressProps<T = any> {
  queue: BulkUpdateQueue<T>
  onRetryFailed: () => void
  onClear: () => void
  onProcess: () => void
}

export function BulkUpdateProgress<T = any>({
  onClear,
  onProcess,
  onRetryFailed,
  queue,
}: BulkUpdateProgressProps<T>) {
  const { isProcessing, items, progress } = queue

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="size-4 text-muted-foreground" />
      case 'processing':
        return <Loader2 className="size-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="size-4 text-green-500" />
      case 'error':
        return <XCircle className="size-4 text-red-500" />
      default:
        return <Clock className="size-4 text-muted-foreground" />
    }
  }, [])

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'processing':
        return 'Procesando'
      case 'success':
        return 'Exitoso'
      case 'error':
        return 'Error'
      default:
        return 'Desconocido'
    }
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-muted text-muted-foreground'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }, [])

  if (items.length === 0) return null

  const pendingCount = items.filter((item) => item.status === 'pending').length
  const processingCount = items.filter((item) => item.status === 'processing').length
  const successCount = items.filter((item) => item.status === 'success').length
  const errorCount = items.filter((item) => item.status === 'error').length

  const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold">Actualizaciones en Lote</h3>
          {isProcessing && (
            <Badge variant="outline" className="animate-pulse bg-blue-50 text-blue-700">
              <Loader2 className="mr-1 size-3 animate-spin" />
              Procesando...
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!isProcessing && pendingCount > 0 && (
            <Button onClick={onProcess} size="sm" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 size-4" />
              Procesar {pendingCount} items
            </Button>
          )}
          {errorCount > 0 && (
            <Button onClick={onRetryFailed} variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
              <XCircle className="mr-2 size-4" />
              Reintentar Errores ({errorCount})
            </Button>
          )}
          <Button onClick={onClear} variant="outline" size="sm">
            Limpiar
          </Button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            Progreso: {progress.completed} de {progress.total}
          </span>
          <span className="font-bold text-blue-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="relative">
          <Progress value={progressPercentage} className="h-3" />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Pendientes: {pendingCount}</span>
            <span>Procesando: {processingCount}</span>
            <span>Exitosos: {successCount}</span>
            <span>Errores: {errorCount}</span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
          <div className="text-xs text-muted-foreground">Pendientes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{processingCount}</div>
          <div className="text-xs text-muted-foreground">Procesando</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{successCount}</div>
          <div className="text-xs text-muted-foreground">Exitosos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-xs text-muted-foreground">Errores</div>
        </div>
      </div>

      {/* Lista de items */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Estado de los Items:</h4>
        <div className="max-h-64 space-y-1 overflow-y-auto rounded border p-2">
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No hay items en la cola
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`flex items-center justify-between rounded p-2 text-sm transition-colors ${item.status === 'processing' ? 'border-l-4 border-l-blue-500 bg-blue-50' :
                  item.status === 'success' ? 'border-l-4 border-l-green-500 bg-green-50' :
                    item.status === 'error' ? 'border-l-4 border-l-red-500 bg-red-50' :
                      'bg-muted/30 border-l-4 border-l-muted-foreground'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  <span className="max-w-[200px] truncate font-mono text-xs" title={item.id}>
                    {(item.data as any)?.title || item.id}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusText(item.status)}
                  </Badge>
                  {item.error && (
                    <span className="max-w-[150px] truncate text-xs text-red-600" title={item.error}>
                      {item.error}
                    </span>
                  )}
                  {item.retryCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Reintentos: {item.retryCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mensaje de estado */}
      {isProcessing && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span>Procesando actualizaciones...</span>
        </div>
      )}

      {!isProcessing && progress.completed === progress.total && progress.total > 0 && (
        <div className="mt-4 text-center">
          <Badge
            variant={progress.error === 0 ? 'default' : 'secondary'}
            className="text-sm"
          >
            {progress.error === 0
              ? '✅ Todas las actualizaciones completadas exitosamente'
              : `⚠️ Completado con ${progress.error} errores`}
          </Badge>
        </div>
      )}
    </div>
  )
}
