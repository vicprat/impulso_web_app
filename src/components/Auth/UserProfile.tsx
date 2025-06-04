'use client';

import { useAuth } from '@/modules/auth/context/useAuth';
import { Logout } from './Logout';

export function UserProfile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Perfil de Usuario</h2>
      
      <div className="space-y-3">
        <div>
          <span className="font-medium text-gray-600">Nombre:</span>
          <span className="ml-2">{user.firstName} {user.lastName}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">Email:</span>
          <span className="ml-2">{user.email}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">Roles:</span>
          <div className="ml-2 flex flex-wrap gap-2">
            {user.roles.map(role => (
              <span 
                key={role} 
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">Permisos:</span>
          <div className="ml-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {user.permissions.map(permission => (
              <span 
                key={permission} 
                className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Logout />
      </div>
    </div>
  );
}
