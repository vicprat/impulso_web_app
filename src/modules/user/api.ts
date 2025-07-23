import { type PublicArtist, type UserFilters } from './types'

export const postgresUserApi = {
  deactivateUser: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/deactivate`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error ?? 'Error al desactivar usuario')
    }

    return response.json()
  },

  getAllUsers: async (filters: UserFilters = {}) => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await fetch(`/api/users?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error ?? 'Error al obtener usuarios')
    }

    return response.json()
  },

  getPublicArtists: async (): Promise<PublicArtist[]> => {
    const response = await fetch(`/api/public-profiles/artists`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error ?? 'Error al obtener artistas públicos')
    }
    return response.json()
  },

  getPublicProfile: async (userId: string) => {
    const response = await fetch(`/api/public-profiles/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error ?? 'Error al obtener perfil público')
    }

    return response.json()
  },

  getUserById: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error ?? 'Error al obtener usuario')
    }

    return response.json()
  },

  reactivateUser: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/reactivate`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error ?? 'Error al reactivar usuario')
    }

    return response.json()
  },

  toggleUserPublicStatus: async (userId: string, isPublic: boolean) => {
    const response = await fetch(`/api/users/${userId}/public`, {
      body: JSON.stringify({ isPublic }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error ?? 'Error al alternar estado público del usuario')
    }

    return response.json()
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await fetch(`/api/users/${userId}/roles`, {
      body: JSON.stringify({ role }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error ?? 'Error al actualizar rol')
    }

    return response.json()
  },
}
