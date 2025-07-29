import { type CreatePrivateRoomDto, type PrivateRoom, type UpdatePrivateRoomDto } from '../types'

const BASE_URL = '/api/private-rooms'

export const privateRoomsApi = {
  createPrivateRoom: async (data: CreatePrivateRoomDto): Promise<PrivateRoom> => {
    const response = await fetch(BASE_URL, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to create private room')
    }
    return response.json()
  },

  deletePrivateRoom: async (id: string) => {
    const response = await fetch(`/api/private-rooms/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error ?? 'Failed to delete private room')
    }

    return response.json()
  },

  getAllPrivateRooms: async (): Promise<PrivateRoom[]> => {
    const response = await fetch(BASE_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch private rooms')
    }
    return response.json()
  },

  getPrivateRoomById: async (id: string): Promise<PrivateRoom> => {
    const response = await fetch(`${BASE_URL}/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch private room')
    }
    return response.json()
  },

  getPrivateRoomByUserId: async (userId: string): Promise<PrivateRoom> => {
    const response = await fetch(`${BASE_URL}/user/${userId}`)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No tienes salas privadas asignadas')
      }
      throw new Error("Failed to fetch user's private room")
    }
    return response.json()
  },

  updatePrivateRoom: async (id: string, data: UpdatePrivateRoomDto) => {
    const response = await fetch(`/api/private-rooms/${id}`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error ?? 'Failed to update private room')
    }

    return response.json()
  },
}
