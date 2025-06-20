'use client';

import { useState } from 'react';
import { 
  useUsersManagement, 
  useUpdateUserRoles, 
  useDeactivateUser, 
  useReactivateUser
} from '@/modules/user/hooks/management';
import { useAuth } from '@/modules/auth/context/useAuth';
import { UserFilters, UserProfile } from '@/modules/user/types';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';



const PromoteToArtistDialog = ({ user }: { user: any }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [vendorName, setVendorName] = useState('');

  // 1. Hook de React Query para obtener la lista de vendors
  const { data: vendors, isLoading } = useQuery<string[]>({
    queryKey: ['vendors'],
    queryFn: () => fetch('/api/vendors').then(res => res.json()),
    enabled: open, // Solo se ejecuta cuando el diálogo está abierto
  });

  // 2. Hook de React Query para la mutación (promocionar al artista)
  const mutation = useMutation({
    mutationFn: (newVendorName: string) => {
      return fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, vendorName: newVendorName }),
      }).then(res => {
        if (!res.ok) throw new Error('Falló la promoción del artista');
        return res.json();
      });
    },
    onSuccess: () => {
      toast.success(  `El usuario ${user.name} ha sido promocionado a artista.` );
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpen(false); 
    },
    onError: () => {
      toast.error("No se pudo promocionar al artista.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName) return;
    mutation.mutate(vendorName);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Promocionar a Artista</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Asignar Vendor a {user.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona un vendor existente o escribe un nombre para crear uno nuevo.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between"
                >
                  {vendorName
                    ? vendors?.find((v) => v.toLowerCase() === vendorName.toLowerCase()) || `Crear nuevo: "${vendorName}"`
                    : "Selecciona o escribe un vendor..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false} /* Filtramos manualmente */>
                  <CommandInput 
                    placeholder="Buscar o crear vendor..."
                    onValueChange={setVendorName}
                  />
                  <CommandList>
                     <CommandEmpty>
                        {isLoading ? 'Cargando...' : 'No se encontraron vendors.'}
                      </CommandEmpty>
                    <CommandGroup>
                      {vendors
                        ?.filter(v => v.toLowerCase().includes(vendorName.toLowerCase()))
                        .map((v) => (
                        <CommandItem
                          key={v}
                          value={v}
                          onSelect={(currentValue) => {
                            setVendorName(currentValue === vendorName ? "" : currentValue);
                            setPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              vendorName.toLowerCase() === v.toLowerCase() ? "opacity-100" : "opacity-0"
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

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button type="submit" disabled={mutation.isPending || !vendorName}>
              {mutation.isPending ? 'Promocionando...' : 'Asignar y Promocionar'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};


export function UserManagementAdmin() {
  const { hasPermission, hasRole, user: currentUser } = useAuth();
  
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    isActive: undefined,
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Hooks de gestión
  const { data: usersData, isLoading: usersLoading} = useUsersManagement(filters);
  const updateRoles = useUpdateUserRoles();
  const deactivateUser = useDeactivateUser();
  const reactivateUser = useReactivateUser();
  
  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    hasNext: false,
    hasPrev: false
  };

  const availableRoles = [
    { id: 'customer', name: 'Cliente', description: 'Cliente básico del sistema' },
    { id: 'vip_customer', name: 'Cliente VIP', description: 'Cliente VIP con beneficios adicionales' },
    { id: 'support', name: 'Soporte', description: 'Personal de soporte al cliente' },
    { id: 'manager', name: 'Gerente', description: 'Gerente con acceso amplio al sistema' },
    { id: 'admin', name: 'Administrador', description: 'Administrador con acceso completo' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleSort = (field: string) => {
    setFilters({
      ...filters,
      sortBy: field as any,
      sortOrder: filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleManageRoles = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedRoles([...user.roles]);
    setShowRoleModal(true);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    
    try {
      await updateRoles.mutateAsync({ userId: selectedUser.id, roles: selectedRoles });
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating roles:', error);
      alert('Error al actualizar roles');
    }
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    const canManage = (() => {
      if (!currentUser) return false;
      if (!hasPermission('manage_users')) return false;
      if (user.id === currentUser.id) return true;
      if (hasRole('admin')) return true;
      if (hasRole('manager')) {
        return !user.roles.includes('manager') && !user.roles.includes('admin');
      }
      return false;
    })();
    
    if (!canManage) {
      alert('No tienes permisos para gestionar este usuario');
      return;
    }

    try {
      if (user.isActive) {
        await deactivateUser.mutateAsync(user.id);
      } else {
        await reactivateUser.mutateAsync(user.id);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error al cambiar el estado del usuario');
    }
  };

  if (!hasPermission('manage_users')) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center py-8">
          <span className="text-6xl">🔒</span>
          <h2 className="text-xl font-semibold text-gray-800 mt-4">Acceso Restringido</h2>
          <p className="text-gray-600 mt-2">No tienes permisos para acceder a la gestión de usuarios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administrar usuarios, roles y permisos</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Total: {pagination.total} usuarios
            </span>
          </div>
        </div>


       {users.map((user) => (
  <div key={user.id} className="flex items-center justify-between p-4 border-b">
    <div>
      <p className="font-semibold">{user.name}</p>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      {user.artist ? (
        <span className="text-sm font-bold text-green-500">Artista: {user.artist.name}</span>
      ) : (
        <span className="text-sm text-gray-500">No es artista</span>
      )}
    </div>
    {!user.artist && <PromoteToArtistDialog user={user} />}
  </div>
))}

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Nombre, email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los roles</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => setFilters({ 
                ...filters, 
                isActive: e.target.value === '' ? undefined : e.target.value === 'true' 
              })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {usersLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('firstName')}
                    >
                      Usuario
                      {filters.sortBy === 'firstName' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      Email
                      {filters.sortBy === 'email' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('lastLoginAt')}
                    >
                      Último acceso
                      {filters.sortBy === 'lastLoginAt' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const canManage = (() => {
                      if (!currentUser) return false;
                      if (user.id === currentUser.id) return true;
                      if (!hasPermission('manage_users')) return false;
                      if (hasRole('admin')) return true;
                      if (hasRole('manager')) {
                        return !user.roles.includes('manager') && !user.roles.includes('admin');
                      }
                      return false;
                    })();
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.shopifyData?.imageUrl ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={user.shopifyData.imageUrl} 
                                  alt="" 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-gray-600 font-medium">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">
                            Shopify: {user.shopifyCustomerId.slice(-8)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.slice(0, 2).map(role => (
                              <span 
                                key={role} 
                                className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {role}
                              </span>
                            ))}
                            {user.roles.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{user.roles.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Nunca'
                          }
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {canManage && (
                              <>
                                <button
                                  onClick={() => handleManageRoles(user)}
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  Roles
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.total > pagination.limit && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                      {' '}a{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>
                      {' '}de{' '}
                      <span className="font-medium">{pagination.total}</span>
                      {' '}usuarios
                    </p>
                  </div>
                  
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ←
                      </button>
                      
                      {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === Math.ceil(pagination.total / pagination.limit) ||
                          Math.abs(page - pagination.page) <= 2
                        )
                        .map((page, index, array) => (
                          <span key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </span>
                        ))}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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

      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Gestionar Roles - {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              
              <div className="space-y-3">
                {availableRoles.map(role => (
                  <label key={role.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, role.id]);
                        } else {
                          setSelectedRoles(selectedRoles.filter(r => r !== role.id));
                        }
                      }}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRoles}
                  disabled={updateRoles.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateRoles.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}