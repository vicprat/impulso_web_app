import { CreatePrivateRoomDto, PrivateRoom } from '../types';

const BASE_URL = '/api/private-rooms';

export const privateRoomsApi = {
  getAllPrivateRooms: async (): Promise<PrivateRoom[]> => {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch private rooms');
    }
    return response.json();
  },

  getPrivateRoomById: async (id: string): Promise<PrivateRoom> => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch private room');
    }
    return response.json();
  },

  getPrivateRoomByUserId: async (userId: string): Promise<PrivateRoom> => {
    const response = await fetch(`${BASE_URL}/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user\'s private room');
    }
    return response.json();
  },

  createPrivateRoom: async (data: CreatePrivateRoomDto): Promise<PrivateRoom> => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create private room');
    }
    return response.json();
  },

 updatePrivateRoom: async (id: string, data: {
    name: string;
    description?: string | null;
    userId: string;
    productIds: string[];
  }) => {
    const response = await fetch(`/api/private-rooms/${id}`, {
      method: 'PUT', // ✅ Cambiar de PATCH a PUT
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update private room');
    }
    
    return response.json();
  },

 deletePrivateRoom: async (id: string) => {
    const response = await fetch(`/api/private-rooms/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete private room');
    }
    
    return response.json();
  },
};
