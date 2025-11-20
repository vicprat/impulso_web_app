'use client'

import { Plus, Search as SearchIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useUsersManagement } from '@/modules/user/hooks/management'
import { type UserProfile } from '@/modules/user/types'
import { ROLES, availableRoles } from '@/src/config/Roles'

interface AddUsersModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  roomTitle: string
  existingUserIds: Set<string>
  onSuccess: () => void
  onUsersSelected?: (userIds: Set<string>) => void
}

export function AddUsersModal({
  existingUserIds,
  isOpen,
  onClose,
  onSuccess,
  onUsersSelected,
  roomId,
  roomTitle,
}: AddUsersModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const { data: usersData, isLoading } = useUsersManagement({
    isActive: isActiveFilter,
    limit: 100,
    role: roleFilter
      ? [roleFilter]
      : [
          'vip_customer',
          'artist',
          'employee',
          'provider',
          'partner',
          'support',
          'manager',
          'admin',
          'finance_manager',
          'inventory_and_content_editor',
          'content_editor',
        ],
    search: debouncedSearchTerm || undefined,
  })

  const users = usersData?.users ?? []
  const availableUsers = users.filter((u: UserProfile) => !existingUserIds.has(u.id))

  const allowedRoles = availableRoles.filter((role) => role.id !== ROLES.CUSTOMER.NAME)

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const handleAddUsers = async () => {
    if (selectedUsers.size === 0) {
      toast.warning('Selecciona al menos un usuario')
      return
    }

    if (onUsersSelected) {
      onUsersSelected(selectedUsers)
      setSelectedUsers(new Set())
      onClose()
      return
    }

    if (!roomId) {
      toast.error('ID de sala no válido')
      return
    }

    try {
      const response = await fetch(`/api/private-rooms/${roomId}`, {
        body: JSON.stringify({
          userIds: Array.from(new Set([...existingUserIds, ...selectedUsers])),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? 'Error al agregar usuarios')
      }

      toast.success(
        `${selectedUsers.size} usuario${selectedUsers.size > 1 ? 's' : ''} agregado${selectedUsers.size > 1 ? 's' : ''} a la sala exitosamente`
      )
      setSelectedUsers(new Set())
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding users:', error)
      toast.error(
        `Error al agregar usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  const handleSelectAll = () => {
    setSelectedUsers(new Set(availableUsers.map((u: UserProfile) => u.id)))
  }

  const handleDeselectAll = () => {
    setSelectedUsers(new Set())
  }

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setRoleFilter('')
      setIsActiveFilter(undefined)
      setSelectedUsers(new Set())
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='flex max-h-[85vh] max-w-5xl flex-col overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Agregar Usuarios - {roomTitle}</DialogTitle>
          <DialogDescription>
            Selecciona usuarios para agregar a esta sala privada. Puedes filtrar por búsqueda, rol o
            estado.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-1 flex-col space-y-4 overflow-hidden'>
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <div className='relative flex-1'>
                <Label htmlFor='search' className='sr-only'>
                  Buscar usuarios
                </Label>
                <SearchIcon className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  id='search'
                  placeholder='Buscar por nombre, apellido o email...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className='w-48 rounded-lg border border-input bg-background p-2 text-sm focus:ring-2 focus:ring-ring'
              >
                <option value=''>Todos los roles</option>
                {allowedRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <select
                value={isActiveFilter === undefined ? '' : String(isActiveFilter)}
                onChange={(e) => {
                  const value = e.target.value
                  setIsActiveFilter(value === '' ? undefined : value === 'true')
                }}
                className='w-32 rounded-lg border border-input bg-background p-2 text-sm focus:ring-2 focus:ring-ring'
              >
                <option value=''>Todos</option>
                <option value='true'>Activos</option>
                <option value='false'>Inactivos</option>
              </select>
            </div>

            {availableUsers.length > 0 && (
              <div className='flex space-x-2'>
                {selectedUsers.size > 0 ? (
                  <Button onClick={handleDeselectAll} variant='outline' size='sm'>
                    <X className='mr-2 size-4' />
                    Deseleccionar Todo
                  </Button>
                ) : (
                  <Button onClick={handleSelectAll} variant='outline' size='sm'>
                    Seleccionar Todos ({availableUsers.length})
                  </Button>
                )}
              </div>
            )}
          </div>

          {selectedUsers.size > 0 && (
            <div className='flex items-center justify-between rounded-md bg-blue-50 p-3 text-sm text-blue-800'>
              <span className='font-medium'>
                {selectedUsers.size} usuario{selectedUsers.size > 1 ? 's' : ''} seleccionado
                {selectedUsers.size > 1 ? 's' : ''}
              </span>
              <Button
                onClick={handleAddUsers}
                size='sm'
                className='bg-green-600 hover:bg-green-700'
              >
                <Plus className='mr-2 size-4' />
                Agregar a Sala
              </Button>
            </div>
          )}

          <div className='flex-1 overflow-auto rounded-md border'>
            {isLoading ? (
              <div className='space-y-3 p-4'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex items-center space-x-4 p-3'>
                    <Skeleton className='size-10 rounded-full' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-3 w-1/2' />
                    </div>
                    <Skeleton className='h-4 w-16' />
                  </div>
                ))}
              </div>
            ) : availableUsers.length === 0 ? (
              <div className='py-8 text-center'>
                <SearchIcon className='mx-auto mb-4 size-12 text-muted-foreground' />
                <p className='text-muted-foreground'>
                  {searchTerm || roleFilter || isActiveFilter !== undefined
                    ? 'No se encontraron usuarios disponibles con los filtros aplicados'
                    : 'Todos los usuarios disponibles ya están en esta sala'}
                </p>
              </div>
            ) : (
              <div className='divide-y'>
                {availableUsers.map((user: UserProfile) => {
                  const isSelected = selectedUsers.has(user.id)
                  const userRole = user.roles?.[0] ?? 'Sin rol'

                  return (
                    <div
                      key={user.id}
                      className={`flex cursor-pointer items-center space-x-4 p-4 transition-colors ${
                        isSelected ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => handleUserToggle(user.id)}
                        className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted'>
                        <span className='text-sm font-medium'>
                          {user.firstName?.[0] ?? ''}
                          {user.lastName?.[0] ?? ''}
                        </span>
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h4 className='truncate font-medium'>
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className='truncate text-sm text-muted-foreground'>{user.email}</p>
                      </div>
                      <div className='shrink-0'>
                        <span className='rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground'>
                          {userRole}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant='outline' disabled={false}>
            Cancelar
          </Button>
          {selectedUsers.size > 0 && (
            <Button onClick={handleAddUsers} className='bg-green-600 hover:bg-green-700'>
              <Plus className='mr-2 size-4' />
              Agregar {selectedUsers.size} usuario{selectedUsers.size > 1 ? 's' : ''}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
