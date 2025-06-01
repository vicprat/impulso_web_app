
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw,  AlertCircle } from 'lucide-react';

type Props = {
  error: Error;
  handleRetry: () => void;
};

export const Error: React.FC<Props> = ({ error, handleRetry }) => {
  return (
     <div className="bg-surface min-h-screen">
        <div className="mx-auto px-4 py-12">
          <Alert className="max-w-md mx-auto border-error-container bg-error-container/10">
            <AlertCircle className="h-4 w-4 text-error" />
            <AlertDescription className="text-on-error-container">
              <span className="font-medium">Error al cargar los productos:</span>
              <br />
              {error.message}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-6">
            <Button 
              onClick={handleRetry}
              variant="default"
              className="bg-primary text-on-primary hover:bg-primary/90 shadow-md"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
  )
}