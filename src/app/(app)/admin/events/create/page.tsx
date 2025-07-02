'use client'

import { useRouter } from 'next/navigation'

import { Form } from '@/components/Forms'
import { useCreateEvent } from '@/services/event/hook'
import { type CreateEventPayload } from '@/services/event/types'

export default function CreateEventPage() {
  const router = useRouter()
  const createMutation = useCreateEvent()

  const handleSave = async (payload: CreateEventPayload) => {
    const newEvent = await createMutation.mutateAsync(payload)
    const eventId = newEvent.id.split('/').pop()
    router.push(`/admin/events/${eventId}`)
  }

  const handleCancel = () => {
    router.push('/admin/events')
  }

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <Form.Event
        mode='create'
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
