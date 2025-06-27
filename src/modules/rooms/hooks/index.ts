import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { privateRoomsApi } from '../api';
import { CreatePrivateRoomDto, UpdatePrivateRoomDto } from '../types';

export const useAllPrivateRooms = () => {
  return useQuery({
    queryKey: ['privateRooms'],
    queryFn: privateRoomsApi.getAllPrivateRooms,
  });
};

export const usePrivateRoom = (id: string) => {
  return useQuery({
    queryKey: ['privateRoom', id],
    queryFn: () => privateRoomsApi.getPrivateRoomById(id),
    enabled: !!id, 
  });
};

export const useUserPrivateRoom = (userId: string) => {
  return useQuery({
    queryKey: ['userPrivateRoom', userId],
    queryFn: () => privateRoomsApi.getPrivateRoomByUserId(userId),
    enabled: !!userId,
  });
};

export const useCreatePrivateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePrivateRoomDto) => privateRoomsApi.createPrivateRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateRooms'] });
    },
  });
};

export const useUpdatePrivateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePrivateRoomDto }) =>
      privateRoomsApi.updatePrivateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateRooms'] });
      queryClient.invalidateQueries({ queryKey: ['privateRoom'] });
    },
  });
};

export const useDeletePrivateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => privateRoomsApi.deletePrivateRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateRooms'] });
    },
  });
};
