'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface BackButtonProps {
  postType: string
}

export const BackButton: React.FC<BackButtonProps> = ({ postType }) => {
  const router = useRouter()

  const handleBack = () => {
    router.push(`/${postType.toLowerCase()}`)
  }

  return (
    <Button variant='outline' onClick={handleBack} className='mb-6'>
      <ArrowLeft className='mr-2 size-4' />
      Volver
    </Button>
  )
}
