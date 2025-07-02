import { DollarSign } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const TableSkeleton = () => {
  return (
    <div className='space-y-6'>
      {/* Financial Summary Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='size-5' />
            Resumen Financiero
          </CardTitle>
          <CardDescription>Vista general de ingresos, egresos y utilidad neta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='rounded-lg border p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-8 w-24' />
                  </div>
                  <div className='flex items-center'>
                    <Skeleton className='size-4 rounded' />
                    <Skeleton className='ml-2 h-5 w-8' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
            <div>
              <CardTitle>Detalle de Entradas Financieras</CardTitle>
              <CardDescription>Lista completa de ingresos y egresos del evento</CardDescription>
            </div>
            {/* Action Buttons Skeleton */}
            <div className='flex items-center space-x-2'>
              <Skeleton className='h-9 w-24' />
              <Skeleton className='h-9 w-32' />
              <Skeleton className='h-9 w-28' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Skeleton */}
          <div className='mb-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0'>
            <div className='relative max-w-sm flex-1'>
              <Skeleton className='h-10 w-full' />
            </div>
            <Skeleton className='h-10 w-48' />
          </div>

          {/* Table Skeleton */}
          <div className='rounded-md border'>
            <div className='p-4'>
              {/* Table Header */}
              <div className='mb-3 grid grid-cols-6 gap-4 border-b pb-3'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-16' />
              </div>

              {/* Table Rows */}
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className='grid grid-cols-6 gap-4 border-b py-3 last:border-b-0'
                >
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='size-4' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-16' />
                  <div className='flex items-center space-x-1'>
                    <Skeleton className='size-8 rounded' />
                    <Skeleton className='size-8 rounded' />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Footer */}
          <div className='flex items-center justify-between space-x-2 py-4'>
            <Skeleton className='h-4 w-48' />
            <div className='flex items-center space-x-2'>
              <Skeleton className='size-8' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='size-8' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
