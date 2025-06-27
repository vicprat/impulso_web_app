export const postgresUserApi = {
  deactivateUser: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/deactivate`, {
      credentials: 'include',
      method: 'PATCH',
    })
    if (!response.ok) throw new Error('Failed to deactivate user')
    return response.json()
  },

  getAllUsers: async (filters: any = {}) => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString())
      }
    })

    const response = await fetch(`/api/users?${queryParams}`, { credentials: 'include' })
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  getProfile: async () => {
    const response = await fetch('/api/users/profile', { credentials: 'include' })
    if (!response.ok) throw new Error('Failed to fetch user profile')
    return response.json()
  },

  reactivateUser: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/reactivate`, {
      credentials: 'include',
      method: 'PATCH',
    })
    if (!response.ok) throw new Error('Failed to reactivate user')
    return response.json()
  },

  updatePreferences: async (preferences: any) => {
    const response = await fetch('/api/users/preferences', {
      body: JSON.stringify({ preferences }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })
    if (!response.ok) throw new Error('Failed to update preferences')
    return response.json()
  },

  updateProfile: async (data: any) => {
    const response = await fetch('/api/users/profile', {
      body: JSON.stringify(data),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })
    if (!response.ok) throw new Error('Failed to update profile')
    return response.json()
  },

  updateUserRole: async (userId: string, roles: string[]) => {
    const response = await fetch(`/api/users/${userId}/roles`, {
      body: JSON.stringify({ roles }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })
    if (!response.ok) throw new Error('Failed to update roles')
    return response.json()
  },
}
