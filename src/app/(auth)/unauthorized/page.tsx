export default function Page() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-24'>
      <h1 className='text-4xl font-bold text-red-600'>Acceso Denegado</h1>
      <p className='mt-4 text-lg text-gray-700'>
        No tienes los permisos necesarios para acceder a esta página.
      </p>
      <p className=' mt-2 text-gray-500'>
        Por favor, contacta al administrador si crees que esto es un error.
      </p>
    </div>
  )
}
