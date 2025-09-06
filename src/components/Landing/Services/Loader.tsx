// Componente Loader para Services
import { Card, CardContent } from '@/components/ui/card'

export const Loader = ({ count = 6 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className='bg-card shadow-elevation-1'>
        <CardContent className='space-y-4 p-6'>
          {/* Header con ícono */}
          <div className='flex items-start gap-4'>
            <div className='size-14 animate-pulse rounded-xl bg-muted' />
            <div className='h-6 w-20 animate-pulse rounded-full bg-muted' />
          </div>

          {/* Título */}
          <div className='space-y-2'>
            <div className='h-6 w-full animate-pulse rounded bg-muted' />
            <div className='h-6 w-3/4 animate-pulse rounded bg-muted' />
          </div>

          {/* Descripción */}
          <div className='space-y-2'>
            {[ 1, 2, 3 ].map((i) => (
              <div key={i} className='h-4 w-full animate-pulse rounded bg-muted' />
            ))}
          </div>

          {/* Features */}
          <div className='space-y-2'>
            <div className='h-4 w-16 animate-pulse rounded bg-muted' />
            <div className='flex flex-wrap gap-1'>
              {[ 1, 2, 3 ].map((i) => (
                <div key={i} className='h-6 w-20 animate-pulse rounded-md bg-muted' />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className='border-t border-border/50 pt-4'>
            <div className='h-4 w-24 animate-pulse rounded bg-muted' />
          </div>
        </CardContent>
      </Card>
    ))}
  </>
)
