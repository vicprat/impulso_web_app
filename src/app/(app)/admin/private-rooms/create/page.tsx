'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Form } from '@/components/Forms'
import { type PrivateRoomData } from '@/components/Forms/Room'
import { privateRoomsApi } from '@/modules/rooms/api'

export default function CreatePrivateRoomPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async (data: PrivateRoomData) => {
    setIsLoading(true)
    try {
      await privateRoomsApi.createPrivateRoom({
        description: data.description,
        name: data.name,
        productIds: data.products.map((p) => p.productId),
        userId: data.userId,
      })

      toast.success('Private room created successfully!')
      router.push('/admin/private-rooms') // Redirigir a la lista
    } catch (error) {
      console.error('Error creating private room:', error)
      toast.error('Failed to create private room.')
    } finally {
      setIsLoading(false)
    }
  }

  return <Form.Room mode='create' onSubmit={handleCreate} isLoading={isLoading} />
}
