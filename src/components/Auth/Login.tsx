'use client';

import { useAuth } from "@/modules/auth/hooks/useAuth";

export function Login() {
  const { login, isLoading } = useAuth();

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
    >
      {isLoading ? 'Cargando...' : 'Iniciar Sesión con Shopify'}
    </button>
  );
}