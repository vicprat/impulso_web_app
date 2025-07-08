/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

interface LogoProps {
  asLink?: boolean
  className?: string
}

export const Logo = ({ asLink = true, className = 'flex items-center' }: LogoProps) => {
  const logoContent = (
    <>
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
    </>
  )

  if (!asLink) {
    return <div className={className}>{logoContent}</div>
  }

  return (
    <Link href='/' className={className}>
      {logoContent}
    </Link>
  )
}
