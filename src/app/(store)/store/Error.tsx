import { RefreshCw, AlertCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Props {
  error: Error
  handleRetry: () => void
}

export const Error: React.FC<Props> = ({ error, handleRetry }) => {
  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto px-4 py-12'>
        <Alert className='bg-error-container/10 mx-auto max-w-md border-error-container'>
          <AlertCircle className='size-4 text-error' />
          <AlertDescription className='text-on-error-container'>
            <span className='font-medium'>Error al cargar los productos:</span>
            <br />
            {error.message}
          </AlertDescription>
        </Alert>
        <div className='mt-6 flex justify-center'>
          <Button
            onClick={handleRetry}
            variant='default'
            className='hover:bg-primary/90 bg-primary text-on-primary shadow-md'
          >
            <RefreshCw className='mr-2 size-4' />
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  )
}
