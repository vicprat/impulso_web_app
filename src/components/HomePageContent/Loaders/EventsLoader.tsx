

export function EventsLoader() {
  return (
    <div className='flex justify-center py-16'>
      <div className='flex flex-col items-center gap-4'>
        <div className='size-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
        <p className='text-muted-foreground'>Cargando eventos...</p>
      </div>
    </div>
  )
}
