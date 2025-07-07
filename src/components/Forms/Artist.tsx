'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useUpdateUserRoles } from '@/modules/user/hooks/management'
import { type UserProfile } from '@/modules/user/types'

interface ArtistFormProps {
  user: UserProfile
  onSuccess: () => void
  onCancel: () => void
}

const availableRoles = [
  { description: 'Cliente básico del sistema', id: 'customer', name: 'Cliente' },
  {
    description: 'Cliente VIP con beneficios adicionales',
    id: 'vip_customer',
    name: 'Cliente VIP',
  },
  { description: 'Personal de soporte al cliente', id: 'support', name: 'Soporte' },
  { description: 'Gerente con acceso amplio al sistema', id: 'manager', name: 'Gerente' },
  { description: 'Administrador con acceso completo', id: 'admin', name: 'Administrador' },
  {
    description: 'Artista con acceso a herramientas de gestión de su perfil',
    id: 'artist',
    name: 'Artista',
  },
]

export function ArtistForm({ onCancel, onSuccess, user }: ArtistFormProps) {
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = useState<string>(user.roles[0] || 'customer')
  const [vendorName, setVendorName] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)

  const updateRoles = useUpdateUserRoles()

  const { data: vendors, isLoading: vendorsLoading } = useQuery<string[]>({
    enabled: selectedRole === 'artist',
    queryFn: () => fetch('/api/vendors').then((res) => res.json()),
    queryKey: ['vendors'],
  })

  const createArtistMutation = useMutation({
    mutationFn: (data: { userId: string; vendorName: string }) => {
      return fetch('/api/artists', {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }).then((res) => {
        if (!res.ok) throw new Error('Falló la creación del artista')
        return res.json()
      })
    },
    onError: () => {
      toast.error('Error al crear el artista')
    },
    onSuccess: () => {
      toast.success('Artista creado exitosamente')
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      onSuccess()
    },
  })

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId)
    if (roleId !== 'artist') {
      setVendorName('')
    }
  }

  const handleSaveRoles = async () => {
    if (!selectedRole) return

    try {
      const isBecomingArtist = selectedRole === 'artist' && !user.roles.includes('artist')

      if (isBecomingArtist && !vendorName) {
        toast.error('Debes seleccionar un vendor para promocionar a artista')
        return
      }

      await updateRoles.mutateAsync({ role: selectedRole, userId: user.id })

      if (isBecomingArtist) {
        await createArtistMutation.mutateAsync({
          userId: user.id,
          vendorName,
        })
      } else {
        toast.success('Rol actualizado exitosamente')
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Error al actualizar rol')
    }
  }

  const isBecomingArtist = selectedRole === 'artist' && !user.roles.includes('artist')

  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        {availableRoles.map((role) => (
          <label key={role.id} className='flex cursor-pointer items-start space-x-3'>
            <input
              type='radio'
              name='userRole'
              value={role.id}
              checked={selectedRole === role.id}
              onChange={(e) => handleRoleChange(e.target.value)}
              className='mt-1 size-4 border-input bg-background text-primary focus:ring-ring'
            />
            <div>
              <div className='text-sm font-medium'>{role.name}</div>
              <div className='text-sm text-muted-foreground'>{role.description}</div>
            </div>
          </label>
        ))}
      </div>

      {isBecomingArtist && (
        <div className='mt-6 rounded-lg bg-primary-container p-4'>
          <h4 className='mb-2 text-sm font-medium text-on-primary-container'>
            Asignar Vendor para Artista
          </h4>
          <p className='text-on-primary-container/80 mb-3 text-xs'>
            Selecciona un vendor existente o escribe un nombre para crear uno nuevo.
          </p>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                aria-expanded={popoverOpen}
                className='w-full justify-between'
              >
                {vendorName
                  ? (vendors?.find((v) => v.toLowerCase() === vendorName.toLowerCase()) ??
                    `Crear nuevo: "${vendorName}"`)
                  : 'Selecciona o escribe un vendor...'}
                <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder='Buscar o crear vendor...'
                  onValueChange={setVendorName}
                />
                <CommandList>
                  <CommandEmpty>
                    {vendorsLoading ? 'Cargando...' : 'No se encontraron vendors.'}
                  </CommandEmpty>
                  <CommandGroup>
                    {vendors
                      ?.filter((v) => v.toLowerCase().includes(vendorName.toLowerCase()))
                      .map((v) => (
                        <CommandItem
                          key={v}
                          value={v}
                          onSelect={(currentValue) => {
                            setVendorName(currentValue === vendorName ? '' : currentValue)
                            setPopoverOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 size-4',
                              vendorName.toLowerCase() === v.toLowerCase()
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {v}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className='mt-6 flex justify-end space-x-3'>
        <Button variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={handleSaveRoles}
          disabled={updateRoles.isPending || createArtistMutation.isPending}
        >
          {updateRoles.isPending || createArtistMutation.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}
