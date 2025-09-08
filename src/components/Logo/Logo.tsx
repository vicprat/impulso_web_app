import Link from 'next/link'

import { ROUTES } from '@/src/config/routes'

interface Props {
  asLink?: boolean
  className?: string
}

export const Logo: React.FC<Props> = ({ asLink = true, className = 'flex items-center' }) => {
  const logoContent = (
    <>
      <img
        src='/assets/logo1.svg'
        alt='Impulso Galería - Logo claro'
        className='h-full w-auto max-w-32 object-contain dark:hidden sm:max-w-40 lg:max-w-48'
        width={192}
        height={48}
      />
      <img
        src='/assets/logo2.svg'
        alt='Impulso Galería - Logo oscuro'
        className='hidden h-full w-auto max-w-32 object-contain dark:block sm:max-w-40 lg:max-w-48'
        width={192}
        height={48}
      />
    </>
  )

  if (!asLink) {
    return <div className={className}>{logoContent}</div>
  }

  return (
    <Link href={ROUTES.PUBLIC.HOME.PATH} className={className}>
      {logoContent}
    </Link>
  )
}
