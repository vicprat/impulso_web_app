'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
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

export function UserRoleForm({ mode = 'edit', onCancel, onSuccess, user }: UserRoleFormProps) {
  const queryClient = useQueryClient()
  const [ selectedRole, setSelectedRole ] = useState<string>(user?.roles[ 0 ] || 'customer')
  const [ vendorName, setVendorName ] = useState('')
  const [ popoverOpen, setPopoverOpen ] = useState(false)
  const [ isNewVendor, setIsNewVendor ] = useState(false)

  // Campos para crear nuevo usuario
  const [ formData, setFormData ] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    isActive: user?.isActive ?? true,
    lastName: user?.lastName || '',
  })

  const updateRoles = useUpdateUserRoles()

  const { data: vendors, isLoading: vendorsLoading } = useQuery<string[]>({
    enabled: selectedRole === 'artist',
    queryFn: () => fetch('/api/vendors').then((res) => res.json()),
    queryKey: [ 'vendors' ],
  })

  // Si el usuario ya es artista, obtener el nombre del vendor
  useEffect(() => {
    if (user?.artist?.name) {
      setVendorName(user.artist.name)
      setIsNewVendor(false)
    }
  }, [ user ])

  // Actualizar el estado isNewVendor cuando cambie vendorName
  useEffect(() => {
    if (vendorName.trim() && vendors) {
      const isExisting = vendors.some(v => v.toLowerCase() === vendorName.toLowerCase())
      setIsNewVendor(!isExisting)
    } else {
      setIsNewVendor(false)
    }
  }, [ vendorName, vendors ])

  const createArtistMutation = useMutation({
    mutationFn: (data: { userId: string; vendorName: string }) => {
      return fetch('/api/artists', {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || 'Falló la creación del artista')
        }
        return res.json()
      })
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el artista')
    },
    onSuccess: () => {
      toast.success('Artista creado exitosamente')
      void queryClient.invalidateQueries({ queryKey: [ 'users' ] })
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
      void queryClient.invalidateQueries({ queryKey: [ 'users' ] })
      onSuccess()
    },
  })

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId)
    if (roleId !== 'artist') {
      setVendorName('')
      setIsNewVendor(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [ field ]: value
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

        // Si es artista, validar que se seleccione un vendor
        if (selectedRole === 'artist' && !vendorName.trim()) {
          toast.error('Debes seleccionar un vendor para crear un usuario artista')
          return
        }

        const userResponse = await createUserMutation.mutateAsync({
          email: formData.email,
          firstName: formData.firstName || undefined,
          isActive: formData.isActive,
          lastName: formData.lastName || undefined,
          role: selectedRole,
        })

        // Si es artista, crear también la relación con el vendor
        if (selectedRole === 'artist' && vendorName.trim() && userResponse.user?.id) {
          await createArtistMutation.mutateAsync({
            userId: userResponse.user.id,
            vendorName: vendorName.trim(),
          })
        } else {
          toast.success('Usuario creado exitosamente')
          onSuccess()
        }
      } else {
        // Editar usuario existente
        if (!user) return

        const isBecomingArtist = selectedRole === 'artist' && !user.roles.includes('artist')

        if (isBecomingArtist && !vendorName.trim()) {
          toast.error('Debes seleccionar un vendor para promocionar a artista')
          return
        }

        await updateRoles.mutateAsync({ role: selectedRole, userId: user.id })

        if (isBecomingArtist) {
          await createArtistMutation.mutateAsync({
            userId: user.id,
            vendorName: vendorName.trim(),
          })
        } else {
          toast.success('Rol actualizado exitosamente')
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Error updating role:', error)
      if (error instanceof Error) {
        toast.error(error.message || 'Error al actualizar rol')
      } else {
        toast.error('Error al actualizar rol')
      }
    }
  }

  const isBecomingArtist = selectedRole === 'artist' && (!user?.roles.includes('artist'))

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

      {(isBecomingArtist || (mode === 'create' && selectedRole === 'artist')) && (
        <div className='mt-6 rounded-lg bg-primary-container p-4'>
          <h4 className='mb-2 text-sm font-medium text-on-primary-container'>
            Asignar Vendor para Artista
          </h4>
          <p className='text-on-primary-container/80 mb-3 text-xs'>
            Escribe el nombre de un vendor existente para seleccionarlo, o escribe un nuevo nombre para crear un vendor nuevo.
          </p>

          <Popover open={popoverOpen} onOpenChange={(open) => {
            setPopoverOpen(open)
            if (!open && !vendorName.trim()) {
              setIsNewVendor(false)
            }
          }}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                aria-expanded={popoverOpen}
                className={`w-full justify-between ${isNewVendor ? 'border-primary text-primary' : ''}`}
              >
                {vendorName
                  ? (isNewVendor
                    ? `Crear nuevo artista: "${vendorName}"`
                    : vendorName)
                  : 'Selecciona un artista existente o escribe para crear uno nuevo...'}
                <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            {isNewVendor && vendorName.trim() && (
              <div className="mt-2 text-xs text-primary">
                <Plus className="mr-1 inline size-3" />
                Se creará un nuevo vendor llamado "{vendorName}"
              </div>
            )}
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
                    {/* Mostrar vendors existentes que coincidan */}
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

                    {/* Opción para crear nuevo vendor si el texto no coincide exactamente con ningún vendor existente */}
                    {vendorName.trim() &&
                      !vendors?.some(v => v.toLowerCase() === vendorName.toLowerCase()) && (
                        <CommandItem
                          value={`create:${vendorName}`}
                          onSelect={() => {
                            // Mantener el vendorName actual para crear el nuevo vendor
                            setPopoverOpen(false)
                          }}
                          className="bg-primary/5 border-t text-primary"
                        >
                          <Check className="mr-2 size-4 opacity-0" />
                          <span className="flex items-center font-medium">
                            <Plus className="mr-2 size-4" />
                            Crear nuevo artista: "{vendorName}"
                          </span>
                        </CommandItem>
                      )}
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
