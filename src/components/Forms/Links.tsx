'use client'

import { Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUserProfile } from '@/modules/user/hooks/useUserProfile'

const inferPlatformFromUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube'
    }
    if (hostname.includes('instagram.com')) {
      return 'instagram'
    }
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'twitter'
    }
    if (hostname.includes('facebook.com')) {
      return 'facebook'
    }
    if (hostname.includes('linkedin.com')) {
      return 'linkedin'
    }
    if (hostname.includes('tiktok.com')) {
      return 'tiktok'
    }
    if (hostname.includes('spotify.com')) {
      return 'spotify'
    }
    if (hostname.includes('soundcloud.com')) {
      return 'soundcloud'
    }
    // Add more platforms as needed
    return 'website' // Default platform
  } catch (error) {
    return 'website' // Fallback if URL is invalid
  }
}

export const Links = () => {
  const [newLink, setNewLink] = useState('')
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [editedLinkUrl, setEditedLinkUrl] = useState('')

  const {
    createLink,
    deleteLink,
    isCreatingLink,
    isDeletingLink,
    isLinksLoading,
    isUpdatingLink,
    links,
    updateLink,
  } = useUserProfile()

  const handleAddLink = async () => {
    if (!newLink.trim()) {
      toast.error('El enlace no puede estar vacío.')
      return
    }

    let validatedUrl = newLink.trim()
    if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://')) {
      validatedUrl = `https://${validatedUrl}` // Prepend https:// if missing
    }

    try {
      new URL(validatedUrl) // Attempt to create a URL object to validate
    } catch (e) {
      toast.error('Formato de URL inválido. Asegúrate de incluir http:// o https://')
      return
    }

    const platform = inferPlatformFromUrl(validatedUrl)

    try {
      await createLink({ platform, url: validatedUrl })
      setNewLink('')
    } catch (error) {
      console.error('Error adding link:', error)
      toast.error('Error al añadir el enlace.')
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteLink(linkId)
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error('Error al eliminar el enlace.')
    }
  }

  const handleEditClick = (linkId: string, currentUrl: string) => {
    setEditingLink(linkId)
    setEditedLinkUrl(currentUrl)
  }

  const handleCancelEdit = () => {
    setEditingLink(null)
    setEditedLinkUrl('')
  }

  const handleSaveEdit = async (linkId: string) => {
    if (!editedLinkUrl.trim()) {
      toast.error('El enlace no puede estar vacío.')
      return
    }

    let validatedUrl = editedLinkUrl.trim()
    if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://')) {
      validatedUrl = `https://${validatedUrl}` // Prepend https:// if missing
    }

    try {
      new URL(validatedUrl) // Attempt to create a URL object to validate
    } catch (e) {
      toast.error('Formato de URL inválido. Asegúrate de incluir http:// o https://')
      return
    }

    const platform = inferPlatformFromUrl(validatedUrl)

    try {
      await updateLink({ data: { platform, url: validatedUrl }, linkId })
      setEditingLink(null)
      setEditedLinkUrl('')
    } catch (error) {
      console.error('Error updating link:', error)
      toast.error('Error al actualizar el enlace.')
    }
  }

  return (
    <Card className='border-none shadow-none'>
      <CardHeader className='px-0 pt-0'>
        <CardTitle className='text-lg font-semibold text-foreground'>Manage Your Links</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 px-0'>
        <div className='space-y-2'>
          <Label htmlFor='newLink' className='text-muted-foreground'>
            Add New Link
          </Label>
          <div className='flex gap-2'>
            <Input
              id='newLink'
              placeholder='https://example.com/your-link'
              className='grow border-input bg-background text-foreground focus:border-primary focus:ring-primary'
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              disabled={isCreatingLink}
            />
            <Button
              onClick={handleAddLink}
              disabled={isCreatingLink}
              className='hover:bg-primary/90 bg-primary text-on-primary'
            >
              <PlusCircle className='mr-2 size-4' /> {isCreatingLink ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>

        <div className='space-y-3'>
          <h3 className='text-md font-medium text-muted-foreground'>Existing Links</h3>
          {isLinksLoading ? (
            <div className='rounded-md bg-surface-container p-4 text-muted-foreground'>
              Loading links...
            </div>
          ) : links && links.length > 0 ? (
            <ul className='space-y-2'>
              {links.map((link) => (
                <li
                  key={link.id}
                  className='flex items-center justify-between rounded-md bg-surface-container p-3'
                >
                  {editingLink === link.id ? (
                    <div className='flex w-full items-center gap-2'>
                      <Input
                        value={editedLinkUrl}
                        onChange={(e) => setEditedLinkUrl(e.target.value)}
                        className='grow border-input bg-background text-foreground focus:border-primary focus:ring-primary'
                        disabled={isUpdatingLink}
                      />
                      <Button
                        size='sm'
                        onClick={() => handleSaveEdit(link.id)}
                        disabled={isUpdatingLink}
                      >
                        {isUpdatingLink ? 'Saving...' : 'Save'}
                      </Button>
                      <Button size='sm' variant='outline' onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <a
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='truncate text-primary hover:underline'
                      >
                        {link.url}
                      </a>
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleEditClick(link.id, link.url)}
                          disabled={isDeletingLink || isUpdatingLink}
                          className='hover:bg-muted/10 text-muted-foreground'
                        >
                          <Pencil className='size-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDeleteLink(link.id)}
                          disabled={isDeletingLink || isUpdatingLink}
                          className='hover:bg-destructive/10 text-destructive'
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className='rounded-md bg-surface-container p-4 text-muted-foreground'>
              No links added yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
