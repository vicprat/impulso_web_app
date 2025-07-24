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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Dialog } from '@/components/Dialog'
import { Form } from '@/components/Forms'
import { Table } from '@/components/Table'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
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

export default function UserManagementPage() {
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
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchTerm, setSearchTerm] = useState(filters.search ?? '')
  const debouncedSearch = useDebounce(searchTerm, 500)

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const roleDialog = useDialog()
  const createUserDialog = useDialog()

  // Hooks
  const { data: usersData, isLoading: usersLoading } = useUsersManagement(filters)
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

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1, search: debouncedSearch }))
  }, [debouncedSearch])

  useEffect(() => {
    if (sorting.length > 0) {
      const { desc, id } = sorting[0]
      setFilters((prev) => ({
        ...prev,
        sortBy: id as UserFilters['sortBy'],
        sortOrder: desc ? 'desc' : 'asc',
      }))
    } else {
      setFilters((prev) => ({ ...prev, sortBy: 'createdAt', sortOrder: 'desc' }))
    }
  }, [sorting])

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
      void queryClient.invalidateQueries({ queryKey: ['users'] })
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
    onSortingChange: setSorting,
    rowCount: pagination.total,
    state: {
      pagination: {
        pageIndex: (filters.page ?? 1) - 1,
        pageSize: filters.limit ?? 10,
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
            <Table.Toolbar searchTerm={searchTerm} onSearchChange={(value) => setSearchTerm(value)}>
              <div className='flex items-center space-x-2'>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, page: 1, role: e.target.value })}
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
                  value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                      page: 1,
                    })
                  }
                  className='w-full rounded-lg border border-input bg-background p-2 text-sm focus:ring-2 focus:ring-ring'
                >
                  <option value=''>Todos</option>
                  <option value='true'>Activos</option>
                  <option value='false'>Inactivos</option>
                </select>
              </div>
            </Table.Toolbar>
          </div>
        </div>

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
          currentPage={filters.page}
          hasNextPage={pagination.hasNext}
          hasPreviousPage={pagination.hasPrev}
          onPageChange={(page) => setFilters({ ...filters, page })}
          onPageSizeChange={(limit) => setFilters({ ...filters, limit, page: 1 })}
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
              void queryClient.invalidateQueries({ queryKey: ['users'] })
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
            void queryClient.invalidateQueries({ queryKey: ['users'] })
          }}
          onCancel={createUserDialog.closeDialog}
        />
      </Dialog.Form>
    </div>
  )
}
