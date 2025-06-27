import { RefreshCw, AlertCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Props {
  error: Error
  handleRetry: () => void
}

export const Error: React.FC<Props> = ({ error, handleRetry }) => {
  return (
    <div className='bg-surface min-h-screen'>
      <div className='mx-auto px-4 py-12'>
        <Alert className='border-error-container bg-error-container/10 mx-auto max-w-md'>
          <AlertCircle className='text-error size-4' />
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
            className='text-on-primary bg-primary shadow-md hover:bg-primary/90'
          >
            <RefreshCw className='mr-2 size-4' />
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  )
}
