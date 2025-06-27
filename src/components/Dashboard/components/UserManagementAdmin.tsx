/* eslint-disable @next/next/no-img-element */
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
import { useAuth } from '@/modules/auth/context/useAuth'
import {
  useUsersManagement,
  useUpdateUserRoles,
  useDeactivateUser,
  useReactivateUser,
} from '@/modules/user/hooks/management'
import { type UserFilters, type UserProfile } from '@/modules/user/types'

export function UserManagementAdmin() {
  const { hasPermission, hasRole, user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<UserFilters>({
    isActive: undefined,
    limit: 10,
    page: 1,
    role: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [vendorName, setVendorName] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Hooks de gestión
  const { data: usersData, isLoading: usersLoading } = useUsersManagement(filters)
  const updateRoles = useUpdateUserRoles()
  const deactivateUser = useDeactivateUser()
  const reactivateUser = useReactivateUser()

  const users = usersData?.users || []
  const pagination = usersData?.pagination || {
    hasNext: false,
    hasPrev: false,
    limit: 10,
    page: 1,
    total: 0,
  }

  const { data: vendors, isLoading: vendorsLoading } = useQuery<string[]>({
    enabled: showRoleModal && selectedRole === 'artist',
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
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, page: 1 })
  }

  const handleSort = (field: string) => {
    setFilters({
      ...filters,
      sortBy: field as UserFilters['sortBy'],
      sortOrder: filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc',
    })
  }

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage })
  }

  const handleManageRoles = (user: UserProfile) => {
    setSelectedUser(user)
    setSelectedRole(user.roles[0] || 'customer')
    setVendorName('')
    setShowRoleModal(true)
  }

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId)
    if (roleId !== 'artist') {
      setVendorName('')
    }
  }

  const handleSaveRoles = async () => {
    if (!selectedUser || !selectedRole) return

    try {
      const isBecomingArtist = selectedRole === 'artist' && !selectedUser.roles.includes('artist')

      if (isBecomingArtist && !vendorName) {
        toast.error('Debes seleccionar un vendor para promocionar a artista')
        return
      }

      await updateRoles.mutateAsync({ roles: [selectedRole], userId: selectedUser.id })

      if (isBecomingArtist) {
        await createArtistMutation.mutateAsync({
          userId: selectedUser.id,
          vendorName,
        })
      }

      toast.success('Rol actualizado exitosamente')
      setShowRoleModal(false)
      setSelectedUser(null)
      setSelectedRole('')
      setVendorName('')
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Error al actualizar rol')
    }
  }

  const handleToggleUserStatus = async (user: UserProfile) => {
    const canManage = (() => {
      if (!currentUser) return false
      if (!hasPermission('manage_users')) return false
      if (user.id === currentUser.id) return true
      if (hasRole('admin')) return true
      if (hasRole('manager')) {
        return !user.roles.includes('manager') && !user.roles.includes('admin')
      }
      return false
    })()

    if (!canManage) {
      toast.error('No tienes permisos para gestionar este usuario')
      return
    }

    try {
      if (user.isActive) {
        await deactivateUser.mutateAsync(user.id)
        toast.success('Usuario desactivado')
      } else {
        await reactivateUser.mutateAsync(user.id)
        toast.success('Usuario reactivado')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Error al cambiar el estado del usuario')
    }
  }

  const isBecomingArtist =
    selectedUser && selectedRole === 'artist' && !selectedUser.roles.includes('artist')

  if (!hasPermission('manage_users')) {
    return (
      <div className='rounded-lg bg-white p-6 shadow-md'>
        <div className='py-8 text-center'>
          <span className='text-6xl'>🔒</span>
          <h2 className='mt-4 text-xl font-semibold text-gray-800'>Acceso Restringido</h2>
          <p className='mt-2 text-gray-600'>
            No tienes permisos para acceder a la gestión de usuarios
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='rounded-lg bg-white p-6 shadow-md'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Gestión de Usuarios</h1>
            <p className='text-gray-600'>Administrar usuarios y roles</p>
          </div>
          <div className='flex items-center space-x-4'>
            <span className='text-sm text-gray-500'>Total: {pagination.total} usuarios</span>
          </div>
        </div>

        <form onSubmit={handleSearch} className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>Buscar</label>
            <input
              type='text'
              placeholder='Nombre, email...'
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className='w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>Rol</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className='w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Todos los roles</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>Estado</label>
            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                })
              }
              className='w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Todos</option>
              <option value='true'>Activos</option>
              <option value='false'>Inactivos</option>
            </select>
          </div>

          <div className='flex items-end'>
            <button
              type='submit'
              className='w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
            >
              Buscar
            </button>
          </div>
        </form>
      </div>

      <div className='overflow-hidden rounded-lg bg-white shadow-md'>
        {usersLoading ? (
          <div className='p-8 text-center'>
            <div className='mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
            <p className='text-gray-600'>Cargando usuarios...</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      className='cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100'
                      onClick={() => handleSort('firstName')}
                    >
                      Usuario
                      {filters.sortBy === 'firstName' && (
                        <span className='ml-1'>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className='cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100'
                      onClick={() => handleSort('email')}
                    >
                      Email
                      {filters.sortBy === 'email' && (
                        <span className='ml-1'>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Rol
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Estado
                    </th>
                    <th
                      className='cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100'
                      onClick={() => handleSort('lastLoginAt')}
                    >
                      Último acceso
                      {filters.sortBy === 'lastLoginAt' && (
                        <span className='ml-1'>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {users.map((user) => {
                    const canManage = (() => {
                      if (!currentUser) return false
                      if (user.id === currentUser.id) return true
                      if (!hasPermission('manage_users')) return false
                      if (hasRole('admin')) return true
                      if (hasRole('manager')) {
                        return !user.roles.includes('manager') && !user.roles.includes('admin')
                      }
                      return false
                    })()

                    return (
                      <tr key={user.id} className='hover:bg-gray-50'>
                        <td className='whitespace-nowrap px-6 py-4'>
                          <div className='flex items-center'>
                            <div className='size-10 shrink-0'>
                              {user.shopifyData?.imageUrl ? (
                                <img
                                  className='size-10 rounded-full object-cover'
                                  src={user.shopifyData.imageUrl}
                                  alt=''
                                />
                              ) : (
                                <div className='flex size-10 items-center justify-center rounded-full bg-gray-300'>
                                  <span className='font-medium text-gray-600'>
                                    {user.firstName?.[0]}
                                    {user.lastName?.[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className='ml-4'>
                              <div className='text-sm font-medium text-gray-900'>
                                {user.firstName} {user.lastName}
                              </div>
                              <div className='text-sm text-gray-500'>
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className='whitespace-nowrap px-6 py-4'>
                          <div className='text-sm text-gray-900'>{user.email}</div>
                          <div className='text-sm text-gray-500'>
                            Shopify: {user.shopifyCustomerId.slice(-8)}
                          </div>
                        </td>

                        <td className='px-6 py-4'>
                          <span className='inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800'>
                            {user.roles[0] || 'Sin rol'}
                          </span>
                        </td>

                        <td className='whitespace-nowrap px-6 py-4'>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Nunca'}
                        </td>

                        <td className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
                          <div className='flex justify-end space-x-2'>
                            {canManage && (
                              <>
                                <button
                                  onClick={() => handleManageRoles(user)}
                                  className='text-sm text-blue-600 hover:text-blue-900'
                                >
                                  Rol
                                </button>
                                <button
                                  onClick={() => handleToggleUserStatus(user)}
                                  disabled={deactivateUser.isPending || reactivateUser.isPending}
                                  className={`text-sm ${
                                    user.isActive
                                      ? 'text-red-600 hover:text-red-900'
                                      : 'text-green-600 hover:text-green-900'
                                  } disabled:opacity-50`}
                                >
                                  {user.isActive ? 'Desactivar' : 'Activar'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {pagination.total > pagination.limit && (
              <div className='flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6'>
                <div className='flex flex-1 justify-between sm:hidden'>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className='relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className='relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                  >
                    Siguiente
                  </button>
                </div>

                <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-sm text-gray-700'>
                      Mostrando{' '}
                      <span className='font-medium'>
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      a{' '}
                      <span className='font-medium'>
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      de <span className='font-medium'>{pagination.total}</span> usuarios
                    </p>
                  </div>

                  <div>
                    <nav className='relative z-0 inline-flex -space-x-px rounded-md shadow-sm'>
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                        className='relative inline-flex items-center rounded-l-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                      >
                        ←
                      </button>

                      {Array.from(
                        { length: Math.ceil(pagination.total / pagination.limit) },
                        (_, i) => i + 1
                      )
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === Math.ceil(pagination.total / pagination.limit) ||
                            Math.abs(page - pagination.page) <= 2
                        )
                        .map((page, index, array) => (
                          <span key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className='relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700'>
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                page === pagination.page
                                  ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </span>
                        ))}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                        className='relative inline-flex items-center rounded-r-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                      >
                        →
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Unificado de Roles */}
      {showRoleModal && selectedUser && (
        <div className='fixed inset-0 z-50 size-full overflow-y-auto bg-gray-600 bg-opacity-50'>
          <div className='relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg'>
            <div className='mt-3'>
              <h3 className='mb-4 text-lg font-medium text-gray-900'>
                Cambiar Rol - {selectedUser.firstName} {selectedUser.lastName}
              </h3>

              <div className='space-y-3'>
                {availableRoles.map((role) => (
                  <label key={role.id} className='flex cursor-pointer items-start space-x-3'>
                    <input
                      type='radio'
                      name='userRole'
                      value={role.id}
                      checked={selectedRole === role.id}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className='mt-1 size-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <div>
                      <div className='text-sm font-medium text-gray-900'>{role.name}</div>
                      <div className='text-sm text-gray-500'>{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Selector de Vendor si se está convirtiendo en artista */}
              {isBecomingArtist && (
                <div className='mt-6 rounded-lg bg-blue-50 p-4'>
                  <h4 className='mb-2 text-sm font-medium text-blue-900'>
                    Asignar Vendor para Artista
                  </h4>
                  <p className='mb-3 text-xs text-blue-700'>
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
                          ? vendors?.find((v) => v.toLowerCase() === vendorName.toLowerCase()) ||
                            `Crear nuevo: "${vendorName}"`
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
                <button
                  onClick={() => {
                    setShowRoleModal(false)
                    setSelectedRole('')
                    setVendorName('')
                  }}
                  className='rounded-lg bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400'
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRoles}
                  disabled={updateRoles.isPending || createArtistMutation.isPending}
                  className='rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
                >
                  {updateRoles.isPending || createArtistMutation.isPending
                    ? 'Guardando...'
                    : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
