
'use client';

import { useAuth } from "@/modules/auth/hooks/useAuth";


export function Logout() {
  const { logout, isLoading } = useAuth();

  return (
    <button
      onClick={logout}
      disabled={isLoading}
      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
    >
      {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
    </button>
  );
}