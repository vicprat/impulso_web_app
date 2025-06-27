'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { AuthContextType, User, AuthMeResponse } from '../types';
import { Cart } from '@/modules/cart/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          signal: controller.signal, 
        });

        if (response.ok) {
          const data: AuthMeResponse = await response.json();
          setUser(data.user);
          setCart(data.cart); // Establecer el cart desde la respuesta
        } else {
          setUser(null);
          setCart(null);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setUser(null);
          setCart(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      controller.abort();
    };
  }, []); 

  const login = useCallback(() => {
    window.location.href = '/api/auth/login';
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      setUser(null);
      setCart(null); // Limpiar cart al hacer logout
      if (data.shopifyLogoutUrl) {
        window.location.href = data.shopifyLogoutUrl;
      } else {
        window.location.href = '/';
      }
    } catch {
      setUser(null);
      setCart(null);
      window.location.href = '/';
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        const data: AuthMeResponse = await response.json();
        setUser(data.user);
        setCart(data.cart); // Actualizar cart en refresh
      } else {
        setUser(null);
        setCart(null);
      }
    } catch {
      setUser(null);
      setCart(null);
    }
  }, []);

  // Nueva función para actualizar solo el cart
  const updateCart = useCallback((updatedCart: Cart) => {
    setCart(updatedCart);
  }, []);
  
  const hasPermission = useCallback((permission: string) => {
    if (!user?.permissions) return false;
    const permissionsSet = new Set(user.permissions);
    return permissionsSet.has(permission);
  }, [user]);

  const hasRole = useCallback((role: string) => {
    if (!user?.roles) return false;
    const rolesSet = new Set(user.roles);
    return rolesSet.has(role);
  }, [user]);

  const value: AuthContextType = {
    user,
    cart,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refresh,
    updateCart,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}