'use client'

import { Copy, Link2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface Invite {
  id: string
  token: string
  email: string | null
  expiresAt: string | null
  usedAt: string | null
  createdAt: string
  privateRoom: {
    id: string
    name: string
  }
}

interface InvitationsSectionProps {
  roomId: string
  isLoading: boolean
}

export function InvitationsSection({ isLoading, roomId }: InvitationsSectionProps) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isLoadingInvites, setIsLoadingInvites] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newInviteEmail, setNewInviteEmail] = useState('')
  const [newInviteExpiry, setNewInviteExpiry] = useState<string>('7')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void fetchInvites()
    }
  }, [hasLoaded, isLoading])

  const fetchInvites = async () => {
    setIsLoadingInvites(true)
    try {
      const response = await fetch(`/api/private-rooms/invites?roomId=${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setInvites(data)
        setHasLoaded(true)
      }
    } catch (error) {
      console.error('Error fetching invites:', error)
    } finally {
      setIsLoadingInvites(false)
    }
  }

  const handleOpenCreateDialog = async () => {
    if (!hasLoaded) {
      await fetchInvites()
    }
    setIsCreateDialogOpen(true)
  }

  const handleCreateInvite = async () => {
    setIsCreating(true)
    try {
      const expiresInDays = parseInt(newInviteExpiry)
      const response = await fetch('/api/private-rooms/invites', {
        body: JSON.stringify({
          email: newInviteEmail || null,
          expiresInDays: expiresInDays > 0 ? expiresInDays : null,
          privateRoomId: roomId,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (response.ok) {
        const newInvite = await response.json()
        setInvites((prev) => [newInvite, ...prev])
        toast.success('Invitación creada exitosamente')
        setIsCreateDialogOpen(false)
        setNewInviteEmail('')
        setNewInviteExpiry('7')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al crear invitación')
      }
    } catch (error) {
      console.error('Error creating invite:', error)
      toast.error('Error al crear invitación')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyLink = (token: string) => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/invite/${token}`
    void navigator.clipboard.writeText(link)
    toast.success('Link copiado al portapapeles')
  }

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/private-rooms/invites?id=${inviteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setInvites((prev) => prev.filter((inv) => inv.id !== inviteId))
        toast.success('Invitación eliminada')
      } else {
        toast.error('Error al eliminar invitación')
      }
    } catch (error) {
      console.error('Error deleting invite:', error)
      toast.error('Error al eliminar invitación')
    }
  }

  const getInviteStatus = (invite: Invite) => {
    if (invite.usedAt) return 'used'
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return 'expired'
    return 'active'
  }

  return (
    <div className='rounded-lg border bg-card'>
      <div className='border-b p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Link2 className='size-5 text-muted-foreground' />
            <h2 className='text-lg font-semibold'>Invitaciones</h2>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              onClick={() => {
                void fetchInvites()
              }}
              variant='outline'
              size='sm'
              disabled={isLoadingInvites}
            >
              <RefreshCw className={`mr-2 size-4 ${isLoadingInvites ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button onClick={handleOpenCreateDialog} size='sm'>
              <Plus className='mr-2 size-4' />
              Crear Invitación
            </Button>
          </div>
        </div>
        <p className='mt-1 text-sm text-muted-foreground'>
          Genera links de invitación para compartir esta sala con otros usuarios
        </p>
      </div>

      <div className='p-4'>
        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        ) : invites.length === 0 && hasLoaded ? (
          <div className='py-8 text-center text-muted-foreground'>
            <Link2 className='mx-auto mb-2 size-8' />
            <p className='text-sm'>No hay invitaciones para esta sala</p>
            <p className='text-xs'>Crea una invitación para compartir la sala</p>
          </div>
        ) : invites.length > 0 ? (
          <div className='space-y-2'>
            {invites.map((invite) => {
              const status = getInviteStatus(invite)
              const isActive = status === 'active'

              return (
                <div
                  key={invite.id}
                  className={`flex items-center justify-between rounded-md border p-3 ${
                    isActive ? '' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-sm font-medium'>
                        {invite.email || 'Sin email específico'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : status === 'used'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {status === 'active' ? 'Activa' : status === 'used' ? 'Usada' : 'Expirada'}
                      </span>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Creada: {new Date(invite.createdAt).toLocaleDateString('es-MX')}
                      {invite.expiresAt &&
                        ` • Expira: ${new Date(invite.expiresAt).toLocaleDateString('es-MX')}`}
                    </p>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleCopyLink(invite.token)}
                          disabled={!isActive}
                        >
                          <Copy className='size-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isActive ? 'Copiar link' : 'No se puede copiar - invitación ya usada'}
                      </TooltipContent>
                    </Tooltip>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeleteInvite(invite.id)}
                      className='text-red-600 hover:bg-red-50'
                      title='Eliminar'
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='py-4 text-center text-sm text-muted-foreground'>
            <Button variant='outline' onClick={() => void fetchInvites()}>
              Cargar invitaciones
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Invitación</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='invite-email'>Email (opcional)</Label>
              <Input
                id='invite-email'
                type='email'
                placeholder='usuario@ejemplo.com'
                value={newInviteEmail}
                onChange={(e) => setNewInviteEmail(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                Si proporcionas un email, la invitación solo será válida para ese usuario
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='invite-expiry'>Expira en</Label>
              <Select value={newInviteExpiry} onValueChange={setNewInviteExpiry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='14'>14 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleCreateInvite()} disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear Invitación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
