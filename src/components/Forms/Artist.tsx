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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useUpdateUserRoles } from '@/modules/user/hooks/management'
import { type UserProfile } from '@/modules/user/types'
import { availableRoles } from '@/src/config/Roles'

interface UserRoleFormProps {
  user?: UserProfile // Opcional para crear nuevos usuarios
  onSuccess: () => void
  onCancel: () => void
  mode?: 'create' | 'edit'
}

export function UserRoleForm({ onCancel, onSuccess, user, mode = 'edit' }: UserRoleFormProps) {
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = useState<string>(user?.roles[0] || 'customer')
  const [vendorName, setVendorName] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)
  
  // Campos para crear nuevo usuario
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    isActive: user?.isActive ?? true,
  })

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

  const createUserMutation = useMutation({
    mutationFn: (data: { email: string; firstName?: string; lastName?: string; role: string; isActive: boolean }) => {
      return fetch('/api/users', {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || 'Falló la creación del usuario')
        }
        return res.json()
      })
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el usuario')
    },
    onSuccess: () => {
      toast.success('Usuario creado exitosamente')
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveRoles = async () => {
    if (!selectedRole) return

    try {
      if (mode === 'create') {
        // Crear nuevo usuario
        if (!formData.email.trim()) {
          toast.error('El email es requerido')
          return
        }

        await createUserMutation.mutateAsync({
          email: formData.email,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          role: selectedRole,
          isActive: formData.isActive,
        })

        // Si es artista, crear también el vendor
        if (selectedRole === 'artist' && vendorName) {
          // Aquí podrías crear el vendor si es necesario
          toast.success('Usuario artista creado exitosamente')
        }
      } else {
        // Editar usuario existente
        if (!user) return

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
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Error al actualizar rol')
    }
  }

  const isBecomingArtist = selectedRole === 'artist' && (!user || !user.roles.includes('artist'))

  return (
    <div className='space-y-6'>
      {/* Campos para crear usuario */}
      {mode === 'create' && (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email *</Label>
            <Input
              id='email'
              type='email'
              placeholder='usuario@ejemplo.com'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='firstName'>Nombre</Label>
            <Input
              id='firstName'
              type='text'
              placeholder='Juan'
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='lastName'>Apellido</Label>
            <Input
              id='lastName'
              type='text'
              placeholder='Pérez'
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>Estado</Label>
            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='isActive'
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className='rounded border-gray-300'
              />
              <Label htmlFor='isActive' className='text-sm font-normal'>
                Usuario activo
              </Label>
            </div>
          </div>
        </div>
      )}

      {/* Selección de rol */}
      <div className='space-y-3'>
        <h3 className='text-lg font-medium'>Asignar Rol</h3>
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
          disabled={updateRoles.isPending || createArtistMutation.isPending || createUserMutation.isPending}
        >
          {updateRoles.isPending || createArtistMutation.isPending || createUserMutation.isPending 
            ? 'Guardando...' 
            : mode === 'create' ? 'Crear Usuario' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}
