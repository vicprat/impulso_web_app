'use client';

import { useState, useEffect } from 'react';

export function usePermission(permission: string) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/auth/permissions?permission=${encodeURIComponent(permission)}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setHasPermission(data.hasPermission);
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error('Permission check failed:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [permission]);

  return { hasPermission, isLoading };
}
