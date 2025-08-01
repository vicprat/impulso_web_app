/* eslint-disable @next/next/no-img-element */
'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { SupabaseImageUploader } from '@/components/Forms/SupabaseImageUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Tiptap } from '../TipTap'

interface ProfileFormData {
  firstName: string
  lastName: string
  bio: string
  description: string
  occupation: string
  avatarUrl?: string | null
  backgroundImageUrl?: string | null
}

interface Props {
  isLoading?: boolean
  onSave: (data: ProfileFormData) => void
  profile?: {
    firstName?: string | null
    lastName?: string | null
    bio?: string | null
    description?: string | null
    occupation?: string | null
    avatarUrl?: string | null
    backgroundImageUrl?: string | null
  } | null
}

export const Profile: React.FC<Props> = ({ isLoading, onSave, profile }) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    avatarUrl: null,
    backgroundImageUrl: null,
    bio: '',
    description: '',
    firstName: '',
    lastName: '',
    occupation: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        avatarUrl: profile.avatarUrl ?? null,
        backgroundImageUrl: profile.backgroundImageUrl ?? null,
        bio: profile.bio ?? '',
        description: profile.description ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        occupation: profile.occupation ?? '',
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarUpload = (url: string | null) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url }))
  }

  const handleBackgroundUpload = (url: string | null) => {
    setFormData((prev) => ({ ...prev, backgroundImageUrl: url }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSave(formData)
  }

  const hasData =
    profile &&
    (profile.bio ??
      profile.description ??
      profile.occupation ??
      profile.avatarUrl ??
      profile.backgroundImageUrl)

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* First Name Field */}
        <div className='space-y-2'>
          <Label htmlFor='firstName' className='font-medium text-foreground'>
            Nombre
          </Label>
          <Input
            type='text'
            name='firstName'
            id='firstName'
            value={formData.firstName}
            onChange={handleChange}
            className='border-border bg-background focus:border-primary focus:ring-primary'
          />
        </div>

        {/* Last Name Field */}
        <div className='space-y-2'>
          <Label htmlFor='lastName' className='font-medium text-foreground'>
            Apellido
          </Label>
          <Input
            type='text'
            name='lastName'
            id='lastName'
            value={formData.lastName}
            onChange={handleChange}
            className='border-border bg-background focus:border-primary focus:ring-primary'
          />
        </div>
      </div>
      {/* Avatar Field */}
      <div className='space-y-2'>
        <Label htmlFor='avatar' className='font-medium text-foreground'>
          Avatar
        </Label>
        {formData.avatarUrl && (
          <div className='mb-2'>
            <img
              src={formData.avatarUrl}
              alt='Avatar Preview'
              width={96}
              height={96}
              className='size-24 rounded-full object-cover'
            />
          </div>
        )}
        <SupabaseImageUploader value={formData.avatarUrl} onChange={handleAvatarUpload} hidePreview type="profile" />
      </div>

      {/* Background Image Field */}
      <div className='space-y-2'>
        <Label htmlFor='backgroundImage' className='font-medium text-foreground'>
          Background Image
        </Label>
        {formData.backgroundImageUrl && (
          <div className='mb-2'>
            <img
              src={formData.backgroundImageUrl}
              alt='Background Preview'
              width={500}
              height={128}
              className='h-32 w-full object-cover'
            />
          </div>
        )}
        <SupabaseImageUploader
          value={formData.backgroundImageUrl}
          onChange={handleBackgroundUpload}
          hidePreview
          type="background"
        />
      </div>

      {/* Occupation Field */}
      <div className='space-y-2'>
        <Label htmlFor='occupation' className='font-medium text-foreground'>
          Occupation
        </Label>
        <Input
          type='text'
          name='occupation'
          id='occupation'
          value={formData.occupation}
          onChange={handleChange}
          placeholder='e.g., Software Developer, Artist, Designer...'
          className='border-border bg-background focus:border-primary focus:ring-primary'
        />
      </div>

      {/* Description Field */}
      <div className='space-y-2'>
        <Label htmlFor='description' className='font-medium text-foreground'>
          Short Description
        </Label>
        <Textarea
          name='description'
          id='description'
          rows={1}
          value={formData.description}
          onChange={handleChange}
          placeholder='A brief description about yourself...'
          className='resize-none border-border bg-background focus:border-primary focus:ring-primary'
        />
      </div>

      {/* Bio Field */}
      <div className='space-y-2'>
        <Label htmlFor='bio' className='font-medium text-foreground'>
          Bio
        </Label>
        <Tiptap.Editor
          content={formData.bio}
          onChange={(value) => setFormData((prev) => ({ ...prev, bio: value }))}
        />
      </div>

      {/* Submit Button */}
      <div className='flex justify-end pt-4'>
        <Button
          type='submit'
          disabled={isLoading}
          className='hover:bg-primary/90 focus:ring-primary/20 bg-primary text-on-primary focus:ring-2 disabled:opacity-50'
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 size-4 animate-spin' />
              Saving...
            </>
          ) : (
            <>{hasData ? 'Update Profile' : 'Save Profile'}</>
          )}
        </Button>
      </div>
    </form>
  )
}
