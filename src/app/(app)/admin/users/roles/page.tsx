'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { AlertCircle, ChevronLeft, Plus, Shield } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Table } from '@/src/components/Table'
import { ROUTES } from '@/src/config/routes'

import { columns, type Role } from './columns'

interface Permission {
  id: string
  name: string
  description: string | null
  resource: string | null
  action: string | null
}

const fetchRoles = async (): Promise<Role[]> => {
  const response = await fetch('/api/admin/roles')
  if (!response.ok) throw new Error('Error al cargar roles')
  return response.json()
}

const fetchPermissions = async (): Promise<Permission[]> => {
  const response = await fetch('/api/admin/permissions')
  if (!response.ok) throw new Error('Error al cargar permisos')
  return response.json()
}

const createRole = async (data: {
  name: string
  description?: string
  permissionIds: string[]
}): Promise<Role> => {
  const response = await fetch('/api/admin/roles', {
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear rol')
  }
  return response.json()
}

const updateRole = async (
  id: string,
  data: {
    name?: string
    description?: string
    permissionIds?: string[]
  }
): Promise<Role> => {
  const response = await fetch(`/api/admin/roles/${id}`, {
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    method: 'PUT',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al actualizar rol')
  }
  return response.json()
}

const deleteRole = async (id: string): Promise<void> => {
  const response = await fetch(`/api/admin/roles/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al eliminar rol')
  }
}

export default function RolesManagementPage() {
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const [formData, setFormData] = useState({
    description: '',
    name: '',
    selectedPermissions: [] as string[],
  })

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryFn: fetchRoles,
    queryKey: ['admin', 'roles'],
  })

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryFn: fetchPermissions,
    queryKey: ['admin', 'permissions'],
  })

  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onError: (error: Error) => {
      toast.error('Error al crear rol', { description: error.message })
    },
    onSuccess: () => {
      toast.success('Rol creado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })
      setIsCreateDialogOpen(false)
      resetForm()
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ data, id }: { id: string; data: Parameters<typeof updateRole>[1] }) =>
      updateRole(id, data),
    onError: (error: Error) => {
      toast.error('Error al actualizar rol', { description: error.message })
    },
    onSuccess: () => {
      toast.success('Rol actualizado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })
      setIsEditDialogOpen(false)
      setSelectedRole(null)
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onError: (error: Error) => {
      toast.error('Error al eliminar rol', { description: error.message })
    },
    onSuccess: () => {
      toast.success('Rol eliminado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })
      setIsDeleteDialogOpen(false)
      setSelectedRole(null)
    },
  })

  const resetForm = () => {
    setFormData({
      description: '',
      name: '',
      selectedPermissions: [],
    })
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      description: role.description || '',
      name: role.name,
      selectedPermissions: role.permissions.map((p) => p.id),
    })
    setIsEditDialogOpen(true)
  }

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role)
    setIsDeleteDialogOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createRoleMutation.mutate({
      description: formData.description,
      name: formData.name,
      permissionIds: formData.selectedPermissions,
    })
  }

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    updateRoleMutation.mutate({
      data: {
        description: formData.description,
        name: formData.name,
        permissionIds: selectedRole.isAdmin ? undefined : formData.selectedPermissions,
      },
      id: selectedRole.id,
    })
  }

  const handleTogglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter((id) => id !== permissionId)
        : [...prev.selectedPermissions, permissionId],
    }))
  }

  const handleSelectAllPermissions = () => {
    if (!permissions) return
    const allIds = permissions.map((p) => p.id)
    const hasAll = formData.selectedPermissions.length === allIds.length
    setFormData((prev) => ({
      ...prev,
      selectedPermissions: hasAll ? [] : allIds,
    }))
  }

  const groupedPermissions = permissions?.reduce(
    (acc, permission) => {
      const resource = permission.resource || 'Other'
      if (!acc[resource]) acc[resource] = []
      acc[resource].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>
  )

  const table = useReactTable({
    columns,
    data: roles || [],
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onDeleteRole: handleOpenDelete,
      onEditRole: handleOpenEdit,
    } as any,
  })

  if (rolesLoading || permissionsLoading) {
    return (
      <div className='space-y-6 p-4 md:p-6'>
        <Card>
          <CardHeader>
            <Skeleton className='h-8 w-1/3' />
            <Skeleton className='h-4 w-1/2' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-4 md:p-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 text-2xl'>
              <Shield className='size-6' />
              Gestión de Roles
            </CardTitle>
            <CardDescription>
              Administra los roles y sus permisos. Asigna roles a los usuarios para controlar el
              acceso.
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            <Link href={ROUTES.ADMIN.USERS.MAIN.PATH}>
              <Button variant='ghost'>
                <ChevronLeft className='mr-2 size-4' />
                Volver a Usuarios
              </Button>
            </Link>
            <Button onClick={handleOpenCreate}>
              <Plus className='mr-2 size-4' />
              Crear Rol
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table.Data table={table} />
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Rol</DialogTitle>
            <DialogDescription>Crea un nuevo rol y asígnale permisos.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nombre del Rol</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder='ej. Gerente de Contenido'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='description'>Descripción</Label>
                <Input
                  id='description'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder='Breve descripción de este rol'
                />
              </div>
              <Separator />
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label>Permisos</Label>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={handleSelectAllPermissions}
                  >
                    {formData.selectedPermissions.length === (permissions?.length || 0)
                      ? 'Desmarcar Todos'
                      : 'Seleccionar Todos'}
                  </Button>
                </div>
                <ScrollArea className='h-[300px] rounded-md border p-4'>
                  <div className='space-y-4'>
                    {groupedPermissions &&
                      Object.entries(groupedPermissions).map(([resource, perms]) => (
                        <div key={resource}>
                          <h4 className='mb-2 text-sm font-semibold uppercase text-muted-foreground'>
                            {resource}
                          </h4>
                          <div className='space-y-2'>
                            {perms.map((permission) => (
                              <div key={permission.id} className='flex items-start space-x-2'>
                                <Checkbox
                                  id={permission.id}
                                  checked={formData.selectedPermissions.includes(permission.id)}
                                  onCheckedChange={() => handleTogglePermission(permission.id)}
                                />
                                <div className='grid gap-1 leading-none'>
                                  <label
                                    htmlFor={permission.id}
                                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                  >
                                    {permission.name}
                                  </label>
                                  {permission.description && (
                                    <p className='text-xs text-muted-foreground'>
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
                <p className='text-xs text-muted-foreground'>
                  {formData.selectedPermissions.length} de {permissions?.length || 0} permisos
                  seleccionados
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type='submit' disabled={createRoleMutation.isPending}>
                {createRoleMutation.isPending ? 'Creando...' : 'Crear Rol'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>Actualiza los detalles y permisos del rol.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-name'>Nombre del Rol</Label>
                <Input
                  id='edit-name'
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder='ej. Gerente de Contenido'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-description'>Descripción</Label>
                <Input
                  id='edit-description'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder='Breve descripción de este rol'
                />
              </div>
              <Separator />
              <div className='space-y-2'>
                {selectedRole?.isAdmin ? (
                  <div className='bg-primary/10 rounded-md p-4 text-sm'>
                    <p className='font-medium'>Rol Admin</p>
                    <p className='text-muted-foreground'>
                      El rol admin tiene todos los permisos del sistema y no puede ser modificado.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className='flex items-center justify-between'>
                      <Label>Permisos</Label>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={handleSelectAllPermissions}
                      >
                        {formData.selectedPermissions.length === (permissions?.length || 0)
                          ? 'Desmarcar Todos'
                          : 'Seleccionar Todos'}
                      </Button>
                    </div>
                    <ScrollArea className='h-[300px] rounded-md border p-4'>
                      <div className='space-y-4'>
                        {groupedPermissions &&
                          Object.entries(groupedPermissions).map(([resource, perms]) => (
                            <div key={resource}>
                              <h4 className='mb-2 text-sm font-semibold uppercase text-muted-foreground'>
                                {resource}
                              </h4>
                              <div className='space-y-2'>
                                {perms.map((permission) => (
                                  <div key={permission.id} className='flex items-start space-x-2'>
                                    <Checkbox
                                      id={`edit-${permission.id}`}
                                      checked={formData.selectedPermissions.includes(permission.id)}
                                      onCheckedChange={() => handleTogglePermission(permission.id)}
                                    />
                                    <div className='grid gap-1 leading-none'>
                                      <label
                                        htmlFor={`edit-${permission.id}`}
                                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                      >
                                        {permission.name}
                                      </label>
                                      {permission.description && (
                                        <p className='text-xs text-muted-foreground'>
                                          {permission.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                    <p className='text-xs text-muted-foreground'>
                      {formData.selectedPermissions.length} de {permissions?.length || 0} permisos
                      seleccionados
                    </p>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type='submit' disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <AlertCircle className='size-5 text-destructive' />
              Eliminar Rol
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el rol &quot;{selectedRole?.name}&quot;? Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRole && deleteRoleMutation.mutate(selectedRole.id)}
              className='hover:bg-destructive/90 bg-destructive'
            >
              {deleteRoleMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
