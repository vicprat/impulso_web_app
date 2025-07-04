import { Skeleton } from '@/components/ui/skeleton'

const TABLE = 6

export const Loader: React.FC = () => {
  const headerCells = Array.from({ length: TABLE }, (_, i) => i)
  const bodyRows = Array.from({ length: TABLE }, (_, i) => i)

  return (
    <div className='w-full overflow-hidden rounded-lg border bg-card'>
      <div className='overflow-hidden rounded-lg border'>
        <div className='border-b bg-muted px-4 py-3'>
          <div className='grid grid-cols-6 gap-4'>
            {headerCells.map((index) => (
              <Skeleton key={`header-${index}`} className='h-4 bg-primary-foreground' />
            ))}
          </div>
        </div>
        <div className='divide-y divide-muted'>
          {bodyRows.map((rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className='hover:bg-muted/50 grid grid-cols-6 gap-4 px-4 py-3 transition-colors duration-200'
            >
              {headerCells.map((colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className='flex items-center'
                  style={{
                    animationDelay: `${(rowIndex * TABLE + colIndex) * 50}ms`,
                  }}
                >
                  <Skeleton className='h-4 w-full bg-primary-foreground' />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className='my-4 flex items-center justify-center'>
        <div className='flex space-x-1'>
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              className='size-2 animate-pulse rounded-full bg-primary-foreground'
              style={{
                animationDelay: `${i * 200}ms`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
