'use client'

import { Guard } from '@/components/Guards'
import { useUserProfile } from '@/modules/user/hooks/useUserProfile'
import { Form } from '@/src/components/Forms'

export default function ProfilePage() {
  const { isProfileLoading, isUpdatingProfile, profile, updateProfile } = useUserProfile()

  if (isProfileLoading) {
    return <div className='h-64 animate-pulse rounded-lg bg-muted'></div>
  }

  return (
    <Guard.Auth>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <div className='overflow-hidden rounded-lg bg-card p-6 shadow-elevation-1'>
            <Form.Profile profile={profile} onSave={updateProfile} isLoading={isUpdatingProfile} />
          </div>
        </div>
        <div>
          <div className='rounded-lg bg-card p-6 shadow-md'>
            <h2 className='mb-4 text-xl font-semibold'>Your Links</h2>
            <Form.Links />
          </div>
        </div>
      </div>
    </Guard.Auth>
  )
}
