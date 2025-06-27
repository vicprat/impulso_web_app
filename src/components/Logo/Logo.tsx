/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

export const Logo = () => {
  return (
    <Link href='/' className='flex items-center'>
      <img
        src='/assets/logo1.svg'
        alt='Logo'
        className='h-full w-auto max-w-32 object-contain dark:hidden sm:max-w-40 lg:max-w-48'
      />
      <img
        src='/assets/logo2.svg'
        alt='Logo'
        className='hidden h-full w-auto max-w-32 object-contain dark:block sm:max-w-40 lg:max-w-48'
      />
    </Link>
  )
}
