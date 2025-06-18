/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <img 
        src="/assets/logo1.svg" 
        alt="Logo" 
        className="h-full w-auto max-w-32 sm:max-w-40 lg:max-w-48 object-contain dark:hidden" 
      />
      <img 
        src="/assets/logo2.svg" 
        alt="Logo" 
        className="h-full w-auto max-w-32 sm:max-w-40 lg:max-w-48 object-contain hidden dark:block" 
      />
    </Link>
  );
}