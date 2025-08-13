'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Dialog } from '@/components/Dialog'
import { Form } from '@/components/Forms'
import { Table } from '@/components/Table'
import { Button } from '@/components/ui/button'
// import { useDebounce } from '@/hooks/use-debounce'
import { useDialog } from '@/hooks/useDialog'
import { useAuth } from '@/modules/auth/context/useAuth'
import {
  useDeactivateUser,
  useReactivateUser,
  useToggleUserPublicStatus,
  useUsersManagement,
} from '@/modules/user/hooks/management'
import { type UserFilters, type UserProfile } from '@/modules/user/types'
import { PERMISSIONS } from '@/src/config/Permissions'
import { availableRoles } from '@/src/config/Roles'

import { columns } from './columns'

import type { User } from '@/src/types/user'

export const dynamic = 'force-dynamic'

export default function UserManagementPage() {
  const { hasPermission, hasRole, user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  const searchParams = useSearchParams()
  const router = useRouter()

  const pageInUrl = parseInt(searchParams.get('page') ?? '1', 10)
  const limitInUrl = parseInt(searchParams.get('limit') ?? '10', 10)
  const searchInUrl = searchParams.get('search') ?? ''
  const roleInUrl = searchParams.get('role') ?? ''
  const isActiveParam = searchParams.get('isActive')
  const isActiveInUrl = isActiveParam === null ? undefined : isActiveParam === 'true'
  const sortByInUrl = (searchParams.get('sortBy') ?? 'createdAt') as UserFilters[ 'sortBy' ]
  const sortOrderInUrl = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc'

  const [ sorting, setSorting ] = useState<SortingState>([])
  const [ searchTerm, setSearchTerm ] = useState(searchInUrl)

  const [ selectedUser, setSelectedUser ] = useState<UserProfile | null>(null)
  const roleDialog = useDialog()
  const createUserDialog = useDialog()

  // Hooks
  const { data: usersData, isLoading: usersLoading } = useUsersManagement({
    isActive: isActiveInUrl,
    limit: limitInUrl,
    page: pageInUrl,
    role: roleInUrl || undefined,
    search: searchInUrl || undefined,
    sortBy: sortByInUrl,
    sortOrder: sortOrderInUrl,
  })
  const deactivateUser = useDeactivateUser()
  const reactivateUser = useReactivateUser()
  const toggleUserPublicStatus = useToggleUserPublicStatus() // Inicializar el hook

  const users = usersData?.users ?? []
  const pagination = usersData?.pagination ?? {
    hasNext: false,
    hasPrev: false,
    limit: 10,
    page: 1,
    total: 0,
  }

  // Sin debounce: el usuario confirma la búsqueda con submit/botón

  useEffect(() => {
    setSorting([ { desc: sortOrderInUrl === 'desc', id: String(sortByInUrl) } ])
  }, [ sortByInUrl, sortOrderInUrl ])

  const handleManageRoles = (user: UserProfile) => {
    setSelectedUser(user)
    roleDialog.openDialog()
  }

  const handleToggleUserStatus = async (user: UserProfile) => {
    const canManage = (() => {
      if (!currentUser) return false
      if (!hasPermission(PERMISSIONS.MANAGE_USERS)) return false
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

  const handleToggleUserPublicStatus = async (userId: string, isPublic: boolean) => {
    const user = users.find((u: User) => u.id === userId)
    if (!user) return

    const canManage = (() => {
      if (!currentUser) return false
      if (!hasPermission(PERMISSIONS.MANAGE_USERS)) return false
      if (hasRole('admin')) return true
      if (hasRole('manager')) {
        return !user.roles.includes('manager') && !user.roles.includes('admin')
      }
      return false
    })()

    if (!canManage) {
      toast.error('No tienes permisos para gestionar la visibilidad pública de este usuario')
      return
    }

    try {
      await toggleUserPublicStatus.mutateAsync({ isPublic, userId })
      toast.success('Estado público del usuario actualizado')
      void queryClient.invalidateQueries({ queryKey: [ 'users' ] })
    } catch (error) {
      console.error('Error toggling user public status:', error)
      toast.error('Error al cambiar el estado público del usuario')
    }
  }

  const table = useReactTable({
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    meta: {
      deactivateUser: deactivateUser.mutate,
      handleManageRoles,
      handleToggleUserStatus,
      reactivateUser: reactivateUser.mutate,
      toggleUserPublicStatus: handleToggleUserPublicStatus,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next.length > 0) {
        const { desc, id } = next[ 0 ]
        params.set('sortBy', String(id))
        params.set('sortOrder', desc ? 'desc' : 'asc')
      } else {
        params.set('sortBy', 'createdAt')
        params.set('sortOrder', 'desc')
      }
      params.set('page', '1')
      router.push(`/admin/users?${params.toString()}`, { scroll: false })
    },
    rowCount: pagination.total,
    state: {
      pagination: {
        pageIndex: pageInUrl - 1,
        pageSize: limitInUrl,
      },
      sorting,
    },
  })

  return (
    <div className='space-y-6'>
      <div className='rounded-lg p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Gestión de Usuarios</h1>
            <p className='text-muted-foreground'>Administrar usuarios y roles</p>
          </div>
          <div className='flex items-center space-x-4'>
            <span className='text-sm text-muted-foreground'>
              Total: {pagination.total} usuarios
            </span>
            <Button onClick={createUserDialog.openDialog}>
              <Plus className='mr-2 size-4' />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          <div className='mb-6'>
            <Table.Toolbar
              searchTerm={searchTerm}
              onSearchChange={(value) => setSearchTerm(value)}
              onSubmit={() => {
                const params = new URLSearchParams(searchParams.toString())
                if (searchTerm) params.set('search', searchTerm)
                else params.delete('search')
                params.set('page', '1')
                router.push(`/admin/users?${params.toString()}`, { scroll: false })
              }}
            >
              <div className='flex items-center space-x-2'>
                <select
                  value={roleInUrl}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString())
                    if (e.target.value) params.set('role', e.target.value)
                    else params.delete('role')
                    params.set('page', '1')
                    router.push(`/admin/users?${params.toString()}`, { scroll: false })
                  }}
                  className='w-full rounded-lg border border-input p-2 text-sm focus:ring-2 focus:ring-ring'
                >
                  <option value=''>Todos los roles</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                <select
                  value={isActiveInUrl === undefined ? '' : String(isActiveInUrl)}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString())
                    if (e.target.value === '') params.delete('isActive')
                    else params.set('isActive', e.target.value)
                    params.set('page', '1')
                    router.push(`/admin/users?${params.toString()}`, { scroll: false })
                  }}
                  className='w-full rounded-lg border border-input bg-background p-2 text-sm focus:ring-2 focus:ring-ring'
                >
                  <option value=''>Todos</option>
                  <option value='true'>Activos</option>
                  <option value='false'>Inactivos</option>
                </select>

                <Button type='submit' className='px-4'>Buscar</Button>
              </div>
            </Table.Toolbar>
          </div>
        </div>

        {(searchInUrl !== '' || roleInUrl !== '' || isActiveInUrl !== undefined || sortByInUrl !== 'createdAt' || sortOrderInUrl !== 'desc' || pageInUrl !== 1 || limitInUrl !== 10) && (
          <div className='mb-4'>
            <Button variant='container-destructive' size='sm' onClick={() => router.replace('/admin/users', { scroll: false })}>
              Limpiar filtros
            </Button>
          </div>
        )}

        {usersLoading ? (
          <Table.Loader />
        ) : (
          <div className='overflow-hidden rounded-lg border bg-card shadow-md'>
            <Table.Data table={table} />
          </div>
        )}

        <Table.Pagination
          table={table}
          isServerSide
          currentPage={pageInUrl}
          hasNextPage={pagination.hasNext}
          hasPreviousPage={pagination.hasPrev}
          onPageChange={(page) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', String(page))
            router.push(`/admin/users?${params.toString()}`, { scroll: false })
          }}
          onPageSizeChange={(limit) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('limit', String(limit))
            params.set('page', '1')
            router.push(`/admin/users?${params.toString()}`, { scroll: false })
          }}
          totalItems={pagination.total}
          isLoading={usersLoading}
        />
      </div>

      <Dialog.Form
        open={roleDialog.open}
        onOpenChange={roleDialog.onOpenChange}
        title={`Cambiar Rol - ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        description='Selecciona un nuevo rol para el usuario.'
      >
        {selectedUser && (
          <Form.Artist
            user={selectedUser}
            onSuccess={() => {
              roleDialog.closeDialog()
              void queryClient.invalidateQueries({ queryKey: [ 'users' ] })
            }}
            onCancel={roleDialog.closeDialog}
          />
        )}
      </Dialog.Form>

      <Dialog.Form
        open={createUserDialog.open}
        onOpenChange={createUserDialog.onOpenChange}
        title='Crear Nuevo Usuario'
        description='Crea un nuevo usuario y asígnale un rol específico.'
      >
        <Form.Artist
          mode='create'
          onSuccess={() => {
            createUserDialog.closeDialog()
            void queryClient.invalidateQueries({ queryKey: [ 'users' ] })
          }}
          onCancel={createUserDialog.closeDialog}
        />
      </Dialog.Form>
    </div>
  )
}
