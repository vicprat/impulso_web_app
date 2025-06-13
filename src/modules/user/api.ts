export const postgresUserApi = {
  getProfile: async () => {
    const response = await fetch('/api/users/profile', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  updateProfile: async (data: any) => {
    const response = await fetch('/api/users/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  updatePreferences: async (preferences: any) => {
    const response = await fetch('/api/users/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ preferences })
    });
    if (!response.ok) throw new Error('Failed to update preferences');
    return response.json();
  },

  getAllUsers: async (filters: any = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`/api/users?${queryParams}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  updateUserRole: async (userId: string, roles: string[]) => {
    const response = await fetch(`/api/users/${userId}/roles`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roles })
    });
    if (!response.ok) throw new Error('Failed to update roles');
    return response.json();
  },

  deactivateUser: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/deactivate`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to deactivate user');
    return response.json();
  },

  reactivateUser: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/reactivate`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to reactivate user');
    return response.json();
  },
};
